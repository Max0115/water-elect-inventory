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
  deleteDoc
} from 'firebase/firestore';
import { db, hasValidConfig } from '../firebase';
import { OrderType, OrderItem, GlobalOptions, InventoryRecord, OperationLog, CrewCalendarEvent } from '../types';
import { initialOptions, sampleRecords, sampleLogs, sampleCrewEvents } from './mockData';

const LOCAL_STORAGE_RECORDS_KEY = 'water_elect_records_cache_v2';
const LOCAL_STORAGE_OPTIONS_KEY = 'water_elect_options_cache_v2';
const LOCAL_STORAGE_LOGS_KEY = 'water_elect_logs_cache_v2';
const LOCAL_STORAGE_CREW_KEY = 'water_elect_crew_cache_v2';

// 檢查 Firebase 是否有效配置
const isFirebaseConfigured = (): boolean => {
  return hasValidConfig;
};

// 本地緩存輔助函數
const getLocalData = <T>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn(`Failed reading localStorage for ${key}`, e);
  }
  return fallback;
};

const setLocalData = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed writing localStorage for ${key}`, e);
  }
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

  // 本地生成
  const localRecords = getLocalData<InventoryRecord[]>(LOCAL_STORAGE_RECORDS_KEY, sampleRecords);
  const matchingOrders = localRecords.filter(r => r.type === type && r.orderDate === orderDate);
  const uniqueOrderIds = Array.from(new Set(matchingOrders.map(r => r.orderId)));
  const nextSeq = uniqueOrderIds.length + 1;
  return `${prefix}-${dateStr}-${String(nextSeq).padStart(2, '0')}`;
};

// 讀取全域選項
export const fetchGlobalOptions = async (): Promise<GlobalOptions> => {
  if (isFirebaseConfigured()) {
    try {
      const snap = await getDocs(collection(db, 'settings'));
      const optionsDoc = snap.docs.find(d => d.id === 'options');
      if (optionsDoc && optionsDoc.exists()) {
        const data = optionsDoc.data() as GlobalOptions;
        setLocalData(LOCAL_STORAGE_OPTIONS_KEY, data);
        return data;
      }
    } catch (e) {
      console.warn('Could not fetch options from Firebase, using cache', e);
    }
  }
  return getLocalData<GlobalOptions>(LOCAL_STORAGE_OPTIONS_KEY, initialOptions);
};

// 儲存全域選項
export const saveGlobalOptions = async (options: GlobalOptions) => {
  setLocalData(LOCAL_STORAGE_OPTIONS_KEY, options);
  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, 'settings', 'options');
      await setDoc(ref, options, { merge: true });
    } catch (e) {
      console.warn('Failed saving options to Firebase', e);
    }
  }
};

// 讀取全部單據明細
export const fetchInventoryRecords = async (): Promise<InventoryRecord[]> => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, 'inventory_records'), orderBy('orderDate', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryRecord[];
        setLocalData(LOCAL_STORAGE_RECORDS_KEY, data);
        return data;
      }
    } catch (e) {
      console.warn('Firebase query failed, using local records', e);
    }
  }
  return getLocalData<InventoryRecord[]>(LOCAL_STORAGE_RECORDS_KEY, sampleRecords);
};

// 開立新單據
export const saveOrderWithItems = async (
  type: OrderType,
  orderDate: string,
  items: OrderItem[],
  userEmail: string
): Promise<string> => {
  const orderId = await generateOrderId(type, orderDate);
  const now = new Date();

  const newRecords: InventoryRecord[] = items.map((item, index) => ({
    ...item,
    id: `rec-${Date.now()}-${index}`,
    orderId,
    orderDate,
    type,
    orderIndex: index + 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    updatedBy: userEmail,
  }));

  // 本地寫入
  const currentRecords = getLocalData<InventoryRecord[]>(LOCAL_STORAGE_RECORDS_KEY, sampleRecords);
  setLocalData(LOCAL_STORAGE_RECORDS_KEY, [...newRecords, ...currentRecords]);

  // 日誌寫入
  const newLog: OperationLog = {
    id: `log-${Date.now()}`,
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

  // 同步 Firebase
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
      console.warn('Failed syncing order to Firebase', e);
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
      console.warn('Failed syncing updated order to Firebase', e);
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
      console.warn('Failed deleting order on Firebase', e);
    }
  }
};

// 讀取操作稽核日誌
export const fetchAuditLogs = async (): Promise<OperationLog[]> => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, 'operation_logs'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          timestamp: d.data().timestamp?.toDate ? d.data().timestamp.toDate().toISOString() : d.data().timestamp
        })) as OperationLog[];
        setLocalData(LOCAL_STORAGE_LOGS_KEY, data);
        return data;
      }
    } catch (e) {
      console.warn('Firebase query logs failed, using local logs', e);
    }
  }
  return getLocalData<OperationLog[]>(LOCAL_STORAGE_LOGS_KEY, sampleLogs);
};

// 讀取工班排假與出勤行事曆
export const fetchCrewCalendar = async (): Promise<CrewCalendarEvent[]> => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, 'crew_calendar'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as CrewCalendarEvent[];
        setLocalData(LOCAL_STORAGE_CREW_KEY, data);
        return data;
      }
    } catch (e) {
      console.warn('Firebase query crew calendar failed, using local', e);
    }
  }
  return getLocalData<CrewCalendarEvent[]>(LOCAL_STORAGE_CREW_KEY, sampleCrewEvents);
};

// 儲存工班排假事件
export const saveCrewCalendarEvent = async (event: CrewCalendarEvent): Promise<void> => {
  const current = getLocalData<CrewCalendarEvent[]>(LOCAL_STORAGE_CREW_KEY, sampleCrewEvents);
  const exists = current.some(e => e.id === event.id);
  const updated = exists ? current.map(e => e.id === event.id ? event : e) : [event, ...current];
  setLocalData(LOCAL_STORAGE_CREW_KEY, updated);

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, 'crew_calendar', event.id);
      await setDoc(ref, event, { merge: true });
    } catch (e) {
      console.warn('Firebase save crew event failed', e);
    }
  }
};

// 刪除工班排假事件
export const deleteCrewCalendarEvent = async (eventId: string): Promise<void> => {
  const current = getLocalData<CrewCalendarEvent[]>(LOCAL_STORAGE_CREW_KEY, sampleCrewEvents);
  setLocalData(LOCAL_STORAGE_CREW_KEY, current.filter(e => e.id !== eventId));

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, 'crew_calendar', eventId);
      await deleteDoc(ref);
    } catch (e) {
      console.warn('Firebase delete crew event failed', e);
    }
  }
};