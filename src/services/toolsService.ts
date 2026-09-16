import { ToolItem, ToolLog } from '../types';

const TOOLS_STORAGE_KEY = 'water_elect_tools_cache_v1';
const TOOL_LOGS_STORAGE_KEY = 'water_elect_tool_logs_cache_v1';

// 水電工班常用專業電動機具與儀器預設清單
export const initialTools: ToolItem[] = [
  {
    id: 'TL-001',
    name: '電動油壓壓接機 (ST白鐵水管專用)',
    category: '動力壓接類',
    modelNumber: 'Milwaukee M18 Force Logic',
    serialNumber: 'MLW-883921',
    status: 'AVAILABLE',
    currentLocation: '工務所總倉',
    conditionNote: '附 4分、6分、1吋 壓接模具 3 組，油壓正常',
    lastInspectionDate: '2026-09-01'
  },
  {
    id: 'TL-002',
    name: '鋼管電動絞牙機 (車牙機)',
    category: '動力壓接類',
    modelNumber: 'REX 2吋自動進刀型',
    serialNumber: 'REX-55201',
    status: 'AVAILABLE',
    currentLocation: '工務所總倉',
    conditionNote: '絞刀鋒利，切削油充足',
    lastInspectionDate: '2026-08-15'
  },
  {
    id: 'TL-003',
    name: '管路通管機 (電動水管疏通機)',
    category: '水管專用類',
    modelNumber: 'RIDGID K-45AF 自動進退線',
    serialNumber: 'RD-9021',
    status: 'BORROWED',
    currentBorrower: '第一組配管工班 (陳師傅)',
    currentLocation: 'A棟地下室排水區',
    borrowDate: '2026-09-15',
    expectedReturnDate: '2026-09-18',
    conditionNote: '配 8mm 鋼纜 15米'
  },
  {
    id: 'TL-004',
    name: '手動高壓試壓泵浦 (水管測漏專用)',
    category: '水管專用類',
    modelNumber: '50 kg/cm² 附精密防震油壓表',
    serialNumber: 'TP-50K-02',
    status: 'AVAILABLE',
    currentLocation: '工務所總倉',
    conditionNote: '高壓軟管正常無洩漏',
    lastInspectionDate: '2026-09-10'
  },
  {
    id: 'TL-005',
    name: '絕緣電阻測試計 (高阻計 / Megger)',
    category: '電氣檢測類',
    modelNumber: '共立 KYORITSU 3005A (指針/數位)',
    serialNumber: 'KYO-3005-77',
    status: 'AVAILABLE',
    currentLocation: '工務所總倉',
    conditionNote: '校正檢驗合格 (附標籤)，探棒完整',
    lastInspectionDate: '2026-07-20',
    nextInspectionDate: '2027-07-19'
  },
  {
    id: 'TL-006',
    name: '接地電阻測試計',
    category: '電氣檢測類',
    modelNumber: 'HIOKI 3151 精密三線式',
    serialNumber: 'HIO-3151-18',
    status: 'AVAILABLE',
    currentLocation: '工務所總倉',
    conditionNote: '附接地輔助地針 2 支及測試導線捲',
    lastInspectionDate: '2026-06-15',
    nextInspectionDate: '2027-06-14'
  },
  {
    id: 'TL-007',
    name: '12線 4D 綠光雷射水平儀',
    category: '水平放樣類',
    modelNumber: '戶外強光高精度 (配微調升降台)',
    serialNumber: 'LV-4D-992',
    status: 'BORROWED',
    currentBorrower: '第二組拉線工班 (黃師傅)',
    currentLocation: 'B棟頂樓配電室',
    borrowDate: '2026-09-12',
    expectedReturnDate: '2026-09-14', // 過去日期 -> 自動標記為逾期
    conditionNote: '含鋰電池 2 顆與充電器'
  },
  {
    id: 'TL-008',
    name: '鑽石洗孔機 (鑽石水鑽穿樑機)',
    category: '大型機具類',
    modelNumber: 'SHIBUYA TS-162 (洗孔能力 160mm)',
    serialNumber: 'SHB-162-09',
    status: 'AVAILABLE',
    currentLocation: '地下室配管區',
    conditionNote: '附 2吋、3吋、4吋 鑽石鑽石管各一支',
    lastInspectionDate: '2026-08-30'
  },
  {
    id: 'TL-009',
    name: '手提四溝電動鎚鑽 (免出力大電鑽)',
    category: '大型機具類',
    modelNumber: 'BOSCH GBH 2-28 F',
    serialNumber: 'BSH-228-44',
    status: 'AVAILABLE',
    currentLocation: '工務所總倉',
    conditionNote: '含鑽頭組與夾頭轉換器',
    lastInspectionDate: '2026-09-05'
  },
  {
    id: 'TL-010',
    name: '真有效值數位萬用鉤表',
    category: '電氣檢測類',
    modelNumber: 'FLUKE 376 FC (帶可撓式電流探棒)',
    serialNumber: 'FLK-376-88',
    status: 'AVAILABLE',
    currentLocation: '工務所總倉',
    conditionNote: '可量測至 1000A AC/DC',
    lastInspectionDate: '2026-08-01'
  }
];

export const initialToolLogs: ToolLog[] = [
  {
    id: 'TLG-001',
    toolId: 'TL-003',
    toolName: '管路通管機 (電動水管疏通機)',
    action: 'BORROW',
    person: '第一組配管工班 (陳師傅)',
    location: 'A棟地下室排水區',
    timestamp: '2026-09-15T08:30:00Z',
    conditionNote: '外觀正常，借用疏通 A棟排水幹管'
  },
  {
    id: 'TLG-002',
    toolId: 'TL-007',
    toolName: '12線 4D 綠光雷射水平儀',
    action: 'BORROW',
    person: '第二組拉線工班 (黃師傅)',
    location: 'B棟頂樓配電室',
    timestamp: '2026-09-12T09:00:00Z',
    conditionNote: '線槽吊架放樣定位用'
  }
];

// 本地暫存輔助
const getLocal = <T>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn(`Failed reading local storage for ${key}`, e);
  }
  return fallback;
};

const setLocal = <T>(key: string, val: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn(`Failed writing local storage for ${key}`, e);
  }
};

/**
 * 取得工具清單
 */
export async function fetchTools(): Promise<ToolItem[]> {
  return getLocal<ToolItem[]>(TOOLS_STORAGE_KEY, initialTools);
}

/**
 * 儲存/新增工具
 */
export async function saveTool(tool: ToolItem): Promise<void> {
  const current = await fetchTools();
  const exists = current.some(t => t.id === tool.id);
  const updated = exists
    ? current.map(t => (t.id === tool.id ? tool : t))
    : [tool, ...current];

  setLocal(TOOLS_STORAGE_KEY, updated);
}

/**
 * 刪除工具
 */
export async function deleteTool(toolId: string): Promise<void> {
  const current = await fetchTools();
  const updated = current.filter(t => t.id !== toolId);
  setLocal(TOOLS_STORAGE_KEY, updated);
}

/**
 * 登記工具借出
 */
export async function borrowTool(
  toolId: string,
  borrower: string,
  location: string,
  expectedReturnDate: string,
  notes?: string,
  photoUrl?: string
): Promise<void> {
  const current = await fetchTools();
  const target = current.find(t => t.id === toolId);
  if (!target) return;

  const nowStr = new Date().toISOString().split('T')[0];
  const updatedTool: ToolItem = {
    ...target,
    status: 'BORROWED',
    currentBorrower: borrower,
    currentLocation: location,
    borrowDate: nowStr,
    expectedReturnDate,
    conditionNote: notes || target.conditionNote,
    photoUrl: photoUrl || target.photoUrl
  };

  await saveTool(updatedTool);

  // 寫入歷程日誌
  const logs = getLocal<ToolLog[]>(TOOL_LOGS_STORAGE_KEY, initialToolLogs);
  const newLog: ToolLog = {
    id: `TLG-${Date.now()}`,
    toolId,
    toolName: target.name,
    action: 'BORROW',
    person: borrower,
    location,
    timestamp: new Date().toISOString(),
    conditionNote: notes,
    photoUrl
  };
  setLocal(TOOL_LOGS_STORAGE_KEY, [newLog, ...logs]);
}

/**
 * 登記工具歸還
 */
export async function returnTool(
  toolId: string,
  location: string,
  conditionStatus: 'NORMAL' | 'MAINTENANCE' | 'DAMAGED' = 'NORMAL',
  notes?: string,
  photoUrl?: string
): Promise<void> {
  const current = await fetchTools();
  const target = current.find(t => t.id === toolId);
  if (!target) return;

  const prevBorrower = target.currentBorrower || '現場工班';
  const updatedTool: ToolItem = {
    ...target,
    status: conditionStatus === 'NORMAL' ? 'AVAILABLE' : conditionStatus,
    currentBorrower: undefined,
    currentLocation: location || '工務所總倉',
    borrowDate: undefined,
    expectedReturnDate: undefined,
    conditionNote: notes || target.conditionNote,
    photoUrl: photoUrl || target.photoUrl
  };

  await saveTool(updatedTool);

  // 寫入歸還日誌
  const logs = getLocal<ToolLog[]>(TOOL_LOGS_STORAGE_KEY, initialToolLogs);
  const newLog: ToolLog = {
    id: `TLG-${Date.now()}`,
    toolId,
    toolName: target.name,
    action: 'RETURN',
    person: prevBorrower,
    location: location || '工務所總倉',
    timestamp: new Date().toISOString(),
    conditionNote: notes ? `${notes} (機況: ${conditionStatus})` : `機況: ${conditionStatus}`,
    photoUrl
  };
  setLocal(TOOL_LOGS_STORAGE_KEY, [newLog, ...logs]);
}

/**
 * 取得工具借還軌跡日誌
 */
export async function fetchToolLogs(): Promise<ToolLog[]> {
  return getLocal<ToolLog[]>(TOOL_LOGS_STORAGE_KEY, initialToolLogs);
}
