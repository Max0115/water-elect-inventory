import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Search, 
  Printer, 
  Calendar, 
  Truck,
  ArrowRightLeft
} from 'lucide-react';
import { InventoryRecord, OrderType } from '../../types';

interface Props {
  records: InventoryRecord[];
  orderType: OrderType;
  title: string;
  onEditOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const OrderList: React.FC<Props> = ({
  records,
  orderType,
  title,
  onEditOrder,
  onDeleteOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

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
      const matchItem = items.some(it => it.itemName.toLowerCase().includes(term) || (it.specification || '').toLowerCase().includes(term));

      if (matchOrderId || matchSupplier || matchItem) {
        result[orderId] = items;
      }
    });

    return result;
  }, [records, orderType, searchTerm]);

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

  const handlePrint = (orderId: string) => {
    window.print();
  };

  const orderEntries = Object.entries(ordersGrouped);

  return (
    <div className="space-y-4">
      {/* 頂部搜尋與批次展開 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-[#1D212C] p-3 rounded-xl border border-[#2A3141]">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717B8F]" />
          <input
            type="text"
            placeholder={`搜尋單號、廠商/工班、或品名...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161922] border border-[#2E3647] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#717B8F] focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

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
        {orderEntries.map(([orderId, items]) => {
          const isExpanded = Boolean(expandedOrders[orderId]);
          const header = items[0];
          const totalQty = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);

          return (
            <div
              key={orderId}
              className="bg-[#202532] border border-[#2A3141] hover:border-[#374156] rounded-xl overflow-hidden shadow-xs transition"
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
                      title="列印單據"
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
                      onClick={() => onDeleteOrder(orderId)}
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
                  <table className="w-full text-left text-xs">
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
                        <tr key={it.id || idx} className="text-white hover:bg-[#1F2430] transition">
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
              )}
            </div>
          );
        })}

        {orderEntries.length === 0 && (
          <div className="py-16 text-center text-[#717B8F] bg-[#202532] rounded-xl border border-[#2A3141]">
            查無相符的{title}紀錄
          </div>
        )}
      </div>
    </div>
  );
};

