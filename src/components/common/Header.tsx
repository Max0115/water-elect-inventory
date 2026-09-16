import React from 'react';
import { 
  Menu, 
  Plus, 
  FileSpreadsheet, 
  UploadCloud, 
  RefreshCw,
  MapPin
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
    <header className="h-16 border-b border-[#262B37] px-4 md:px-6 flex items-center justify-between shrink-0 bg-[#191D26] text-white">
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

