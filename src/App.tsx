import { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';

// 模組化組件
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { StatCards } from './components/dashboard/StatCards';
import { InventoryTable, CalculatedStock } from './components/inventory/InventoryTable';
import { ExcelImportModal } from './components/inventory/ExcelImportModal';
import { OrderList } from './components/orders/OrderList';
import { AddOrderModal } from './components/AddOrderModal';
import { EditOrderModal } from './components/EditOrderModal';
import { CrewCalendarView } from './components/calendar/CrewCalendarView';
import { AuditLogsView } from './components/logs/AuditLogsView';
import { OptionsManager } from './components/options/OptionsManager';

// 服務與型別
import { 
  fetchInventoryRecords, 
  fetchGlobalOptions, 
  saveGlobalOptions, 
  deleteOrder,
  fetchAuditLogs,
  fetchCrewCalendar
} from './services/inventoryService';
import { initialOptions } from './services/mockData';
import { 
  InventoryRecord, 
  MainTab, 
  GlobalOptions, 
  OperationLog, 
  CrewCalendarEvent, 
  OrderType 
} from './types';

export default function App() {
  // 導覽分頁與當前案場
  const [currentTab, setCurrentTab] = useState<MainTab>('inventory');
  const [selectedLocation, setSelectedLocation] = useState<string>('全部地點');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 核心資料狀態
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [options, setOptions] = useState<GlobalOptions>(initialOptions);
  const [auditLogs, setAuditLogs] = useState<OperationLog[]>([]);
  const [crewEvents, setCrewEvents] = useState<CrewCalendarEvent[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 篩選與搜尋狀態
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [isOnlyLowStock, setIsOnlyLowStock] = useState(false);

  // 對話框狀態
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string>('');
  const [prefillItem, setPrefillItem] = useState<{
    category: string;
    itemName: string;
    specification: string;
    location: string;
    unit: string;
    actionType?: OrderType;
  } | null>(null);

  // Toast 訊息堆疊
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // 載入系統資料
  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [optData, recData, logData, crewData] = await Promise.all([
        fetchGlobalOptions(),
        fetchInventoryRecords(),
        fetchAuditLogs(),
        fetchCrewCalendar()
      ]);
      setOptions(optData);
      setRecords(recData);
      setAuditLogs(logData);
      setCrewEvents(crewData);
    } catch (err) {
      console.error('Error loading data:', err);
      showToast('載入資料時發生異常，已啟動離線保護快取', 'info');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // 選項變更處理
  const handleUpdateOptions = async (updated: GlobalOptions) => {
    setOptions(updated);
    await saveGlobalOptions(updated);
  };

  // 即時結餘計算 (調撥單支援：出庫方扣減，入庫方增加)
  const stockSummary = useMemo<CalculatedStock[]>(() => {
    const map: Record<string, CalculatedStock> = {};

    records.forEach(r => {
      const qty = Number(r.quantity) || 0;

      // 調撥單 (TRANSFER) 雙向結存運算
      if (r.type === 'TRANSFER' && r.targetLocation) {
        if (selectedLocation === '全部地點' || r.location === selectedLocation) {
          const keyOut = `${r.category}_${r.itemName}_${r.specification}_${r.location}`;
          if (!map[keyOut]) {
            map[keyOut] = {
              category: r.category,
              itemName: r.itemName,
              specification: r.specification || '-',
              location: r.location,
              unit: r.unit,
              total: 0
            };
          }
          map[keyOut].total -= qty;
        }
        if (selectedLocation === '全部地點' || r.targetLocation === selectedLocation) {
          const keyIn = `${r.category}_${r.itemName}_${r.specification}_${r.targetLocation}`;
          if (!map[keyIn]) {
            map[keyIn] = {
              category: r.category,
              itemName: r.itemName,
              specification: r.specification || '-',
              location: r.targetLocation,
              unit: r.unit,
              total: 0
            };
          }
          map[keyIn].total += qty;
        }
        return;
      }

      // 一般單據若指定特定案場則過濾
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

      if (r.type === 'IN' || r.type === 'SCRAP') {
        map[key].total += qty;
      } else if (r.type === 'OUT' || r.type === 'R') {
        map[key].total -= qty;
      }
    });

    return Object.values(map);
  }, [records, selectedLocation]);

  // 計算 KPI 數據指標
  const lowStockCount = useMemo(() => {
    return stockSummary.filter(item => {
      const minStock = options.minStockMap?.[item.itemName] ?? 5;
      return item.total <= minStock;
    }).length;
  }, [stockSummary, options.minStockMap]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayInCount = useMemo(() => {
    const orders = records.filter(r => r.type === 'IN' && r.orderDate === todayStr);
    return new Set(orders.map(o => o.orderId)).size;
  }, [records, todayStr]);

  const todayOutCount = useMemo(() => {
    const orders = records.filter(r => r.type === 'OUT' && r.orderDate === todayStr);
    return new Set(orders.map(o => o.orderId)).size;
  }, [records, todayStr]);

  // Excel 匯出庫存表
  const handleExportExcel = () => {
    const exportData = stockSummary.map(item => ({
      '分類': item.category,
      '材料品名': item.itemName,
      '規格尺寸': item.specification,
      '所在案場/庫位': item.location,
      '結餘存量': item.total,
      '單位': item.unit,
      '安全庫存警戒值': options.minStockMap?.[item.itemName] ?? 5,
      '狀態': item.total <= (options.minStockMap?.[item.itemName] ?? 5) ? '需補貨' : '正常'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '水電即時庫存表');
    XLSX.writeFile(workbook, `水電材料庫存報表_${selectedLocation}_${todayStr}.xlsx`);
    showToast('庫存表已成功匯出 Excel', 'success');
  };

  // 快速開單帶入
  const handleQuickAction = (item: CalculatedStock, action: 'IN' | 'OUT') => {
    setPrefillItem({
      category: item.category,
      itemName: item.itemName,
      specification: item.specification,
      location: item.location,
      unit: item.unit,
      actionType: action
    });
    setModalOpen(true);
  };

  // 刪除單據
  const handleDeleteOrder = async (orderId: string) => {
    if (confirm(`確定刪除單據 ${orderId} 嗎？此操作將同步回滾庫存。`)) {
      await deleteOrder(orderId, 'admin@system.local');
      showToast(`單據 ${orderId} 已成功刪除`, 'info');
      loadAllData();
    }
  };

  return (
    <div className="flex h-screen bg-[#151821] text-[#E1E4EA] overflow-hidden font-sans select-none">
      {/* 側邊導覽列 (含手機抽屜) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        locations={options.locations}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 主內容區 */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* 頂部導航與功能鍵 */}
        <Header
          currentTab={currentTab}
          selectedLocation={selectedLocation}
          onOpenOrderModal={() => {
            setPrefillItem(null);
            setModalOpen(true);
          }}
          onOpenImportModal={() => setImportModalOpen(true)}
          onExportExcel={handleExportExcel}
          onRefresh={loadAllData}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          isRefreshing={isRefreshing}
        />

        {/* 視圖內容容器 */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* 分頁 1: 庫存管理與戰情室 */}
          {currentTab === 'inventory' && (
            <>
              <StatCards
                totalSkus={stockSummary.length}
                lowStockCount={lowStockCount}
                todayInCount={todayInCount}
                todayOutCount={todayOutCount}
                onFilterLowStock={() => setIsOnlyLowStock(prev => !prev)}
                isLowStockFilterActive={isOnlyLowStock}
              />

              <InventoryTable
                stockList={stockSummary}
                options={options}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                isOnlyLowStock={isOnlyLowStock}
                onToggleLowStock={setIsOnlyLowStock}
                onQuickAction={handleQuickAction}
              />
            </>
          )}

          {/* 分頁 2: 進貨單據 */}
          {currentTab === 'in_orders' && (
            <OrderList
              records={records}
              orderType="IN"
              title="進貨單據"
              onEditOrder={(id) => {
                setEditingOrderId(id);
                setEditModalOpen(true);
              }}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {/* 分頁 3: 現場領料出庫 */}
          {currentTab === 'out_orders' && (
            <OrderList
              records={records}
              orderType="OUT"
              title="現場領料出庫"
              onEditOrder={(id) => {
                setEditingOrderId(id);
                setEditModalOpen(true);
              }}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {/* 分頁 4: 餘料/短管管材 */}
          {currentTab === 'scrap' && (
            <OrderList
              records={records}
              orderType="SCRAP"
              title="餘料短管暫存"
              onEditOrder={(id) => {
                setEditingOrderId(id);
                setEditModalOpen(true);
              }}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {/* 分頁 5: 工班出勤與排假行事曆 */}
          {currentTab === 'calendar' && (
            <CrewCalendarView
              events={crewEvents}
              options={options}
              onRefresh={loadAllData}
              onShowToast={showToast}
            />
          )}

          {/* 分頁 6: 水電常用選項與規格維護 */}
          {currentTab === 'options' && (
            <OptionsManager
              options={options}
              onUpdateOptions={handleUpdateOptions}
              onShowToast={showToast}
            />
          )}

          {/* 分頁 7: 系統操作日誌 */}
          {currentTab === 'logs' && (
            <AuditLogsView
              logs={auditLogs}
              onRefresh={loadAllData}
            />
          )}
        </main>
      </div>

      {/* 開單對話框 */}
      <AddOrderModal
        isOpen={modalOpen}
        options={options}
        prefillItem={prefillItem}
        onClose={() => {
          setModalOpen(false);
          setPrefillItem(null);
        }}
        onSuccess={() => {
          showToast('單據已成功開立並更新庫存', 'success');
          loadAllData();
        }}
      />

      {/* 編輯對話框 */}
      <EditOrderModal
        isOpen={editModalOpen}
        orderId={editingOrderId}
        initialItems={records.filter(r => r.orderId === editingOrderId)}
        options={options}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          showToast('單據已成功更新', 'success');
          loadAllData();
        }}
      />

      {/* Excel 批次進貨單匯入 */}
      <ExcelImportModal
        isOpen={importModalOpen}
        options={options}
        defaultLocation={selectedLocation === '全部地點' ? (options.locations[0] || '工務所總倉') : selectedLocation}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          showToast('Excel 批次進貨單已成功匯入！', 'success');
          loadAllData();
        }}
      />

      {/* 系統 Toast 通知 */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}