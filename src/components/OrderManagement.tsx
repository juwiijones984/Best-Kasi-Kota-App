import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Clock, CheckCircle, XCircle, ChefHat, Receipt } from 'lucide-react';

export function OrderManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-75ce26d9/orders`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        // Sort by newest first
        const sortedOrders = data.data.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-75ce26d9/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      pending: { icon: Clock, label: 'Pending', variant: 'secondary' },
      preparing: { icon: ChefHat, label: 'Preparing', variant: 'default' },
      ready: { icon: CheckCircle, label: 'Ready', variant: 'default' },
      completed: { icon: CheckCircle, label: 'Completed', variant: 'default' },
      cancelled: { icon: XCircle, label: 'Cancelled', variant: 'destructive' },
    };

    const { icon: Icon, label, variant } = config[status] || config.pending;

    return (
      <Badge variant={variant as any} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl mb-2">Order Management</h2>
          <p className="text-gray-500">View and manage customer orders</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter orders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Receipt className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Order {order.orderNumber}
                      {getStatusBadge(order.status)}
                    </CardTitle>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(order.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl">R {order.total.toFixed(2)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Customer Details</div>
                    <div className="text-sm">
                      <div><span>Name:</span> {order.customerName}</div>
                      <div><span>Phone:</span> {order.customerPhone}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-2">Order Items</div>
                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <div>
                            <div>{item.name}</div>
                            <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                          </div>
                          <div>R {item.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.notes && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Special Instructions</div>
                      <div className="text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                        {order.notes}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                        >
                          <ChefHat className="h-4 w-4 mr-2" />
                          Start Preparing
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                    )}
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
