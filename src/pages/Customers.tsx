import { useState, useMemo } from 'react';
import { Plus, Trash2, Search, Users, CreditCard, Calendar, Phone, MapPin } from 'lucide-react';
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
import { useCustomers, useCustomerPayments, useSales, generateId, formatCurrency, formatDate } from '@/hooks/useAccounting';
import { Customer, CustomerPayment } from '@/types/accounting';

export default function Customers() {
  const [customers, setCustomers] = useCustomers();
  const [payments, setPayments] = useCustomerPayments();
  const [sales] = useSales();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', notes: '' });
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search))
      .sort((a, b) => b.totalDebt - a.totalDebt);
  }, [customers, search]);

  const totalDebts = useMemo(() => customers.reduce((sum, c) => sum + c.totalDebt, 0), [customers]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    const customer: Customer = {
      id: generateId(), name: formData.name.trim(), phone: formData.phone, address: formData.address,
      totalDebt: 0, createdAt: formatDate(new Date()), notes: formData.notes,
    };
    setCustomers([...customers, customer]);
    setIsAddOpen(false);
    setFormData({ name: '', phone: '', address: '', notes: '' });
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !payAmount) return;
    const amount = parseFloat(payAmount);
    const payment: CustomerPayment = {
      id: generateId(), customerId: selectedCustomer.id, customerName: selectedCustomer.name,
      amount, date: formatDate(new Date()), notes: payNotes,
    };
    setPayments([...payments, payment]);
    setCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, totalDebt: c.totalDebt - amount } : c));
    setIsPayOpen(false);
    setPayAmount('');
    setPayNotes('');
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    setPayments(payments.filter(p => p.customerId !== id));
  };

  const getCustomerSales = (customerId: string) => sales.filter(s => s.customerId === customerId);
  const getCustomerPayments = (customerId: string) => payments.filter(p => p.customerId === customerId);

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">العملاء</h1>
          <p className="text-muted-foreground text-sm">{customers.length} عميل</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 ml-2" />عميل جديد</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>إضافة عميل جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="space-y-2">
                <Label>اسم العميل</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="اسم العميل" required />
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
              <Button type="submit" className="w-full">إضافة العميل</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground">إجمالي الديون المستحقة</p>
          <p className="text-xl font-bold text-destructive">{formatCurrency(totalDebts)}</p>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pr-10" placeholder="بحث عن عميل..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filteredCustomers.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا يوجد عملاء</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map(customer => (
            <Card key={customer.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => { setSelectedCustomer(customer); setIsDetailOpen(true); }}>
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    {customer.phone && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Phone className="h-3 w-3" />{customer.phone}</p>}
                    {customer.address && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{customer.address}</p>}
                    <div className="mt-2">
                      <span className={`text-lg font-bold ${customer.totalDebt > 0 ? 'text-destructive' : 'text-success'}`}>
                        {customer.totalDebt > 0 ? `عليه: ${formatCurrency(customer.totalDebt)}` : 'لا يوجد ديون'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {customer.totalDebt > 0 && (
                      <Button variant="outline" size="sm" onClick={() => { setSelectedCustomer(customer); setIsPayOpen(true); }}>
                        <CreditCard className="h-4 w-4 ml-1" />تسديد
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف العميل</AlertDialogTitle>
                          <AlertDialogDescription>هل أنت متأكد من حذف "{customer.name}"؟</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2">
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteCustomer(customer.id)}>حذف</AlertDialogAction>
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

      {/* Payment Dialog */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>تسديد مبلغ - {selectedCustomer?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <span className="text-muted-foreground">المبلغ المستحق: </span>
              <span className="font-bold text-destructive">{formatCurrency(selectedCustomer?.totalDebt || 0)}</span>
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

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>تفاصيل العميل - {selectedCustomer?.name}</DialogTitle></DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">إجمالي الدين الحالي</p>
                <p className={`text-2xl font-bold ${selectedCustomer.totalDebt > 0 ? 'text-destructive' : 'text-success'}`}>
                  {formatCurrency(selectedCustomer.totalDebt)}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">المبيعات الآجلة</h4>
                {getCustomerSales(selectedCustomer.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد مبيعات</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getCustomerSales(selectedCustomer.id).map(sale => (
                      <div key={sale.id} className="flex justify-between p-2 bg-muted/50 rounded text-sm">
                        <span>{sale.productName} - {sale.quantity} وحدة</span>
                        <div className="text-left">
                          <span className="font-medium">{formatCurrency(sale.totalPrice)}</span>
                          <span className="text-xs text-muted-foreground block">{sale.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2">المدفوعات</h4>
                {getCustomerPayments(selectedCustomer.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد مدفوعات</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getCustomerPayments(selectedCustomer.id).map(payment => (
                      <div key={payment.id} className="flex justify-between p-2 bg-success/10 rounded text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{payment.date}
                        </div>
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
