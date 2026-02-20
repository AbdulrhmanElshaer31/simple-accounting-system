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
  customerId?: string;
  customerName?: string;
  paymentType: 'cash' | 'credit';
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
  supplierId?: string;
  notes?: string;
  paymentType: 'cash' | 'credit';
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  totalDebt: number;
  createdAt: string;
  notes?: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  totalDebt: number;
  createdAt: string;
  notes?: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  amount: number;
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
