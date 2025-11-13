import { useState, useEffect } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerMenu } from './components/CustomerMenu';
import { Cart } from './components/Cart';
import { OrderTracking } from './components/OrderTracking';
import { Button } from './components/ui/button';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { ShieldCheck, Store } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

type View = 'home' | 'menu' | 'cart' | 'tracking' | 'admin-login' | 'admin-dashboard';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [cart, setCart] = useState<any[]>([]);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeData();
    checkAdminLogin();
  }, []);

  const initializeData = async () => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-75ce26d9/init`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  };

  const checkAdminLogin = () => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
      setView('admin-dashboard');
    }
  };

  const handleAddToCart = (item: any) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const handleOrderPlaced = (orderId: string) => {
    setOrderNumber(orderId);
    setCart([]);
    setView('tracking');
  };

  const handleBackToMenu = () => {
    setView('menu');
  };

  const handleAdminLogin = () => {
    setView('admin-dashboard');
  };

  const handleAdminLogout = () => {
    setView('home');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-gray-500">Initializing system...</div>
      </div>
    );
  }

  if (view === 'admin-login') {
    return (
      <>
        <AdminLogin onLogin={handleAdminLogin} />
        <Toaster />
      </>
    );
  }

  if (view === 'admin-dashboard') {
    return (
      <>
        <AdminDashboard onLogout={handleAdminLogout} />
        <Toaster />
      </>
    );
  }

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-orange-500 p-6 rounded-full">
                <Store className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl mb-4">Best Kasi Kota</h1>
            <p className="text-xl text-gray-600 mb-2">Authentic Township Flavors</p>
            <p className="text-gray-500">Order your favorite kotas online</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
            <Button
              size="lg"
              className="h-32 text-xl flex flex-col gap-2"
              onClick={() => setView('menu')}
            >
              <Store className="h-12 w-12" />
              <span>Order Now</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-32 text-xl flex flex-col gap-2"
              onClick={() => setView('admin-login')}
            >
              <ShieldCheck className="h-12 w-12" />
              <span>Admin Panel</span>
            </Button>
          </div>

          <div className="mt-12 text-center text-sm text-gray-500">
            <p>Admin login credentials: admin / admin123</p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'tracking') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl">Best Kasi Kota</h1>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <OrderTracking orderNumber={orderNumber} onBackToMenu={handleBackToMenu} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setView('home')}
            >
              <div className="bg-orange-500 p-2 rounded-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">Best Kasi Kota</h1>
                <p className="text-xs text-gray-500">Order Online</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'menu' && (
          <CustomerMenu
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onViewCart={() => setView('cart')}
          />
        )}

        {view === 'cart' && (
          <Cart
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onBackToMenu={handleBackToMenu}
            onOrderPlaced={handleOrderPlaced}
          />
        )}
      </div>
      <Toaster />
    </div>
  );
}
