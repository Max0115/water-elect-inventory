import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { OrderType, OrderItem, GlobalOptions } from '../types';
import { saveOrderWithItems } from '../services/inventoryService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  options: GlobalOptions;
}

export const AddOrderModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, options }) => {
  const [type, setType] = useState<OrderType>('IN');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('');
  const [sourceLocation, setSourceLocation] = useState(options.locations[0] || '工務所倉庫');
  const [targetLocation, setTargetLocation] = useState(options.locations[1] || '地下室配管區');
  
  const [items, setItems] = useState<OrderItem[]>([
    { orderDate: '', orderIndex: 1, type: 'IN', category: Object.keys(options.categories)[0] || 'PVC另件材料', itemName: '', specification: options.specifications[0] || '1"', quantity: 10, unit: '只', location: options.locations[0] || '工務所倉庫' }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
        location: type === 'TRANSFER' ? sourceLocation : (options.locations[0] || ''), 
        targetLocation: type === 'TRANSFER' ? targetLocation : undefined,
        supplier: '' 
      }
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = items.map(it => ({
        ...it,
        supplier,
        location: type === 'TRANSFER' ? sourceLocation : it.location,
        targetLocation: type === 'TRANSFER' ? targetLocation : undefined,
      }));
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
      <div className="bg-[#242833] border border-[#343A48] rounded-xl max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-[#2F3442] pb-3">
          <h2 className="text-xl font-bold text-white">開立材料單據</h2>
          <button onClick={onClose}><X className="text-[#8E96A4] hover:text-white" /></button>
        </div>

        {/* Datalist 快速補全 */}
        <datalist id="opt-specs">
          {options.specifications.map(s => <option key={s} value={s} />)}
        </datalist>
        <datalist id="opt-units">
          {options.units.map(u => <option key={u} value={u} />)}
        </datalist>
        <datalist id="opt-locations">
          {options.locations.map(l => <option key={l} value={l} />)}
        </datalist>
        <datalist id="opt-suppliers">
          {options.suppliers.map(sup => <option key={sup} value={sup} />)}
        </datalist>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#8E96A4] mb-1 font-medium">單據類型</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as OrderType)}
                className="w-full bg-[#1A1D24] border border-[#373D4A] rounded-lg p-2.5 text-white text-sm focus:border-cyan-500 outline-none"
              >
                <option value="IN">進貨入庫 (I)</option>
                <option value="OUT">現場領料出庫 (O)</option>
                <option value="R">退回材料商 (R)</option>
                <option value="SCRAP">工地零料/短管入庫 (S)</option>
                <option value="TRANSFER">案場調撥借料 (T)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8E96A4] mb-1 font-medium">單據日期</label>
              <input 
                type="date" 
                value={orderDate} 
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full bg-[#1A1D24] border border-[#373D4A] rounded-lg p-2 text-white text-sm focus:border-cyan-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#8E96A4] mb-1 font-medium">
                {type === 'IN' || type === 'R' ? '材料商' : '領料人 / 工班師傅'}
              </label>
              <input 
                type="text" 
                list="opt-suppliers"
                placeholder="選取或輸入..."
                value={supplier} 
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-[#1A1D24] border border-[#373D4A] rounded-lg p-2 text-white text-sm focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          {/* 調撥單專用：來源庫位與目標庫位 */}
          {type === 'TRANSFER' && (
            <div className="grid grid-cols-2 gap-4 bg-[#1B1E26] p-3 rounded-lg border border-cyan-500/30">
              <div>
                <label className="block text-xs text-cyan-400 mb-1 font-semibold">調出庫位 (來源)</label>
                <select 
                  value={sourceLocation} 
                  onChange={(e) => setSourceLocation(e.target.value)}
                  className="w-full bg-[#242833] border border-[#373D4A] rounded p-2 text-sm text-white"
                >
                  {options.locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-cyan-400 mb-1 font-semibold">調入庫位 (目標)</label>
                <select 
                  value={targetLocation} 
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full bg-[#242833] border border-[#373D4A] rounded p-2 text-sm text-white"
                >
                  {options.locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

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
              {items.map((item, idx) => {
                const availableItems = options.categories[item.category] || [];
                return (
                  <div key={idx} className="flex gap-2 items-center bg-[#1D212A] p-2.5 rounded-lg border border-[#2F3442]">
                    {/* 分類下拉 */}
                    <select
                      value={item.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        const copy = [...items];
                        copy[idx].category = newCat;
                        copy[idx].itemName = options.categories[newCat]?.[0] || '';
                        setItems(copy);
                      }}
                      className="w-36 bg-[#252A36] border border-[#373D4A] rounded px-2 py-1.5 text-xs text-white"
                    >
                      {Object.keys(options.categories).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    {/* 品名下拉（依分類動態連動） */}
                    <input 
                      list={`items-${idx}`}
                      placeholder="品名"
                      value={item.itemName}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].itemName = e.target.value;
                        setItems(copy);
                      }}
                      className="flex-1 bg-[#252A36] border border-[#373D4A] rounded px-2 py-1.5 text-xs text-white"
                      required
                    />
                    <datalist id={`items-${idx}`}>
                      {availableItems.map(it => <option key={it} value={it} />)}
                    </datalist>

                    {/* 規格 */}
                    <input 
                      list="opt-specs"
                      placeholder="規格"
                      value={item.specification}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].specification = e.target.value;
                        setItems(copy);
                      }}
                      className="w-28 bg-[#252A36] border border-[#373D4A] rounded px-2 py-1.5 text-xs text-white"
                    />

                    {/* 數量 */}
                    <input 
                      type="number"
                      placeholder="數量"
                      value={item.quantity}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].quantity = Number(e.target.value);
                        setItems(copy);
                      }}
                      className="w-20 bg-[#252A36] border border-[#373D4A] rounded px-2 py-1.5 text-xs text-white font-mono"
                      required
                    />

                    {/* 單位 */}
                    <input 
                      list="opt-units"
                      placeholder="單位"
                      value={item.unit}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].unit = e.target.value;
                        setItems(copy);
                      }}
                      className="w-16 bg-[#252A36] border border-[#373D4A] rounded px-2 py-1.5 text-xs text-white"
                    />

                    {/* 庫位（調撥單時隱藏，因為上方已統一設定） */}
                    {type !== 'TRANSFER' && (
                      <input 
                        list="opt-locations"
                        placeholder="庫位"
                        value={item.location}
                        onChange={(e) => {
                          const copy = [...items];
                          copy[idx].location = e.target.value;
                          setItems(copy);
                        }}
                        className="w-28 bg-[#252A36] border border-[#373D4A] rounded px-2 py-1.5 text-xs text-white"
                      />
                    )}

                    {items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-400 p-1 hover:bg-red-500/10 rounded">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
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