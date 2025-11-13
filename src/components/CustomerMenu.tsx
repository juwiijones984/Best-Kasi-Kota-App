import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ShoppingCart, Plus, Minus, Search } from 'lucide-react';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CustomerMenuProps {
  cart: any[];
  onAddToCart: (item: any) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onViewCart: () => void;
}

export function CustomerMenu({ cart, onAddToCart, onUpdateQuantity, onViewCart }: CustomerMenuProps) {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-75ce26d9/menu`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setMenuItems(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemQuantityInCart = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item: any) => {
    onAddToCart(item);
  };

  const handleIncrement = (itemId: string) => {
    const currentQty = getItemQuantityInCart(itemId);
    onUpdateQuantity(itemId, currentQty + 1);
  };

  const handleDecrement = (itemId: string) => {
    const currentQty = getItemQuantityInCart(itemId);
    if (currentQty > 0) {
      onUpdateQuantity(itemId, currentQty - 1);
    }
  };

  const filteredMenu = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onViewCart} className="relative">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Cart
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0">
              {totalItems}
            </Badge>
          )}
        </Button>
      </div>

      {filteredMenu.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500">No items found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMenu.map((item) => {
            const quantityInCart = getItemQuantityInCart(item.id);

            return (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 relative overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1673534409216-91c3175b9b2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW5kd2ljaCUyMGZvb2R8ZW58MXx8fHwxNzYyNTg2MDQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-white text-orange-600">
                      R {item.price.toFixed(2)}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {quantityInCart === 0 ? (
                    <Button
                      className="w-full"
                      onClick={() => handleAddToCart(item)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDecrement(item.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-lg px-4">{quantityInCart}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleIncrement(item.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
