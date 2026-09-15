import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { InventoryRecord, MainTab, GlobalOptions } from './types';
import { AddOrderModal } from './components/AddOrderModal';
import { EditOrderModal } from './components/EditOrderModal';
import * as XLSX from 'xlsx';
import { 
  Box, 
  Download, 
  Upload, 
  Layers, 
  Calendar, 
  Sliders, 
  FileText, 
  LogOut, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  FileSpreadsheet, 
  Trash2,
  Edit2,
  AlertTriangle,
  ArrowLeftRight,
  X
} from 'lucide-react';
import { deleteOrder, saveGlobalOptions } from './services/inventoryService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainTab>('inventory');
  const [selectedLocation, setSelectedLocation] = useState('全部地點');
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string>('');
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

  // 各設定欄位輸入暫存
  const [newCatName, setNewCatName] = useState('');
  const [newItemName, setNewItemName] = useState<Record<string, string>>({});
  const [newSpec, setNewSpec] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newSup, setNewSup] = useState('');

  // 讀取選項與單據
  const loadOptions = async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'options'));
      if (snap.exists()) {
        setOptions(snap.data() as GlobalOptions);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRecords = async () => {
    try {
      const q = query(collection(db, 'inventory_records'), orderBy('orderDate', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryRecord[];
      setRecords(data);
    } catch (e) {
      console.error('Fetch error:', e);
    }
  };

  useEffect(() => {
    loadOptions();
    fetchRecords();
  }, []);

  // 儲存選項變更到 Firestore
  const syncOptions = async (updated: GlobalOptions) => {
    setOptions(updated);
    await saveGlobalOptions(updated);
  };

  // 即時結餘計算 (調撥單支援：出庫方扣減，入庫方增加)
  const stockSummary = useMemo(() => {
    const map: Record<string, { category: string; itemName: string; specification: string; location: string; unit: string; total: number }> = {};

    records.forEach(r => {
      const qty = Number(r.quantity) || 0;

      // 針對調撥單雙向結餘
      if (r.type === 'TRANSFER' && r.targetLocation) {
        if (selectedLocation === '全部地點' || r.location === selectedLocation) {
          const keyOut = `${r.category}_${r.itemName}_${r.specification}_${r.location}`;
          if (!map[keyOut]) map[keyOut] = { category: r.category, itemName: r.itemName, specification: r.specification || '-', location: r.location, unit: r.unit, total: 0 };
          map[keyOut].total -= qty;
        }
        if (selectedLocation === '全部地點' || r.targetLocation === selectedLocation) {
          const keyIn = `${r.category}_${r.itemName}_${r.specification}_${r.targetLocation}`;
          if (!map[keyIn]) map[keyIn] = { category: r.category, itemName: r.itemName, specification: r.specification || '-', location: r.targetLocation, unit: r.unit, total: 0 };
          map[keyIn].total += qty;
        }
        return;
      }

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
      if (r.type === 'IN' || r.type === 'R' || r.type === 'SCRAP') {
        map[key].total += qty;
      } else if (r.type === 'OUT') {
        map[key].total -= qty;
      }
    });

    return Object.values(map);
  }, [records, selectedLocation]);

  const categoryList = ['全部', ...Object.keys(options.categories)];

  const filteredStock = stockSummary.filter(s => {
    const matchCat = selectedCategory === '全部' || s.category === selectedCategory;
    const matchSearch = s.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.specification.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

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
      {/* 側邊導覽列 */}
      <aside className="w-64 bg-[#181B22] border-r border-[#2A2E39] flex flex-col justify-between shrink-0">
        <div>
          <div className="p-5 flex items-center space-x-3 border-b border-[#2A2E39]">
            <Box className="text-cyan-400" size={26} />
            <span className="font-bold text-lg tracking-wider text-white">智能庫存系統</span>
          </div>

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

        <div className="p-4 border-t border-[#2A2E39] text-xs text-[#8E96A4]">
          <div className="text-white font-medium mb-0.5">系統管理員</div>
          <div className="truncate mb-3">現場工務主管</div>
          <button className="flex items-center text-red-400 hover:text-red-300">
            <LogOut size={15} className="mr-2" /> 登出系統
          </button>
        </div>
      </aside>

      {/* 主內容區 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-[#2A2E39] px-6 flex items-center justify-between shrink-0 bg-[#1E222B]">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold">
              {currentTab === 'inventory' && '即時庫存總覽'}
              {currentTab === 'in_orders' && '進貨單據管理'}
              {currentTab === 'out_orders' && '現場領料出庫'}
              {currentTab === 'scrap' && '工地短管/餘料入庫'}
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

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* 庫存管理視窗 */}
          {currentTab === 'inventory' && (
            <>
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

              <div className="flex justify-between items-center">
                <input 
                  type="text"
                  placeholder="輸入材料品名或規格即時篩選..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#2A2E39] border border-[#373D4A] rounded-lg px-4 py-2 text-sm w-96 text-white focus:outline-none focus:border-cyan-500"
                />
                <span className="text-xs text-[#8E96A4]">
                  共篩選出 <strong className="text-cyan-400">{filteredStock.length}</strong> 項水電材料
                </span>
              </div>

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

          {/* 單據清單：支援編輯鉛筆與刪除 */}
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
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">
                          總計: <strong className="font-mono text-white text-base">{totalQty}</strong>
                        </span>
                        {/* 編輯按鈕 */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingOrderId(orderId);
                            setEditModalOpen(true);
                          }}
                          className="text-[#8E96A4] hover:text-cyan-400 transition p-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        {/* 刪除按鈕 */}
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`確定刪除單據 ${orderId} 嗎？`)) {
                              await deleteOrder(orderId, 'admin');
                              fetchRecords();
                            }
                          }}
                          className="text-[#8E96A4] hover:text-red-400 transition p-1"
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
            </div>
          )}

          {/* 選項設定頁面：支援即時新增與刪除 */}
          {currentTab === 'options' && (
            <div className="grid grid-cols-2 gap-6">
              {/* 分類與品名管理 */}
              <div className="bg-[#242833] p-5 rounded-xl border border-[#2F3442] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-base">分類與品名設定</h3>
                </div>

                {/* 新增分類 */}
                <div className="flex gap-2">
                  <input 
                    placeholder="新增分類名稱 (如: 弱電另件)..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 bg-[#1D212A] border border-[#373D4A] rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <button 
                    onClick={() => {
                      if (!newCatName.trim()) return;
                      syncOptions({
                        ...options,
                        categories: { ...options.categories, [newCatName.trim()]: [] }
                      });
                      setNewCatName('');
                    }}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    新增分類
                  </button>
                </div>

                {/* 分類與品名列表 */}
                {Object.entries(options.categories).map(([cat, items]) => (
                  <div key={cat} className="p-3 bg-[#1D212A] rounded-lg border border-[#2F3442] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-cyan-400 text-sm">{cat}</span>
                      <button 
                        onClick={() => {
                          if (confirm(`確定刪除分類「${cat}」嗎？`)) {
                            const copy = { ...options.categories };
                            delete copy[cat];
                            syncOptions({ ...options, categories: copy });
                          }
                        }}
                        className="text-[#8E96A4] hover:text-red-400 text-xs"
                      >
                        刪除此分類
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {items.map(it => (
                        <span key={it} className="flex items-center bg-[#2A2E39] text-xs px-2.5 py-1 rounded text-white border border-[#373D4A]">
                          {it}
                          <button 
                            onClick={() => {
                              const updated = {
                                ...options,
                                categories: {
                                  ...options.categories,
                                  [cat]: items.filter(x => x !== it)
                                }
                              };
                              syncOptions(updated);
                            }}
                            className="ml-1.5 text-[#8E96A4] hover:text-red-400"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* 新增品名到該分類 */}
                    <div className="flex gap-2 pt-1">
                      <input 
                        placeholder={`新增品名至 ${cat}...`}
                        value={newItemName[cat] || ''}
                        onChange={(e) => setNewItemName({ ...newItemName, [cat]: e.target.value })}
                        className="flex-1 bg-[#252A36] border border-[#373D4A] rounded px-2 py-1 text-xs text-white"
                      />
                      <button 
                        onClick={() => {
                          const val = (newItemName[cat] || '').trim();
                          if (!val) return;
                          syncOptions({
                            ...options,
                            categories: {
                              ...options.categories,
                              [cat]: [...items, val]
                            }
                          });
                          setNewItemName({ ...newItemName, [cat]: '' });
                        }}
                        className="bg-[#2A2E39] hover:bg-[#343A46] text-white px-2.5 py-1 rounded text-xs"
                      >
                        + 品名
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 規格、單位、材料商、地點 */}
              <div className="space-y-4">
                {/* 規格設定 */}
                <div className="bg-[#242833] p-5 rounded-xl border border-[#2F3442] space-y-3">
                  <h3 className="font-bold text-white text-sm">水電專用規格</h3>
                  <div className="flex gap-2">
                    <input 
                      placeholder="新增規格 (如: 3/8, 1/4)..."
                      value={newSpec}
                      onChange={(e) => setNewSpec(e.target.value)}
                      className="flex-1 bg-[#1D212A] border border-[#373D4A] rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <button 
                      onClick={() => {
                        if (!newSpec.trim()) return;
                        syncOptions({ ...options, specifications: [...options.specifications, newSpec.trim()] });
                        setNewSpec('');
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      新增
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {options.specifications.map(s => (
                      <span key={s} className="flex items-center bg-[#1D212A] text-xs px-2.5 py-1 rounded-md border border-[#2F3442]">
                        {s}
                        <button 
                          onClick={() => syncOptions({ ...options, specifications: options.specifications.filter(x => x !== s) })}
                          className="ml-1.5 text-[#8E96A4] hover:text-red-400"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 單位設定 */}
                <div className="bg-[#242833] p-5 rounded-xl border border-[#2F3442] space-y-3">
                  <h3 className="font-bold text-white text-sm">計量單位</h3>
                  <div className="flex gap-2">
                    <input 
                      placeholder="新增單位 (如: 捆, 卷)..."
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="flex-1 bg-[#1D212A] border border-[#373D4A] rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <button 
                      onClick={() => {
                        if (!newUnit.trim()) return;
                        syncOptions({ ...options, units: [...options.units, newUnit.trim()] });
                        setNewUnit('');
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      新增
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {options.units.map(u => (
                      <span key={u} className="flex items-center bg-[#1D212A] text-xs px-2.5 py-1 rounded-md border border-[#2F3442]">
                        {u}
                        <button 
                          onClick={() => syncOptions({ ...options, units: options.units.filter(x => x !== u) })}
                          className="ml-1.5 text-[#8E96A4] hover:text-red-400"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 常用廠商 */}
                <div className="bg-[#242833] p-5 rounded-xl border border-[#2F3442] space-y-3">
                  <h3 className="font-bold text-white text-sm">常用材料商 / 工班</h3>
                  <div className="flex gap-2">
                    <input 
                      placeholder="新增廠商或工班..."
                      value={newSup}
                      onChange={(e) => setNewSup(e.target.value)}
                      className="flex-1 bg-[#1D212A] border border-[#373D4A] rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <button 
                      onClick={() => {
                        if (!newSup.trim()) return;
                        syncOptions({ ...options, suppliers: [...options.suppliers, newSup.trim()] });
                        setNewSup('');
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      新增
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {options.suppliers.map(sup => (
                      <span key={sup} className="flex items-center bg-[#1D212A] text-xs px-2.5 py-1 rounded-md border border-[#2F3442]">
                        {sup}
                        <button 
                          onClick={() => syncOptions({ ...options, suppliers: options.suppliers.filter(x => x !== sup) })}
                          className="ml-1.5 text-[#8E96A4] hover:text-red-400"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 案場地點設定 */}
                <div className="bg-[#242833] p-5 rounded-xl border border-[#2F3442] space-y-3">
                  <h3 className="font-bold text-white text-sm">庫位與案場地點</h3>
                  <div className="flex gap-2">
                    <input 
                      placeholder="新增案場或庫位 (如: C棟配電區)..."
                      value={newLoc}
                      onChange={(e) => setNewLoc(e.target.value)}
                      className="flex-1 bg-[#1D212A] border border-[#373D4A] rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <button 
                      onClick={() => {
                        if (!newLoc.trim()) return;
                        syncOptions({ ...options, locations: [...options.locations, newLoc.trim()] });
                        setNewLoc('');
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      新增
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {options.locations.map(loc => (
                      <span key={loc} className="flex items-center bg-[#1D212A] text-xs px-2.5 py-1 rounded-md border border-[#2F3442]">
                        {loc}
                        <button 
                          onClick={() => syncOptions({ ...options, locations: options.locations.filter(x => x !== loc) })}
                          className="ml-1.5 text-[#8E96A4] hover:text-red-400"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {currentTab === 'calendar' && (
            <div className="bg-[#242833] p-8 rounded-xl border border-[#2F3442] text-center">
              <Calendar size={48} className="mx-auto text-cyan-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">水電工班出勤與排假系統</h3>
              <p className="text-sm text-[#8E96A4]">可在此排定各工區配管、穿線、拉配電盤之出勤日誌與師傅請假紀錄。</p>
            </div>
          )}

          {currentTab === 'logs' && (
            <div className="bg-[#242833] p-8 rounded-xl border border-[#2F3442] text-center">
              <FileText size={48} className="mx-auto text-cyan-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">異動軌跡稽核</h3>
              <p className="text-sm text-[#8E96A4]">即時記錄進出庫單據新增、刪除、庫存回滾之系統流水歷程。</p>
            </div>
          )}

        </div>
      </main>

      {/* 新增單據彈窗 */}
      <AddOrderModal 
        isOpen={modalOpen} 
        options={options}
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchRecords} 
      />

      {/* 編輯單據彈窗 */}
      <EditOrderModal
        isOpen={editModalOpen}
        orderId={editingOrderId}
        initialItems={records.filter(r => r.orderId === editingOrderId)}
        options={options}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchRecords}
      />
    </div>
  );
}