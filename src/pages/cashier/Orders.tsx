import { DashboardLayout } from '@/components/DashboardLayout';
import { CashierSidebar } from '@/components/CashierSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { Receipt } from 'lucide-react';

interface Order {
  id: string;
  cashier_name: string;
  items: any[];
  total: number;
  payment_type: string;
  amount_tendered: number;
  change: number;
  created_at: string;
}

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  return (
    <DashboardLayout sidebar={<CashierSidebar />} title="Order History">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Order History</h2>
          <p className="text-muted-foreground">View all completed transactions</p>
        </div>

        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Loading orders...</p>
        ) : orders?.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No orders yet</p>
        ) : (
          <div className="grid gap-4">
            {orders?.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={order.payment_type === 'CASH' ? 'default' : 'secondary'}>
                      {order.payment_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Items:</p>
                    <div className="space-y-1">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium">₱{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-semibold">₱{order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount Tendered:</span>
                      <span className="font-semibold">₱{order.amount_tendered.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Change:</span>
                      <span className="font-semibold">₱{order.change.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Cashier: {order.cashier_name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
