import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Sparkles } from 'lucide-react';
import { OrderType, OrderItem, GlobalOptions } from '../types';
import { saveOrderWithItems } from '../services/inventoryService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  options: GlobalOptions;
  prefillItem?: {
    category: string;
    itemName: string;
    specification: string;
    location: string;
    unit: string;
    actionType?: OrderType;
  } | null;
}

export const AddOrderModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  options, 
  prefillItem 
}) => {
  const [type, setType] = useState<OrderType>('IN');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('');
  const [sourceLocation, setSourceLocation] = useState(options.locations[0] || '工務所總倉');
  const [targetLocation, setTargetLocation] = useState(options.locations[1] || '地下室配管區');
  
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (prefillItem) {
      setType(prefillItem.actionType || 'OUT');
      setItems([
        {
          orderDate,
          orderIndex: 1,
          type: prefillItem.actionType || 'OUT',
          category: prefillItem.category,
          itemName: prefillItem.itemName,
          specification: prefillItem.specification,
          quantity: 1,
          unit: prefillItem.unit,
          location: prefillItem.location,
          supplier: ''
        }
      ]);
    } else {
      const firstCat = Object.keys(options.categories)[0] || 'PVC另件材料';
      const firstItem = options.categories[firstCat]?.[0] || '';
      setItems([
        { 
          orderDate, 
          orderIndex: 1, 
          type, 
          category: firstCat, 
          itemName: firstItem, 
          specification: options.specifications[0] || '1"', 
          quantity: 10, 
          unit: options.units[0] || '只', 
          location: options.locations[0] || '工務所總倉' 
        }
      ]);
    }
  }, [isOpen, prefillItem]);

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
    if (items.length <= 1) return;
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-[#202532] border border-[#2F374A] rounded-2xl max-w-5xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-5 border-b border-[#2A3243] pb-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-bold text-white">開立材料異動單據</h2>
            {prefillItem && (
              <span className="text-[11px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/50 flex items-center">
                <Sparkles size={11} className="mr-1 text-cyan-400" /> 已自動帶入材料
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-[#8E96A4] hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* 快速提示選項 */}
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

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs text-[#8E96A4] mb-1 font-medium">單據類型</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as OrderType)}
                className="w-full bg-[#181C25] border border-[#2E3647] rounded-lg p-2 text-white text-xs sm:text-sm focus:border-cyan-500 outline-none"
              >
                <option value="IN">進貨入庫 (IN - 增加庫存)</option>
                <option value="OUT">現場領料 (OUT - 扣除庫存)</option>
                <option value="TRANSFER">工區調撥借料 (TRANSFER)</option>
                <option value="SCRAP">餘料短管暫存 (RECLAIM / SCRAP)</option>
                <option value="R">退回材料商 (R)</option>
              </select>
            </div>
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
              <label className="block text-xs text-[#8E96A4] mb-1 font-medium">
                {type === 'IN' || type === 'R' ? '供貨材料商' : '領料責任工班 / 師傅'}
              </label>
              <input 
                type="text" 
                list="opt-suppliers"
                placeholder="選取或輸入廠商/工班..."
                value={supplier} 
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-[#181C25] border border-[#2E3647] rounded-lg p-2 text-white text-xs sm:text-sm focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          {/* 調撥單專用：來源庫位與目標庫位 */}
          {type === 'TRANSFER' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#181C25] p-3 rounded-xl border border-cyan-500/30">
              <div>
                <label className="block text-xs text-cyan-400 mb-1 font-semibold">調出庫位 (來源)</label>
                <select 
                  value={sourceLocation} 
                  onChange={(e) => setSourceLocation(e.target.value)}
                  className="w-full bg-[#202532] border border-[#2E3647] rounded p-2 text-xs text-white"
                >
                  {options.locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-cyan-400 mb-1 font-semibold">調入庫位 (目標)</label>
                <select 
                  value={targetLocation} 
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full bg-[#202532] border border-[#2E3647] rounded p-2 text-xs text-white"
                >
                  {options.locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* 材料品項明細 */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <span className="font-semibold text-xs sm:text-sm text-white">材料品項清單 ({items.length} 筆)</span>
              <button 
                type="button" 
                onClick={handleAddItem}
                className="flex items-center text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg transition shadow-sm font-medium"
              >
                <Plus size={14} className="mr-1" /> 新增品項列
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => {
                const availableItems = options.categories[item.category] || [];
                return (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-[#181C25] p-3 rounded-xl border border-[#28303F]">
                    {/* 分類下拉 */}
                    <select
                      value={item.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        const newItems = [...items];
                        newItems[idx].category = newCat;
                        newItems[idx].itemName = options.categories[newCat]?.[0] || '';
                        setItems(newItems);
                      }}
                      className="bg-[#202532] border border-[#2E3647] rounded-lg p-1.5 text-xs text-white sm:w-36 focus:outline-none"
                    >
                      {Object.keys(options.categories).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {/* 品名 */}
                    <div className="flex-1">
                      {availableItems.length > 0 ? (
                        <select
                          value={item.itemName}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[idx].itemName = e.target.value;
                            setItems(newItems);
                          }}
                          className="w-full bg-[#202532] border border-[#2E3647] rounded-lg p-1.5 text-xs text-white focus:outline-none"
                        >
                          {availableItems.map(it => <option key={it} value={it}>{it}</option>)}
                        </select>
                      ) : (
                        <input 
                          type="text"
                          placeholder="自訂品名"
                          value={item.itemName}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[idx].itemName = e.target.value;
                            setItems(newItems);
                          }}
                          className="w-full bg-[#202532] border border-[#2E3647] rounded-lg p-1.5 text-xs text-white"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* 規格 */}
                      <input 
                        type="text" 
                        list="opt-specs"
                        placeholder="規格"
                        value={item.specification} 
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].specification = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-24 bg-[#202532] border border-[#2E3647] rounded-lg p-1.5 text-xs text-white font-mono"
                      />

                      {/* 數量 */}
                      <input 
                        type="number" 
                        min="1"
                        placeholder="數量"
                        value={item.quantity} 
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].quantity = Number(e.target.value) || 1;
                          setItems(newItems);
                        }}
                        className="w-16 bg-[#202532] border border-[#2E3647] rounded-lg p-1.5 text-xs text-white font-mono text-right"
                        required
                      />

                      {/* 單位 */}
                      <input 
                        type="text" 
                        list="opt-units"
                        placeholder="單位"
                        value={item.unit} 
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].unit = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-16 bg-[#202532] border border-[#2E3647] rounded-lg p-1.5 text-xs text-white text-center"
                      />

                      {/* 庫位 (非調撥單時可個別指定) */}
                      {type !== 'TRANSFER' && (
                        <select
                          value={item.location}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[idx].location = e.target.value;
                            setItems(newItems);
                          }}
                          className="bg-[#202532] border border-[#2E3647] rounded-lg p-1.5 text-xs text-white w-28 focus:outline-none"
                        >
                          {options.locations.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      )}

                      {/* 刪除品項按鈕 */}
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
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#2A3243] flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg text-xs text-[#8E96A4] hover:text-white hover:bg-[#28303F] transition"
            >
              取消
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 shadow-lg shadow-cyan-600/20 transition"
            >
              {loading ? '儲存開單中...' : '確認開立單據'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};