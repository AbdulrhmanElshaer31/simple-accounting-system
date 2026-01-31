import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { useProducts, generateId, formatCurrency, formatDate } from '@/hooks/useAccounting';
import { Product } from '@/types/accounting';

export default function Products() {
  const [products, setProducts] = useProducts();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    buyPrice: '',
    sellPrice: '',
    stock: '',
    unit: 'قطعة',
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: '', buyPrice: '', sellPrice: '', stock: '', unit: 'قطعة' });
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        buyPrice: product.buyPrice.toString(),
        sellPrice: product.sellPrice.toString(),
        stock: product.stock.toString(),
        unit: product.unit,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.buyPrice || !formData.sellPrice) {
      return;
    }

    const productData: Product = {
      id: editingProduct?.id || generateId(),
      name: formData.name.trim(),
      buyPrice: parseFloat(formData.buyPrice),
      sellPrice: parseFloat(formData.sellPrice),
      stock: parseInt(formData.stock) || 0,
      unit: formData.unit,
      createdAt: editingProduct?.createdAt || formatDate(new Date()),
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? productData : p));
    } else {
      setProducts([...products, productData]);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const profitMargin = (buyPrice: number, sellPrice: number) => {
    if (buyPrice === 0) return 0;
    return ((sellPrice - buyPrice) / buyPrice * 100).toFixed(1);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المنتجات</h1>
          <p className="text-muted-foreground text-sm">{products.length} منتج</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المنتج</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسم المنتج"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="buyPrice">سعر الشراء</Label>
                  <Input
                    id="buyPrice"
                    type="number"
                    step="0.01"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellPrice">سعر البيع</Label>
                  <Input
                    id="sellPrice"
                    type="number"
                    step="0.01"
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="stock">الكمية بالمخزن</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">الوحدة</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="قطعة"
                  />
                </div>
              </div>
              {formData.buyPrice && formData.sellPrice && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <span className="text-muted-foreground">هامش الربح: </span>
                  <span className="font-semibold text-success">
                    {profitMargin(parseFloat(formData.buyPrice), parseFloat(formData.sellPrice))}%
                  </span>
                  <span className="text-muted-foreground mr-2">
                    ({formatCurrency(parseFloat(formData.sellPrice) - parseFloat(formData.buyPrice))})
                  </span>
                </div>
              )}
              <Button type="submit" className="w-full">
                {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pr-10"
          placeholder="بحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد منتجات</p>
            <p className="text-sm text-muted-foreground">ابدأ بإضافة منتج جديد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        الشراء: <span className="text-foreground">{formatCurrency(product.buyPrice)}</span>
                      </span>
                      <span className="text-muted-foreground">
                        البيع: <span className="text-success font-medium">{formatCurrency(product.sellPrice)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`text-sm ${product.stock < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        المخزون: <span className="font-medium">{product.stock} {product.unit}</span>
                      </span>
                      <span className="text-sm text-success">
                        ربح: {profitMargin(product.buyPrice, product.sellPrice)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف المنتج</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف "{product.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2">
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(product.id)}
                          >
                            حذف
                          </AlertDialogAction>
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
    </div>
  );
}
