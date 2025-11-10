import { DashboardLayout } from '@/components/DashboardLayout';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [itemsResult, ordersResult] = await Promise.all([
        supabase.from('items').select('*', { count: 'exact' }),
        supabase.from('orders').select('*'),
      ]);

      const totalItems = itemsResult.count || 0;
      const totalOrders = ordersResult.data?.length || 0;
      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const lowStockItems = itemsResult.data?.filter(item => item.stock < 10).length || 0;

      return { totalItems, totalOrders, totalRevenue, lowStockItems };
    },
  });

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Admin Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Welcome back, Admin!</h2>
          <p className="text-muted-foreground">Here's what's happening with your store today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
              <p className="text-xs text-muted-foreground">Items in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">Orders completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{stats?.totalRevenue.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">Total sales</p>
            </CardContent>
          </Card>

          <Card className={stats?.lowStockItems ? 'border-destructive' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.lowStockItems || 0}</div>
              <p className="text-xs text-muted-foreground">Items need restocking</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
