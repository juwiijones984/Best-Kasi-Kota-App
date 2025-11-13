import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Package, AlertTriangle, TrendingUp, Edit } from 'lucide-react';

export function InventoryManagement() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    quantity: '',
    lowStockThreshold: '',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-75ce26d9/inventory`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      quantity: item.quantity.toString(),
      lowStockThreshold: item.lowStockThreshold.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-75ce26d9/inventory/${editingItem.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity: parseFloat(formData.quantity),
            lowStockThreshold: parseFloat(formData.lowStockThreshold),
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchInventory();
        setIsDialogOpen(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Failed to update inventory:', error);
    }
  };

  const getStockStatus = (item: any) => {
    if (item.quantity <= 0) {
      return { label: 'Out of Stock', color: 'text-red-600 bg-red-50 border-red-200' };
    } else if (item.quantity <= item.lowStockThreshold) {
      return { label: 'Low Stock', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    } else {
      return { label: 'In Stock', color: 'text-green-600 bg-green-50 border-green-200' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Inventory Management</h2>
        <p className="text-gray-500">Monitor and manage your stock levels</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {inventory.map((item) => {
          const status = getStockStatus(item);
          const stockPercentage = Math.min(100, (item.quantity / (item.lowStockThreshold * 3)) * 100);

          return (
            <Card key={item.id} className={`border-2 ${status.color.includes('red') ? 'border-red-200' : status.color.includes('orange') ? 'border-orange-200' : 'border-gray-200'}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {item.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {item.unit}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Current Stock</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-3xl mb-2">
                    {item.quantity} <span className="text-base text-gray-500">{item.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status.color.includes('red')
                          ? 'bg-red-500'
                          : status.color.includes('orange')
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${stockPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Low stock alert: {item.lowStockThreshold} {item.unit}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
            <DialogDescription>
              Update stock levels for {editingItem?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Current Stock ({editingItem?.unit})</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Low Stock Threshold ({editingItem?.unit})</Label>
              <Input
                id="threshold"
                type="number"
                step="0.01"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
