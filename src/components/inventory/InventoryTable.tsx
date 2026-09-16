import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  PlusCircle, 
  ArrowUpRight, 
  SlidersHorizontal, 
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { GlobalOptions } from '../../types';
import { SearchDropdown } from './SearchDropdown';
import { matchesHydroQuery } from '../../services/hydroDictionary';

export interface CalculatedStock {
  category: string;
  itemName: string;
  specification: string;
  location: string;
  unit: string;
  total: number;
}

interface Props {
  stockList: CalculatedStock[];
  options: GlobalOptions;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  isOnlyLowStock: boolean;
  onToggleLowStock: (val: boolean) => void;
  onQuickAction: (item: CalculatedStock, action: 'IN' | 'OUT') => void;
}

export const InventoryTable: React.FC<Props> = ({
  stockList,
  options,
  selectedCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
  isOnlyLowStock,
  onToggleLowStock,
  onQuickAction,
}) => {
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'LOW' | 'NORMAL'>('ALL');

  const categories = ['全部', ...Object.keys(options.categories)];

  // 取得該品項的安全存量閾值 (預設為 5，若 options.minStockMap 有定義則使用自訂)
  const getMinStock = (itemName: string) => {
    return options.minStockMap?.[itemName] ?? 5;
  };

  const filtered = stockList.filter(item => {
    // 分類過濾
    const matchCat = selectedCategory === '全部' || item.category === selectedCategory;
    // 關鍵字搜尋 (支援水電俗稱、日語外來語與英吋分數自動映射)
    const matchSearch = matchesHydroQuery(
      item,
      searchTerm,
      options.synonyms,
      options.sizeAliases
    );

    const minStock = getMinStock(item.itemName);
    const isLow = item.total <= minStock;

    // 低存量快捷過濾
    if (isOnlyLowStock && !isLow) return false;

    // 狀態過濾
    if (stockStatusFilter === 'LOW' && !isLow) return false;
    if (stockStatusFilter === 'NORMAL' && isLow) return false;

    return matchCat && matchSearch;
  });

  // 三段式排序：升冪 (asc) -> 降冪 (desc) -> 無排序 (none)
  const [sortField, setSortField] = useState<'category' | 'itemName' | 'specification' | 'location' | 'total' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'none'>('none');

  const handleSort = (field: 'category' | 'itemName' | 'specification' | 'location' | 'total' | 'status') => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection('asc');
    } else {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection('none');
      } else {
        setSortDirection('asc');
      }
    }
  };

  const sortedList = useMemo(() => {
    if (!sortField || sortDirection === 'none') {
      return filtered;
    }
    return [...filtered].sort((a, b) => {
      let comp = 0;
      if (sortField === 'total') {
        comp = a.total - b.total;
      } else if (sortField === 'status') {
        const getScore = (it: CalculatedStock) => {
          const min = getMinStock(it.itemName);
          if (it.total <= 0) return 0;
          if (it.total <= min) return 1;
          return 2;
        };
        comp = getScore(a) - getScore(b);
      } else {
        const valA = (a[sortField] || '').toString();
        const valB = (b[sortField] || '').toString();
        comp = valA.localeCompare(valB, 'zh-TW', { numeric: true, sensitivity: 'base' });
      }
      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [filtered, sortField, sortDirection]);

  const renderSortHeader = (field: 'category' | 'itemName' | 'specification' | 'location' | 'total' | 'status', label: string, align: 'left' | 'right' | 'center' = 'left') => {
    const isActive = sortField === field && sortDirection !== 'none';
    return (
      <th
        onClick={() => handleSort(field)}
        className={`py-3 px-4 font-semibold select-none cursor-pointer group hover:text-cyan-400 transition-colors ${
          align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
        }`}
        title={`點擊切換：升冪、降冪、無排序 (目前: ${!isActive ? '無排序' : sortDirection === 'asc' ? '升冪 ↑' : '降冪 ↓'})`}
      >
        <div className={`inline-flex items-center space-x-1.5 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
          <span className={isActive ? 'text-cyan-400 font-bold' : ''}>{label}</span>
          <span className="inline-flex items-center">
            {!isActive ? (
              <ArrowUpDown size={12} className="opacity-35 group-hover:opacity-90 transition" />
            ) : sortDirection === 'asc' ? (
              <ArrowUp size={13} className="text-cyan-400 font-bold" />
            ) : (
              <ArrowDown size={13} className="text-cyan-400 font-bold" />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-4">
      {/* 分類藥丸標籤列 */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-md shadow-cyan-600/20'
                  : 'bg-[#202532] text-[#8E96A4] hover:bg-[#282F3F] hover:text-white border border-[#2B3242]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 搜尋欄與狀態篩選 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-[#1D212C] p-3 rounded-xl border border-[#2A3141]">
        <SearchDropdown
          value={searchTerm}
          onChange={onSearchChange}
          onSelectLowStock={() => {
            setStockStatusFilter('LOW');
            onToggleLowStock(true);
          }}
          placeholder="搜尋材料品名、水電俗稱(如凡而、歐魯)、規格或庫位..."
          className="max-w-md"
        />

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#717B8F] flex items-center">
            <SlidersHorizontal size={13} className="mr-1" /> 狀態：
          </span>
          <div className="flex bg-[#161922] p-1 rounded-lg border border-[#2E3647]">
            <button
              onClick={() => {
                setStockStatusFilter('ALL');
                onToggleLowStock(false);
              }}
              className={`px-2.5 py-1 rounded text-xs transition ${
                stockStatusFilter === 'ALL' && !isOnlyLowStock ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-[#8E96A4] hover:text-white'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => {
                setStockStatusFilter('LOW');
                onToggleLowStock(true);
              }}
              className={`px-2.5 py-1 rounded text-xs transition ${
                stockStatusFilter === 'LOW' || isOnlyLowStock ? 'bg-red-500/20 text-red-300 font-semibold' : 'text-[#8E96A4] hover:text-white'
              }`}
            >
              告急
            </button>
            <button
              onClick={() => {
                setStockStatusFilter('NORMAL');
                onToggleLowStock(false);
              }}
              className={`px-2.5 py-1 rounded text-xs transition ${
                stockStatusFilter === 'NORMAL' && !isOnlyLowStock ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-[#8E96A4] hover:text-white'
              }`}
            >
              充足
            </button>
          </div>

          <span className="text-xs text-[#717B8F] pl-2 border-l border-[#2E3647]">
            共 <strong className="text-cyan-400 font-mono">{filtered.length}</strong> 筆
          </span>
        </div>
      </div>

      {/* 桌面端表格 */}
      <div className="hidden md:block bg-[#202532] border border-[#2B3242] rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#181C25] text-[#8A93A6] border-b border-[#2B3242]">
            <tr>
              {renderSortHeader('category', '材料分類', 'left')}
              {renderSortHeader('itemName', '品名與型號', 'left')}
              {renderSortHeader('specification', '規格尺寸', 'left')}
              {renderSortHeader('location', '案場 / 庫位', 'left')}
              {renderSortHeader('total', '結存數量', 'right')}
              <th className="py-3 px-4 font-semibold">單位</th>
              {renderSortHeader('status', '庫存狀態', 'center')}
              <th className="py-3 px-4 font-semibold text-right">快捷操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#282F3E]">
            {sortedList.map((item, idx) => {
              const minStock = getMinStock(item.itemName);
              const isLow = item.total <= minStock;
              const isZero = item.total <= 0;

              return (
                <tr key={idx} className="hover:bg-[#252B3A] transition">
                  <td className="py-3 px-4 text-[#8A93A6]">
                    <span className="bg-[#181C25] px-2 py-1 rounded border border-[#2E3647]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-white text-sm">
                    {item.itemName}
                  </td>
                  <td className="py-3 px-4 text-cyan-300 font-mono font-semibold">
                    {item.specification || '-'}
                  </td>
                  <td className="py-3 px-4 text-[#A1AAB9]">
                    {item.location}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-base">
                    <span className={isZero ? 'text-red-500 font-bold' : isLow ? 'text-amber-400 font-bold' : 'text-white'}>
                      {item.total}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#8A93A6]">{item.unit}</td>
                  <td className="py-3 px-4 text-center">
                    {isZero ? (
                      <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold badge-stock-empty shadow-xs">
                        <AlertTriangle size={12} className="mr-1 shrink-0" /> 已缺料 (0)
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold badge-stock-low shadow-xs">
                        <AlertTriangle size={12} className="mr-1 shrink-0" /> 偏低 (≤{minStock})
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold badge-stock-normal shadow-xs">
                        <CheckCircle size={12} className="mr-1 shrink-0" /> 充足
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-1.5">
                      <button
                        onClick={() => onQuickAction(item, 'OUT')}
                        title="領料出庫"
                        className="px-2 py-1 rounded bg-[#181C25] hover:bg-amber-900/40 hover:text-amber-300 text-[#8A93A6] border border-[#2E3647] flex items-center transition"
                      >
                        <ArrowUpRight size={13} className="mr-0.5" /> 領料
                      </button>
                      <button
                        onClick={() => onQuickAction(item, 'IN')}
                        title="補貨進場"
                        className="px-2 py-1 rounded bg-[#181C25] hover:bg-cyan-900/40 hover:text-cyan-300 text-[#8A93A6] border border-[#2E3647] flex items-center transition"
                      >
                        <PlusCircle size={13} className="mr-0.5" /> 進貨
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#717B8F]">
                  查無符合條件的水電材料庫存資料
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 手機行動端卡片模式 */}
      <div className="md:hidden space-y-2.5">
        {sortedList.map((item, idx) => {
          const minStock = getMinStock(item.itemName);
          const isLow = item.total <= minStock;
          const isZero = item.total <= 0;

          return (
            <div key={idx} className="bg-[#202532] border border-[#2B3242] p-3.5 rounded-xl space-y-2 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/40 mr-1.5">
                    {item.category}
                  </span>
                  <div className="font-bold text-white text-sm mt-1">{item.itemName}</div>
                  <div className="text-xs text-cyan-300 font-mono font-semibold">規格: {item.specification || '-'}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-bold text-white">
                    <span className={isZero ? 'text-red-500 font-bold' : isLow ? 'text-amber-400 font-bold' : 'text-white'}>
                      {item.total}
                    </span>{' '}
                    <span className="text-xs text-[#8A93A6]">{item.unit}</span>
                  </div>
                  {isZero ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold badge-stock-empty inline-block mt-1">
                      已缺料 (0)
                    </span>
                  ) : isLow ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold badge-stock-low inline-block mt-1">
                      偏低 (≤{minStock})
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold badge-stock-normal inline-block mt-1">
                      充足
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-[#2B3242] text-[#8A93A6]">
                <div>庫位: {item.location}</div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onQuickAction(item, 'OUT')}
                    className="px-2.5 py-1 bg-[#181C25] text-amber-300 rounded border border-[#2E3647]"
                  >
                    領料
                  </button>
                  <button
                    onClick={() => onQuickAction(item, 'IN')}
                    className="px-2.5 py-1 bg-cyan-600 text-white rounded"
                  >
                    進貨
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[#717B8F] bg-[#202532] rounded-xl border border-[#2B3242]">
            查無符合條件的水電材料
          </div>
        )}
      </div>
    </div>
  );
};

