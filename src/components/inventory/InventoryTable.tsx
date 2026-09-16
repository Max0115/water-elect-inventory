import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, PlusCircle, ArrowUpRight, SlidersHorizontal, X } from 'lucide-react';
import { GlobalOptions } from '../../types';

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
    // 關鍵字搜尋 (品名、規格、庫位)
    const matchSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const minStock = getMinStock(item.itemName);
    const isLow = item.total <= minStock;

    // 低存量快捷過濾
    if (isOnlyLowStock && !isLow) return false;

    // 狀態過濾
    if (stockStatusFilter === 'LOW' && !isLow) return false;
    if (stockStatusFilter === 'NORMAL' && isLow) return false;

    return matchCat && matchSearch;
  });

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
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717B8F]" />
          <input
            type="text"
            placeholder="搜尋材料品名、規格或庫位..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#161922] border border-[#2E3647] rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-[#717B8F] focus:outline-none focus:border-cyan-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

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
              <th className="py-3 px-4 font-semibold">材料分類</th>
              <th className="py-3 px-4 font-semibold">品名與型號</th>
              <th className="py-3 px-4 font-semibold">規格尺寸</th>
              <th className="py-3 px-4 font-semibold">案場 / 庫位</th>
              <th className="py-3 px-4 font-semibold text-right">結存數量</th>
              <th className="py-3 px-4 font-semibold">單位</th>
              <th className="py-3 px-4 font-semibold text-center">庫存狀態</th>
              <th className="py-3 px-4 font-semibold text-right">快捷操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#282F3E]">
            {filtered.map((item, idx) => {
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
                  <td className="py-3 px-4 text-cyan-300 font-mono">
                    {item.specification || '-'}
                  </td>
                  <td className="py-3 px-4 text-[#A1AAB9]">
                    {item.location}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-base">
                    <span className={isZero ? 'text-red-500' : isLow ? 'text-amber-400' : 'text-white'}>
                      {item.total}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#8A93A6]">{item.unit}</td>
                  <td className="py-3 px-4 text-center">
                    {isZero ? (
                      <span className="inline-flex items-center text-[11px] bg-red-950/60 text-red-400 px-2 py-0.5 rounded border border-red-500/40">
                        <AlertTriangle size={12} className="mr-1" /> 已缺料 (0)
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center text-[11px] bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                        <AlertTriangle size={12} className="mr-1" /> 偏低 (≤{minStock})
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[11px] bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40">
                        <CheckCircle size={12} className="mr-1" /> 充足
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
        {filtered.map((item, idx) => {
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
                  <div className="text-xs text-cyan-300 font-mono">規格: {item.specification || '-'}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-bold text-white">
                    <span className={isZero ? 'text-red-500' : isLow ? 'text-amber-400' : 'text-white'}>
                      {item.total}
                    </span>{' '}
                    <span className="text-xs text-[#8A93A6]">{item.unit}</span>
                  </div>
                  {isLow && (
                    <span className="text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40 inline-block mt-1">
                      需補貨
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

