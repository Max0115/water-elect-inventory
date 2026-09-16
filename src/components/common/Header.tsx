import React from 'react';
import { 
  Menu, 
  Plus, 
  FileSpreadsheet, 
  UploadCloud, 
  RefreshCw,
  MapPin,
  Sun,
  Moon
} from 'lucide-react';
import { MainTab } from '../../types';

interface Props {
  currentTab: MainTab;
  selectedLocation: string;
  onOpenOrderModal: () => void;
  onOpenImportModal: () => void;
  onExportExcel: () => void;
  onRefresh: () => void;
  onOpenMobileMenu: () => void;
  isRefreshing?: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<Props> = ({
  currentTab,
  selectedLocation,
  onOpenOrderModal,
  onOpenImportModal,
  onExportExcel,
  onRefresh,
  onOpenMobileMenu,
  isRefreshing,
  theme,
  onToggleTheme,
}) => {
  const getTabTitle = (tab: MainTab) => {
    switch (tab) {
      case 'inventory': return '即時庫存總覽';
      case 'in_orders': return '進貨單據管理';
      case 'out_orders': return '現場領料出庫';
      case 'scrap': return '工地短管 / 餘料暫存';
      case 'options': return '水電常用規格與選項維護';
      case 'logs': return '系統操作軌跡稽核日誌';
      default: return '庫存系統';
    }
  };

  return (
    <header className="h-16 border-b border-[#262B37] px-4 md:px-6 flex items-center justify-between shrink-0 bg-[#191D26] text-white transition-colors">
      {/* 左側：漢堡按鈕 + 標題與庫位 */}
      <div className="flex items-center space-x-3 md:space-x-4">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg bg-[#222734] text-gray-300 hover:text-white"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center space-x-3">
          <h1 className="text-base md:text-lg font-bold tracking-tight text-white">
            {getTabTitle(currentTab)}
          </h1>
          <div className="hidden sm:flex items-center text-xs bg-[#222734] text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30">
            <MapPin size={12} className="mr-1 text-cyan-400" />
            <span className="font-medium">{selectedLocation}</span>
          </div>
        </div>
      </div>

      {/* 右側：動作按鈕群 */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* 亮暗模式精緻滑動開關 */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? '點擊切換為亮色模式' : '點擊切換為暗色模式'}
          className={`relative w-[82px] h-[34px] rounded-full p-1 transition-colors duration-300 flex items-center cursor-pointer select-none focus:outline-none border shadow-inner ${
            theme === 'dark'
              ? 'bg-[#151821] border-[#2E3647]'
              : 'bg-amber-100/95 border-amber-300 shadow-amber-200/50'
          }`}
        >
          {/* 滑動圓球 */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 ease-in-out z-10 shadow-md ${
              theme === 'dark'
                ? 'translate-x-0 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-cyan-500/25'
                : 'translate-x-[48px] bg-gradient-to-tr from-amber-400 to-orange-400 text-white shadow-amber-500/30'
            }`}
          >
            {theme === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
          </div>

          {/* 文字標籤 (絕對定位在背景兩側) */}
          <div className="absolute inset-0 flex items-center px-2.5 pointer-events-none">
            {theme === 'dark' ? (
              <span className="w-full text-right text-[11px] font-bold text-gray-300 pr-0.5 tracking-wide">
                暗色
              </span>
            ) : (
              <span className="w-full text-left text-[11px] font-bold text-amber-900 pl-0.5 tracking-wide">
                亮色
              </span>
            )}
          </div>
        </button>

        {/* 重新整理 */}
        <button
          onClick={onRefresh}
          title="重新整理數據"
          className="p-2 rounded-lg bg-[#222734] hover:bg-[#2C3243] text-gray-300 hover:text-white border border-[#30384A] transition"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-cyan-400' : ''} />
        </button>

        {/* 庫存分頁特有按鈕：匯出與匯入 */}
        {currentTab === 'inventory' && (
          <>
            <button
              onClick={onOpenImportModal}
              className="hidden lg:flex items-center text-xs bg-[#222734] hover:bg-[#2C3243] border border-[#30384A] px-3 py-2 rounded-lg text-white font-medium transition"
            >
              <UploadCloud size={14} className="mr-1.5 text-cyan-400" /> Excel 批次匯入
            </button>

            <button
              onClick={onExportExcel}
              className="flex items-center text-xs bg-[#222734] hover:bg-[#2C3243] border border-[#30384A] px-3 py-2 rounded-lg text-white font-medium transition"
            >
              <FileSpreadsheet size={14} className="mr-1.5 text-emerald-400" />
              <span className="hidden sm:inline">匯出 Excel</span>
              <span className="sm:hidden">匯出</span>
            </button>
          </>
        )}

        {/* 開單按鈕 */}
        <button
          onClick={onOpenOrderModal}
          className="flex items-center text-xs md:text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-3.5 md:px-4 py-2 rounded-lg font-semibold text-white shadow-lg shadow-cyan-600/25 transition transform active:scale-95"
        >
          <Plus size={16} className="mr-1" />
          <span className="hidden xs:inline">快速開單 / 異動</span>
          <span className="xs:hidden">開單</span>
        </button>
      </div>
    </header>
  );
};
