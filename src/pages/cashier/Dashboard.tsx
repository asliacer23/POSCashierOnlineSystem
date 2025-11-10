import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CashierSidebar } from '@/components/CashierSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Item {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface CartItem extends Item {
  quantity: number;
}

export default function CashierDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [amountTendered, setAmountTendered] = useState('');
  const [paymentType, setPaymentType] = useState<'CASH' | 'GCASH'>('CASH');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Item[];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      items: any[];
      total: number;
      payment_type: string;
      amount_tendered: number;
      change: number;
    }) => {
      const { error: orderError } = await supabase.from('orders').insert([{
        cashier_id: user?.id,
        cashier_name: profile?.username || user?.email || 'Unknown',
        ...orderData,
      }]);

      if (orderError) throw orderError;

      // Update stock for each item
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('items')
          .update({ stock: item.stock - item.quantity })
          .eq('id', item.id);
        
        if (stockError) throw stockError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast({ title: 'Order completed successfully!' });
      setCart([]);
      setShowCheckout(false);
      setAmountTendered('');
    },
    onError: (error: any) => {
      toast({
        title: 'Order failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const categories = ['all', ...new Set(items?.map(item => item.category) || [])];
  
  const filteredItems = items?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.stock > 0;
  });

  const addToCart = (item: Item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      if (existing.quantity >= item.stock) {
        toast({ title: 'Cannot add more', description: 'Not enough stock', variant: 'destructive' });
        return;
      }
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return item;
        if (newQuantity > item.stock) {
          toast({ title: 'Cannot add more', description: 'Not enough stock', variant: 'destructive' });
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tendered = parseFloat(amountTendered) || 0;
  const change = tendered - total;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ title: 'Cart is empty', variant: 'destructive' });
      return;
    }
    setShowCheckout(true);
  };

  const handleCompleteOrder = () => {
    if (tendered < total) {
      toast({ title: 'Insufficient payment', variant: 'destructive' });
      return;
    }

    const orderData = {
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total,
      payment_type: paymentType,
      amount_tendered: tendered,
      change: change,
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <DashboardLayout sidebar={<CashierSidebar />} title="New Order">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {filteredItems?.map(item => (
              <Card key={item.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => addToCart(item)}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold">₱{item.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Stock: {item.stock}</p>
                    </div>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Current Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between gap-2 pb-3 border-b">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">₱{item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>₱{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>Enter payment details to complete the order</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentType} onValueChange={(v: 'CASH' | 'GCASH') => setPaymentType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="GCASH">GCash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount Tendered (₱)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold">₱{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Tendered:</span>
                <span className="font-semibold">₱{tendered.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-bold">Change:</span>
                <span className={`font-bold ${change < 0 ? 'text-destructive' : 'text-primary'}`}>
                  ₱{change.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteOrder} disabled={change < 0 || createOrderMutation.isPending}>
              {createOrderMutation.isPending ? 'Processing...' : 'Complete Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
