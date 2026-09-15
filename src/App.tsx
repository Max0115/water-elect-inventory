import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { InventoryRecord } from './types';
import { AddOrderModal } from './components/AddOrderModal';
import { Plus, ChevronDown, ChevronRight, PackageCheck } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const fetchRecords = async () => {
    try {
      const q = query(collection(db, 'inventory_records'), orderBy('orderId', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as InventoryRecord[];
      setRecords(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // 依照 orderId 群組化
  const groupedOrders = records.reduce((acc, cur) => {
    if (!acc[cur.orderId]) acc[cur.orderId] = [];
    acc[cur.orderId].push(cur);
    return acc;
  }, {} as Record<string, InventoryRecord[]>);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-app-border pb-4">
          <div className="flex items-center space-x-3">
            <PackageCheck className="text-blue-500" size={28} />
            <h1 className="text-2xl font-bold tracking-wide">水電材料進銷存系統</h1>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium shadow-md transition"
          >
            <Plus size={18} className="mr-2" /> 新增訂單
          </button>
        </header>

        {/* 訂單折疊清單 */}
        <div className="space-y-4">
          {Object.entries(groupedOrders).map(([orderId, items]) => {
            const isExpanded = expandedOrders[orderId];
            const firstItem = items[0];
            return (
              <div key={orderId} className="bg-app-card border border-app-border rounded-lg overflow-hidden">
                <div 
                  onClick={() => toggleExpand(orderId)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-app-border/40 transition select-none"
                >
                  <div className="flex items-center space-x-4">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <span className="font-mono font-bold text-blue-400">{orderId}</span>
                    <span className="text-sm bg-app-bg px-2 py-1 rounded border border-app-border">
                      {firstItem.type === 'IN' ? '進貨' : firstItem.type === 'OUT' ? '出貨' : '退貨'}
                    </span>
                    <span className="text-sm text-app-muted">{firstItem.orderDate}</span>
                  </div>
                  <div className="text-sm text-app-muted">
                    共 {items.length} 項品項
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-app-border p-4 bg-[#252932]">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-app-muted border-b border-app-border pb-2">
                          <th className="py-2">品名</th>
                          <th className="py-2">規格</th>
                          <th className="py-2">數量</th>
                          <th className="py-2">單位</th>
                          <th className="py-2">庫位</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b border-app-border/40 last:border-none">
                            <td className="py-2 font-medium">{item.itemName}</td>
                            <td className="py-2 text-app-muted">{item.specification || '-'}</td>
                            <td className="py-2">{item.quantity}</td>
                            <td className="py-2 text-app-muted">{item.unit}</td>
                            <td className="py-2 text-app-muted">{item.location || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          {Object.keys(groupedOrders).length === 0 && (
            <div className="text-center py-16 text-app-muted">
              目前尚無任何單據資料，點擊右上角「新增訂單」開始建立。
            </div>
          )}
        </div>
      </div>

      <AddOrderModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchRecords} 
      />
    </div>
  );
}