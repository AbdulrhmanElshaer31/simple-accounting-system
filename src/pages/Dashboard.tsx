import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Package, DollarSign, ShoppingCart, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSales, usePurchases, useExpenses, useProducts, formatCurrency, formatDate } from '@/hooks/useAccounting';

export default function Dashboard() {
  const [sales] = useSales();
  const [purchases] = usePurchases();
  const [expenses] = useExpenses();
  const [products] = useProducts();

  const today = formatDate(new Date());
  
  const stats = useMemo(() => {
    const todaySales = sales.filter(s => s.date === today);
    const todayPurchases = purchases.filter(p => p.date === today);
    const todayExpenses = expenses.filter(e => e.date === today);

    const totalSalesToday = todaySales.reduce((sum, s) => sum + s.totalPrice, 0);
    const totalPurchasesToday = todayPurchases.reduce((sum, p) => sum + p.totalPrice, 0);
    const totalExpensesToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalProfitToday = todaySales.reduce((sum, s) => sum + s.profit, 0) - totalExpensesToday;

    const totalSalesAll = sales.reduce((sum, s) => sum + s.totalPrice, 0);
    const totalPurchasesAll = purchases.reduce((sum, p) => sum + p.totalPrice, 0);
    const totalExpensesAll = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalProfitAll = sales.reduce((sum, s) => sum + s.profit, 0) - totalExpensesAll;

    const lowStockProducts = products.filter(p => p.stock < 10);
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.buyPrice), 0);

    return {
      todaySales: totalSalesToday,
      todayPurchases: totalPurchasesToday,
      todayExpenses: totalExpensesToday,
      todayProfit: totalProfitToday,
      totalSales: totalSalesAll,
      totalPurchases: totalPurchasesAll,
      totalExpenses: totalExpensesAll,
      totalProfit: totalProfitAll,
      productsCount: products.length,
      lowStockCount: lowStockProducts.length,
      inventoryValue: totalInventoryValue,
      salesCountToday: todaySales.length,
    };
  }, [sales, purchases, expenses, products, today]);

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على العمليات اليومية</p>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-3">إحصائيات اليوم</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                المبيعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-success">{formatCurrency(stats.todaySales)}</p>
              <p className="text-xs text-muted-foreground">{stats.salesCountToday} عملية</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                المشتريات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-primary">{formatCurrency(stats.todayPurchases)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4 text-warning" />
                المصروفات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-warning">{formatCurrency(stats.todayExpenses)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                صافي الربح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xl font-bold ${stats.todayProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(stats.todayProfit)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Overall Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-3">الإجمالي الكلي</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-success">{formatCurrency(stats.totalSales)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المشتريات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-primary">{formatCurrency(stats.totalPurchases)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المصروفات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-warning">{formatCurrency(stats.totalExpenses)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">صافي الربح الكلي</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(stats.totalProfit)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inventory Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-3">المخزون</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                عدد المنتجات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{stats.productsCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                منتجات على وشك النفاد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-destructive">{stats.lowStockCount}</p>
            </CardContent>
          </Card>

          <Card className="col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">قيمة المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatCurrency(stats.inventoryValue)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
