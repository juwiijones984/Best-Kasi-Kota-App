import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Admin login
app.post('/make-server-75ce26d9/admin/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    // Get admin credentials
    const adminCreds = await kv.get('admin_credentials');
    
    // Initialize default admin if not exists
    if (!adminCreds) {
      await kv.set('admin_credentials', {
        username: 'admin',
        password: 'admin123'
      });
      
      if (username === 'admin' && password === 'admin123') {
        return c.json({ success: true, message: 'Login successful' });
      }
    } else {
      if (username === adminCreds.username && password === adminCreds.password) {
        return c.json({ success: true, message: 'Login successful' });
      }
    }
    
    return c.json({ success: false, message: 'Invalid credentials' }, 401);
  } catch (error) {
    console.log('Login error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Initialize data
app.post('/make-server-75ce26d9/init', async (c) => {
  try {
    const existingMenu = await kv.get('menu_items');
    
    if (!existingMenu) {
      // Initialize menu items based on the images
      const menuItems = [
        {
          id: '1',
          name: 'Russian Kota',
          price: 35,
          description: 'Delicious kota with Russian sausage',
          category: 'Kotas',
          ingredients: [
            { id: 'bread', name: 'Bread', quantity: 0.25 },
            { id: 'russian', name: 'Russian Sausage', quantity: 1 },
            { id: 'chips', name: 'Chips', quantity: 100 },
            { id: 'sauce', name: 'Sauce', quantity: 1 }
          ]
        },
        {
          id: '2',
          name: 'Cheese Kota',
          price: 35,
          description: 'Kota with melted cheese',
          category: 'Kotas',
          ingredients: [
            { id: 'bread', name: 'Bread', quantity: 0.25 },
            { id: 'cheese', name: 'Cheese', quantity: 2 },
            { id: 'chips', name: 'Chips', quantity: 100 },
            { id: 'sauce', name: 'Sauce', quantity: 1 }
          ]
        },
        {
          id: '3',
          name: 'Egg Kota',
          price: 35,
          description: 'Kota with fried eggs',
          category: 'Kotas',
          ingredients: [
            { id: 'bread', name: 'Bread', quantity: 0.25 },
            { id: 'eggs', name: 'Eggs', quantity: 2 },
            { id: 'chips', name: 'Chips', quantity: 100 },
            { id: 'sauce', name: 'Sauce', quantity: 1 }
          ]
        },
        {
          id: '4',
          name: 'Viennas Kota',
          price: 35,
          description: 'Kota with Vienna sausages',
          category: 'Kotas',
          ingredients: [
            { id: 'bread', name: 'Bread', quantity: 0.25 },
            { id: 'viennas', name: 'Vienna Sausages', quantity: 3 },
            { id: 'chips', name: 'Chips', quantity: 100 },
            { id: 'sauce', name: 'Sauce', quantity: 1 }
          ]
        },
        {
          id: '5',
          name: 'Polony Kota',
          price: 30,
          description: 'Classic kota with polony',
          category: 'Kotas',
          ingredients: [
            { id: 'bread', name: 'Bread', quantity: 0.25 },
            { id: 'polony', name: 'Polony', quantity: 4 },
            { id: 'chips', name: 'Chips', quantity: 100 },
            { id: 'sauce', name: 'Sauce', quantity: 1 }
          ]
        }
      ];
      
      await kv.set('menu_items', menuItems);
      
      // Initialize inventory with stock
      const inventory = [
        { id: 'bread', name: 'Bread (Loaves)', quantity: 50, unit: 'loaves', lowStockThreshold: 10 },
        { id: 'russian', name: 'Russian Sausage', quantity: 100, unit: 'pieces', lowStockThreshold: 20 },
        { id: 'cheese', name: 'Cheese Slices', quantity: 200, unit: 'slices', lowStockThreshold: 50 },
        { id: 'eggs', name: 'Eggs', quantity: 150, unit: 'pieces', lowStockThreshold: 30 },
        { id: 'viennas', name: 'Vienna Sausages', quantity: 200, unit: 'pieces', lowStockThreshold: 40 },
        { id: 'polony', name: 'Polony Slices', quantity: 300, unit: 'slices', lowStockThreshold: 60 },
        { id: 'chips', name: 'Chips', quantity: 5000, unit: 'grams', lowStockThreshold: 1000 },
        { id: 'sauce', name: 'Sauce Packets', quantity: 200, unit: 'packets', lowStockThreshold: 40 }
      ];
      
      await kv.set('inventory', inventory);
      await kv.set('orders', []);
      await kv.set('order_counter', 1000);
    }
    
    return c.json({ success: true, message: 'Data initialized' });
  } catch (error) {
    console.log('Initialization error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Get menu items
app.get('/make-server-75ce26d9/menu', async (c) => {
  try {
    const menu = await kv.get('menu_items') || [];
    return c.json({ success: true, data: menu });
  } catch (error) {
    console.log('Get menu error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Add menu item
app.post('/make-server-75ce26d9/menu', async (c) => {
  try {
    const newItem = await c.req.json();
    const menu = await kv.get('menu_items') || [];
    
    newItem.id = Date.now().toString();
    menu.push(newItem);
    
    await kv.set('menu_items', menu);
    return c.json({ success: true, data: newItem });
  } catch (error) {
    console.log('Add menu item error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Update menu item
app.put('/make-server-75ce26d9/menu/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updatedItem = await c.req.json();
    const menu = await kv.get('menu_items') || [];
    
    const index = menu.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      menu[index] = { ...menu[index], ...updatedItem };
      await kv.set('menu_items', menu);
      return c.json({ success: true, data: menu[index] });
    }
    
    return c.json({ success: false, message: 'Item not found' }, 404);
  } catch (error) {
    console.log('Update menu item error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Delete menu item
app.delete('/make-server-75ce26d9/menu/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const menu = await kv.get('menu_items') || [];
    
    const filteredMenu = menu.filter((item: any) => item.id !== id);
    await kv.set('menu_items', filteredMenu);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete menu item error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Get inventory
app.get('/make-server-75ce26d9/inventory', async (c) => {
  try {
    const inventory = await kv.get('inventory') || [];
    return c.json({ success: true, data: inventory });
  } catch (error) {
    console.log('Get inventory error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Update inventory item
app.put('/make-server-75ce26d9/inventory/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updatedItem = await c.req.json();
    const inventory = await kv.get('inventory') || [];
    
    const index = inventory.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      inventory[index] = { ...inventory[index], ...updatedItem };
      await kv.set('inventory', inventory);
      return c.json({ success: true, data: inventory[index] });
    }
    
    return c.json({ success: false, message: 'Item not found' }, 404);
  } catch (error) {
    console.log('Update inventory error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Place order
app.post('/make-server-75ce26d9/orders', async (c) => {
  try {
    const orderData = await c.req.json();
    const orders = await kv.get('orders') || [];
    const counter = await kv.get('order_counter') || 1000;
    const notifications = await kv.get('notifications') || [];
    
    const newOrder = {
      id: counter.toString(),
      ...orderData,
      status: 'pending',
      timestamp: new Date().toISOString(),
      orderNumber: `BKK${counter}`,
      deliveryMethod: orderData.deliveryMethod || 'pickup',
      paymentMethod: orderData.paymentMethod || 'cash'
    };
    
    orders.push(newOrder);
    await kv.set('orders', orders);
    await kv.set('order_counter', counter + 1);
    
    // Create notification for admin
    notifications.push({
      id: Date.now().toString() + Math.random(),
      type: 'new_order',
      title: 'New Order Received',
      message: `Order ${newOrder.orderNumber} from ${orderData.customerName} - R${orderData.total.toFixed(2)}`,
      timestamp: new Date().toISOString(),
      read: false,
      orderId: newOrder.id
    });
    await kv.set('notifications', notifications);
    
    return c.json({ success: true, data: newOrder });
  } catch (error) {
    console.log('Place order error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Get orders
app.get('/make-server-75ce26d9/orders', async (c) => {
  try {
    const orders = await kv.get('orders') || [];
    return c.json({ success: true, data: orders });
  } catch (error) {
    console.log('Get orders error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Get single order
app.get('/make-server-75ce26d9/orders/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const orders = await kv.get('orders') || [];
    const order = orders.find((o: any) => o.id === id || o.orderNumber === id);
    
    if (order) {
      return c.json({ success: true, data: order });
    }
    
    return c.json({ success: false, message: 'Order not found' }, 404);
  } catch (error) {
    console.log('Get order error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Update order status
app.put('/make-server-75ce26d9/orders/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    const orders = await kv.get('orders') || [];
    
    const index = orders.findIndex((o: any) => o.id === id);
    if (index !== -1) {
      const previousStatus = orders[index].status;
      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();
      
      // Deduct inventory when order starts preparing (not when completed)
      // This follows the guideline: "Auto deduction when order is Accepted/Prepared"
      if (status === 'preparing' && previousStatus !== 'preparing') {
        const inventory = await kv.get('inventory') || [];
        const menu = await kv.get('menu_items') || [];
        const stockLogs = await kv.get('stock_logs') || [];
        
        for (const orderItem of orders[index].items) {
          const menuItem = menu.find((m: any) => m.id === orderItem.id);
          
          if (menuItem && menuItem.ingredients) {
            for (const ingredient of menuItem.ingredients) {
              const invIndex = inventory.findIndex((inv: any) => inv.id === ingredient.id);
              if (invIndex !== -1) {
                const quantityUsed = ingredient.quantity * orderItem.quantity;
                inventory[invIndex].quantity -= quantityUsed;
                
                // Log stock change
                stockLogs.push({
                  id: Date.now().toString() + Math.random(),
                  ingredientId: ingredient.id,
                  ingredientName: ingredient.name,
                  change: -quantityUsed,
                  reason: `Order ${orders[index].orderNumber} - ${orderItem.name}`,
                  timestamp: new Date().toISOString()
                });
              }
            }
          }
        }
        
        await kv.set('inventory', inventory);
        await kv.set('stock_logs', stockLogs);
        
        // Create notification for low stock items
        const notifications = await kv.get('notifications') || [];
        for (const item of inventory) {
          if (item.quantity <= item.lowStockThreshold && item.quantity > 0) {
            notifications.push({
              id: Date.now().toString() + Math.random(),
              type: 'low_stock',
              title: 'Low Stock Alert',
              message: `${item.name} is running low (${item.quantity} ${item.unit} remaining)`,
              timestamp: new Date().toISOString(),
              read: false
            });
          } else if (item.quantity <= 0) {
            notifications.push({
              id: Date.now().toString() + Math.random(),
              type: 'out_of_stock',
              title: 'Out of Stock',
              message: `${item.name} is out of stock!`,
              timestamp: new Date().toISOString(),
              read: false
            });
          }
        }
        await kv.set('notifications', notifications);
      }
      
      await kv.set('orders', orders);
      return c.json({ success: true, data: orders[index] });
    }
    
    return c.json({ success: false, message: 'Order not found' }, 404);
  } catch (error) {
    console.log('Update order status error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Get analytics
app.get('/make-server-75ce26d9/analytics', async (c) => {
  try {
    const orders = await kv.get('orders') || [];
    const inventory = await kv.get('inventory') || [];
    
    // Calculate total sales
    const totalSales = orders.reduce((sum: number, order: any) => 
      order.status === 'completed' ? sum + order.total : sum, 0
    );
    
    // Calculate today's sales
    const today = new Date().toDateString();
    const todaySales = orders.filter((order: any) => 
      new Date(order.timestamp).toDateString() === today && order.status === 'completed'
    ).reduce((sum: number, order: any) => sum + order.total, 0);
    
    // Count orders by status
    const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
    const preparingOrders = orders.filter((o: any) => o.status === 'preparing').length;
    const completedOrders = orders.filter((o: any) => o.status === 'completed').length;
    
    // Low stock items
    const lowStock = inventory.filter((item: any) => 
      item.quantity <= item.lowStockThreshold
    );
    
    // Popular items
    const itemSales: any = {};
    orders.forEach((order: any) => {
      if (order.status === 'completed') {
        order.items.forEach((item: any) => {
          itemSales[item.name] = (itemSales[item.name] || 0) + item.quantity;
        });
      }
    });
    
    const popularItems = Object.entries(itemSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 5);
    
    // Sales by day (last 7 days)
    const salesByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const daySales = orders.filter((order: any) => 
        new Date(order.timestamp).toDateString() === dateStr && order.status === 'completed'
      ).reduce((sum: number, order: any) => sum + order.total, 0);
      
      salesByDay.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: daySales
      });
    }
    
    return c.json({
      success: true,
      data: {
        totalSales,
        todaySales,
        totalOrders: orders.length,
        pendingOrders,
        preparingOrders,
        completedOrders,
        lowStock,
        popularItems,
        salesByDay
      }
    });
  } catch (error) {
    console.log('Analytics error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Get notifications
app.get('/make-server-75ce26d9/notifications', async (c) => {
  try {
    const notifications = await kv.get('notifications') || [];
    // Return unread notifications first
    const sorted = notifications.sort((a: any, b: any) => {
      if (a.read === b.read) {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return a.read ? 1 : -1;
    });
    return c.json({ success: true, data: sorted });
  } catch (error) {
    console.log('Get notifications error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Mark notification as read
app.put('/make-server-75ce26d9/notifications/:id/read', async (c) => {
  try {
    const id = c.req.param('id');
    const notifications = await kv.get('notifications') || [];
    
    const index = notifications.findIndex((n: any) => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      await kv.set('notifications', notifications);
      return c.json({ success: true });
    }
    
    return c.json({ success: false, message: 'Notification not found' }, 404);
  } catch (error) {
    console.log('Mark notification read error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Clear all notifications
app.delete('/make-server-75ce26d9/notifications', async (c) => {
  try {
    await kv.set('notifications', []);
    return c.json({ success: true });
  } catch (error) {
    console.log('Clear notifications error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Get stock logs
app.get('/make-server-75ce26d9/stock-logs', async (c) => {
  try {
    const logs = await kv.get('stock_logs') || [];
    // Return most recent first
    const sorted = logs.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return c.json({ success: true, data: sorted.slice(0, 100) }); // Return last 100 logs
  } catch (error) {
    console.log('Get stock logs error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Add stock (manual restock)
app.post('/make-server-75ce26d9/inventory/:id/restock', async (c) => {
  try {
    const id = c.req.param('id');
    const { quantity, reason } = await c.req.json();
    const inventory = await kv.get('inventory') || [];
    const stockLogs = await kv.get('stock_logs') || [];
    
    const index = inventory.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      inventory[index].quantity += quantity;
      
      // Log restock
      stockLogs.push({
        id: Date.now().toString() + Math.random(),
        ingredientId: id,
        ingredientName: inventory[index].name,
        change: quantity,
        reason: reason || 'Manual restock',
        timestamp: new Date().toISOString()
      });
      
      await kv.set('inventory', inventory);
      await kv.set('stock_logs', stockLogs);
      
      return c.json({ success: true, data: inventory[index] });
    }
    
    return c.json({ success: false, message: 'Item not found' }, 404);
  } catch (error) {
    console.log('Restock error:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
