import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Package, ShoppingCart, TrendingUp, FileText, Wallet,
  Menu, X, BarChart3, Users, Truck, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'الرئيسية', icon: BarChart3 },
  { path: '/products', label: 'المنتجات', icon: Package },
  { path: '/sales', label: 'المبيعات', icon: TrendingUp },
  { path: '/purchases', label: 'المشتريات', icon: ShoppingCart },
  { path: '/expenses', label: 'المصروفات', icon: Wallet },
  { path: '/customers', label: 'العملاء', icon: Users },
  { path: '/suppliers', label: 'الموردين', icon: Truck },
  { path: '/reports', label: 'التقارير', icon: FileText },
  { path: '/backup', label: 'النسخ الاحتياطي', icon: Database },
];

const bottomNavItems = navItems.slice(0, 5);

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold text-primary">حديد القصبي</h1>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        {mobileMenuOpen && (
          <nav className="bg-card border-b shadow-lg">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 border-b border-border/50 transition-colors",
                  location.pathname === item.path ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}>
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col fixed right-0 top-0 h-screen w-64 bg-card border-l shadow-sm">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-primary">حديد القصبي</h1>
            <p className="text-sm text-muted-foreground mt-1">نظام إدارة المحل</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  location.pathname === item.path ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}>
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:mr-64 pt-14 lg:pt-0 min-h-screen">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
        <div className="flex justify-around">
          {bottomNavItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={cn(
                "flex flex-col items-center py-2 px-3 min-w-[60px]",
                location.pathname === item.path ? "text-primary" : "text-muted-foreground"
              )}>
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
