import { useState, useMemo } from 'react';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSales, usePurchases, useExpenses, useProducts, formatCurrency, formatDate, getDateRange } from '@/hooks/useAccounting';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom';

export default function Reports() {
  const [sales] = useSales();
  const [purchases] = usePurchases();
  const [expenses] = useExpenses();
  const [products] = useProducts();

  const today = formatDate(new Date());
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const dateRange = useMemo(() => {
    const now = new Date();
    
    switch (reportType) {
      case 'daily':
        return { start: today, end: today };
      case 'weekly': {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return { start: formatDate(weekAgo), end: today };
      }
      case 'monthly': {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return { start: formatDate(monthAgo), end: today };
      }
      case 'custom':
        return { start: startDate, end: endDate };
      default:
        return { start: today, end: today };
    }
  }, [reportType, startDate, endDate, today]);

  const reportData = useMemo(() => {
    const { start, end } = dateRange;
    
    const filteredSales = sales.filter(s => s.date >= start && s.date <= end);
    const filteredPurchases = purchases.filter(p => p.date >= start && p.date <= end);
    const filteredExpenses = expenses.filter(e => e.date >= start && e.date <= end);

    const totalSales = filteredSales.reduce((sum, s) => sum + s.totalPrice, 0);
    const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.totalPrice, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const grossProfit = filteredSales.reduce((sum, s) => sum + s.profit, 0);
    const netProfit = grossProfit - totalExpenses;

    // Group by date
    const dates = getDateRange(start, end);
    const dailyData = dates.map(date => {
      const daySales = filteredSales.filter(s => s.date === date);
      const dayPurchases = filteredPurchases.filter(p => p.date === date);
      const dayExpenses = filteredExpenses.filter(e => e.date === date);
      
      return {
        date,
        sales: daySales.reduce((sum, s) => sum + s.totalPrice, 0),
        purchases: dayPurchases.reduce((sum, p) => sum + p.totalPrice, 0),
        expenses: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
        profit: daySales.reduce((sum, s) => sum + s.profit, 0) - dayExpenses.reduce((sum, e) => sum + e.amount, 0),
      };
    });

    // Top products
    const productSales = new Map<string, { name: string; quantity: number; total: number; profit: number }>();
    filteredSales.forEach(sale => {
      const existing = productSales.get(sale.productId) || { name: sale.productName, quantity: 0, total: 0, profit: 0 };
      productSales.set(sale.productId, {
        name: sale.productName,
        quantity: existing.quantity + sale.quantity,
        total: existing.total + sale.totalPrice,
        profit: existing.profit + sale.profit,
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      grossProfit,
      netProfit,
      salesCount: filteredSales.length,
      purchasesCount: filteredPurchases.length,
      dailyData,
      topProducts,
      sales: filteredSales,
      purchases: filteredPurchases,
      expenses: filteredExpenses,
    };
  }, [dateRange, sales, purchases, expenses]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const { start, end } = dateRange;
    
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Accounting Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${start} to ${end}`, 105, 30, { align: 'center' });

    // Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, 45);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const summaryData = [
      ['Total Sales', `${reportData.totalSales.toFixed(2)} EGP`],
      ['Total Purchases', `${reportData.totalPurchases.toFixed(2)} EGP`],
      ['Total Expenses', `${reportData.totalExpenses.toFixed(2)} EGP`],
      ['Gross Profit', `${reportData.grossProfit.toFixed(2)} EGP`],
      ['Net Profit', `${reportData.netProfit.toFixed(2)} EGP`],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Item', 'Amount']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });

    // Sales Details
    if (reportData.sales.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Sales Details', 14, 20);

      const salesTableData = reportData.sales.map(s => [
        s.date,
        s.productName,
        s.quantity.toString(),
        `${s.unitPrice.toFixed(2)}`,
        `${s.totalPrice.toFixed(2)}`,
        `${s.profit.toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 25,
        head: [['Date', 'Product', 'Qty', 'Price', 'Total', 'Profit']],
        body: salesTableData,
        theme: 'striped',
        headStyles: { fillColor: [92, 184, 92] },
      });
    }

    // Purchases Details
    if (reportData.purchases.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Purchases Details', 14, 20);

      const purchasesTableData = reportData.purchases.map(p => [
        p.date,
        p.productName,
        p.quantity.toString(),
        `${p.unitPrice.toFixed(2)}`,
        `${p.totalPrice.toFixed(2)}`,
        p.supplier || '-',
      ]);

      autoTable(doc, {
        startY: 25,
        head: [['Date', 'Product', 'Qty', 'Price', 'Total', 'Supplier']],
        body: purchasesTableData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] },
      });
    }

    // Expenses Details
    if (reportData.expenses.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Expenses Details', 14, 20);

      const expensesTableData = reportData.expenses.map(e => [
        e.date,
        e.description,
        e.category,
        `${e.amount.toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 25,
        head: [['Date', 'Description', 'Category', 'Amount']],
        body: expensesTableData,
        theme: 'striped',
        headStyles: { fillColor: [240, 173, 78] },
      });
    }

    // Inventory Status
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Inventory Status', 14, 20);

    const inventoryData = products.length > 0 
      ? products.map(p => [
          p.name,
          p.stock.toString(),
          p.unit,
          `${p.buyPrice.toFixed(2)}`,
          `${p.sellPrice.toFixed(2)}`,
          `${(p.stock * p.buyPrice).toFixed(2)}`,
        ])
      : [['No products', '-', '-', '-', '-', '-']];

    autoTable(doc, {
      startY: 25,
      head: [['Product', 'Stock', 'Unit', 'Buy Price', 'Sell Price', 'Value']],
      body: inventoryData,
      theme: 'striped',
      headStyles: { fillColor: [91, 192, 222] },
    });

    // Save
    doc.save(`accounting-report-${start}-${end}.pdf`);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">التقارير</h1>
          <p className="text-muted-foreground text-sm">إنشاء تقارير مفصلة</p>
        </div>
        <Button onClick={generatePDF}>
          <Download className="h-4 w-4 ml-2" />
          تصدير PDF
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>نوع التقرير</Label>
              <Select value={reportType} onValueChange={(v: ReportType) => setReportType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">يومي</SelectItem>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="custom">مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>من تاريخ</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>إلى تاريخ</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>الفترة: {dateRange.start} إلى {dateRange.end}</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              إجمالي المبيعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-success">{formatCurrency(reportData.totalSales)}</p>
            <p className="text-xs text-muted-foreground">{reportData.salesCount} عملية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-primary" />
              إجمالي المشتريات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-primary">{formatCurrency(reportData.totalPurchases)}</p>
            <p className="text-xs text-muted-foreground">{reportData.purchasesCount} عملية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-warning">{formatCurrency(reportData.totalExpenses)}</p>
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
            <p className={`text-xl font-bold ${reportData.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(reportData.netProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">التفاصيل اليومية</CardTitle>
        </CardHeader>
        <CardContent>
          {reportData.dailyData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-2 px-2">التاريخ</th>
                    <th className="text-right py-2 px-2">المبيعات</th>
                    <th className="text-right py-2 px-2">المشتريات</th>
                    <th className="text-right py-2 px-2">المصروفات</th>
                    <th className="text-right py-2 px-2">الربح</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.dailyData.map((day) => (
                    <tr key={day.date} className="border-b">
                      <td className="py-2 px-2">{day.date}</td>
                      <td className="py-2 px-2 text-success">{formatCurrency(day.sales)}</td>
                      <td className="py-2 px-2 text-primary">{formatCurrency(day.purchases)}</td>
                      <td className="py-2 px-2 text-warning">{formatCurrency(day.expenses)}</td>
                      <td className={`py-2 px-2 font-semibold ${day.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(day.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      {reportData.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">أكثر المنتجات مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    <p className="text-sm text-muted-foreground">
                      {product.quantity} وحدة مباعة
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{formatCurrency(product.total)}</p>
                    <p className="text-sm text-success">ربح: {formatCurrency(product.profit)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
