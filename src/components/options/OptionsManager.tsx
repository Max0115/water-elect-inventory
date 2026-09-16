import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Layers, 
  Ruler, 
  Scale, 
  Truck, 
  MapPin, 
  ShieldAlert,
  Save
} from 'lucide-react';
import { GlobalOptions } from '../../types';

interface Props {
  options: GlobalOptions;
  onUpdateOptions: (updated: GlobalOptions) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const OptionsManager: React.FC<Props> = ({
  options,
  onUpdateOptions,
  onShowToast,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newItemName, setNewItemName] = useState<Record<string, string>>({});
  const [newSpec, setNewSpec] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newSup, setNewSup] = useState('');

  // 暫存安全存量門檻編輯
  const [selectedMinStockItem, setSelectedMinStockItem] = useState('');
  const [minStockValue, setMinStockValue] = useState<number>(5);

  const allItemNames = Object.values(options.categories).flat();

  // 新增分類
  const handleAddCategory = () => {
    const cat = newCatName.trim();
    if (!cat) return;
    if (options.categories[cat]) {
      onShowToast('該分類已存在', 'error');
      return;
    }
    onUpdateOptions({
      ...options,
      categories: { ...options.categories, [cat]: [] }
    });
    setNewCatName('');
    onShowToast(`已新增分類「${cat}」`, 'success');
  };

  // 刪除分類
  const handleDeleteCategory = (cat: string) => {
    if (confirm(`確定刪除分類「${cat}」以及底下的所有材料品名嗎？`)) {
      const copy = { ...options.categories };
      delete copy[cat];
      onUpdateOptions({ ...options, categories: copy });
      onShowToast(`已刪除分類「${cat}」`, 'info');
    }
  };

  // 新增品名到指定分類
  const handleAddItemToCategory = (cat: string) => {
    const val = (newItemName[cat] || '').trim();
    if (!val) return;
    const currentItems = options.categories[cat] || [];
    if (currentItems.includes(val)) {
      onShowToast('該分類下已有相同品名', 'error');
      return;
    }
    onUpdateOptions({
      ...options,
      categories: {
        ...options.categories,
        [cat]: [...currentItems, val]
      }
    });
    setNewItemName({ ...newItemName, [cat]: '' });
    onShowToast(`已新增品名「${val}」至 ${cat}`, 'success');
  };

  // 移除品名
  const handleRemoveItem = (cat: string, item: string) => {
    onUpdateOptions({
      ...options,
      categories: {
        ...options.categories,
        [cat]: options.categories[cat].filter(x => x !== item)
      }
    });
  };

  // 規格處理
  const handleAddSpec = () => {
    const s = newSpec.trim();
    if (!s) return;
    if (options.specifications.includes(s)) return;
    onUpdateOptions({ ...options, specifications: [...options.specifications, s] });
    setNewSpec('');
    onShowToast(`已新增規格「${s}」`, 'success');
  };

  // 單位處理
  const handleAddUnit = () => {
    const u = newUnit.trim();
    if (!u) return;
    if (options.units.includes(u)) return;
    onUpdateOptions({ ...options, units: [...options.units, u] });
    setNewUnit('');
    onShowToast(`已新增單位「${u}」`, 'success');
  };

  // 廠商處理
  const handleAddSupplier = () => {
    const sup = newSup.trim();
    if (!sup) return;
    if (options.suppliers.includes(sup)) return;
    onUpdateOptions({ ...options, suppliers: [...options.suppliers, sup] });
    setNewSup('');
    onShowToast(`已新增材料商/工班「${sup}」`, 'success');
  };

  // 地點處理
  const handleAddLocation = () => {
    const loc = newLoc.trim();
    if (!loc) return;
    if (options.locations.includes(loc)) return;
    onUpdateOptions({ ...options, locations: [...options.locations, loc] });
    setNewLoc('');
    onShowToast(`已新增庫位「${loc}」`, 'success');
  };

  // 儲存安全存量門檻
  const handleSetMinStock = () => {
    if (!selectedMinStockItem) {
      onShowToast('請先選擇材料品名', 'error');
      return;
    }
    const currentMap = options.minStockMap || {};
    onUpdateOptions({
      ...options,
      minStockMap: {
        ...currentMap,
        [selectedMinStockItem]: minStockValue
      }
    });
    onShowToast(`已將 ${selectedMinStockItem} 的安全庫存門檻設為 ${minStockValue}`, 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左欄：水電分類與品名管理 */}
      <div className="bg-[#202532] p-5 rounded-2xl border border-[#2B3242] space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#282F3E]">
          <h3 className="font-bold text-white text-sm flex items-center">
            <Layers size={17} className="mr-2 text-cyan-400" />
            水電材料分類與品名維護
          </h3>
          <span className="text-[11px] text-[#8E96A4]">
            共 {Object.keys(options.categories).length} 個分類
          </span>
        </div>

        {/* 新增分類列 */}
        <div className="flex gap-2">
          <input
            placeholder="新增材料分類 (如: 衛浴銅器、消防另件)..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 bg-[#161922] border border-[#2E3647] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleAddCategory}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center transition shadow-md shadow-cyan-600/20"
          >
            <Plus size={14} className="mr-1" /> 新增分類
          </button>
        </div>

        {/* 分類與品名清單區塊 */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {Object.entries(options.categories).map(([cat, items]) => (
            <div key={cat} className="p-3.5 bg-[#181C25] rounded-xl border border-[#282F3E] space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-cyan-300 text-sm">{cat}</span>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="text-[#717B8F] hover:text-red-400 text-xs flex items-center transition p-1"
                  title="刪除此分類"
                >
                  <Trash2 size={13} className="mr-1" /> 刪除分類
                </button>
              </div>

              {/* 品名膠囊 */}
              <div className="flex flex-wrap gap-1.5">
                {items.map(it => (
                  <span
                    key={it}
                    className="flex items-center bg-[#222734] text-xs px-2.5 py-1 rounded-md text-white border border-[#2D3546]"
                  >
                    {it}
                    <button
                      onClick={() => handleRemoveItem(cat, it)}
                      className="ml-1.5 text-[#717B8F] hover:text-red-400 transition"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {items.length === 0 && (
                  <span className="text-[11px] text-[#717B8F]">尚無品名，請在下方輸入新增。</span>
                )}
              </div>

              {/* 新增品名欄位 */}
              <div className="flex gap-2 pt-1 border-t border-[#232936]">
                <input
                  placeholder={`新增品名至 ${cat}...`}
                  value={newItemName[cat] || ''}
                  onChange={(e) => setNewItemName({ ...newItemName, [cat]: e.target.value })}
                  className="flex-1 bg-[#1F2430] border border-[#2D3546] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleAddItemToCategory(cat)}
                  className="bg-[#262C3A] hover:bg-[#323A4C] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  + 品名
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右欄：規格、單位、案場庫位、材料商與安全庫存 */}
      <div className="space-y-4">
        {/* 自訂安全存量門檻 */}
        <div className="bg-[#202532] p-5 rounded-2xl border border-[#2B3242] space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#282F3E]">
            <h3 className="font-bold text-white text-sm flex items-center">
              <ShieldAlert size={17} className="mr-2 text-amber-400" />
              自訂安全庫存警示門檻 (Min Stock Threshold)
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedMinStockItem}
              onChange={(e) => {
                setSelectedMinStockItem(e.target.value);
                setMinStockValue(options.minStockMap?.[e.target.value] ?? 5);
              }}
              className="flex-1 bg-[#161922] border border-[#2E3647] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- 請選擇欲設定安全存量的品名 --</option>
              {allItemNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#8E96A4] whitespace-nowrap">警戒值:</span>
              <input
                type="number"
                min="0"
                value={minStockValue}
                onChange={(e) => setMinStockValue(Number(e.target.value) || 0)}
                className="w-20 bg-[#161922] border border-[#2E3647] rounded-lg px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSetMinStock}
                className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center transition shadow-md shadow-amber-600/20"
              >
                <Save size={13} className="mr-1" /> 設定
              </button>
            </div>
          </div>

          {/* 現有自訂門檻快速預覽 */}
          {options.minStockMap && Object.keys(options.minStockMap).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.entries(options.minStockMap).map(([name, threshold]) => (
                <span key={name} className="text-[11px] bg-amber-950/40 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40 flex items-center">
                  {name}: ≤{threshold}
                  <button
                    onClick={() => {
                      const copy = { ...options.minStockMap };
                      delete copy[name];
                      onUpdateOptions({ ...options, minStockMap: copy });
                    }}
                    className="ml-1 text-amber-400 hover:text-red-400"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 水電專用規格 */}
        <div className="bg-[#202532] p-5 rounded-2xl border border-[#2B3242] space-y-3 shadow-xs">
          <h3 className="font-bold text-white text-sm flex items-center">
            <Ruler size={16} className="mr-2 text-cyan-400" />
            管件與另件常用規格尺寸
          </h3>
          <div className="flex gap-2">
            <input
              placeholder="新增規格尺寸 (例如: 3/8, 1/4, 2-1/2)..."
              value={newSpec}
              onChange={(e) => setNewSpec(e.target.value)}
              className="flex-1 bg-[#161922] border border-[#2E3647] rounded-lg px-3 py-1.5 text-xs text-white"
            />
            <button
              onClick={handleAddSpec}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              新增規格
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {options.specifications.map(s => (
              <span key={s} className="flex items-center bg-[#181C25] text-xs px-2.5 py-1 rounded-md border border-[#282F3E] text-cyan-200">
                {s}
                <button
                  onClick={() => onUpdateOptions({ ...options, specifications: options.specifications.filter(x => x !== s) })}
                  className="ml-1.5 text-[#717B8F] hover:text-red-400"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 計量單位 */}
        <div className="bg-[#202532] p-5 rounded-2xl border border-[#2B3242] space-y-3 shadow-xs">
          <h3 className="font-bold text-white text-sm flex items-center">
            <Scale size={16} className="mr-2 text-cyan-400" />
            庫存計量單位
          </h3>
          <div className="flex gap-2">
            <input
              placeholder="新增單位 (例如: 捆, 軸, 套)..."
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              className="flex-1 bg-[#161922] border border-[#2E3647] rounded-lg px-3 py-1.5 text-xs text-white"
            />
            <button
              onClick={handleAddUnit}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              新增單位
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {options.units.map(u => (
              <span key={u} className="flex items-center bg-[#181C25] text-xs px-2.5 py-1 rounded-md border border-[#282F3E] text-white">
                {u}
                <button
                  onClick={() => onUpdateOptions({ ...options, units: options.units.filter(x => x !== u) })}
                  className="ml-1.5 text-[#717B8F] hover:text-red-400"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 材料商與工班 */}
        <div className="bg-[#202532] p-5 rounded-2xl border border-[#2B3242] space-y-3 shadow-xs">
          <h3 className="font-bold text-white text-sm flex items-center">
            <Truck size={16} className="mr-2 text-cyan-400" />
            常用材料商與領料工班
          </h3>
          <div className="flex gap-2">
            <input
              placeholder="新增廠商或工班名稱..."
              value={newSup}
              onChange={(e) => setNewSup(e.target.value)}
              className="flex-1 bg-[#161922] border border-[#2E3647] rounded-lg px-3 py-1.5 text-xs text-white"
            />
            <button
              onClick={handleAddSupplier}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              新增
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {options.suppliers.map(sup => (
              <span key={sup} className="flex items-center bg-[#181C25] text-xs px-2.5 py-1 rounded-md border border-[#282F3E] text-cyan-300">
                {sup}
                <button
                  onClick={() => onUpdateOptions({ ...options, suppliers: options.suppliers.filter(x => x !== sup) })}
                  className="ml-1.5 text-[#717B8F] hover:text-red-400"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 案場庫位 */}
        <div className="bg-[#202532] p-5 rounded-2xl border border-[#2B3242] space-y-3 shadow-xs">
          <h3 className="font-bold text-white text-sm flex items-center">
            <MapPin size={16} className="mr-2 text-cyan-400" />
            施工案場與庫位地點
          </h3>
          <div className="flex gap-2">
            <input
              placeholder="新增庫位 (例如: 頂樓水箱區, C棟B1配電室)..."
              value={newLoc}
              onChange={(e) => setNewLoc(e.target.value)}
              className="flex-1 bg-[#161922] border border-[#2E3647] rounded-lg px-3 py-1.5 text-xs text-white"
            />
            <button
              onClick={handleAddLocation}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              新增地點
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {options.locations.map(loc => (
              <span key={loc} className="flex items-center bg-[#181C25] text-xs px-2.5 py-1 rounded-md border border-[#282F3E] text-white">
                {loc}
                <button
                  onClick={() => onUpdateOptions({ ...options, locations: options.locations.filter(x => x !== loc) })}
                  className="ml-1.5 text-[#717B8F] hover:text-red-400"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

