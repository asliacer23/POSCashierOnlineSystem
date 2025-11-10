import { DashboardLayout } from '@/components/DashboardLayout';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react';

export default function Analytics() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const [ordersResult, itemsResult] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('items').select('*').order('stock', { ascending: true }),
      ]);

      const orders = ordersResult.data || [];
      const items = itemsResult.data || [];

      // Calculate analytics
      const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;
      
      // Top selling items (count from orders)
      const itemCounts: Record<string, number> = {};
      orders.forEach(order => {
        order.items.forEach((item: any) => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
      });
      
      const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, quantity]) => ({ name, quantity }));

      // Low stock items
      const lowStockItems = items.filter(item => item.stock < 10);

      return {
        totalSales,
        totalOrders: orders.length,
        averageOrderValue,
        topItems,
        lowStockItems,
      };
    },
  });

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Analytics">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{analytics?.totalSales.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">All time revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">Orders completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{analytics?.averageOrderValue.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Top Selling Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.topItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales data yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics?.topItems.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.quantity} sold</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Package className="h-5 w-5" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">All items are well stocked</p>
              ) : (
                <div className="space-y-3">
                  {analytics?.lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-destructive font-semibold">
                        Only {item.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
