import { 
  collection, 
  doc, 
  runTransaction, 
  writeBatch, 
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { OrderType, OrderItem, GlobalOptions } from '../types';

export const generateOrderId = async (type: OrderType, orderDate: string): Promise<string> => {
  const dateStr = orderDate.replace(/-/g, '');
  const prefix = type === 'IN' ? 'I' : type === 'OUT' ? 'O' : type === 'R' ? 'R' : 'S';
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

  return `${prefix}-${dateStr}-${String(nextSeq).padStart(2, '0')}`;
};

export const saveOrderWithItems = async (
  type: OrderType,
  orderDate: string,
  items: OrderItem[],
  userEmail: string
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
  });

  const logRef = doc(collection(db, 'operation_logs'));
  batch.set(logRef, {
    action: 'CREATE',
    targetId: orderId,
    targetName: `單據 ${orderId}`,
    userId: userEmail,
    userEmail,
    timestamp: serverTimestamp(),
    details: { itemCount: items.length, type, orderDate }
  });

  await batch.commit();
  return orderId;
};

export const deleteOrder = async (orderId: string, userEmail: string) => {
  const q = query(collection(db, 'inventory_records'), where('orderId', '==', orderId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  
  snap.docs.forEach(d => batch.delete(d.ref));

  const logRef = doc(collection(db, 'operation_logs'));
  batch.set(logRef, {
    action: 'DELETE',
    targetId: orderId,
    targetName: `刪除單據 ${orderId}`,
    userId: userEmail,
    userEmail,
    timestamp: serverTimestamp(),
  });

  await batch.commit();
};