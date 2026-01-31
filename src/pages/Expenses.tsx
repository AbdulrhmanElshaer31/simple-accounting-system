import { useState, useMemo } from 'react';
import { Plus, Trash2, Search, Wallet, Calendar } from 'lucide-react';
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
import { useExpenses, generateId, formatCurrency, formatDate } from '@/hooks/useAccounting';
import { Expense } from '@/types/accounting';

const expenseCategories = [
  'إيجار',
  'كهرباء',
  'ماء',
  'رواتب',
  'نقل',
  'صيانة',
  'إعلانات',
  'أخرى',
];

export default function Expenses() {
  const [expenses, setExpenses] = useExpenses();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(formatDate(new Date()));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    notes: '',
    date: formatDate(new Date()),
  });

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase()) ||
                             e.category.toLowerCase().includes(search.toLowerCase());
        const matchesDate = !dateFilter || e.date === dateFilter;
        return matchesSearch && matchesDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, search, dateFilter]);

  const todayStats = useMemo(() => {
    const todayExpenses = expenses.filter(e => e.date === formatDate(new Date()));
    return {
      total: todayExpenses.reduce((sum, e) => sum + e.amount, 0),
      count: todayExpenses.length,
    };
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      notes: '',
      date: formatDate(new Date()),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      return;
    }

    const expense: Expense = {
      id: generateId(),
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      notes: formData.notes,
    };

    setExpenses([...expenses, expense]);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المصروفات</h1>
          <p className="text-muted-foreground text-sm">{expenses.length} مصروف</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              مصروف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تسجيل مصروف</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="مثال: فاتورة الكهرباء"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>الفئة</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <Button type="submit" className="w-full">تسجيل المصروف</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">مصروفات اليوم</p>
            <p className="text-lg font-bold text-warning">{formatCurrency(todayStats.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">إجمالي المصروفات</p>
            <p className="text-lg font-bold">{formatCurrency(totalExpenses)}</p>
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
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-auto"
        />
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد مصروفات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{expense.description}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-muted rounded-full">{expense.category}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-lg font-bold text-warning">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {expense.date}
                    </div>
                    {expense.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{expense.notes}</p>
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
                        <AlertDialogTitle>حذف المصروف</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف "{expense.description}"؟
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(expense.id)}
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
