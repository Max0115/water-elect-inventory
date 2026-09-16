import React from 'react';
import { 
  Box, 
  Download, 
  Upload, 
  Layers, 
  Sliders, 
  FileText, 
  LogOut, 
  HardHat, 
  X,
  Wrench
} from 'lucide-react';
import { MainTab } from '../../types';
import { APP_VERSION } from '../../version';

interface Props {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  locations: string[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  selectedLocation,
  onSelectLocation,
  locations,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: { id: MainTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'inventory', label: '庫存總覽', icon: Box },
    { id: 'tools', label: '機具與儀器借還', icon: Wrench },
    { id: 'in_orders', label: '進貨管理', icon: Download },
    { id: 'out_orders', label: '現場領料出庫', icon: Upload },
    { id: 'scrap', label: '餘料 / 短管管理', icon: Layers },
    { id: 'options', label: '材料與常用設定', icon: Sliders },
    { id: 'logs', label: '操作軌跡日誌', icon: FileText },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between bg-[#151820] border-r border-[#262B37] w-64 text-[#9BA3B4]">
      {/* 頂部 LOGO 區塊 */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-[#262B37]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <HardHat size={20} />
            </div>
            <div>
              <div className="font-bold text-base tracking-wide text-white">水電庫存智管</div>
              <div className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase">Site Inventory {APP_VERSION}</div>
            </div>
          </div>
          {/* 手機關閉按鈕 */}
          <button onClick={onCloseMobile} className="md:hidden text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* 案場快速篩選下拉 */}
        <div className="p-4 border-b border-[#262B37]">
          <label className="text-xs text-[#7A8293] block mb-1.5 font-medium flex items-center justify-between">
            <span>當前案場 / 庫位</span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/50">即時切換</span>
          </label>
          <select 
            value={selectedLocation}
            onChange={(e) => onSelectLocation(e.target.value)}
            className="w-full bg-[#1E232E] border border-[#2E3544] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="全部地點">全部地點 (全案場彙總)</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* 導覽選單 */}
        <nav className="p-3 space-y-1.5 text-xs font-medium">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center px-3.5 py-2.5 rounded-lg transition-all text-left ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-300 font-semibold border-l-4 border-cyan-400 pl-3 shadow-inner' 
                    : 'text-[#8E96A4] hover:bg-[#1E232E] hover:text-white'
                }`}
              >
                <Icon size={17} className={`mr-3 shrink-0 ${isActive ? 'text-cyan-400' : 'text-[#727B8E]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 底部使用者資訊 */}
      <div className="p-4 border-t border-[#262B37] text-xs text-[#7A8293] bg-[#12141B]">
        <div className="flex items-center space-x-2.5 mb-2.5">
          <div className="w-7 h-7 rounded-full bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center text-xs">
            工
          </div>
          <div className="overflow-hidden">
            <div className="text-white font-semibold truncate text-xs">現場工務主管</div>
            <div className="text-[10px] text-emerald-400 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse"></span>
              系統連線正常
            </div>
          </div>
        </div>
        <button 
          onClick={() => alert('已鎖定目前終端')} 
          className="flex items-center text-xs text-red-400/80 hover:text-red-300 transition mt-1"
        >
          <LogOut size={13} className="mr-1.5" /> 登出 / 鎖定終端
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 桌面側邊欄 */}
      <aside className="hidden md:block shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* 手機端抽屜背景遮罩 */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

