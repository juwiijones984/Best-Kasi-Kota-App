import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Trash2, ShoppingBag, ArrowLeft, Bike, Store as StoreIcon, Banknote, CreditCard } from 'lucide-react';

interface CartProps {
  cart: any[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onBackToMenu: () => void;
  onOrderPlaced: (orderId: string) => void;
}

export function Cart({ cart, onUpdateQuantity, onRemoveItem, onBackToMenu, onOrderPlaced }: CartProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        customerName,
        customerPhone,
        notes,
        total,
        deliveryMethod,
        paymentMethod,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-75ce26d9/orders`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (data.success) {
        onOrderPlaced(data.data.orderNumber);
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch (err) {
      console.error('Place order error:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBackToMenu} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-4">Add some delicious items to get started</p>
            <Button onClick={onBackToMenu}>Browse Menu</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBackToMenu}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Menu
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Order</CardTitle>
              <CardDescription>{cart.length} item(s) in cart</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 pb-4 border-b last:border-0">
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-sm text-gray-500">R {item.price.toFixed(2)} each</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <div className="w-20 text-right">
                      R {(item.price * item.quantity).toFixed(2)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span>Total</span>
                <span>R {total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter your phone"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Delivery Method *</Label>
                  <RadioGroup value={deliveryMethod} onValueChange={(value: any) => setDeliveryMethod(value)}>
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer flex-1">
                        <StoreIcon className="h-4 w-4" />
                        Pickup
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Bike className="h-4 w-4" />
                        Delivery
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Banknote className="h-4 w-4" />
                        Cash on {deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-4 w-4" />
                        Online Payment
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests?"
                    rows={3}
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Placing Order...' : `Place Order - R ${total.toFixed(2)}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
