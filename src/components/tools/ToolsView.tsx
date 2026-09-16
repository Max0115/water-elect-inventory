import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wrench, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  RotateCcw, 
  MapPin, 
  User, 
  Camera, 
  ShieldCheck, 
  Trash2,
  Calendar,
  Layers,
  Search
} from 'lucide-react';
import { ToolItem, ToolStatus, GlobalOptions } from '../../types';
import { fetchTools, deleteTool } from '../../services/toolsService';
import { BorrowToolModal } from './BorrowToolModal';
import { ReturnToolModal } from './ReturnToolModal';
import { AddToolModal } from './AddToolModal';
import { SearchDropdown } from '../inventory/SearchDropdown';

interface Props {
  options: GlobalOptions;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ToolsView: React.FC<Props> = ({
  options,
  onShowToast,
}) => {
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // 對話框狀態
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTools();
      setTools(data);
    } catch (e) {
      console.error(e);
      onShowToast('載入機具資料失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // 計算是否逾期
  const isOverdue = (tool: ToolItem): boolean => {
    if (tool.status !== 'BORROWED' || !tool.expectedReturnDate) return false;
    return tool.expectedReturnDate < todayStr;
  };

  // 計算逾期天數
  const getOverdueDays = (tool: ToolItem): number => {
    if (!isOverdue(tool) || !tool.expectedReturnDate) return 0;
    const diff = new Date(todayStr).getTime() - new Date(tool.expectedReturnDate).getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  // 統計數字
  const stats = useMemo(() => {
    const total = tools.length;
    const available = tools.filter(t => t.status === 'AVAILABLE').length;
    const borrowed = tools.filter(t => t.status === 'BORROWED').length;
    const overdue = tools.filter(t => isOverdue(t)).length;
    const maintenance = tools.filter(t => t.status === 'MAINTENANCE' || t.status === 'DAMAGED').length;
    return { total, available, borrowed, overdue, maintenance };
  }, [tools, todayStr]);

  // 分類清單
  const categories = useMemo(() => {
    const set = new Set(tools.map(t => t.category));
    return ['全部', ...Array.from(set)];
  }, [tools]);

  // 過濾清單
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // 分類過濾
      if (selectedCategory !== '全部' && tool.category !== selectedCategory) return false;

      // 狀態標籤過濾
      if (selectedStatus === 'AVAILABLE' && tool.status !== 'AVAILABLE') return false;
      if (selectedStatus === 'BORROWED' && tool.status !== 'BORROWED') return false;
      if (selectedStatus === 'OVERDUE' && !isOverdue(tool)) return false;
      if (selectedStatus === 'MAINTENANCE' && tool.status !== 'MAINTENANCE' && tool.status !== 'DAMAGED') return false;

      // 關鍵字搜尋 (工具名稱、型號、序號、借用人、庫位)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = tool.name.toLowerCase().includes(term);
        const matchModel = (tool.modelNumber || '').toLowerCase().includes(term);
        const matchBorrower = (tool.currentBorrower || '').toLowerCase().includes(term);
        const matchLoc = (tool.currentLocation || '').toLowerCase().includes(term);
        if (!matchName && !matchModel && !matchBorrower && !matchLoc) return false;
      }

      return true;
    });
  }, [tools, selectedCategory, selectedStatus, searchTerm]);

  // 刪除工具確認
  const handleDeleteTool = async (id: string, name: string) => {
    if (confirm(`確定要刪除「${name}」的機具檔案嗎？`)) {
      await deleteTool(id);
      onShowToast(`已刪除機具 ${name}`, 'info');
      loadData();
    }
  };

  return (
    <div className="space-y-5">
      {/* 頂部概覽指標卡 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-[#202532] border border-[#2B3242] p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#8E96A4]">機具儀器總數</span>
            <span className="p-1.5 rounded-lg bg-[#181C25] text-cyan-400">
              <Wrench size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5">{stats.total}</div>
          <div className="text-[11px] text-[#717B8F] mt-0.5">專業水電機具庫</div>
        </div>

        <div className="bg-[#202532] border border-emerald-500/20 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs text-emerald-400 font-medium">在庫隨時可借</span>
            <span className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              <CheckCircle size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1.5">{stats.available}</div>
          <div className="text-[11px] text-[#717B8F] mt-0.5">在倉備用中</div>
        </div>

        <div className="bg-[#202532] border border-amber-500/20 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs text-amber-400 font-medium">現場借出施工</span>
            <span className="p-1.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/40">
              <Clock size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1.5">{stats.borrowed}</div>
          <div className="text-[11px] text-[#717B8F] mt-0.5">各案場施工中</div>
        </div>

        <div className={`p-4 rounded-2xl shadow-xs border transition ${
          stats.overdue > 0 
            ? 'bg-red-950/20 border-red-500/50 ring-1 ring-red-500/30' 
            : 'bg-[#202532] border-[#2B3242]'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-xs text-red-400 font-semibold">逾期未還警示</span>
            <span className={`p-1.5 rounded-lg ${stats.overdue > 0 ? 'bg-red-950 text-red-400 animate-pulse' : 'bg-[#181C25] text-[#717B8F]'}`}>
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1.5">{stats.overdue}</div>
          <div className="text-[11px] text-red-300/80 mt-0.5">
            {stats.overdue > 0 ? '需盡速追回機具' : '目前借出皆正常'}
          </div>
        </div>
      </div>

      {/* 分類藥丸標籤列 */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
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

      {/* 搜尋欄、狀態篩選與新增機具按鈕 */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center bg-[#1D212C] p-3 rounded-2xl border border-[#2A3141]">
        <SearchDropdown
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="搜尋機具名稱、型號廠牌、借用人或所在案場..."
          className="max-w-md"
        />

        <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-2">
          {/* 狀態快捷鈕 */}
          <div className="flex bg-[#161922] p-1 rounded-xl border border-[#2E3647]">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedStatus === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-[#8E96A4] hover:text-white'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setSelectedStatus('AVAILABLE')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedStatus === 'AVAILABLE' ? 'badge-stock-normal font-semibold' : 'text-[#8E96A4] hover:text-white'
              }`}
            >
              在庫
            </button>
            <button
              onClick={() => setSelectedStatus('BORROWED')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedStatus === 'BORROWED' ? 'badge-stock-low font-semibold' : 'text-[#8E96A4] hover:text-white'
              }`}
            >
              借出中
            </button>
            <button
              onClick={() => setSelectedStatus('OVERDUE')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedStatus === 'OVERDUE' ? 'badge-stock-empty font-semibold' : 'text-[#8E96A4] hover:text-white'
              }`}
            >
              逾期 ({stats.overdue})
            </button>
          </div>

          {/* 新增工具 */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl font-semibold transition shadow-md shadow-cyan-600/20"
          >
            <Plus size={14} className="mr-1" /> 新增機具
          </button>
        </div>
      </div>

      {/* 機具卡片網格 (桌面與手機通用響應式卡片) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTools.map((tool) => {
          const overdue = isOverdue(tool);
          const overdueDays = getOverdueDays(tool);

          return (
            <div
              key={tool.id}
              className={`bg-[#202532] border rounded-2xl p-4 flex flex-col justify-between space-y-3.5 transition-all shadow-sm ${
                overdue 
                  ? 'border-red-500/60 bg-red-950/10 ring-1 ring-red-500/30' 
                  : tool.status === 'BORROWED'
                    ? 'border-amber-500/30'
                    : 'border-[#2B3242] hover:border-cyan-500/40'
              }`}
            >
              {/* 卡片上半：標題、分類與狀態徽章 */}
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800/40 font-mono">
                        {tool.id}
                      </span>
                      <span className="text-xs text-[#8E96A4]">{tool.category}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm sm:text-base leading-tight">
                      {tool.name}
                    </h4>
                  </div>

                  {/* 狀態標籤 */}
                  {overdue ? (
                    <span className="badge-stock-empty text-xs px-2.5 py-1 rounded-full font-bold flex items-center shrink-0 animate-pulse">
                      <AlertTriangle size={12} className="mr-1" /> 逾期 {overdueDays} 天
                    </span>
                  ) : tool.status === 'BORROWED' ? (
                    <span className="badge-stock-low text-xs px-2.5 py-1 rounded-full font-semibold flex items-center shrink-0">
                      <Clock size={12} className="mr-1" /> 借出中
                    </span>
                  ) : tool.status === 'AVAILABLE' ? (
                    <span className="badge-stock-normal text-xs px-2.5 py-1 rounded-full font-semibold flex items-center shrink-0">
                      <CheckCircle size={12} className="mr-1" /> 在庫可借
                    </span>
                  ) : (
                    <span className="bg-[#181C25] text-[#8E96A4] text-xs px-2 py-0.5 rounded-full border border-[#2E3647] shrink-0">
                      保養維護中
                    </span>
                  )}
                </div>

                {/* 型號與機身序號 */}
                {(tool.modelNumber || tool.serialNumber) && (
                  <div className="text-xs text-[#A1AAB9] font-mono flex items-center space-x-2">
                    {tool.modelNumber && <span>型號: {tool.modelNumber}</span>}
                    {tool.serialNumber && <span className="text-[#626B7E]">S/N: {tool.serialNumber}</span>}
                  </div>
                )}
              </div>

              {/* 卡片中半：借用人資訊或在庫庫位 */}
              <div className="p-3 rounded-xl bg-[#181C25] border border-[#282F3E] text-xs space-y-1.5">
                {tool.status === 'BORROWED' ? (
                  <>
                    <div className="flex justify-between items-center text-[#E1E4EA]">
                      <span className="text-[#717B8F] flex items-center">
                        <User size={12} className="mr-1 text-amber-400" /> 借用人：
                      </span>
                      <span className="font-bold text-amber-300">{tool.currentBorrower}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#E1E4EA]">
                      <span className="text-[#717B8F] flex items-center">
                        <MapPin size={12} className="mr-1 text-cyan-400" /> 所在案場：
                      </span>
                      <span>{tool.currentLocation}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#E1E4EA]">
                      <span className="text-[#717B8F] flex items-center">
                        <Calendar size={12} className="mr-1 text-cyan-400" /> 預定歸還：
                      </span>
                      <span className={`font-mono font-bold ${overdue ? 'text-red-400' : 'text-white'}`}>
                        {tool.expectedReturnDate}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-[#E1E4EA]">
                      <span className="text-[#717B8F] flex items-center">
                        <MapPin size={12} className="mr-1 text-cyan-400" /> 存放庫位：
                      </span>
                      <span className="font-semibold text-white">{tool.currentLocation || '工務所總倉'}</span>
                    </div>
                    {tool.lastInspectionDate && (
                      <div className="flex justify-between items-center text-[#E1E4EA]">
                        <span className="text-[#717B8F] flex items-center">
                          <ShieldCheck size={12} className="mr-1 text-emerald-400" /> 上次保養校正：
                        </span>
                        <span className="font-mono text-emerald-400">{tool.lastInspectionDate}</span>
                      </div>
                    )}
                  </>
                )}

                {tool.conditionNote && (
                  <div className="text-[11px] text-[#8E96A4] pt-1 border-t border-[#232936] line-clamp-1">
                    備註: {tool.conditionNote}
                  </div>
                )}
              </div>

              {/* 卡片下半：操作動作按鈕 */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleDeleteTool(tool.id, tool.name)}
                  className="text-[#717B8F] hover:text-red-400 p-1.5 rounded-lg transition"
                  title="刪除此工具檔案"
                >
                  <Trash2 size={15} />
                </button>

                <div className="flex space-x-2">
                  {tool.status === 'BORROWED' ? (
                    <button
                      onClick={() => {
                        setActiveTool(tool);
                        setReturnModalOpen(true);
                      }}
                      className="flex items-center text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-semibold transition shadow-sm"
                    >
                      <RotateCcw size={13} className="mr-1" /> 點收歸還
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveTool(tool);
                        setBorrowModalOpen(true);
                      }}
                      className="flex items-center text-xs bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-3.5 py-1.5 rounded-xl font-semibold transition shadow-md shadow-amber-600/20"
                    >
                      <ArrowUpRight size={13} className="mr-1" /> 登記借出
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTools.length === 0 && !loading && (
        <div className="py-16 text-center text-[#717B8F] bg-[#202532] rounded-2xl border border-[#2B3242]">
          查無符合條件的水電機具與儀器
        </div>
      )}

      {/* 借出彈窗 */}
      <BorrowToolModal
        isOpen={borrowModalOpen}
        onClose={() => {
          setBorrowModalOpen(false);
          setActiveTool(null);
        }}
        onSuccess={() => {
          onShowToast('機具借出登記成功！', 'success');
          loadData();
        }}
        tool={activeTool}
        locations={options.locations}
        suppliers={options.suppliers}
      />

      {/* 歸還彈窗 */}
      <ReturnToolModal
        isOpen={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false);
          setActiveTool(null);
        }}
        onSuccess={() => {
          onShowToast('機具已完成點收歸還！', 'success');
          loadData();
        }}
        tool={activeTool}
        locations={options.locations}
      />

      {/* 新增工具彈窗 */}
      <AddToolModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          onShowToast('新機具建立成功！', 'success');
          loadData();
        }}
        locations={options.locations}
      />
    </div>
  );
};
