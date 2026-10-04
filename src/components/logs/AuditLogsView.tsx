import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Clock, 
  User, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  ArrowRightLeft,
  UploadCloud,
  RefreshCw,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { OperationLog } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { Pagination } from '../common/Pagination';

interface Props {
  logs: OperationLog[];
  onRefresh: () => void;
}

export const AuditLogsView: React.FC<Props> = ({ logs, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  const filteredLogs = logs.filter(log => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const matchId = (log.targetId || '').toLowerCase().includes(term);
    const matchName = (log.targetName || '').toLowerCase().includes(term);
    const matchUser = (log.userEmail || '').toLowerCase().includes(term);

    return matchId || matchName || matchUser;
  });

  const getActionBadge = (action: OperationLog['action']) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center text-[11px] bg-emerald-950/70 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
            <PlusCircle size={12} className="mr-1" /> 新增開單
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center text-[11px] bg-cyan-950/70 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
            <Edit3 size={12} className="mr-1" /> 編輯修改
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center text-[11px] bg-red-950/70 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
            <Trash2 size={12} className="mr-1" /> 刪除撤銷
          </span>
        );
      case 'TRANSFER':
        return (
          <span className="inline-flex items-center text-[11px] bg-amber-950/70 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
            <ArrowRightLeft size={12} className="mr-1" /> 工區調撥
          </span>
        );
      case 'IMPORT':
        return (
          <span className="inline-flex items-center text-[11px] bg-purple-950/70 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
            <UploadCloud size={12} className="mr-1" /> Excel匯入
          </span>
        );
      default:
        return (
          <span className="text-[11px] bg-[#222734] text-[#8E96A4] px-2 py-0.5 rounded">
            {action}
          </span>
        );
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return '剛才';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return String(ts);
      return d.toLocaleString('zh-TW', { hour12: false });
    } catch {
      return String(ts);
    }
  };

  const handleExportExcel = () => {
    const data = filteredLogs.map((log, idx) => ({
      項次: idx + 1,
      時間戳記: formatTimestamp(log.timestamp),
      動作類別: log.action,
      目標項目: log.targetName,
      操作帳號: log.userEmail || log.userId,
      異動細節: log.details ? JSON.stringify(log.details) : ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '操作日誌');
    XLSX.writeFile(wb, `水電工程_操作軌跡日誌_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* 搜尋與類別篩選 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-[#1D212C] p-3 rounded-xl border border-[#2A3141]">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717B8F]" />
          <input
            type="text"
            placeholder="搜尋單號、操作人或操作項目..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#161922] border border-[#2E3647] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#717B8F] focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-2">
          <span className="text-[#717B8F]">篩選動作：</span>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#161922] border border-[#2E3647] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">全部動作</option>
            <option value="CREATE">新增開單</option>
            <option value="UPDATE">編輯修改</option>
            <option value="DELETE">刪除撤銷</option>
            <option value="TRANSFER">調撥轉移</option>
            <option value="IMPORT">Excel匯入</option>
          </select>

          <button
            onClick={onRefresh}
            title="重新整理日誌"
            className="px-2.5 py-1.5 rounded-lg bg-[#242938] hover:bg-[#2F3648] text-[#8E96A4] hover:text-white transition flex items-center"
          >
            <RefreshCw size={12} className="mr-1 text-cyan-400" /> 重新載入
          </button>

          <button
            onClick={handleExportExcel}
            title="匯出 Excel"
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 transition flex items-center"
          >
            <Download size={12} className="mr-1" /> 匯出 Excel
          </button>

          <span className="text-[#717B8F] pl-2 border-l border-[#2E3647]">
            共 <strong className="text-cyan-400 font-mono">{filteredLogs.length}</strong> 筆日誌
          </span>
        </div>
      </div>

      {/* 日誌表格 */}
      <div className="bg-[#202532] border border-[#2B3242] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-[#181C25] text-[#8A93A6] border-b border-[#2B3242]">
              <tr>
                <th className="py-3 px-4 font-semibold">時間戳記</th>
                <th className="py-3 px-4 font-semibold">動作類別</th>
                <th className="py-3 px-4 font-semibold">異動目標項目</th>
                <th className="py-3 px-4 font-semibold">操作帳號</th>
                <th className="py-3 px-4 font-semibold">異動內容細節</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282F3E]">
              {paginatedLogs.map((log, idx) => (
                <tr key={log.id || `log-${log.targetId}-${idx}`} className="hover:bg-[#252B3A] transition">
                  <td className="py-3 px-4 text-[#8A93A6] font-mono flex items-center">
                    <Clock size={12} className="mr-1.5 text-cyan-400" />
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                  <td className="py-3 px-4 font-medium text-white">
                    {log.targetName}
                  </td>
                  <td className="py-3 px-4 text-[#A1AAB9]">
                    <span className="inline-flex items-center">
                      <User size={12} className="mr-1 text-[#717B8F]" />
                      {log.userEmail || log.userId}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#717B8F] font-mono text-[11px] max-w-xs truncate" title={log.details ? JSON.stringify(log.details, null, 2) : ''}>
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8">
                    <EmptyState
                      title="查無符合條件的系統稽核日誌紀錄"
                      description="請嘗試調整關鍵字或重設篩選條件"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分頁控制 */}
      {filteredLogs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={filteredLogs.length}
          showInfo={true}
        />
      )}
    </div>
  );
};

