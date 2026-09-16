export type OrderType = 'IN' | 'OUT' | 'R' | 'SCRAP' | 'TRANSFER';

export type MainTab = 
  | 'inventory'
  | 'tools'
  | 'in_orders'
  | 'out_orders'
  | 'scrap'
  | 'options'
  | 'logs'
  | 'settings';

export interface OrderItem {
  id?: string;
  orderId?: string;
  orderDate: string;
  orderIndex: number;
  type: OrderType;
  category: string;
  itemName: string;
  specification: string;
  quantity: number;
  unit: string;
  location: string;        // 案場或庫位
  supplier?: string;       // 進貨: 材料商 / 出貨: 領料工班
  targetLocation?: string; // 調撥目標
  notes?: string;
}

export interface InventoryRecord extends OrderItem {
  id: string;
  orderId: string;
  createdAt: any;
  updatedAt: any;
  updatedBy: string;
}

export interface StockItem {
  id: string;
  category: string;
  itemName: string;
  specification: string;
  location: string;
  unit: string;
  currentStock: number;
  minStock?: number; // 安全庫存警示值
  lastUpdated?: any;
}

export interface GlobalOptions {
  categories: Record<string, string[]>;
  specifications: string[];
  units: string[];
  locations: string[];
  suppliers: string[];
  minStockMap?: Record<string, number>; // 各材料自訂安全庫存門檻
  synonyms?: Record<string, string[]>;   // 水電零件台語/外來語同義詞對照
  sizeAliases?: Record<string, string[]>; // 1/8" ~ 6" 英吋與台語分數尺寸對照
}

export interface OperationLog {
  id?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TRANSFER' | 'IMPORT';
  targetId: string;
  targetName: string;
  userId: string;
  userEmail: string;
  timestamp: any;
  details?: Record<string, any>;
}

export type ToolStatus = 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE' | 'DAMAGED';

export interface ToolItem {
  id: string;
  name: string;
  category: string; // 動力壓接類, 水管通管試壓, 電氣檢測儀器, 鑽孔破碎機具, 常用手工具
  modelNumber?: string;
  serialNumber?: string;
  status: ToolStatus;
  currentBorrower?: string; // 當前借用工班/師傅
  currentLocation?: string; // 當前所在案場/庫位
  borrowDate?: string;
  expectedReturnDate?: string;
  photoUrl?: string; // 存證照片 (壓縮 Base64 或 URL)
  conditionNote?: string; // 機況備註 (如模具規格、配件狀況)
  lastInspectionDate?: string; // 上次保養/校正日期
  nextInspectionDate?: string; // 下次校正到期日
}

export interface ToolLog {
  id: string;
  toolId: string;
  toolName: string;
  action: 'BORROW' | 'RETURN' | 'MAINTENANCE' | 'CREATE' | 'UPDATE';
  person: string;
  location: string;
  timestamp: string;
  conditionNote?: string;
  photoUrl?: string;
}