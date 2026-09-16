import { GlobalOptions, InventoryRecord, OperationLog } from '../types';
import { DEFAULT_PART_SYNONYMS, DEFAULT_PIPE_SIZE_ALIASES } from './hydroDictionary';

// 去除品名內硬編碼尺寸，尺寸規格一律獨立由 specifications 欄位管理
export const initialOptions: GlobalOptions = {
  categories: {
    'PVC另件材料': ['電S', '45度OL 單放', 'OL', 'OT', 'OS', '順T', '異徑S', '球閥', '90度彎頭', '活接頭'],
    '給水另件': ['EB 套銅彎頭', '套銅S', '給水直接頭', '立體三通', '雙外牙短管'],
    '耐衝擊另件': ['OL', '套銅S', '耐衝擊接頭', '外牙塞頭', '管帽'],
    'PVC管材': ['耐衝擊管', '橘色薄管', '灰色厚管', '電線導管', '波紋管'],
    '電線電纜': ['單芯銅線 (紅)', '單芯銅線 (白)', '絞線 (綠)', '主幹線 (黑)'],
    '開關箱與插座': ['接地雙插座附蓋板', '無熔線斷路器', '漏電斷路器', '金屬開關接線盒']
  },
  specifications: [
    '1/8"', '1/4"', '5/16"', '3/8"',
    '1/2"', '5/8"', '3/4"', '7/8"', 
    '1"', '1"(25)', '1"x3/4"', 
    '1-1/4"', '1-1/2"', '2"', '2"x1"', '2-1/2"', 
    '3"', '3-1/2"', '4"', '4"x2"', '5"', '6"', 
    '2.0mm', '5.5mm²', '14mm²', '38mm²', 
    '2P 20A', '3P 30A'
  ],
  units: ['支', '只', '罐', '條', '盒', '卷', '米'],
  locations: ['工務所總倉', '地下室配管區', 'A棟1F施工區', 'B棟頂樓機房', '案場外圍管線區'],
  suppliers: ['太乙水電材料', '泰詠材料行', '南亞管材行', '大亞電線電纜', '第一組配管工班', '第二組拉線工班'],
  minStockMap: {
    '電S': 10,
    '45度OL 單放': 5,
    '單芯銅線 (紅)': 3,
    '耐衝擊管': 8,
    '無熔線斷路器': 4
  },
  synonyms: DEFAULT_PART_SYNONYMS,
  sizeAliases: DEFAULT_PIPE_SIZE_ALIASES
};

export const sampleRecords: InventoryRecord[] = [
  {
    id: 'rec-001',
    orderId: 'I-20260915-01',
    orderDate: '2026-09-15',
    orderIndex: 1,
    type: 'IN',
    category: 'PVC管材',
    itemName: '耐衝擊管',
    specification: '1"(25)',
    quantity: 50,
    unit: '支',
    location: '工務所總倉',
    supplier: '南亞管材行',
    notes: '批次大宗進場',
    createdAt: new Date('2026-09-15T08:30:00').toISOString(),
    updatedAt: new Date('2026-09-15T08:30:00').toISOString(),
    updatedBy: 'admin@system.local'
  },
  {
    id: 'rec-002',
    orderId: 'I-20260915-01',
    orderDate: '2026-09-15',
    orderIndex: 2,
    type: 'IN',
    category: 'PVC另件材料',
    itemName: '電S',
    specification: '1"',
    quantity: 80,
    unit: '只',
    location: '工務所總倉',
    supplier: '太乙水電材料',
    notes: '常備進貨',
    createdAt: new Date('2026-09-15T08:30:00').toISOString(),
    updatedAt: new Date('2026-09-15T08:30:00').toISOString(),
    updatedBy: 'admin@system.local'
  },
  {
    id: 'rec-003',
    orderId: 'I-20260915-01',
    orderDate: '2026-09-15',
    orderIndex: 3,
    type: 'IN',
    category: '電線電纜',
    itemName: '單芯銅線 (紅)',
    specification: '2.0mm',
    quantity: 12,
    unit: '卷',
    location: '工務所總倉',
    supplier: '大亞電線電纜',
    notes: '樓層室內配線用',
    createdAt: new Date('2026-09-15T08:30:00').toISOString(),
    updatedAt: new Date('2026-09-15T08:30:00').toISOString(),
    updatedBy: 'admin@system.local'
  },
  {
    id: 'rec-004',
    orderId: 'O-20260916-01',
    orderDate: '2026-09-16',
    orderIndex: 1,
    type: 'OUT',
    category: 'PVC管材',
    itemName: '耐衝擊管',
    specification: '1"(25)',
    quantity: 20,
    unit: '支',
    location: '工務所總倉',
    supplier: '第一組配管工班',
    notes: '領料至地下室連續壁配管',
    createdAt: new Date('2026-09-16T09:15:00').toISOString(),
    updatedAt: new Date('2026-09-16T09:15:00').toISOString(),
    updatedBy: 'admin@system.local'
  },
  {
    id: 'rec-005',
    orderId: 'O-20260916-01',
    orderDate: '2026-09-16',
    orderIndex: 2,
    type: 'OUT',
    category: 'PVC另件材料',
    itemName: '電S',
    specification: '1"',
    quantity: 35,
    unit: '只',
    location: '工務所總倉',
    supplier: '第一組配管工班',
    notes: '配管接頭領用',
    createdAt: new Date('2026-09-16T09:15:00').toISOString(),
    updatedAt: new Date('2026-09-16T09:15:00').toISOString(),
    updatedBy: 'admin@system.local'
  },
  {
    id: 'rec-006',
    orderId: 'T-20260916-01',
    orderDate: '2026-09-16',
    orderIndex: 1,
    type: 'TRANSFER',
    category: 'PVC管材',
    itemName: '耐衝擊管',
    specification: '1"(25)',
    quantity: 15,
    unit: '支',
    location: '工務所總倉',
    targetLocation: '地下室配管區',
    notes: '工地預放備料調撥',
    createdAt: new Date('2026-09-16T10:20:00').toISOString(),
    updatedAt: new Date('2026-09-16T10:20:00').toISOString(),
    updatedBy: 'admin@system.local'
  },
  {
    id: 'rec-007',
    orderId: 'S-20260916-01',
    orderDate: '2026-09-16',
    orderIndex: 1,
    type: 'SCRAP',
    category: 'PVC管材',
    itemName: '耐衝擊管',
    specification: '1"(25)',
    quantity: 3,
    unit: '支',
    location: '工務所總倉',
    notes: '現場裁切短管入庫',
    createdAt: new Date('2026-09-16T11:00:00').toISOString(),
    updatedAt: new Date('2026-09-16T11:00:00').toISOString(),
    updatedBy: 'admin@system.local'
  }
];

export const sampleLogs: OperationLog[] = [
  {
    id: 'log-001',
    action: 'CREATE',
    targetId: 'I-20260915-01',
    targetName: '進貨單 I-20260915-01',
    userId: 'admin@system.local',
    userEmail: 'max5020899@gmail.com',
    timestamp: new Date('2026-09-15T08:30:00').toISOString(),
    details: { itemCount: 3, type: 'IN', orderDate: '2026-09-15' }
  },
  {
    id: 'log-002',
    action: 'CREATE',
    targetId: 'O-20260916-01',
    targetName: '出庫單 O-20260916-01',
    userId: 'admin@system.local',
    userEmail: 'max5020899@gmail.com',
    timestamp: new Date('2026-09-16T09:15:00').toISOString(),
    details: { itemCount: 2, type: 'OUT', orderDate: '2026-09-16' }
  },
  {
    id: 'log-003',
    action: 'TRANSFER',
    targetId: 'T-20260916-01',
    targetName: '調撥單 T-20260916-01',
    userId: 'admin@system.local',
    userEmail: 'max5020899@gmail.com',
    timestamp: new Date('2026-09-16T10:20:00').toISOString(),
    details: { itemCount: 1, type: 'TRANSFER', targetLocation: '地下室配管區' }
  },
  {
    id: 'log-004',
    action: 'DELETE',
    targetId: 'S-20260916-01',
    targetName: '報廢單 S-20260916-01',
    userId: 'admin@system.local',
    userEmail: 'max5020899@gmail.com',
    timestamp: new Date('2026-09-16T11:00:00').toISOString(),
    details: { itemCount: 1, type: 'SCRAP' }
  }
];
