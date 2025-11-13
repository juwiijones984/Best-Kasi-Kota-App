import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { CheckCircle, Clock, ChefHat, Home, Receipt as ReceiptIcon } from 'lucide-react';
import { Receipt } from './Receipt';

interface OrderTrackingProps {
  orderNumber: string;
  onBackToMenu: () => void;
}

export function OrderTracking({ orderNumber, onBackToMenu }: OrderTrackingProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-75ce26d9/orders/${orderNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">Order not found</p>
            <Button onClick={onBackToMenu}>Back to Menu</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showReceipt) {
    return <Receipt order={order} onClose={() => setShowReceipt(false)} onBackToMenu={onBackToMenu} />;
  }

  const steps = [
    { id: 'pending', label: 'Order Received', icon: Clock },
    { id: 'preparing', label: 'Preparing', icon: ChefHat },
    { id: 'ready', label: 'Ready for Pickup', icon: CheckCircle },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  const statusOrder = ['pending', 'preparing', 'ready', 'completed'];
  const currentStepIndex = statusOrder.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBackToMenu}>
          <Home className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <Button variant="outline" onClick={() => setShowReceipt(true)}>
          <ReceiptIcon className="h-4 w-4 mr-2" />
          View Receipt
        </Button>
      </div>

      <Card className="border-2 border-orange-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Track Your Order</CardTitle>
          <CardDescription className="text-lg">
            Order #{order.orderNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {order.status === 'cancelled' ? (
            <div className="text-center py-8">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Order Cancelled
              </Badge>
              <p className="text-gray-500 mt-4">This order has been cancelled</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.id} className="flex items-center gap-4">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full ${
                          isCompleted
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className={`${isCurrent ? '' : 'text-gray-500'}`}>
                          {step.label}
                        </div>
                        {isCurrent && (
                          <div className="text-sm text-orange-600 mt-1">Current Status</div>
                        )}
                      </div>
                      {isCompleted && (
                        <CheckCircle className="h-6 w-6 text-orange-500" />
                      )}
                    </div>
                  );
                })}
              </div>

              {order.status === 'ready' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                  <p className="text-orange-800">
                    🎉 Your order is ready! Please come to collect it.
                  </p>
                </div>
              )}

              {order.status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-800">
                    ✅ Thank you for your order! Enjoy your meal!
                  </p>
                </div>
              )}
            </>
          )}

          <div className="pt-6 border-t space-y-3">
            <h3 className="text-lg">Order Summary</h3>
            <div className="space-y-2">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>R {item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span>Total</span>
              <span>R {order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer:</span>
              <span>{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone:</span>
              <span>{order.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Order Time:</span>
              <span>{new Date(order.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
