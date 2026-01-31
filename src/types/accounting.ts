export interface Product {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  unit: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  profit: number;
  date: string;
  notes?: string;
}

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
  supplier?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  totalProfit: number;
  salesCount: number;
  purchasesCount: number;
}
