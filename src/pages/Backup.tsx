import { useState } from 'react';
import { Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getAllData, restoreAllData, formatDate } from '@/hooks/useAccounting';

export default function Backup() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = () => {
    const data = getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `حديد-القصبي-نسخة-احتياطية-${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'تم تصدير النسخة الاحتياطية بنجاح' });
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          setPendingData(data);
          setShowConfirm(true);
        } catch {
          setMessage({ type: 'error', text: 'الملف غير صالح' });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const confirmRestore = () => {
    if (pendingData) {
      restoreAllData(pendingData);
      setMessage({ type: 'success', text: 'تم استعادة البيانات بنجاح! يرجى تحديث الصفحة.' });
      setPendingData(null);
      setShowConfirm(false);
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold">النسخ الاحتياطي</h1>
        <p className="text-muted-foreground text-sm">تصدير واستيراد بيانات النظام</p>
      </div>

      {message && (
        <Card className={message.type === 'success' ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'}>
          <CardContent className="p-4 flex items-center gap-3">
            {message.type === 'success' ? <CheckCircle className="h-5 w-5 text-success" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
            <span className="font-medium">{message.text}</span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />تصدير البيانات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">تحميل نسخة احتياطية من كل البيانات (المنتجات، المبيعات، المشتريات، المصروفات، العملاء، الموردين)</p>
          <Button onClick={handleExport} className="w-full"><Download className="h-4 w-4 ml-2" />تحميل النسخة الاحتياطية</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />استعادة البيانات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-warning/10 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <p className="text-sm text-warning">تحذير: استعادة البيانات ستحل محل كل البيانات الحالية!</p>
          </div>
          <Button variant="outline" onClick={handleImportClick} className="w-full"><Upload className="h-4 w-4 ml-2" />اختيار ملف واستعادة</Button>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الاستعادة</AlertDialogTitle>
            <AlertDialogDescription>هذا سيستبدل كل البيانات الحالية بالبيانات من الملف. هل أنت متأكد؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">استعادة البيانات</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
