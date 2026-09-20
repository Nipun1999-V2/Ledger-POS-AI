export type CatalogType = 'PRODUCT' | 'RAW_MATERIAL';
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_WALLET' | 'BANK_TRANSFER';

export interface Category {
  id: number;
  name: string;
  type: CatalogType;
  description?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
}

export interface RawMaterial {
  id: number;
  sku: string;
  name: string;
  category?: Category;
  supplier?: Supplier;
  unit: string;
  costPrice: number;
  sellingPrice?: number;
  currentStock: number;
  minStockLevel: number;
  reorderQuantity: number;
  sellableDirectly: boolean;
  active: boolean;
}

export interface ProductRecipeItem {
  id?: number;
  rawMaterial?: RawMaterial;
  rawMaterialId?: number;
  quantityRequired: number;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category?: Category;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number;
  reorderQuantity: number;
  hasRecipe: boolean;
  active: boolean;
  recipeItems?: ProductRecipeItem[];
}

export interface SaleLine {
  itemType: CatalogType;
  itemId: number;
  quantity: number;
}

export interface SaleRequest {
  customerName?: string;
  customerPhone?: string;
  discount: number;
  taxRate: number;
  paymentMethod: PaymentMethod;
  items: SaleLine[];
}

export interface SaleItem {
  id: number;
  itemType: CatalogType;
  itemId: number;
  itemName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Sale {
  id: number;
  invoiceNumber: string;
  customerName?: string;
  saleDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: string;
  items: SaleItem[];
}

export interface StockAlert {
  id: number;
  itemType: CatalogType;
  itemId: number;
  itemName: string;
  currentStock: number;
  minStockLevel: number;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
}

export interface ForecastItem {
  itemType: CatalogType;
  itemId: number;
  itemName: string;
  currentStock: number;
  avgMonthlySales: number;
  predictedNextMonthQty: number;
  suggestedReorderQty: number;
  trend: 'RISING' | 'STABLE' | 'FALLING';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TopItem {
  itemName: string;
  quantitySold: number;
  revenue: number;
}

export interface AnalyticsReport {
  periodType: string;
  periodStart: string;
  periodEnd: string;
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  averageOrderValue: number;
  revenueChangePct: number;
  topSellingItems: TopItem[];
  lowPerformingItems: TopItem[];
  narrative: string;
}

export interface DashboardSummary {
  today: AnalyticsReport;
  topPredictedSellers: ForecastItem[];
  openStockAlerts: StockAlert[];
  totalActiveProducts: number;
  totalActiveRawMaterials: number;
}

export interface AppUser {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  active: boolean;
}
