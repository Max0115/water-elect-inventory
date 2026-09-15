export type OrderType = 'IN' | 'OUT' | 'R';

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
  location: string;
  supplier: string;
  notes?: string;
}

export interface InventoryRecord extends OrderItem {
  id: string;
  orderId: string;
  createdAt: any;
  updatedAt: any;
  updatedBy: string;
}

export interface GlobalOptions {
  categories: Record<string, string[]>;
  specifications: string[];
  units: string[];
  locations: string[];
  suppliers: string[];
}