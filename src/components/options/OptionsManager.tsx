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
  Save,
  GripVertical,
  Wand2,
  BookOpen,
  RotateCcw,
  Sparkles,
  Tag
} from 'lucide-react';
import { GlobalOptions } from '../../types';
import { sanitizeGlobalOptions, sanitizeItemName } from '../../services/inventoryService';
import { DEFAULT_PART_SYNONYMS, DEFAULT_PIPE_SIZE_ALIASES } from '../../services/hydroDictionary';

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
  // 輸入狀態
  const [newCatName, setNewCatName] = useState('');
  const [newItemName, setNewItemName] = useState<Record<string, string>>({});
  const [newSpec, setNewSpec] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newSup, setNewSup] = useState('');

  // 暫存安全存量門檻編輯
  const [selectedMinStockItem, setSelectedMinStockItem] = useState('');
  const [minStockValue, setMinStockValue] = useState<number>(5);

  // 標籤膠囊拖動排序狀態 (精準插入指標)
  const [draggingItem, setDraggingItem] = useState<{ listId: string; index: number } | null>(null);
  const [dragTarget, setDragTarget] = useState<{ listId: string; insertIndex: number } | null>(null);

  // 分類卡片拖動排序狀態 (精準水平插入指示線)
  const [draggingCatIndex, setDraggingCatIndex] = useState<number | null>(null);
  const [dragCatTargetIndex, setDragCatTargetIndex] = useState<number | null>(null);

  const allItemNames = Object.values(options.categories).flat();

  // 水電專屬同義詞與管件尺寸辭典狀態
  const currentSynonyms = options.synonyms || DEFAULT_PART_SYNONYMS;
  const currentSizeAliases = options.sizeAliases || DEFAULT_PIPE_SIZE_ALIASES;
  
  const [selectedTermForAlias, setSelectedTermForAlias] = useState<string>('球閥');
  const [newSynonymAlias, setNewSynonymAlias] = useState('');
  const [newCustomStdTerm, setNewCustomStdTerm] = useState('');

  const [selectedSizeForAlias, setSelectedSizeForAlias] = useState<string>('1/2"');
  const [newSizeAliasText, setNewSizeAliasText] = useState('');

  // 新增同義詞別名至指定標準名
  const handleAddSynonymAlias = (targetTerm: string) => {
    if (!newSynonymAlias.trim()) return;
    const cleanAlias = newSynonymAlias.trim();
    const updated = { ...currentSynonyms };
    const existing = updated[targetTerm] || [];
    if (!existing.includes(cleanAlias)) {
      updated[targetTerm] = [...existing, cleanAlias];
      onUpdateOptions({ ...options, synonyms: updated });
      onShowToast(`已將「${cleanAlias}」加入「${targetTerm}」俗稱對照`, 'success');
      setNewSynonymAlias('');
    }
  };

  // 移除指定標準名中的別名
  const handleRemoveSynonymAlias = (term: string, alias: string) => {
    const updated = { ...currentSynonyms };
    if (updated[term]) {
      updated[term] = updated[term].filter(a => a !== alias);
      onUpdateOptions({ ...options, synonyms: updated });
      onShowToast(`已移除別名「${alias}」`, 'info');
    }
  };

  // 新增自訂標準品名進同義詞庫
  const handleAddCustomStdTerm = () => {
    if (!newCustomStdTerm.trim()) return;
    const term = newCustomStdTerm.trim();
    if (currentSynonyms[term]) {
      onShowToast(`「${term}」已存在於辭典中`, 'error');
      return;
    }
    const updated = { ...currentSynonyms, [term]: [term] };
    onUpdateOptions({ ...options, synonyms: updated });
    setSelectedTermForAlias(term);
    setNewCustomStdTerm('');
    onShowToast(`已新增標準名「${term}」至詞庫`, 'success');
  };

  // 新增尺寸別名至指定尺寸 (例如 1/2" 新增 "半吋")
  const handleAddSizeAlias = (targetSize: string) => {
    if (!newSizeAliasText.trim()) return;
    const cleanAlias = newSizeAliasText.trim();
    const updated = { ...currentSizeAliases };
    const existing = updated[targetSize] || [];
    if (!existing.includes(cleanAlias)) {
      updated[targetSize] = [...existing, cleanAlias];
      onUpdateOptions({ ...options, sizeAliases: updated });
      onShowToast(`已將「${cleanAlias}」加入「${targetSize}」尺寸別名`, 'success');
      setNewSizeAliasText('');
    }
  };

  // 移除尺寸別名
  const handleRemoveSizeAlias = (size: string, alias: string) => {
    const updated = { ...currentSizeAliases };
    if (updated[size]) {
      updated[size] = updated[size].filter(a => a !== alias);
      onUpdateOptions({ ...options, sizeAliases: updated });
      onShowToast(`已移除「${size}」的別名「${alias}」`, 'info');
    }
  };

  // 恢復預設水電詞庫
  const handleResetDictionary = () => {
    if (window.confirm('確定要將管件尺寸對照與台語俗稱詞庫還原為水電標準預設值嗎？')) {
      onUpdateOptions({
        ...options,
        synonyms: DEFAULT_PART_SYNONYMS,
        sizeAliases: DEFAULT_PIPE_SIZE_ALIASES
      });
      onShowToast('已成功還原為水電官方標準辭典庫', 'success');
    }
  };

  // 標籤拖動開始
  const handlePillDragStart = (e: React.DragEvent, listId: string, index: number) => {
    e.stopPropagation();
    setDraggingItem({ listId, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  // 標籤拖動經過目標：以滑鼠在元素的左半/右半精確計算插入點
  const handlePillDragOver = (e: React.DragEvent, listId: string, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingItem || draggingItem.listId !== listId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const isAfter = (e.clientX - rect.left) > (rect.width / 2);
    const targetIndex = isAfter ? idx + 1 : idx;

    if (!dragTarget || dragTarget.listId !== listId || dragTarget.insertIndex !== targetIndex) {
      setDragTarget({ listId, insertIndex: targetIndex });
    }
  };

  // 標籤放置落下 (精準插入至指定位置)
  const handlePillDrop = (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingItem || !dragTarget || draggingItem.listId !== listId) {
      setDraggingItem(null);
      setDragTarget(null);
      return;
    }

    const from = draggingItem.index;
    const to = dragTarget.insertIndex;
    setDraggingItem(null);
    setDragTarget(null);

    if (from === to || from === to - 1) return;

    const reorder = (origList: string[]) => {
      const list = [...origList];
      const [item] = list.splice(from, 1);
      const target = from < to ? to - 1 : to;
      list.splice(target, 0, item);
      return list;
    };

    if (listId === 'specifications') {
      onUpdateOptions({ ...options, specifications: reorder(options.specifications) });
    } else if (listId === 'units') {
      onUpdateOptions({ ...options, units: reorder(options.units) });
    } else if (listId === 'suppliers') {
      onUpdateOptions({ ...options, suppliers: reorder(options.suppliers) });
    } else if (listId === 'locations') {
      onUpdateOptions({ ...options, locations: reorder(options.locations) });
    } else if (listId.startsWith('cat_items_')) {
      const catName = listId.replace('cat_items_', '');
      const currentItems = options.categories[catName] || [];
      onUpdateOptions({
        ...options,
        categories: {
          ...options.categories,
          [catName]: reorder(currentItems)
        }
      });
    }
    onShowToast('已調整排列順序', 'info');
  };

  // 分類卡片拖動開始
  const handleCategoryDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggingCatIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 分類卡片拖動經過：以滑鼠在上半/下半精確計算插入點
  const handleCategoryDragOver = (e: React.DragEvent, catIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingCatIndex === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const isAfter = (e.clientY - rect.top) > (rect.height / 2);
    const target = isAfter ? catIdx + 1 : catIdx;

    if (dragCatTargetIndex !== target) {
      setDragCatTargetIndex(target);
    }
  };

  // 分類卡片放置落下
  const handleCategoryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingCatIndex === null || dragCatTargetIndex === null) {
      setDraggingCatIndex(null);
      setDragCatTargetIndex(null);
      return;
    }

    const from = draggingCatIndex;
    const to = dragCatTargetIndex;
    setDraggingCatIndex(null);
    setDragCatTargetIndex(null);

    if (from === to || from === to - 1) return;

    const catEntries = Object.entries(options.categories);
    const [removed] = catEntries.splice(from, 1);
    const target = from < to ? to - 1 : to;
    catEntries.splice(target, 0, removed);

    const reorderedCategories: Record<string, string[]> = {};
    catEntries.forEach(([k, v]) => {
      reorderedCategories[k] = v;
    });

    onUpdateOptions({
      ...options,
      categories: reorderedCategories
    });

    onShowToast('已調整分類先後順序', 'info');
  };

  // 一鍵清理所有品名中之尺寸規格
  const handleCleanAllDimensions = () => {
    const cleaned = sanitizeGlobalOptions(options);
    onUpdateOptions(cleaned);
    onShowToast('已全面清除品名中的尺寸標註，統一由規格庫管理！', 'success');
  };

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

  // 新增品名（自動過濾尺寸）
  const handleAddItemToCategory = (cat: string) => {
    const rawVal = (newItemName[cat] || '').trim();
    if (!rawVal) return;
    const val = sanitizeItemName(rawVal);
    if (!val) {
      onShowToast('請輸入有效品名', 'error');
      return;
    }
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

  // 通用可拖動標籤清單渲染器 (附帶高辨識度垂直霓虹光插入線)
  const renderDraggablePills = (listId: string, items: string[], onRemove: (item: string) => void, colorClass = 'text-white') => {
    return (
      <div 
        onDragOver={(e) => {
          e.preventDefault();
          if (items.length === 0 && draggingItem?.listId === listId) {
            setDragTarget({ listId, insertIndex: 0 });
          }
        }}
        onDrop={(e) => handlePillDrop(e, listId)}
        className="flex flex-wrap items-center gap-1.5 min-h-[42px] p-1.5 rounded-xl transition-all"
      >
        {items.map((it, idx) => {
          const isDraggingThis = draggingItem?.listId === listId && draggingItem.index === idx;
          const isInsertBeforeThis = dragTarget?.listId === listId && dragTarget.insertIndex === idx;

          return (
            <React.Fragment key={`${it}_${idx}`}>
              {/* 精準插入光束指示針 (前) */}
              {isInsertBeforeThis && (
                <div className="flex items-center self-stretch mx-0.5 animate-pulse">
                  <div className="w-1.5 h-7 bg-gradient-to-b from-cyan-300 via-cyan-400 to-blue-500 rounded-full shadow-[0_0_12px_#22d3ee] ring-2 ring-cyan-400/60" />
                </div>
              )}

              {/* 膠囊本體 */}
              <div
                draggable
                onDragStart={(e) => handlePillDragStart(e, listId, idx)}
                onDragOver={(e) => handlePillDragOver(e, listId, idx)}
                onDragEnd={() => {
                  setDraggingItem(null);
                  setDragTarget(null);
                }}
                className={`group relative flex items-center bg-[#1E232E] text-xs px-2.5 py-1.5 rounded-lg border border-[#2E3647] cursor-grab active:cursor-grabbing transition-all duration-150 select-none ${colorClass} ${
                  isDraggingThis ? 'opacity-25 scale-90 border-dashed border-cyan-400 bg-cyan-950/30' : 'hover:border-cyan-500/50 hover:bg-[#252C3A]'
                }`}
              >
                <GripVertical size={13} className="text-[#626B7E] group-hover:text-cyan-400 mr-1 shrink-0 transition" />
                <span className="font-medium tracking-wide">{it}</span>
                <button
                  type="button"
                  onClick={() => onRemove(it)}
                  className="ml-1.5 text-[#717B8F] hover:text-red-400 transition"
                >
                  <X size={12} />
                </button>
              </div>
            </React.Fragment>
          );
        })}

        {/* 若插入點在最末端 */}
        {dragTarget?.listId === listId && dragTarget.insertIndex === items.length && (
          <div className="flex items-center self-stretch mx-0.5 animate-pulse">
            <div className="w-1.5 h-7 bg-gradient-to-b from-cyan-300 via-cyan-400 to-blue-500 rounded-full shadow-[0_0_12px_#22d3ee] ring-2 ring-cyan-400/60" />
          </div>
        )}

        {items.length === 0 && (
          <span className="text-[11px] text-[#717B8F] py-1">尚無項目，請在下方新增。</span>
        )}
      </div>
    );
  };

  const catEntries = Object.entries(options.categories);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左欄：水電分類與品名管理 (品名尺寸全數脫鉤 + 支援拖拽排序) */}
      <div className="bg-[#202532] p-5 rounded-2xl border border-[#2B3242] space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#282F3E]">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center">
              <Layers size={17} className="mr-2 text-cyan-400" />
              水電材料分類與品名維護
            </h3>
            <p className="text-[11px] text-[#8E96A4] mt-0.5">
              尺寸規格獨立由規格庫挑選；每個品名與分類皆可直接拖動調整先後順序。
            </p>
          </div>

          <button
            onClick={handleCleanAllDimensions}
            title="一鍵清除所有品名中附帶的幾吋規格文字"
            className="flex items-center text-xs bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 px-2.5 py-1.5 rounded-lg transition"
          >
            <Wand2 size={13} className="mr-1 text-cyan-400" /> 一鍵去尺寸
          </button>
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

        {/* 分類清單區塊 (分類卡片支援精準水平指示光束拖曳排序) */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCategoryDrop}
          className="space-y-3.5 max-h-[640px] overflow-y-auto pr-1"
        >
          {catEntries.map(([cat, items], catIdx) => {
            const isCatDragging = draggingCatIndex === catIdx;
            const isInsertBeforeCat = dragCatTargetIndex === catIdx;

            return (
              <React.Fragment key={cat}>
                {/* 分類卡片插入指示線 (前) */}
                {isInsertBeforeCat && (
                  <div className="my-2 flex items-center justify-center animate-pulse">
                    <div className="h-2 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-[0_0_15px_#22d3ee] ring-2 ring-cyan-400/50" />
                  </div>
                )}

                <div
                  onDragOver={(e) => handleCategoryDragOver(e, catIdx)}
                  className={`p-3.5 bg-[#181C25] rounded-xl border border-[#282F3E] space-y-2.5 transition-all duration-150 ${
                    isCatDragging ? 'opacity-25 border-dashed border-cyan-400 bg-cyan-950/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div 
                      draggable
                      onDragStart={(e) => handleCategoryDragStart(e, catIdx)}
                      onDragEnd={() => {
                        setDraggingCatIndex(null);
                        setDragCatTargetIndex(null);
                      }}
                      className="flex items-center space-x-2 cursor-grab active:cursor-grabbing group select-none p-1 rounded hover:bg-[#202532] transition"
                    >
                      <GripVertical size={15} className="text-[#626B7E] group-hover:text-cyan-400 transition" />
                      <span className="font-bold text-cyan-300 text-sm">{cat}</span>
                      <span className="text-[10px] text-[#717B8F]">({items.length} 項品名)</span>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-[#717B8F] hover:text-red-400 text-xs flex items-center transition p-1"
                      title="刪除此分類"
                    >
                      <Trash2 size={13} className="mr-1" /> 刪除分類
                    </button>
                  </div>

                  {/* 品名膠囊列表 (可拖動排序) */}
                  {renderDraggablePills(`cat_items_${cat}`, items, (it) => handleRemoveItem(cat, it), 'text-white')}

                  {/* 新增品名欄位 */}
                  <div className="flex gap-2 pt-1 border-t border-[#232936]">
                    <input
                      placeholder={`新增品名至 ${cat} (無需填幾吋)...`}
                      value={newItemName[cat] || ''}
                      onChange={(e) => setNewItemName({ ...newItemName, [cat]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItemToCategory(cat);
                        }
                      }}
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
              </React.Fragment>
            );
          })}

          {/* 若分類插入點在最末端 */}
          {dragCatTargetIndex === catEntries.length && (
            <div className="my-2 flex items-center justify-center animate-pulse">
              <div className="h-2 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-[0_0_15px_#22d3ee] ring-2 ring-cyan-400/50" />
            </div>
          )}
        </div>
      </div>

      {/* 右欄：規格庫 (全規格集中)、單位、案場庫位、材料商與安全庫存 */}
      <div className="space-y-4">
        {/* 管件與另件常用規格尺寸 (全尺寸由此挑選，可拖動調整前後順序) */}
        <div className="bg-[#202532] p-5 rounded-2xl border border-cyan-500/30 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#282F3E]">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center">
                <Ruler size={16} className="mr-2 text-cyan-400" />
                管件與另件常用規格尺寸 (統一尺寸庫)
              </h3>
              <p className="text-[11px] text-cyan-300/80 mt-0.5">
                開單時尺寸一律自此規格清單中選取；支援滑鼠拖動排序前後順位。
              </p>
            </div>
            <span className="text-[11px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/40 font-mono">
              {options.specifications.length} 種規格
            </span>
          </div>

          <div className="flex gap-2">
            <input
              placeholder="新增規格尺寸 (例如: 1/2, 3/4, 1-1/2, 2.0mm)..."
              value={newSpec}
              onChange={(e) => setNewSpec(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSpec();
                }
              }}
              className="flex-1 bg-[#161922] border border-[#2E3647] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              onClick={handleAddSpec}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold"
            >
              新增規格
            </button>
          </div>

          {/* 可拖曳之規格列表 */}
          {renderDraggablePills('specifications', options.specifications, (s) => {
            onUpdateOptions({ ...options, specifications: options.specifications.filter(x => x !== s) });
          }, 'text-cyan-300 font-mono')}
        </div>

        {/* 自訂安全存量門檻 */}
        <div className="bg-[#202532] p-5 rounded-2xl border border-[#2B3242] space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#282F3E]">
            <h3 className="font-bold text-white text-sm flex items-center">
              <ShieldAlert size={17} className="mr-2 text-amber-400" />
              自訂安全庫存警示門檻 (Min Stock)
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
              <option value="">-- 請選擇欲設定安全存量的材料品名 --</option>
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

        {/* 計量單位 (可拖曳排序) */}
        <div className="bg-[#202532] p-5 rounded-2xl border border-[#2B3242] space-y-3 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-sm flex items-center">
              <Scale size={16} className="mr-2 text-cyan-400" />
              庫存計量單位 (可拖曳排序)
            </h3>
            <span className="text-[10px] text-[#717B8F]">拖曳調整順序</span>
          </div>
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
          {renderDraggablePills('units', options.units, (u) => {
            onUpdateOptions({ ...options, units: options.units.filter(x => x !== u) });
          })}
        </div>

        {/* 常用材料商與工班 (可拖曳排序) */}
        <div className="bg-[#202532] p-5 rounded-2xl border border-[#2B3242] space-y-3 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-sm flex items-center">
              <Truck size={16} className="mr-2 text-cyan-400" />
              常用材料商與領料工班 (可拖曳排序)
            </h3>
            <span className="text-[10px] text-[#717B8F]">拖曳調整順序</span>
          </div>
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
          {renderDraggablePills('suppliers', options.suppliers, (sup) => {
            onUpdateOptions({ ...options, suppliers: options.suppliers.filter(x => x !== sup) });
          }, 'text-cyan-200')}
        </div>

        {/* 施工案場與庫位 (可拖曳排序) */}
        <div className="bg-[#202532] p-5 rounded-2xl border border-[#2B3242] space-y-3 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-sm flex items-center">
              <MapPin size={16} className="mr-2 text-cyan-400" />
              施工案場與庫位地點 (可拖曳排序)
            </h3>
            <span className="text-[10px] text-[#717B8F]">拖曳調整順序</span>
          </div>
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
          {renderDraggablePills('locations', options.locations, (loc) => {
            onUpdateOptions({ ...options, locations: options.locations.filter(x => x !== loc) });
          })}
        </div>
      </div>
    </div>

    {/* 水電專屬台語俗稱與管件規格 (1/8" ~ 6") 辭典對照管理 */}
    <div className="bg-[#202532] p-5 sm:p-6 rounded-2xl border border-cyan-500/40 shadow-lg space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#282F3E]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              <BookOpen size={18} />
            </span>
            <h3 className="font-bold text-white text-base">
              水電專屬「管件規格 (1/8" ~ 6") 與台語俗稱」自動映射辭典
            </h3>
          </div>
          <p className="text-xs text-[#8E96A4] mt-1.5 leading-relaxed">
            解決「工班師傅口語講台語俗稱，系統存標準中文名」的溝通斷層。搜尋時打「4分 凡而」會自動匹配「1/2" 球閥」；開單時也會自動標註俗稱提示。
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDictionary}
          className="flex items-center text-xs bg-[#161922] hover:bg-[#282F3F] text-cyan-300 hover:text-white px-3 py-2 rounded-xl border border-cyan-800/50 transition self-start sm:self-auto shrink-0 shadow-xs"
          title="還原為台灣水電官方標準管徑與同義詞對照庫"
        >
          <RotateCcw size={13} className="mr-1.5 text-cyan-400" />
          恢復水電官方預設詞庫
        </button>
      </div>

      {/* 雙欄劃分：左欄 1/8"~6"管徑英吋分數對照；右欄 常用零件台語/外來語同義詞對照 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左區塊：1/8" 至 6" 英吋與台語分數對照 */}
        <div className="bg-[#181C25] p-4 rounded-xl border border-[#282F3E] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ruler size={15} className="text-cyan-400" />
              <h4 className="text-xs font-bold text-white">管件英吋與台語分數對照 (1/8" ~ 6")</h4>
            </div>
            <span className="text-[10px] bg-cyan-950/70 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/40 font-mono">
              {Object.keys(currentSizeAliases).length} 種標準管徑
            </span>
          </div>

          {/* 新增別名控制列 */}
          <div className="flex gap-2">
            <select
              value={selectedSizeForAlias}
              onChange={(e) => setSelectedSizeForAlias(e.target.value)}
              className="bg-[#202532] border border-[#2E3647] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono w-28"
            >
              {Object.keys(currentSizeAliases).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              placeholder={`新增「${selectedSizeForAlias}」的俗稱別名 (如: 4分, 半吋)...`}
              value={newSizeAliasText}
              onChange={(e) => setNewSizeAliasText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSizeAlias(selectedSizeForAlias);
                }
              }}
              className="flex-1 bg-[#161922] border border-[#2E3647] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={() => handleAddSizeAlias(selectedSizeForAlias)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
            >
              + 別名
            </button>
          </div>

          {/* 尺寸與別名展示卡片清單 */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {Object.entries(currentSizeAliases).map(([size, aliases]) => (
              <div key={size} className="flex items-center justify-between p-2 rounded-lg bg-[#202532] border border-[#28303F] text-xs">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="font-mono font-bold text-cyan-300 w-16 px-1.5 py-0.5 bg-cyan-950/60 rounded border border-cyan-800/40 text-center shrink-0">
                    {size}
                  </span>
                  <span className="text-[#626B7E]">→</span>
                  <div className="flex flex-wrap gap-1">
                    {aliases.map(al => (
                      <span key={al} className="bg-[#161922] text-[#E1E4EA] px-2 py-0.5 rounded text-[11px] border border-[#2E3647] flex items-center">
                        {al}
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeAlias(size, al)}
                          className="ml-1 text-[#717B8F] hover:text-red-400"
                          title="移除此別名"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右區塊：零件台語/外來語同義詞對照 */}
        <div className="bg-[#181C25] p-4 rounded-xl border border-[#282F3E] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag size={15} className="text-cyan-400" />
              <h4 className="text-xs font-bold text-white">零件台語 / 日語外來語同義詞表</h4>
            </div>
            <span className="text-[10px] bg-cyan-950/70 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/40 font-mono">
              {Object.keys(currentSynonyms).length} 組對照
            </span>
          </div>

          {/* 新增別名至選定品名 */}
          <div className="flex gap-2">
            <select
              value={selectedTermForAlias}
              onChange={(e) => setSelectedTermForAlias(e.target.value)}
              className="bg-[#202532] border border-[#2E3647] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 w-32"
            >
              {Object.keys(currentSynonyms).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              placeholder={`新增「${selectedTermForAlias}」的台語俗稱 (如: 凡而, 歐魯)...`}
              value={newSynonymAlias}
              onChange={(e) => setNewSynonymAlias(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSynonymAlias(selectedTermForAlias);
                }
              }}
              className="flex-1 bg-[#161922] border border-[#2E3647] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={() => handleAddSynonymAlias(selectedTermForAlias)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
            >
              + 俗稱
            </button>
          </div>

          {/* 新增自訂標準名欄位 */}
          <div className="flex gap-2 pt-1 border-t border-[#232936]">
            <input
              placeholder="新增全新標準品名進辭典 (如: 壓接另件, 活心三通)..."
              value={newCustomStdTerm}
              onChange={(e) => setNewCustomStdTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomStdTerm();
                }
              }}
              className="flex-1 bg-[#161922] border border-[#2E3647] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleAddCustomStdTerm}
              className="bg-[#262C3A] hover:bg-[#323A4C] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
            >
              + 標準名
            </button>
          </div>

          {/* 俗稱對照清單 */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
            {Object.entries(currentSynonyms).map(([term, aliases]) => (
              <div key={term} className="p-2.5 rounded-lg bg-[#202532] border border-[#28303F] text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center">
                    <Sparkles size={12} className="mr-1 text-cyan-400" />
                    {term}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = { ...currentSynonyms };
                      delete copy[term];
                      onUpdateOptions({ ...options, synonyms: copy });
                    }}
                    className="text-[#717B8F] hover:text-red-400 text-[11px]"
                    title="刪除此品名辭典群組"
                  >
                    刪除
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {aliases.map(al => (
                    <span key={al} className="bg-[#161922] text-[#E1E4EA] px-2 py-0.5 rounded text-[11px] border border-[#2E3647] flex items-center">
                      {al}
                      <button
                        type="button"
                        onClick={() => handleRemoveSynonymAlias(term, al)}
                        className="ml-1 text-[#717B8F] hover:text-red-400"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
