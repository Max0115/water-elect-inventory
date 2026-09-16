export type OrderType = 'IN' | 'OUT' | 'R' | 'SCRAP' | 'TRANSFER';

export type MainTab = 
  | 'inventory'
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