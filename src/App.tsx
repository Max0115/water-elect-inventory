import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { InventoryRecord, MainTab, GlobalOptions } from './types';
import { AddOrderModal } from './components/AddOrderModal';
import * as XLSX from 'xlsx';
import { 
  Box, 
  Download, 
  Upload, 
  Layers, 
  Calendar, 
  Sliders, 
  FileText, 
  Settings, 
  LogOut, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  FileSpreadsheet, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { deleteOrder } from './services/inventoryService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainTab>('inventory');
  const [selectedLocation, setSelectedLocation] = useState('全部地點');
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  // 全域選項狀態
  const [options, setOptions] = useState<GlobalOptions>({
    categories: {
      'PVC另件材料': ['電S 1"', '45度OL 單放 2"', 'OL 3/4"', 'OT 1"(25)x3/4"', 'OS 1"(25)x3/4"'],
      '給水另件': ['EB 套銅彎頭 1"(25)', '套銅S 1"(25)'],
      '耐衝擊另件': ['OL 1"(25)', '套銅S 1"(25)'],
      'PVC管': ['耐衝擊管 1"(25)']
    },
    specifications: ['1/2"', '3/4"', '1"', '1"(25)', '1"x3/4"', '1-1/2"', '2"', '4"x2"', '6"'],
    units: ['支', '只', '罐', '條', '盒'],
    locations: ['工務所倉庫', '地下室配管區', 'A棟1F', 'B棟頂樓', '外管線區'],
    suppliers: ['太乙水電材料', '泰詠材料行', '南亞管材行']
  });

  const fetchRecords = async () => {
    try {
      const q = query(collection(db, 'inventory_records'), orderBy('orderDate', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryRecord[];
      setRecords(data);
    } catch (e) {
      console.error('Fetch records error:', e);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // 動態計算結餘庫存 (Group by 品名 + 規格 + 庫位)
  const stockSummary = useMemo(() => {
    const map: Record<string, { category: string; itemName: string; specification: string; location: string; unit: string; total: number }> = {};

    records.forEach(r => {
      if (selectedLocation !== '全部地點' && r.location !== selectedLocation) return;

      const key = `${r.category}_${r.itemName}_${r.specification}_${r.location}`;
      if (!map[key]) {
        map[key] = {
          category: r.category || '未分類',
          itemName: r.itemName,
          specification: r.specification || '-',
          location: r.location || '預設庫位',
          unit: r.unit || '個',
          total: 0
        };
      }
      const qty = Number(r.quantity) || 0;
      if (r.type === 'IN' || r.type === 'R') {
        map[key].total += qty;
      } else if (r.type === 'OUT' || r.type === 'SCRAP') {
        map[key].total -= qty;
      }
    });

    return Object.values(map);
  }, [records, selectedLocation]);

  // 分類清單
  const categoryList = ['全部', ...Object.keys(options.categories)];

  // 篩選庫存
  const filteredStock = stockSummary.filter(s => {
    const matchCat = selectedCategory === '全部' || s.category === selectedCategory;
    const matchSearch = s.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.specification.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  // 匯出 Excel
  const exportToExcel = () => {
    const data = filteredStock.map(item => ({
      '分類': item.category,
      '品名': item.itemName,
      '規格': item.specification,
      '地點/庫位': item.location,
      '結餘數量': item.total,
      '單位': item.unit
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '即時庫存表');
    XLSX.writeFile(workbook, `水電材料庫存表_${selectedLocation}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // 依單據群組
  const filteredOrders = useMemo(() => {
    const filtered = records.filter(r => {
      if (currentTab === 'in_orders') return r.type === 'IN';
      if (currentTab === 'out_orders') return r.type === 'OUT';
      if (currentTab === 'scrap') return r.type === 'SCRAP';
      return true;
    });

    return filtered.reduce((acc, cur) => {
      if (!acc[cur.orderId]) acc[cur.orderId] = [];
      acc[cur.orderId].push(cur);
      return acc;
    }, {} as Record<string, InventoryRecord[]>);
  }, [records, currentTab]);

  return (
    <div className="flex h-screen bg-[#1E222B] text-[#E1E4EA] overflow-hidden font-sans">
      {/* 側邊導覽列 Sidebar */}
      <aside className="w-64 bg-[#181B22] border-r border-[#2A2E39] flex flex-col justify-between shrink-0">
        <div>
          <div className="p-5 flex items-center space-x-3 border-b border-[#2A2E39]">
            <Box className="text-cyan-400" size={26} />
            <span className="font-bold text-lg tracking-wider text-white">智能庫存系統</span>
          </div>

          {/* 當前地點切換 */}
          <div className="p-4 border-b border-[#2A2E39]">
            <label className="text-xs text-[#8E96A4] block mb-1.5 font-medium">當前案場 / 庫位</label>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-[#21252D] border border-[#373D4A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="全部地點">全部地點</option>
              {options.locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* 導覽連結 */}
          <nav className="p-2 space-y-1 text-sm">
            <button 
              onClick={() => setCurrentTab('inventory')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg transition ${currentTab === 'inventory' ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30' : 'text-[#8E96A4] hover:bg-[#21252D]'}`}
            >
              <Box size={18} className="mr-3" /> 庫存管理
            </button>
            <button 
              onClick={() => setCurrentTab('in_orders')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg transition ${currentTab === 'in_orders' ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30' : 'text-[#8E96A4] hover:bg-[#21252D]'}`}
            >
              <Download size={18} className="mr-3" /> 進貨管理
            </button>
            <button 
              onClick={() => setCurrentTab('out_orders')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg transition ${currentTab === 'out_orders' ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30' : 'text-[#8E96A4] hover:bg-[#21252D]'}`}
            >
              <Upload size={18} className="mr-3" /> 出庫 / 領料
            </button>
            <button 
              onClick={() => setCurrentTab('scrap')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg transition ${currentTab === 'scrap' ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30' : 'text-[#8E96A4] hover:bg-[#21252D]'}`}
            >
              <Layers size={18} className="mr-3" /> 餘料 / 短料管
            </button>
            <button 
              onClick={() => setCurrentTab('calendar')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg transition ${currentTab === 'calendar' ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30' : 'text-[#8E96A4] hover:bg-[#21252D]'}`}
            >
              <Calendar size={18} className="mr-3" /> 人員排假 / 工班
            </button>
            <button 
              onClick={() => setCurrentTab('options')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg transition ${currentTab === 'options' ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30' : 'text-[#8E96A4] hover:bg-[#21252D]'}`}
            >
              <Sliders size={18} className="mr-3" /> 選項設定
            </button>
            <button 
              onClick={() => setCurrentTab('logs')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg transition ${currentTab === 'logs' ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30' : 'text-[#8E96A4] hover:bg-[#21252D]'}`}
            >
              <FileText size={18} className="mr-3" /> 操作紀錄
            </button>
          </nav>
        </div>

        {/* 使用者資訊與登出 */}
        <div className="p-4 border-t border-[#2A2E39] text-xs text-[#8E96A4]">
          <div className="text-white font-medium mb-0.5">系統管理員</div>
          <div className="truncate mb-3">工程經辦 / 倉庫管理</div>
          <button className="flex items-center text-red-400 hover:text-red-300">
            <LogOut size={15} className="mr-2" /> 登出系統
          </button>
        </div>
      </aside>

      {/* 主內容區 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 頂部功能工具列 */}
        <header className="h-16 border-b border-[#2A2E39] px-6 flex items-center justify-between shrink-0 bg-[#1E222B]">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold">
              {currentTab === 'inventory' && '即時庫存總覽'}
              {currentTab === 'in_orders' && '進貨單據管理'}
              {currentTab === 'out_orders' && '出庫領料紀錄'}
              {currentTab === 'scrap' && '餘料零料清單'}
              {currentTab === 'calendar' && '工班排假行事曆'}
              {currentTab === 'options' && '水電分類與常用選項設定'}
              {currentTab === 'logs' && '系統操作日誌'}
            </h2>
            <span className="text-xs bg-[#2A2E39] text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/20">
              {selectedLocation}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {currentTab === 'inventory' && (
              <button 
                onClick={exportToExcel}
                className="flex items-center text-sm bg-[#2A2E39] hover:bg-[#343A46] border border-[#3D4452] px-3.5 py-2 rounded-lg text-white transition"
              >
                <FileSpreadsheet size={16} className="mr-2 text-green-400" /> 匯出 Excel
              </button>
            )}

            <button 
              onClick={() => setModalOpen(true)}
              className="flex items-center text-sm bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg font-semibold text-white shadow-lg shadow-cyan-600/20 transition"
            >
              <Plus size={16} className="mr-1.5" /> 快速開單 / 異動
            </button>
          </div>
        </header>

        {/* 內容視窗 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* 庫存管理視窗 */}
          {currentTab === 'inventory' && (
            <>
              {/* 分類快速篩選標籤 */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[#2A2E39]">
                {categoryList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-md text-sm whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-white font-bold'
                        : 'bg-[#2A2E39] text-[#8E96A4] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 搜尋欄 */}
              <div className="flex justify-between items-center">
                <input 
                  type="text"
                  placeholder="輸入材料品名或規格即時篩選 (如: 1吋、彎頭、電線)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#2A2E39] border border-[#373D4A] rounded-lg px-4 py-2 text-sm w-96 text-white focus:outline-none focus:border-cyan-500"
                />
                <span className="text-xs text-[#8E96A4]">
                  共篩選出 <strong className="text-cyan-400">{filteredStock.length}</strong> 項水電材料
                </span>
              </div>

              {/* 庫存表格 */}
              <div className="bg-[#242833] border border-[#2F3442] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#1D212A] text-[#8E96A4] border-b border-[#2F3442]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">分類</th>
                      <th className="py-3 px-4 font-semibold">品名 / 規格</th>
                      <th className="py-3 px-4 font-semibold">地點 / 庫位</th>
                      <th className="py-3 px-4 font-semibold text-right">結餘數量</th>
                      <th className="py-3 px-4 font-semibold">單位</th>
                      <th className="py-3 px-4 font-semibold text-center">庫存狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2F3442]">
                    {filteredStock.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#2A2E3B] transition">
                        <td className="py-3.5 px-4 text-[#8E96A4]">{item.category}</td>
                        <td className="py-3.5 px-4 font-medium text-white">
                          {item.itemName} <span className="text-xs text-cyan-300 ml-1">({item.specification})</span>
                        </td>
                        <td className="py-3.5 px-4 text-[#8E96A4]">{item.location}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-base text-white">
                          {item.total}
                        </td>
                        <td className="py-3.5 px-4 text-[#8E96A4]">{item.unit}</td>
                        <td className="py-3.5 px-4 text-center">
                          {item.total <= 5 ? (
                            <span className="inline-flex items-center text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                              <AlertTriangle size={12} className="mr-1" /> 偏低
                            </span>
                          ) : (
                            <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/30">
                              充足
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredStock.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#8E96A4]">
                          查無符合條件的材料庫存資料
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* 進貨/出貨/餘料 單據摺疊列表 */}
          {(currentTab === 'in_orders' || currentTab === 'out_orders' || currentTab === 'scrap') && (
            <div className="space-y-3">
              {Object.entries(filteredOrders).map(([orderId, items]) => {
                const isExpanded = expandedOrders[orderId];
                const header = items[0];
                const totalQty = items.reduce((sum, it) => sum + Number(it.quantity), 0);

                return (
                  <div key={orderId} className="bg-[#242833] border border-[#2F3442] rounded-xl overflow-hidden">
                    <div 
                      onClick={() => setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }))}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#2A2E3B] transition select-none"
                    >
                      <div className="flex items-center space-x-4">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        <span className="font-mono font-bold text-cyan-400 text-base">{orderId}</span>
                        <span className="text-xs bg-[#1E222B] px-2 py-1 rounded border border-[#373D4A] text-[#8E96A4]">
                          {items.length} 個品項
                        </span>
                        <span className="text-sm text-[#8E96A4]">日期: {header.orderDate}</span>
                        {header.supplier && (
                          <span className="text-sm text-cyan-200">商號/領料: {header.supplier}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-5">
                        <span className="text-sm">
                          總計: <strong className="font-mono text-white text-base">{totalQty}</strong>
                        </span>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`確定刪除單據 ${orderId} 嗎？`)) {
                              await deleteOrder(orderId, 'admin');
                              fetchRecords();
                            }
                          }}
                          className="text-[#8E96A4] hover:text-red-400 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-[#2F3442] p-4 bg-[#1F232D]">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-[#8E96A4] border-b border-[#2F3442] pb-2">
                              <th className="py-2">分類</th>
                              <th className="py-2">品名</th>
                              <th className="py-2">規格</th>
                              <th className="py-2">數量</th>
                              <th className="py-2">庫位</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2F3442]/50">
                            {items.map(it => (
                              <tr key={it.id} className="text-white">
                                <td className="py-2 text-[#8E96A4]">{it.category}</td>
                                <td className="py-2 font-medium">{it.itemName}</td>
                                <td className="py-2 text-cyan-300">{it.specification || '-'}</td>
                                <td className="py-2 font-mono font-bold">{it.quantity} {it.unit}</td>
                                <td className="py-2 text-[#8E96A4]">{it.location}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}

              {Object.keys(filteredOrders).length === 0 && (
                <div className="text-center py-16 text-[#8E96A4]">
                  目前尚無任何單據記錄，請點擊上方按鈕建立新單據。
                </div>
              )}
            </div>
          )}

          {/* 選項設定頁面 (完全還原 Tag 樣式) */}
          {currentTab === 'options' && (
            <div className="grid grid-cols-2 gap-6">
              {/* 分類與品名 */}
              <div className="bg-[#242833] p-5 rounded-xl border border-[#2F3442] space-y-4">
                <h3 className="font-bold text-white text-base">分類與品名</h3>
                {Object.entries(options.categories).map(([cat, items]) => (
                  <div key={cat} className="p-3 bg-[#1D212A] rounded-lg border border-[#2F3442]">
                    <div className="font-bold text-cyan-400 mb-2">{cat}</div>
                    <div className="flex flex-wrap gap-2">
                      {items.map(it => (
                        <span key={it} className="bg-[#2A2E39] text-xs px-2.5 py-1 rounded text-white border border-[#373D4A]">
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* 常用規格與單位 */}
              <div className="space-y-6">
                <div className="bg-[#242833] p-5 rounded-xl border border-[#2F3442]">
                  <h3 className="font-bold text-white text-base mb-3">水電專用規格</h3>
                  <div className="flex flex-wrap gap-2">
                    {options.specifications.map(s => (
                      <span key={s} className="bg-[#1D212A] text-xs px-3 py-1.5 rounded-md border border-[#2F3442]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#242833] p-5 rounded-xl border border-[#2F3442]">
                  <h3 className="font-bold text-white text-base mb-3">計量單位</h3>
                  <div className="flex flex-wrap gap-2">
                    {options.units.map(u => (
                      <span key={u} className="bg-[#1D212A] text-xs px-3 py-1.5 rounded-md border border-[#2F3442]">
                        {u}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#242833] p-5 rounded-xl border border-[#2F3442]">
                  <h3 className="font-bold text-white text-base mb-3">常用材料行 / 配合商</h3>
                  <div className="flex flex-wrap gap-2">
                    {options.suppliers.map(sup => (
                      <span key={sup} className="bg-[#1D212A] text-xs px-3 py-1.5 rounded-md border border-[#2F3442]">
                        {sup}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 工班排假行事曆提示 */}
          {currentTab === 'calendar' && (
            <div className="bg-[#242833] p-8 rounded-xl border border-[#2F3442] text-center">
              <Calendar size={48} className="mx-auto text-cyan-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">水電工班出勤與排假系統</h3>
              <p className="text-sm text-[#8E96A4]">可在此排定各工區配管、穿線、拉配電盤之出勤日誌與師傅請假紀錄。</p>
            </div>
          )}

          {/* 操作日誌提示 */}
          {currentTab === 'logs' && (
            <div className="bg-[#242833] p-8 rounded-xl border border-[#2F3442] text-center">
              <FileText size={48} className="mx-auto text-cyan-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">異動軌跡稽核</h3>
              <p className="text-sm text-[#8E96A4]">即時記錄進出庫單據新增、刪除、庫存回滾之系統流水歷程。</p>
            </div>
          )}

        </div>
      </main>

      <AddOrderModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchRecords} 
      />
    </div>
  );
}