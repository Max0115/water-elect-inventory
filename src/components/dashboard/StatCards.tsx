import React from 'react';
import { Package, AlertTriangle, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  totalSkus: number;
  lowStockCount: number;
  todayInCount: number;
  todayOutCount: number;
  onFilterLowStock: () => void;
  isLowStockFilterActive: boolean;
}

export const StatCards: React.FC<StatCardProps> = ({
  totalSkus,
  lowStockCount,
  todayInCount,
  todayOutCount,
  onFilterLowStock,
  isLowStockFilterActive,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
      {/* 總在庫品項 */}
      <div className="bg-[#202532] border border-[#2B3242] p-4 rounded-xl shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#8A93A6] mb-2 font-medium">
          <span>在庫材料品項</span>
          <Package size={16} className="text-cyan-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl md:text-3xl font-bold font-mono text-white">{totalSkus}</span>
          <span className="text-xs text-[#8A93A6]">種品項</span>
        </div>
        <div className="text-[11px] text-[#70798C] mt-2 truncate">即時計算各案場結存</div>
      </div>

      {/* 安全存量告急 */}
      <div 
        onClick={onFilterLowStock}
        className={`border p-4 rounded-xl shadow-xs cursor-pointer transition-all ${
          isLowStockFilterActive
            ? 'bg-red-950/40 border-red-500 shadow-red-500/10'
            : 'bg-[#202532] border-[#2B3242] hover:border-red-500/50'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-[#8A93A6] mb-2 font-medium">
          <span className="text-red-300 flex items-center">
            <AlertTriangle size={13} className="mr-1 text-red-400 animate-pulse" /> 存量告急品項
          </span>
          <span className="text-[10px] text-cyan-400 hover:underline">
            {isLowStockFilterActive ? '顯示全部' : '點擊篩選'}
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl md:text-3xl font-bold font-mono text-red-400">{lowStockCount}</span>
          <span className="text-xs text-red-300/80">項需補貨</span>
        </div>
        <div className="text-[11px] text-[#70798C] mt-2 truncate">低於預設或自訂安全警戒值</div>
      </div>

      {/* 今日進貨 */}
      <div className="bg-[#202532] border border-[#2B3242] p-4 rounded-xl shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#8A93A6] mb-2 font-medium">
          <span>今日進場材料</span>
          <ArrowDownRight size={16} className="text-emerald-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl md:text-3xl font-bold font-mono text-emerald-400">{todayInCount}</span>
          <span className="text-xs text-[#8A93A6]">筆單據</span>
        </div>
        <div className="text-[11px] text-[#70798C] mt-2 truncate">大宗材料商與管件到貨</div>
      </div>

      {/* 今日出庫領料 */}
      <div className="bg-[#202532] border border-[#2B3242] p-4 rounded-xl shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#8A93A6] mb-2 font-medium">
          <span>今日現場領料</span>
          <ArrowUpRight size={16} className="text-amber-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl md:text-3xl font-bold font-mono text-amber-400">{todayOutCount}</span>
          <span className="text-xs text-[#8A93A6]">筆領料</span>
        </div>
        <div className="text-[11px] text-[#70798C] mt-2 truncate">工班領用與案場施工消耗</div>
      </div>
    </div>
  );
};

