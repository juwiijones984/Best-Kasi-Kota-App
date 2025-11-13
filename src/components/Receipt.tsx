import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Home, Printer } from 'lucide-react';

interface ReceiptProps {
  order: any;
  onClose: () => void;
  onBackToMenu: () => void;
}

export function Receipt({ order, onClose, onBackToMenu }: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tracking
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={onBackToMenu}>
            <Home className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none">
        <CardHeader className="text-center border-b">
          <div className="space-y-2">
            <CardTitle className="text-3xl">Best Kasi Kota</CardTitle>
            <p className="text-sm text-gray-500">Fast Food & Kotas</p>
            <p className="text-sm text-gray-500">Thank you for your order!</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="text-center pb-4 border-b">
            <div className="text-sm text-gray-500 mb-1">Order Number</div>
            <div className="text-2xl">{order.orderNumber}</div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm text-gray-500 uppercase tracking-wide">Customer Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-gray-500">Name</div>
                <div>{order.customerName}</div>
              </div>
              <div>
                <div className="text-gray-500">Phone</div>
                <div>{order.customerPhone}</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500">Date & Time</div>
                <div>{new Date(order.timestamp).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm text-gray-500 uppercase tracking-wide border-b pb-2">Order Items</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {order.items.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">R {item.price.toFixed(2)}</td>
                    <td className="py-2 text-right">R {(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {order.notes && (
            <div className="space-y-2">
              <h3 className="text-sm text-gray-500 uppercase tracking-wide">Special Instructions</h3>
              <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                {order.notes}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t-2 border-dashed">
            <div className="flex justify-between text-lg">
              <span>Total</span>
              <span>R {order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>Please keep this receipt for your records</p>
            <p className="mt-2">Order Status: <span className="uppercase">{order.status}</span></p>
          </div>

          <div className="text-center text-xs text-gray-400 pt-4 border-t">
            <p>Powered by Best Kasi Kota Ordering System</p>
            <p>www.bestkasikota.co.za</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
