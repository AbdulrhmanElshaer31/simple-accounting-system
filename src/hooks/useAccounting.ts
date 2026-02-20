import { useLocalStorage } from './useLocalStorage';
import { Product, Sale, Purchase, Expense, DailySummary, Customer, CustomerPayment, Supplier, SupplierPayment } from '@/types/accounting';

export function useProducts() {
  return useLocalStorage<Product[]>('accounting_products', []);
}

export function useSales() {
  return useLocalStorage<Sale[]>('accounting_sales', []);
}

export function usePurchases() {
  return useLocalStorage<Purchase[]>('accounting_purchases', []);
}

export function useExpenses() {
  return useLocalStorage<Expense[]>('accounting_expenses', []);
}

export function useCustomers() {
  return useLocalStorage<Customer[]>('accounting_customers', []);
}

export function useCustomerPayments() {
  return useLocalStorage<CustomerPayment[]>('accounting_customer_payments', []);
}

export function useSuppliers() {
  return useLocalStorage<Supplier[]>('accounting_suppliers', []);
}

export function useSupplierPayments() {
  return useLocalStorage<SupplierPayment[]>('accounting_supplier_payments', []);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-EG').format(num);
}

export function calculateDailySummary(
  sales: Sale[],
  purchases: Purchase[],
  expenses: Expense[],
  date: string
): DailySummary {
  const daySales = sales.filter(s => s.date === date);
  const dayPurchases = purchases.filter(p => p.date === date);
  const dayExpenses = expenses.filter(e => e.date === date);

  return {
    date,
    totalSales: daySales.reduce((sum, s) => sum + s.totalPrice, 0),
    totalPurchases: dayPurchases.reduce((sum, p) => sum + p.totalPrice, 0),
    totalExpenses: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
    totalProfit: daySales.reduce((sum, s) => sum + s.profit, 0) - dayExpenses.reduce((sum, e) => sum + e.amount, 0),
    salesCount: daySales.length,
    purchasesCount: dayPurchases.length,
  };
}

export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

export function getAllData() {
  return {
    products: JSON.parse(localStorage.getItem('accounting_products') || '[]'),
    sales: JSON.parse(localStorage.getItem('accounting_sales') || '[]'),
    purchases: JSON.parse(localStorage.getItem('accounting_purchases') || '[]'),
    expenses: JSON.parse(localStorage.getItem('accounting_expenses') || '[]'),
    customers: JSON.parse(localStorage.getItem('accounting_customers') || '[]'),
    customerPayments: JSON.parse(localStorage.getItem('accounting_customer_payments') || '[]'),
    suppliers: JSON.parse(localStorage.getItem('accounting_suppliers') || '[]'),
    supplierPayments: JSON.parse(localStorage.getItem('accounting_supplier_payments') || '[]'),
  };
}

export function restoreAllData(data: Record<string, unknown>) {
  if (data.products) localStorage.setItem('accounting_products', JSON.stringify(data.products));
  if (data.sales) localStorage.setItem('accounting_sales', JSON.stringify(data.sales));
  if (data.purchases) localStorage.setItem('accounting_purchases', JSON.stringify(data.purchases));
  if (data.expenses) localStorage.setItem('accounting_expenses', JSON.stringify(data.expenses));
  if (data.customers) localStorage.setItem('accounting_customers', JSON.stringify(data.customers));
  if (data.customerPayments) localStorage.setItem('accounting_customer_payments', JSON.stringify(data.customerPayments));
  if (data.suppliers) localStorage.setItem('accounting_suppliers', JSON.stringify(data.suppliers));
  if (data.supplierPayments) localStorage.setItem('accounting_supplier_payments', JSON.stringify(data.supplierPayments));
}
