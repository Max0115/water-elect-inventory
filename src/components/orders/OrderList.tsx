import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Printer, 
  Calendar, 
  Truck,
  ArrowRightLeft
} from 'lucide-react';
import { InventoryRecord, OrderType, GlobalOptions } from '../../types';
import { SearchDropdown } from '../inventory/SearchDropdown';
import { matchesHydroQuery } from '../../services/hydroDictionary';
import { ConfirmModal } from '../common/ConfirmModal';
import { EmptyState } from '../common/EmptyState';
import { Pagination } from '../common/Pagination';

interface Props {
  records: InventoryRecord[];
  orderType: OrderType;
  title: string;
  onEditOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  options?: GlobalOptions;
}

export const OrderList: React.FC<Props> = ({
  records,
  orderType,
  title,
  onEditOrder,
  onDeleteOrder,
  options,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // 過濾屬於此單據類型的紀錄，並按 orderId 分組
  const ordersGrouped = useMemo(() => {
    const filtered = records.filter(r => r.type === orderType);

    const grouped: Record<string, InventoryRecord[]> = {};
    filtered.forEach(r => {
      if (!grouped[r.orderId]) grouped[r.orderId] = [];
      grouped[r.orderId].push(r);
    });

    // 關鍵字搜尋 (訂單編號、廠商/工班、或內部品名)
    if (!searchTerm.trim()) return grouped;

    const term = searchTerm.toLowerCase();
    const result: Record<string, InventoryRecord[]> = {};

    Object.entries(grouped).forEach(([orderId, items]) => {
      const matchOrderId = orderId.toLowerCase().includes(term);
      const matchSupplier = items.some(it => (it.supplier || '').toLowerCase().includes(term));
      const matchItem = items.some(it => 
        matchesHydroQuery(it, searchTerm, options?.synonyms, options?.sizeAliases)
      );

      if (matchOrderId || matchSupplier || matchItem) {
        result[orderId] = items;
      }
    });

    return result;
  }, [records, orderType, searchTerm, options]);

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const expandAll = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    Object.keys(ordersGrouped).forEach(id => {
      next[id] = expand;
    });
    setExpandedOrders(next);
  };

  // 專業水電工程格式化單據列印
  const handlePrint = (orderId: string) => {
    const orderItems = ordersGrouped[orderId];
    if (!orderItems || orderItems.length === 0) return;
    const header = orderItems[0];
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - ${orderId}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: "Microsoft JhengHei", -apple-system, sans-serif; padding: 32px; color: #111; }
          .header { border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 22px; font-weight: bold; }
          .meta { font-size: 13px; margin-top: 8px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 13px; }
          th, td { border: 1px solid #bbb; padding: 8px 10px; text-align: left; }
          th { background: #f4f4f4; font-weight: bold; }
          .text-right { text-align: right; }
          .sign { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; }
          .sign-box { border-top: 1px dashed #444; width: 170px; text-align: center; padding-top: 8px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">水電工程 — ${title} (${orderId})</div>
          <div class="meta">
            <span>單據日期：${header.orderDate}</span>
            <span>廠商/工班：${header.supplier || '無'}</span>
            <span>庫位/案場：${header.location}</span>
            ${header.targetLocation ? `<span>調撥目標庫位：${header.targetLocation}</span>` : ''}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">項次</th>
              <th>材料分類</th>
              <th>材料品名型號</th>
              <th>規格尺寸</th>
              <th class="text-right">數量</th>
              <th>單位</th>
              <th>庫位</th>
              <th>備註說明</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems.map((it, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${it.category}</td>
                <td>${it.itemName}</td>
                <td>${it.specification || '-'}</td>
                <td class="text-right"><strong>${it.quantity}</strong></td>
                <td>${it.unit}</td>
                <td>${it.location}</td>
                <td>${it.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="sign">
          <div class="sign-box">製單工程師簽章</div>
          <div class="sign-box">工務所點交人簽章</div>
          <div class="sign-box">現場領料/簽收人</div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 250);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const orderEntries = Object.entries(ordersGrouped);
  const totalPages = Math.max(1, Math.ceil(orderEntries.length / pageSize));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return orderEntries.slice(start, start + pageSize);
  }, [orderEntries, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* 頂部搜尋與批次展開 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-[#1D212C] p-3 rounded-xl border border-[#2A3141]">
        <SearchDropdown
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={`搜尋 ${title} 之單號、廠商/工班、台語俗稱或品名...`}
          className="max-w-md"
        />

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => expandAll(true)}
            className="px-2.5 py-1.5 rounded-lg bg-[#242938] hover:bg-[#2F3648] text-[#8E96A4] hover:text-white transition"
          >
            全部展開
          </button>
          <button
            onClick={() => expandAll(false)}
            className="px-2.5 py-1.5 rounded-lg bg-[#242938] hover:bg-[#2F3648] text-[#8E96A4] hover:text-white transition"
          >
            全部收合
          </button>
          <span className="text-[#717B8F] pl-2 border-l border-[#2E3647]">
            共 <strong className="text-cyan-400 font-mono">{orderEntries.length}</strong> 張單據
          </span>
        </div>
      </div>

      {/* 單據清單卡片 */}
      <div className="space-y-3">
        {paginatedEntries.map(([orderId, items]) => {
          const isExpanded = Boolean(expandedOrders[orderId]);
          const header = items[0];
          const totalQty = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);

          return (
            <div
              key={orderId}
              className="bg-[#202532] border border-[#2A3141] hover:border-[#374156] rounded-xl overflow-hidden shadow-sm transition"
            >
              {/* 單據卡片頂部摘要條 */}
              <div
                onClick={() => toggleOrder(orderId)}
                className="p-3.5 md:p-4 flex flex-wrap items-center justify-between cursor-pointer hover:bg-[#252B3A] transition select-none gap-2"
              >
                {/* 左側資訊 */}
                <div className="flex items-center space-x-3 flex-wrap">
                  <span className="text-[#717B8F]">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </span>

                  <span className="font-mono font-bold text-cyan-400 text-sm md:text-base">
                    {orderId}
                  </span>

                  <span className="text-[11px] bg-[#161922] px-2 py-0.5 rounded border border-[#2E3647] text-[#8E96A4]">
                    {items.length} 個品項
                  </span>

                  <span className="flex items-center text-xs text-[#8E96A4]">
                    <Calendar size={13} className="mr-1 text-[#626B7E]" />
                    {header.orderDate}
                  </span>

                  {header.supplier && (
                    <span className="flex items-center text-xs text-cyan-200 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                      <Truck size={13} className="mr-1 text-cyan-400" />
                      {header.supplier}
                    </span>
                  )}

                  {header.type === 'TRANSFER' && header.targetLocation && (
                    <span className="flex items-center text-xs text-amber-200 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                      <ArrowRightLeft size={13} className="mr-1 text-amber-400" />
                      調至: {header.targetLocation}
                    </span>
                  )}
                </div>

                {/* 右側總量與操作 */}
                <div className="flex items-center space-x-3 ml-auto">
                  <span className="text-xs text-[#8E96A4]">
                    總數量: <strong className="font-mono text-white text-sm md:text-base ml-1">{totalQty}</strong>
                  </span>

                  <div className="flex items-center space-x-1 border-l border-[#2E3647] pl-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handlePrint(orderId)}
                      title="列印正式工程驗收/領料單"
                      className="p-1.5 rounded-lg text-[#8E96A4] hover:text-white hover:bg-[#161922] transition"
                    >
                      <Printer size={15} />
                    </button>

                    <button
                      onClick={() => onEditOrder(orderId)}
                      title="修改此單據"
                      className="p-1.5 rounded-lg text-[#8E96A4] hover:text-cyan-400 hover:bg-[#161922] transition"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      onClick={() => setOrderToDelete(orderId)}
                      title="刪除此單據"
                      className="p-1.5 rounded-lg text-[#8E96A4] hover:text-red-400 hover:bg-[#161922] transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 展開之明細列表 */}
              {isExpanded && (
                <div className="border-t border-[#2A3141] p-3 md:p-4 bg-[#181C25]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[600px]">
                      <thead>
                        <tr className="text-[#717B8F] border-b border-[#2A3141] pb-2">
                          <th className="py-2 px-2 font-medium">分類</th>
                          <th className="py-2 px-2 font-medium">材料品名</th>
                          <th className="py-2 px-2 font-medium">規格尺寸</th>
                          <th className="py-2 px-2 font-medium text-right">數量</th>
                          <th className="py-2 px-2 font-medium">單位</th>
                          <th className="py-2 px-2 font-medium">所在庫位</th>
                          <th className="py-2 px-2 font-medium">備註說明</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#232936]">
                        {items.map((it, idx) => (
                          <tr key={it.id || `${orderId}_${idx}`} className="text-white hover:bg-[#1F2430] transition">
                            <td className="py-2 px-2 text-[#8E96A4]">{it.category}</td>
                            <td className="py-2 px-2 font-medium">{it.itemName}</td>
                            <td className="py-2 px-2 text-cyan-300 font-mono">{it.specification || '-'}</td>
                            <td className="py-2 px-2 text-right font-mono font-bold text-sm text-white">
                              {it.quantity}
                            </td>
                            <td className="py-2 px-2 text-[#8E96A4]">{it.unit}</td>
                            <td className="py-2 px-2 text-[#8E96A4]">{it.location}</td>
                            <td className="py-2 px-2 text-[#656E81] truncate max-w-xs">{it.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {orderEntries.length === 0 && (
          <EmptyState
            title={`查無相符的${title}紀錄`}
            description="請確認單據編號或清除搜尋關鍵字"
            actionLabel="清除搜尋"
            onAction={() => setSearchTerm('')}
          />
        )}
      </div>

      {/* 分頁器 */}
      {orderEntries.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={orderEntries.length}
          showInfo={true}
        />
      )}

      {/* 刪除確認彈窗 */}
      <ConfirmModal
        isOpen={Boolean(orderToDelete)}
        onClose={() => setOrderToDelete(null)}
        onConfirm={() => {
          if (orderToDelete) {
            onDeleteOrder(orderToDelete);
            setOrderToDelete(null);
          }
        }}
        title="確定刪除單據？"
        message={`確定要永久刪除單據「${orderToDelete}」嗎？此操作將同步回滾該單據對庫存的計算影響。`}
        variant="danger"
        confirmText="確認刪除"
        cancelText="取消"
      />
    </div>
  );
};

