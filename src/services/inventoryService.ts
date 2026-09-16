import { 
  collection, 
  doc, 
  runTransaction, 
  writeBatch, 
  serverTimestamp, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  setDoc,
} from 'firebase/firestore';
import { db, hasValidConfig } from '../firebase';
import { OrderType, OrderItem, GlobalOptions, InventoryRecord, OperationLog } from '../types';
import { initialOptions, sampleRecords, sampleLogs } from './mockData';

const LOCAL_STORAGE_RECORDS_KEY = 'water_elect_records_cache_v3';
const LOCAL_STORAGE_OPTIONS_KEY = 'water_elect_options_cache_v3';
const LOCAL_STORAGE_LOGS_KEY = 'water_elect_logs_cache_v3';

// 檢查 Firebase 是否有效配置
const isFirebaseConfigured = (): boolean => {
  return hasValidConfig;
};

// 本地緩存讀取輔助函數
const getLocalData = <T>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn(`Failed reading localStorage for ${key}`, e);
  }
  return fallback;
};

// 本地緩存寫入輔助函數
const setLocalData = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed writing localStorage for ${key}`, e);
  }
};

// 自動清理材料品名中尺寸規格 (如: 電S 1" -> 電S, 45度OL 單放 2" -> 45度OL 單放)
export const sanitizeItemName = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/\s*\d+["”'](\(\d+\))?([xX]\d+["”'](\(\d+\))?)*/g, '')
    .replace(/\s*\d+\/\d+["”']/g, '')
    .replace(/\s*\d+-\d+\/\d+["”']/g, '')
    .trim();
};

// 清理整個 options 中的分類品名尺寸
export const sanitizeGlobalOptions = (opts: GlobalOptions): GlobalOptions => {
  const sanitizedCategories: Record<string, string[]> = {};
  Object.entries(opts.categories).forEach(([cat, items]) => {
    const cleanedSet = new Set<string>();
    items.forEach(it => {
      const clean = sanitizeItemName(it);
      if (clean) cleanedSet.add(clean);
    });
    sanitizedCategories[cat] = Array.from(cleanedSet);
  });

  return {
    ...opts,
    categories: sanitizedCategories
  };
};

// 產生訂單流水號 (例如: I-20260916-01)
export const generateOrderId = async (type: OrderType, orderDate: string): Promise<string> => {
  const dateStr = orderDate.replace(/-/g, '');
  const prefix = type === 'IN' ? 'I' : type === 'OUT' ? 'O' : type === 'R' ? 'R' : type === 'TRANSFER' ? 'T' : 'S';
  const counterId = `${type}_${dateStr}`;

  if (isFirebaseConfigured()) {
    try {
      const counterRef = doc(db, 'order_counters', counterId);
      const nextSeq = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let seq = 1;
        if (counterDoc.exists()) {
          seq = (counterDoc.data().currentSeq || 0) + 1;
        }
        transaction.set(counterRef, { currentSeq: seq }, { merge: true });
        return seq;
      });
      return `${prefix}-${dateStr}-${String(nextSeq).padStart(2, '0')}`;
    } catch (err) {
      console.warn('Firebase transaction failed, falling back to local counter generator', err);
    }
  }

  // 本地計數生成
  const localRecords = getLocalData<InventoryRecord[]>(LOCAL_STORAGE_RECORDS_KEY, sampleRecords);
  const matchingOrders = localRecords.filter(r => r.type === type && r.orderDate === orderDate);
  const uniqueOrderIds = Array.from(new Set(matchingOrders.map(r => r.orderId)));
  const nextSeq = uniqueOrderIds.length + 1;
  return `${prefix}-${dateStr}-${String(nextSeq).padStart(2, '0')}`;
};

// 讀取全域選項 (包含自動清除尺寸過濾)
export const fetchGlobalOptions = async (): Promise<GlobalOptions> => {
  let rawOptions: GlobalOptions = getLocalData<GlobalOptions>(LOCAL_STORAGE_OPTIONS_KEY, initialOptions);

  if (isFirebaseConfigured()) {
    try {
      const snap = await getDocs(collection(db, 'settings'));
      const optionsDoc = snap.docs.find(d => d.id === 'options');
      if (optionsDoc && optionsDoc.exists()) {
        rawOptions = optionsDoc.data() as GlobalOptions;
      }
    } catch (e) {
      console.warn('Could not fetch options from Firebase, using cache', e);
    }
  }

  // 確保自動清理掉品名內硬編碼之尺寸
  const sanitized = sanitizeGlobalOptions(rawOptions);
  setLocalData(LOCAL_STORAGE_OPTIONS_KEY, sanitized);
  return sanitized;
};

// 儲存全域選項
export const saveGlobalOptions = async (options: GlobalOptions) => {
  const sanitized = sanitizeGlobalOptions(options);
  setLocalData(LOCAL_STORAGE_OPTIONS_KEY, sanitized);

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, 'settings', 'options');
      await setDoc(ref, sanitized, { merge: true });
    } catch (e) {
      console.warn('Failed saving options to Firebase (請確認 Firestore 權限):', e);
    }
  }
};

// 讀取全部單據明細 (支援雙向合併，確保新建單據不會被空遠端覆蓋)
export const fetchInventoryRecords = async (): Promise<InventoryRecord[]> => {
  const localData = getLocalData<InventoryRecord[]>(LOCAL_STORAGE_RECORDS_KEY, sampleRecords);

  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, 'inventory_records'), orderBy('orderDate', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const remoteData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryRecord[];
        const remoteIds = new Set(remoteData.map(r => r.id || `${r.orderId}_${r.orderIndex}`));
        const localUnSynced = localData.filter(r => !remoteIds.has(r.id || `${r.orderId}_${r.orderIndex}`));
        const merged = [...localUnSynced, ...remoteData];
        setLocalData(LOCAL_STORAGE_RECORDS_KEY, merged);
        return merged;
      }
    } catch (e) {
      console.warn('Firebase query records failed (請確認 Firestore 規則):', e);
    }
  }

  return localData;
};

// 開立新單據 (樂觀更新：立刻寫入本地確保 100% 成功，再異步同步 Firestore)
export const saveOrderWithItems = async (
  type: OrderType,
  orderDate: string,
  items: OrderItem[],
  userEmail: string
): Promise<string> => {
  const orderId = await generateOrderId(type, orderDate);
  const now = new Date();

  // 確保寫入前材料品名尺寸被清理
  const newRecords: InventoryRecord[] = items.map((item, index) => ({
    ...item,
    itemName: sanitizeItemName(item.itemName),
    id: `rec-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
    orderId,
    orderDate,
    type,
    orderIndex: index + 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    updatedBy: userEmail,
  }));

  // 1. 立刻寫入本地快取 (確保畫面即時有數據，就算 Firebase 阻擋也不會遺失！)
  const currentRecords = getLocalData<InventoryRecord[]>(LOCAL_STORAGE_RECORDS_KEY, sampleRecords);
  setLocalData(LOCAL_STORAGE_RECORDS_KEY, [...newRecords, ...currentRecords]);

  // 2. 立刻寫入日誌快取
  const newLog: OperationLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    action: 'CREATE',
    targetId: orderId,
    targetName: `開立單據 ${orderId} (${items.length}項)`,
    userId: userEmail,
    userEmail,
    timestamp: now.toISOString(),
    details: { itemCount: items.length, type, orderDate }
  };
  const currentLogs = getLocalData<OperationLog[]>(LOCAL_STORAGE_LOGS_KEY, sampleLogs);
  setLocalData(LOCAL_STORAGE_LOGS_KEY, [newLog, ...currentLogs]);

  // 3. 嘗試同步至 Firebase Firestore
  if (isFirebaseConfigured()) {
    try {
      const batch = writeBatch(db);
      newRecords.forEach((item) => {
        const recordRef = doc(collection(db, 'inventory_records'));
        batch.set(recordRef, {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      const logRef = doc(collection(db, 'operation_logs'));
      batch.set(logRef, {
        ...newLog,
        timestamp: serverTimestamp()
      });
      await batch.commit();
    } catch (e) {
      console.warn('Firebase batch write failed (本地已成功保存，請確認 Firestore Security Rules):', e);
    }
  }

  return orderId;
};

// 編輯更新單據
export const updateOrderWithItems = async (
  oldOrderId: string,
  oldOrderDate: string,
  newOrderDate: string,
  type: OrderType,
  items: OrderItem[],
  userEmail: string
): Promise<string> => {
  let finalOrderId = oldOrderId;
  if (oldOrderDate !== newOrderDate) {
    finalOrderId = await generateOrderId(type, newOrderDate);
  }
  const now = new Date();

  // 更新本地紀錄
  const currentRecords = getLocalData<InventoryRecord[]>(LOCAL_STORAGE_RECORDS_KEY, sampleRecords);
  const remaining = currentRecords.filter(r => r.orderId !== oldOrderId);
  const updatedRecords: InventoryRecord[] = items.map((item, index) => ({
    ...item,
    itemName: sanitizeItemName(item.itemName),
    id: `rec-${Date.now()}-${index}`,
    orderId: finalOrderId,
    orderDate: newOrderDate,
    type,
    orderIndex: index + 1,
    createdAt: item.id ? (item as any).createdAt || now.toISOString() : now.toISOString(),
    updatedAt: now.toISOString(),
    updatedBy: userEmail,
  }));
  setLocalData(LOCAL_STORAGE_RECORDS_KEY, [...updatedRecords, ...remaining]);

  // 記錄日誌
  const newLog: OperationLog = {
    id: `log-${Date.now()}`,
    action: 'UPDATE',
    targetId: finalOrderId,
    targetName: `更新單據 ${finalOrderId} (原 ${oldOrderId})`,
    userId: userEmail,
    userEmail,
    timestamp: now.toISOString(),
    details: { oldOrderId, finalOrderId, dateChanged: oldOrderDate !== newOrderDate, itemCount: items.length }
  };
  const currentLogs = getLocalData<OperationLog[]>(LOCAL_STORAGE_LOGS_KEY, sampleLogs);
  setLocalData(LOCAL_STORAGE_LOGS_KEY, [newLog, ...currentLogs]);

  // 同步 Firebase
  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, 'inventory_records'), where('orderId', '==', oldOrderId));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));

      updatedRecords.forEach((item) => {
        const recordRef = doc(collection(db, 'inventory_records'));
        batch.set(recordRef, {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      const logRef = doc(collection(db, 'operation_logs'));
      batch.set(logRef, {
        ...newLog,
        timestamp: serverTimestamp()
      });
      await batch.commit();
    } catch (e) {
      console.warn('Failed syncing updated order to Firebase:', e);
    }
  }

  return finalOrderId;
};

// 刪除單據
export const deleteOrder = async (orderId: string, userEmail: string): Promise<void> => {
  // 本地刪除
  const currentRecords = getLocalData<InventoryRecord[]>(LOCAL_STORAGE_RECORDS_KEY, sampleRecords);
  setLocalData(LOCAL_STORAGE_RECORDS_KEY, currentRecords.filter(r => r.orderId !== orderId));

  // 記錄日誌
  const newLog: OperationLog = {
    id: `log-${Date.now()}`,
    action: 'DELETE',
    targetId: orderId,
    targetName: `刪除單據 ${orderId}`,
    userId: userEmail,
    userEmail,
    timestamp: new Date().toISOString(),
  };
  const currentLogs = getLocalData<OperationLog[]>(LOCAL_STORAGE_LOGS_KEY, sampleLogs);
  setLocalData(LOCAL_STORAGE_LOGS_KEY, [newLog, ...currentLogs]);

  // 同步 Firebase
  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, 'inventory_records'), where('orderId', '==', orderId));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));

      const logRef = doc(collection(db, 'operation_logs'));
      batch.set(logRef, {
        ...newLog,
        timestamp: serverTimestamp()
      });
      await batch.commit();
    } catch (e) {
      console.warn('Failed deleting order on Firebase:', e);
    }
  }
};

// 讀取操作稽核日誌 (支援雙向合併)
export const fetchAuditLogs = async (): Promise<OperationLog[]> => {
  const localLogs = getLocalData<OperationLog[]>(LOCAL_STORAGE_LOGS_KEY, sampleLogs);

  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, 'operation_logs'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const remoteLogs = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          timestamp: d.data().timestamp?.toDate ? d.data().timestamp.toDate().toISOString() : d.data().timestamp
        })) as OperationLog[];
        const remoteIds = new Set(remoteLogs.map(l => l.id || l.targetId));
        const unSyncedLogs = localLogs.filter(l => !remoteIds.has(l.id || l.targetId));
        const merged = [...unSyncedLogs, ...remoteLogs];
        setLocalData(LOCAL_STORAGE_LOGS_KEY, merged);
        return merged;
      }
    } catch (e) {
      console.warn('Firebase query logs failed (請確認 Firestore 規則):', e);
    }
  }

  return localLogs;
};