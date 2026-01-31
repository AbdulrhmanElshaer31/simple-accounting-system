import { useState, useMemo } from 'react';
import { Plus, Trash2, Search, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSales, useProducts, generateId, formatCurrency, formatDate } from '@/hooks/useAccounting';
import { Sale } from '@/types/accounting';

export default function Sales() {
  const [sales, setSales] = useSales();
  const [products, setProducts] = useProducts();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(formatDate(new Date()));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    unitPrice: '',
    notes: '',
    date: formatDate(new Date()),
  });

  const selectedProduct = products.find(p => p.id === formData.productId);

  const filteredSales = useMemo(() => {
    return sales
      .filter(s => {
        const matchesSearch = s.productName.toLowerCase().includes(search.toLowerCase());
        const matchesDate = !dateFilter || s.date === dateFilter;
        return matchesSearch && matchesDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, search, dateFilter]);

  const todayStats = useMemo(() => {
    const todaySales = sales.filter(s => s.date === formatDate(new Date()));
    return {
      total: todaySales.reduce((sum, s) => sum + s.totalPrice, 0),
      profit: todaySales.reduce((sum, s) => sum + s.profit, 0),
      count: todaySales.length,
    };
  }, [sales]);

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      unitPrice: '',
      notes: '',
      date: formatDate(new Date()),
    });
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setFormData({
      ...formData,
      productId,
      unitPrice: product?.sellPrice.toString() || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.quantity || !formData.unitPrice) {
      return;
    }

    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    const quantity = parseInt(formData.quantity);
    const unitPrice = parseFloat(formData.unitPrice);
    const totalPrice = quantity * unitPrice;
    const profit = (unitPrice - product.buyPrice) * quantity;

    const sale: Sale = {
      id: generateId(),
      productId: formData.productId,
      productName: product.name,
      quantity,
      unitPrice,
      totalPrice,
      profit,
      date: formData.date,
      notes: formData.notes,
    };

    setSales([...sales, sale]);

    // Update product stock
    setProducts(products.map(p =>
      p.id === formData.productId
        ? { ...p, stock: p.stock - quantity }
        : p
    ));

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (sale: Sale) => {
    setSales(sales.filter(s => s.id !== sale.id));
    // Restore stock
    setProducts(products.map(p =>
      p.id === sale.productId
        ? { ...p, stock: p.stock + sale.quantity }
        : p
    ));
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المبيعات</h1>
          <p className="text-muted-foreground text-sm">{sales.length} عملية بيع</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              بيع جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تسجيل عملية بيع</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>المنتج</Label>
                <Select value={formData.productId} onValueChange={handleProductSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} (المتاح: {p.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="quantity">الكمية</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedProduct?.stock || 999999}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">سعر الوحدة</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات إضافية (اختياري)"
                  rows={2}
                />
              </div>

              {formData.quantity && formData.unitPrice && selectedProduct && (
                <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الإجمالي:</span>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(formData.quantity) * parseFloat(formData.unitPrice))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الربح:</span>
                    <span className="font-semibold text-success">
                      {formatCurrency((parseFloat(formData.unitPrice) - selectedProduct.buyPrice) * parseFloat(formData.quantity))}
                    </span>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={products.length === 0}>
                {products.length === 0 ? 'أضف منتجات أولاً' : 'تسجيل البيع'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">مبيعات اليوم</p>
            <p className="text-lg font-bold text-success">{formatCurrency(todayStats.total)}</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">الأرباح</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(todayStats.profit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">عدد العمليات</p>
            <p className="text-lg font-bold">{todayStats.count}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pr-10"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد مبيعات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSales.map((sale) => (
            <Card key={sale.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{sale.productName}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
                      <span className="text-muted-foreground">
                        الكمية: <span className="text-foreground">{sale.quantity}</span>
                      </span>
                      <span className="text-muted-foreground">
                        السعر: <span className="text-foreground">{formatCurrency(sale.unitPrice)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-semibold">
                        الإجمالي: {formatCurrency(sale.totalPrice)}
                      </span>
                      <span className="text-sm text-success">
                        ربح: {formatCurrency(sale.profit)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {sale.date}
                    </div>
                    {sale.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{sale.notes}</p>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف عملية البيع</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد؟ سيتم إرجاع الكمية للمخزون.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(sale)}
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
