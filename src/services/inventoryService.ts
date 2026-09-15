import { 
  collection, 
  doc, 
  runTransaction, 
  writeBatch, 
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { OrderType, OrderItem, GlobalOptions } from '../types';

export const generateOrderId = async (type: OrderType, orderDate: string): Promise<string> => {
  const dateStr = orderDate.replace(/-/g, '');
  const prefix = type === 'IN' ? 'I' : type === 'OUT' ? 'O' : 'R';
  const counterId = `${type}_${dateStr}`;
  const counterRef = doc(db, 'order_counters', counterId);

  const nextSeq = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    let seq = 1;
    if (counterDoc.exists()) {
      seq = counterDoc.data().currentSeq + 1;
    }
    transaction.set(counterRef, { currentSeq: seq }, { merge: true });
    return seq;
  });

  const seqStr = String(nextSeq).padStart(2, '0');
  return `${prefix}-${dateStr}-${seqStr}`;
};

export const saveOrderWithItems = async (
  type: OrderType,
  orderDate: string,
  items: OrderItem[],
  userEmail: string,
  newOptions?: Partial<GlobalOptions>
) => {
  const orderId = await generateOrderId(type, orderDate);
  const batch = writeBatch(db);

  items.forEach((item, index) => {
    const recordRef = doc(collection(db, 'inventory_records'));
    batch.set(recordRef, {
      ...item,
      orderId,
      orderDate,
      type,
      orderIndex: index + 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: userEmail,
    });

    // 庫存複合鍵 Key
    const stockId = `${item.category}_${item.itemName}_${item.specification}_${item.location}`.replace(/[\/\s]/g, '_');
    const stockRef = doc(db, 'inventory_stocks', stockId);
    
    // 即時庫存扣減/增加 (進貨/退貨加, 出貨減)
    const delta = type === 'OUT' ? -Number(item.quantity) : Number(item.quantity);
    batch.set(stockRef, {
      category: item.category,
      itemName: item.itemName,
      specification: item.specification,
      location: item.location,
      unit: item.unit,
      currentStock: delta, // 若為生產環境請搭配交易或 increment
      lastUpdated: serverTimestamp(),
    }, { merge: true });
  });

  // 操作日誌
  const logRef = doc(collection(db, 'operation_logs'));
  batch.set(logRef, {
    action: 'CREATE',
    targetId: orderId,
    targetName: `訂單 ${orderId}`,
    userId: userEmail,
    userEmail: userEmail,
    timestamp: serverTimestamp(),
    details: { itemCount: items.length, type, orderDate }
  });

  await batch.commit();
  return orderId;
};