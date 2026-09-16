import { GlobalOptions, InventoryRecord, OperationLog, CrewCalendarEvent } from '../types';

export const initialOptions: GlobalOptions = {
  categories: {
    'PVC另件材料': ['電S 1"', '45度OL 單放 2"', 'OL 3/4"', 'OT 1"(25)x3/4"', 'OS 1"(25)x3/4"', '順T 2"', '異徑S 2"x1"'],
    '給水另件': ['EB 套銅彎頭 1"(25)', '套銅S 1"(25)', '給水直接頭 3/4"', '立體三通 1"'],
    '耐衝擊另件': ['OL 1"(25)', '套銅S 1"(25)', '耐衝擊接頭 2"'],
    'PVC管材': ['耐衝擊管 1"(25)', '橘色薄管 2"', '灰色厚管 4"', '電線導管 3/4"'],
    '電線電纜': ['2.0mm 單芯銅線 (紅)', '2.0mm 單芯銅線 (白)', '5.5mm² 絞線 (綠)', '38mm² 主幹線'],
    '開關箱與插座': ['接地雙插座附蓋板', '無熔線斷路器 2P 20A', '漏電斷路器 30A', '金屬開關接線盒']
  },
  specifications: ['1/2"', '3/4"', '1"', '1"(25)', '1"x3/4"', '1-1/2"', '2"', '4"x2"', '4"', '6"'],
  units: ['支', '只', '罐', '條', '盒', '卷', '米'],
  locations: ['工務所總倉', '地下室配管區', 'A棟1F施工區', 'B棟頂樓機房', '案場外圍管線區'],
  suppliers: ['太乙水電材料', '泰詠材料行', '南亞管材行', '大亞電線電纜', '第一組配管工班', '第二組拉線工班'],
  minStockMap: {
    '電S 1"': 10,
    '45度OL 單放 2"': 5,
    '2.0mm 單芯銅線 (紅)': 3,
    '耐衝擊管 1"(25)': 8,
    '無熔線斷路器 2P 20A': 4
  }
};

export const sampleRecords: InventoryRecord[] = [
  {
    id: 'rec-001',
    orderId: 'I-20260915-01',
    orderDate: '2026-09-15',
    orderIndex: 1,
    type: 'IN',
    category: 'PVC管材',
    itemName: '耐衝擊管 1"(25)',
    specification: '1"(25)',
    quantity: 50,
    unit: '支',
    location: '工務所總倉',
    supplier: '南亞管材行',
    notes: '批次大宗進場',
    createdAt: new Date('2026-09-15T08:30:00'),
    updatedAt: new Date('2026-09-15T08:30:00'),
    updatedBy: 'admin@system.local'
  },
  {
    id: 'rec-002',
    orderId: 'I-20260915-01',
    orderDate: '2026-09-15',
    orderIndex: 2,
    type: 'IN',
    category: 'PVC另件材料',
    itemName: '電S 1"',
    specification: '1"',
    quantity: 80,
    unit: '只',
    location: '工務所總倉',
    supplier: '太乙水電材料',
    notes: '常備進貨',
    createdAt: new Date('2026-09-15T08:30:00'),
    updatedAt: new Date('2026-09-15T08:30:00'),
    updatedBy: 'admin@system.local'
  },
  {
    id: 'rec-003',
    orderId: 'I-20260915-01',
    orderDate: '2026-09-15',
    orderIndex: 3,
    type: 'IN',
    category: '電線電纜',
    itemName: '2.0mm 單芯銅線 (紅)',
    specification: '1"',
    quantity: 12,
    unit: '卷',
    location: '工務所總倉',
    supplier: '大亞電線電纜',
    notes: '樓層室內配線用',
    createdAt: new Date('2026-09-15T08:30:00'),
    updatedAt: new Date('2026-09-15T08:30:00'),
    updatedBy: 'admin@system.local'
  },
  {
    id: 'rec-004',
    orderId: 'O-20260916-01',
    orderDate: '2026-09-16',
    orderIndex: 1,
    type: 'OUT',
    category: 'PVC管材',
    itemName: '耐衝擊管 1"(25)',
    specification: '1"(25)',
    quantity: 20,
    unit: '支',
    location: '工務所總倉',
    supplier: '第一組配管工班',
    notes: '領料至地下室連續壁配管',
    createdAt: new Date('2026-09-16T09:15:00'),
    updatedAt: new Date('2026-09-16T09:15:00'),
    updatedBy: 'admin@system.local'
  },
  {
    id: 'rec-005',
    orderId: 'O-20260916-01',
    orderDate: '2026-09-16',
    orderIndex: 2,
    type: 'OUT',
    category: 'PVC另件材料',
    itemName: '電S 1"',
    specification: '1"',
    quantity: 35,
    unit: '只',
    location: '工務所總倉',
    supplier: '第一組配管工班',
    notes: '配管接頭領用',
    createdAt: new Date('2026-09-16T09:15:00'),
    updatedAt: new Date('2026-09-16T09:15:00'),
    updatedBy: 'admin@system.local'
  },
  {
    id: 'rec-006',
    orderId: 'T-20260916-01',
    orderDate: '2026-09-16',
    orderIndex: 1,
    type: 'TRANSFER',
    category: 'PVC管材',
    itemName: '耐衝擊管 1"(25)',
    specification: '1"(25)',
    quantity: 15,
    unit: '支',
    location: '工務所總倉',
    targetLocation: '地下室配管區',
    notes: '工地預放備料調撥',
    createdAt: new Date('2026-09-16T10:20:00'),
    updatedAt: new Date('2026-09-16T10:20:00'),
    updatedBy: 'admin@system.local'
  },
  {
    id: 'rec-007',
    orderId: 'S-20260916-01',
    orderDate: '2026-09-16',
    orderIndex: 1,
    type: 'SCRAP',
    category: 'PVC管材',
    itemName: '耐衝擊管 1"(25)',
    specification: '1"(25)',
    quantity: 3,
    unit: '支',
    location: '工務所總倉',
    notes: '運送碰撞壓扁破裂報廢',
    createdAt: new Date('2026-09-16T11:00:00'),
    updatedAt: new Date('2026-09-16T11:00:00'),
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
    timestamp: new Date('2026-09-15T08:30:00'),
    details: { itemCount: 3, type: 'IN', orderDate: '2026-09-15' }
  },
  {
    id: 'log-002',
    action: 'CREATE',
    targetId: 'O-20260916-01',
    targetName: '出庫單 O-20260916-01',
    userId: 'admin@system.local',
    userEmail: 'max5020899@gmail.com',
    timestamp: new Date('2026-09-16T09:15:00'),
    details: { itemCount: 2, type: 'OUT', orderDate: '2026-09-16' }
  },
  {
    id: 'log-003',
    action: 'TRANSFER',
    targetId: 'T-20260916-01',
    targetName: '調撥單 T-20260916-01',
    userId: 'admin@system.local',
    userEmail: 'max5020899@gmail.com',
    timestamp: new Date('2026-09-16T10:20:00'),
    details: { itemCount: 1, type: 'TRANSFER', targetLocation: '地下室配管區' }
  },
  {
    id: 'log-004',
    action: 'DELETE',
    targetId: 'S-20260916-01',
    targetName: '報廢單 S-20260916-01',
    userId: 'admin@system.local',
    userEmail: 'max5020899@gmail.com',
    timestamp: new Date('2026-09-16T11:00:00'),
    details: { itemCount: 1, type: 'SCRAP' }
  }
];

export const sampleCrewEvents: CrewCalendarEvent[] = [
  {
    id: 'crew-01',
    date: '2026-09-16',
    crewName: '陳師傅 (配管組長)',
    type: 'WORK',
    siteLocation: '地下室配管區',
    workDescription: 'B2污廢水幹管配管作業',
    notes: '預計完成 35 米'
  },
  {
    id: 'crew-02',
    date: '2026-09-16',
    crewName: '李師傅 (電工工班)',
    type: 'WORK',
    siteLocation: 'A棟1F施工區',
    workDescription: '1F梯廳照明開關盒定位放樣',
    notes: '需配合泥作進場'
  },
  {
    id: 'crew-03',
    date: '2026-09-16',
    crewName: '王師傅',
    type: 'LEAVE',
    siteLocation: '全區',
    workDescription: '特休事假',
    notes: '已由陳組長代班'
  },
  {
    id: 'crew-04',
    date: '2026-09-17',
    crewName: '張師傅 (高空作業)',
    type: 'SITE_DUTY',
    siteLocation: 'B棟頂樓機房',
    workDescription: '頂樓冷卻水塔揚水管吊管銜接',
    notes: '需備安全索扣'
  }
];

