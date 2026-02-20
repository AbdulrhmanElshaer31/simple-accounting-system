import { useState, useMemo } from 'react';
import { Plus, Trash2, Search, Truck, CreditCard, Calendar, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSuppliers, useSupplierPayments, usePurchases, generateId, formatCurrency, formatDate } from '@/hooks/useAccounting';
import { Supplier, SupplierPayment } from '@/types/accounting';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useSuppliers();
  const [payments, setPayments] = useSupplierPayments();
  const [purchases] = usePurchases();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', notes: '' });
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.phone || '').includes(search))
      .sort((a, b) => b.totalDebt - a.totalDebt);
  }, [suppliers, search]);

  const totalDebts = useMemo(() => suppliers.reduce((sum, s) => sum + s.totalDebt, 0), [suppliers]);

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    const supplier: Supplier = {
      id: generateId(), name: formData.name.trim(), phone: formData.phone, address: formData.address,
      totalDebt: 0, createdAt: formatDate(new Date()), notes: formData.notes,
    };
    setSuppliers([...suppliers, supplier]);
    setIsAddOpen(false);
    setFormData({ name: '', phone: '', address: '', notes: '' });
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !payAmount) return;
    const amount = parseFloat(payAmount);
    const payment: SupplierPayment = {
      id: generateId(), supplierId: selectedSupplier.id, supplierName: selectedSupplier.name,
      amount, date: formatDate(new Date()), notes: payNotes,
    };
    setPayments([...payments, payment]);
    setSuppliers(suppliers.map(s => s.id === selectedSupplier.id ? { ...s, totalDebt: s.totalDebt - amount } : s));
    setIsPayOpen(false);
    setPayAmount('');
    setPayNotes('');
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
    setPayments(payments.filter(p => p.supplierId !== id));
  };

  const getSupplierPurchases = (supplierId: string) => purchases.filter(p => p.supplierId === supplierId);
  const getSupplierPayments = (supplierId: string) => payments.filter(p => p.supplierId === supplierId);

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الموردين</h1>
          <p className="text-muted-foreground text-sm">{suppliers.length} مورد</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 ml-2" />مورد جديد</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>إضافة مورد جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="space-y-2">
                <Label>اسم المورد</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="اسم المورد" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="اختياري" />
                </div>
                <div className="space-y-2">
                  <Label>العنوان</Label>
                  <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="اختياري" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="اختياري" rows={2} />
              </div>
              <Button type="submit" className="w-full">إضافة المورد</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-warning/10 border-warning/20">
        <CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground">إجمالي المبالغ المستحقة للموردين</p>
          <p className="text-xl font-bold text-warning">{formatCurrency(totalDebts)}</p>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pr-10" placeholder="بحث عن مورد..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filteredSuppliers.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا يوجد موردين</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSuppliers.map(supplier => (
            <Card key={supplier.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => { setSelectedSupplier(supplier); setIsDetailOpen(true); }}>
                    <h3 className="font-semibold text-lg">{supplier.name}</h3>
                    {supplier.phone && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Phone className="h-3 w-3" />{supplier.phone}</p>}
                    {supplier.address && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{supplier.address}</p>}
                    <div className="mt-2">
                      <span className={`text-lg font-bold ${supplier.totalDebt > 0 ? 'text-warning' : 'text-success'}`}>
                        {supplier.totalDebt > 0 ? `مستحق: ${formatCurrency(supplier.totalDebt)}` : 'لا يوجد مستحقات'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {supplier.totalDebt > 0 && (
                      <Button variant="outline" size="sm" onClick={() => { setSelectedSupplier(supplier); setIsPayOpen(true); }}>
                        <CreditCard className="h-4 w-4 ml-1" />تسديد
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف المورد</AlertDialogTitle>
                          <AlertDialogDescription>هل أنت متأكد من حذف "{supplier.name}"؟</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2">
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteSupplier(supplier.id)}>حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>تسديد مبلغ - {selectedSupplier?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <span className="text-muted-foreground">المبلغ المستحق: </span>
              <span className="font-bold text-warning">{formatCurrency(selectedSupplier?.totalDebt || 0)}</span>
            </div>
            <div className="space-y-2">
              <Label>المبلغ المدفوع</Label>
              <Input type="number" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="اختياري" rows={2} />
            </div>
            <Button type="submit" className="w-full">تسجيل الدفع</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>تفاصيل المورد - {selectedSupplier?.name}</DialogTitle></DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">إجمالي المستحق الحالي</p>
                <p className={`text-2xl font-bold ${selectedSupplier.totalDebt > 0 ? 'text-warning' : 'text-success'}`}>
                  {formatCurrency(selectedSupplier.totalDebt)}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">المشتريات الآجلة</h4>
                {getSupplierPurchases(selectedSupplier.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد مشتريات</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getSupplierPurchases(selectedSupplier.id).map(purchase => (
                      <div key={purchase.id} className="flex justify-between p-2 bg-muted/50 rounded text-sm">
                        <span>{purchase.productName} - {purchase.quantity} وحدة</span>
                        <div className="text-left">
                          <span className="font-medium">{formatCurrency(purchase.totalPrice)}</span>
                          <span className="text-xs text-muted-foreground block">{purchase.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2">المدفوعات</h4>
                {getSupplierPayments(selectedSupplier.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد مدفوعات</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getSupplierPayments(selectedSupplier.id).map(payment => (
                      <div key={payment.id} className="flex justify-between p-2 bg-success/10 rounded text-sm">
                        <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{payment.date}</div>
                        <span className="font-medium text-success">{formatCurrency(payment.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
