import { NavLink } from '@/components/NavLink';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Users, 
  ShoppingBag 
} from 'lucide-react';

export function AdminSidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">School Supplies POS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/admin" icon={LayoutDashboard}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/inventory" icon={Package}>
          Inventory
        </NavLink>
        <NavLink to="/admin/analytics" icon={BarChart3}>
          Analytics
        </NavLink>
        <NavLink to="/admin/cashiers" icon={Users}>
          Cashiers
        </NavLink>
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 POS System
        </p>
      </div>
    </div>
  );
}
