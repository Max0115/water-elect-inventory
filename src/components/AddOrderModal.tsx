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
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState<OrderItem[]>([
    { orderDate: '', orderIndex: 1, type: 'IN', category: 'PVC另件材料', itemName: 'OL', specification: '3/4"', quantity: 10, unit: '只', location: '地下室配管區', supplier: '' }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      { orderDate, orderIndex: items.length + 1, type, category: 'PVC另件材料', itemName: '', specification: '', quantity: 1, unit: '只', location: '地下室配管區', supplier: '' }
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = items.map(it => ({ ...it, supplier }));
      await saveOrderWithItems(type, orderDate, payload, 'admin@system.local');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('開單失敗，請檢查資料庫狀態');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-[#242833] border border-[#343A48] rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-[#2F3442] pb-3">
          <h2 className="text-xl font-bold text-white">開立材料異動單據</h2>
          <button onClick={onClose}><X className="text-[#8E96A4] hover:text-white" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#8E96A4] mb-1 font-medium">單據類型</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as OrderType)}
                className="w-full bg-[#1A1D24] border border-[#373D4A] rounded-lg p-2.5 text-white text-sm"
              >
                <option value="IN">進貨入庫 (I)</option>
                <option value="OUT">現場領料出庫 (O)</option>
                <option value="R">退回材料商 (R)</option>
                <option value="SCRAP">工地零料/餘料入庫 (S)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8E96A4] mb-1 font-medium">單據日期</label>
              <input 
                type="date" 
                value={orderDate} 
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full bg-[#1A1D24] border border-[#373D4A] rounded-lg p-2 text-white text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#8E96A4] mb-1 font-medium">材料商 / 領料工班</label>
              <input 
                type="text" 
                placeholder="如: 太乙材料行、阿水師工班"
                value={supplier} 
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-[#1A1D24] border border-[#373D4A] rounded-lg p-2 text-white text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm text-white">材料品項明細</span>
              <button 
                type="button" 
                onClick={handleAddItem}
                className="flex items-center text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-md transition"
              >
                <Plus size={14} className="mr-1" /> 新增品項
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-[#1D212A] p-2.5 rounded-lg border border-[#2F3442]">
                  <input 
                    placeholder="分類 (如: 給水另件)"
                    value={item.category}
                    onChange={(e) => {
                      const copy = [...items];
                      copy[idx].category = e.target.value;
                      setItems(copy);
                    }}
                    className="w-32 bg-[#252A36] border border-[#373D4A] rounded px-2 py-1 text-xs text-white"
                    required
                  />
                  <input 
                    placeholder="品名 (如: 45度OL)"
                    value={item.itemName}
                    onChange={(e) => {
                      const copy = [...items];
                      copy[idx].itemName = e.target.value;
                      setItems(copy);
                    }}
                    className="flex-1 bg-[#252A36] border border-[#373D4A] rounded px-2 py-1 text-xs text-white"
                    required
                  />
                  <input 
                    placeholder="規格 (如: 3/4)"
                    value={item.specification}
                    onChange={(e) => {
                      const copy = [...items];
                      copy[idx].specification = e.target.value;
                      setItems(copy);
                    }}
                    className="w-24 bg-[#252A36] border border-[#373D4A] rounded px-2 py-1 text-xs text-white"
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
                    className="w-20 bg-[#252A36] border border-[#373D4A] rounded px-2 py-1 text-xs text-white font-mono"
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
                    className="w-16 bg-[#252A36] border border-[#373D4A] rounded px-2 py-1 text-xs text-white"
                  />
                  <input 
                    placeholder="庫位"
                    value={item.location}
                    onChange={(e) => {
                      const copy = [...items];
                      copy[idx].location = e.target.value;
                      setItems(copy);
                    }}
                    className="w-28 bg-[#252A36] border border-[#373D4A] rounded px-2 py-1 text-xs text-white"
                  />
                  {items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-400 p-1 hover:bg-red-500/10 rounded">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#2F3442]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-[#2A2E39] text-[#8E96A4] hover:text-white rounded-lg text-sm"
            >
              取消
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {loading ? '儲存中...' : '確認送出單據'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};