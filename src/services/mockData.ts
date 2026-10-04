import { GlobalOptions, InventoryRecord, OperationLog } from '../types';
import { DEFAULT_PART_SYNONYMS, DEFAULT_PIPE_SIZE_ALIASES } from './hydroDictionary';
import { generateDefaultOptions } from './materialsDatabase';

// 使用完整的 15 大類水電工程材料資料庫作為系統預設選項
const generated = generateDefaultOptions();

export const initialOptions: GlobalOptions = {
  categories: generated.categories,
  specifications: generated.specifications,
  units: generated.units,
  locations: generated.locations,
  suppliers: generated.suppliers,
  minStockMap: generated.minStockMap,
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
    userEmail: 'admin@system.local',
    timestamp: new Date('2026-09-15T08:30:00').toISOString(),
    details: { itemCount: 3, type: 'IN', orderDate: '2026-09-15' }
  },
  {
    id: 'log-002',
    action: 'CREATE',
    targetId: 'O-20260916-01',
    targetName: '出庫單 O-20260916-01',
    userId: 'admin@system.local',
    userEmail: 'admin@system.local',
    timestamp: new Date('2026-09-16T09:15:00').toISOString(),
    details: { itemCount: 2, type: 'OUT', orderDate: '2026-09-16' }
  },
  {
    id: 'log-003',
    action: 'TRANSFER',
    targetId: 'T-20260916-01',
    targetName: '調撥單 T-20260916-01',
    userId: 'admin@system.local',
    userEmail: 'admin@system.local',
    timestamp: new Date('2026-09-16T10:20:00').toISOString(),
    details: { itemCount: 1, type: 'TRANSFER', targetLocation: '地下室配管區' }
  },
  {
    id: 'log-004',
    action: 'CREATE',
    targetId: 'S-20260916-01',
    targetName: '餘料/報廢單 S-20260916-01',
    userId: 'admin@system.local',
    userEmail: 'admin@system.local',
    timestamp: new Date('2026-09-16T11:00:00').toISOString(),
    details: { itemCount: 1, type: 'SCRAP' }
  }
];
