import { NavLink } from '@/components/NavLink';
import { 
  ShoppingCart, 
  Receipt, 
  ShoppingBag 
} from 'lucide-react';

export function CashierSidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Cashier</h2>
            <p className="text-xs text-muted-foreground">School Supplies POS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/cashier" icon={ShoppingCart}>
          New Order
        </NavLink>
        <NavLink to="/cashier/orders" icon={Receipt}>
          Order History
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
