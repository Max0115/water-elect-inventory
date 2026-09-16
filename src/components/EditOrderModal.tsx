import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { OrderItem, GlobalOptions, InventoryRecord } from '../types';
import { updateOrderWithItems } from '../services/inventoryService';

interface Props {
  isOpen: boolean;
  orderId: string;
  initialItems: InventoryRecord[];
  options: GlobalOptions;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditOrderModal: React.FC<Props> = ({ 
  isOpen, 
  orderId, 
  initialItems, 
  options, 
  onClose, 
  onSuccess 
}) => {
  const [orderDate, setOrderDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialItems.length > 0) {
      setOrderDate(initialItems[0].orderDate);
      setSupplier(initialItems[0].supplier || '');
      setItems(initialItems.map(i => ({ ...i })));
    }
  }, [initialItems]);

  if (!isOpen || initialItems.length === 0) return null;

  const type = initialItems[0].type;
  const originalDate = initialItems[0].orderDate;

  const handleAddItem = () => {
    const firstCat = Object.keys(options.categories)[0] || '';
    setItems([
      ...items,
      {
        orderDate,
        orderIndex: items.length + 1,
        type,
        category: firstCat,
        itemName: options.categories[firstCat]?.[0] || '',
        specification: options.specifications[0] || '',
        quantity: 1,
        unit: options.units[0] || '只',
        location: options.locations[0] || '工務所總倉',
        supplier
      }
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = items.map(it => ({ ...it, supplier }));
      await updateOrderWithItems(orderId, originalDate, orderDate, type, payload, 'admin@system.local');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('更新單據失敗，請檢查資料庫狀態');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-[#202532] border border-[#2F374A] rounded-2xl max-w-5xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-5 border-b border-[#2A3243] pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">編輯單據 ({orderId})</h2>
            <p className="text-xs text-[#8E96A4] mt-0.5">如修改日期，系統將自動核發該日期之新單號</p>
          </div>
          <button onClick={onClose} className="text-[#8E96A4] hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <datalist id="edit-specs">{options.specifications.map(s => <option key={s} value={s} />)}</datalist>
        <datalist id="edit-units">{options.units.map(u => <option key={u} value={u} />)}</datalist>
        <datalist id="edit-locations">{options.locations.map(l => <option key={l} value={l} />)}</datalist>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs text-[#8E96A4] mb-1 font-medium">單據日期</label>
              <input 
                type="date" 
                value={orderDate} 
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full bg-[#181C25] border border-[#2E3647] rounded-lg p-2 text-white text-xs sm:text-sm focus:border-cyan-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#8E96A4] mb-1 font-medium">供貨材料商 / 領料工班</label>
              <input 
                type="text" 
                value={supplier} 
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-[#181C25] border border-[#2E3647] rounded-lg p-2 text-white text-xs sm:text-sm focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2.5">
              <span className="font-semibold text-xs sm:text-sm text-white">材料品項明細 ({items.length} 筆)</span>
              <button 
                type="button" 
                onClick={handleAddItem}
                className="flex items-center text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg transition font-medium"
              >
                <Plus size={14} className="mr-1" /> 新增品項
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-[#181C25] p-3 rounded-xl border border-[#28303F]">
                  <select
                    value={item.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const copy = [...items];
                      copy[idx].category = newCat;
                      copy[idx].itemName = options.categories[newCat]?.[0] || '';
                      setItems(copy);
                    }}
                    className="w-full sm:w-36 bg-[#202532] border border-[#2E3647] rounded-lg p-1.5 text-xs text-white focus:outline-none"
                  >
                    {Object.keys(options.categories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <input 
                    list={`edit-items-${idx}`}
                    placeholder="品名"
                    value={item.itemName}
                    onChange={(e) => {
                      const copy = [...items];
                      copy[idx].itemName = e.target.value;
                      setItems(copy);
                    }}
                    className="flex-1 bg-[#202532] border border-[#2E3647] rounded-lg p-1.5 text-xs text-white focus:outline-none"
                    required
                  />
                  <datalist id={`edit-items-${idx}`}>
                    {(options.categories[item.category] || []).map(it => <option key={it} value={it} />)}
                  </datalist>

                  <div className="flex items-center gap-2">
                    <input 
                      list="edit-specs"
                      placeholder="規格"
                      value={item.specification}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].specification = e.target.value;
                        setItems(copy);
                      }}
                      className="w-24 bg-[#202532] border border-[#2E3647] rounded-lg p-1.5 text-xs text-white font-mono"
                    />

                    <input 
                      type="number"
                      min="1"
                      placeholder="數量"
                      value={item.quantity}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].quantity = Number(e.target.value) || 1;
                        setItems(copy);
                      }}
                      className="w-16 bg-[#202532] border border-[#2E3647] rounded-lg p-1.5 text-xs text-white font-mono text-right"
                      required
                    />

                    <input 
                      list="edit-units"
                      placeholder="單位"
                      value={item.unit}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].unit = e.target.value;
                        setItems(copy);
                      }}
                      className="w-16 bg-[#202532] border border-[#2E3647] rounded-lg p-1.5 text-xs text-white text-center"
                    />

                    <input 
                      list="edit-locations"
                      placeholder="庫位"
                      value={item.location}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].location = e.target.value;
                        setItems(copy);
                      }}
                      className="w-28 bg-[#202532] border border-[#2E3647] rounded-lg p-1.5 text-xs text-white"
                    />

                    <button 
                      type="button" 
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="text-[#717B8F] hover:text-red-400 disabled:opacity-30 p-1.5 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A3243]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-[#28303F] text-[#8E96A4] hover:text-white rounded-lg text-xs font-medium transition"
            >
              取消
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-semibold text-white transition disabled:opacity-50 shadow-md shadow-cyan-600/20"
            >
              {loading ? '儲存中...' : '儲存變更'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};