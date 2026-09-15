import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { OrderType, OrderItem } from '../types';
import { saveOrderWithItems } from '../services/inventoryService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddOrderModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [type, setType] = useState<OrderType>('IN');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<OrderItem[]>([
    { orderDate: '', orderIndex: 1, type: 'IN', category: '水管類', itemName: 'PVC 4米', specification: '1吋', quantity: 10, unit: '支', location: 'A-01', supplier: '南亞' }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      { orderDate, orderIndex: items.length + 1, type, category: '', itemName: '', specification: '', quantity: 1, unit: '個', location: '', supplier: '' }
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveOrderWithItems(type, orderDate, items, 'admin@system.local');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('儲存失敗，請檢查網路或權限');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-app-card border border-app-border rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">新增材料單據</h2>
          <button onClick={onClose}><X className="text-app-muted hover:text-white" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-app-muted mb-1">單據類型</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as OrderType)}
                className="w-full bg-app-bg border border-app-border rounded p-2 text-white"
              >
                <option value="IN">進貨單 (I)</option>
                <option value="OUT">出庫/領料單 (O)</option>
                <option value="R">退貨單 (R)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-app-muted mb-1">單據日期</label>
              <input 
                type="date" 
                value={orderDate} 
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full bg-app-bg border border-app-border rounded p-2 text-white"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">材料品項明細</span>
              <button 
                type="button" 
                onClick={handleAddItem}
                className="flex items-center text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
              >
                <Plus size={14} className="mr-1" /> 增加明細
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-app-bg p-2 rounded border border-app-border">
                  <input 
                    placeholder="品名"
                    value={item.itemName}
                    onChange={(e) => {
                      const copy = [...items];
                      copy[idx].itemName = e.target.value;
                      setItems(copy);
                    }}
                    className="flex-1 bg-transparent border-b border-app-border px-2 py-1 text-sm outline-none"
                    required
                  />
                  <input 
                    placeholder="規格"
                    value={item.specification}
                    onChange={(e) => {
                      const copy = [...items];
                      copy[idx].specification = e.target.value;
                      setItems(copy);
                    }}
                    className="w-24 bg-transparent border-b border-app-border px-2 py-1 text-sm outline-none"
                  />
                  <input 
                    type="number"
                    placeholder="數量"
                    value={item.quantity}
                    onChange={(e) => {
                      const copy = [...items];
                      copy[idx].quantity = Number(e.target.value);
                      setItems(copy);
                    }}
                    className="w-16 bg-transparent border-b border-app-border px-2 py-1 text-sm outline-none"
                    required
                  />
                  <input 
                    placeholder="單位"
                    value={item.unit}
                    onChange={(e) => {
                      const copy = [...items];
                      copy[idx].unit = e.target.value;
                      setItems(copy);
                    }}
                    className="w-16 bg-transparent border-b border-app-border px-2 py-1 text-sm outline-none"
                  />
                  <input 
                    placeholder="庫位"
                    value={item.location}
                    onChange={(e) => {
                      const copy = [...items];
                      copy[idx].location = e.target.value;
                      setItems(copy);
                    }}
                    className="w-20 bg-transparent border-b border-app-border px-2 py-1 text-sm outline-none"
                  />
                  {items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-400">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-app-bg border border-app-border rounded hover:bg-opacity-80"
            >
              取消
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '儲存中...' : '確認開單'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};