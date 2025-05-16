import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, /*List, ListItem, ListItemText,*/ Paper, Alert, /*Button,*/ Card, CardContent, Box, IconButton } from '@mui/material'; // Removed unused List, ListItem, ListItemText, Button
import RefreshIcon from '@mui/icons-material/Refresh';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../hooks/useAuth'; // Updated import path
import { useNotification } from '../../hooks/useNotification'; // Updated import path

interface OrderItem { // Define a more specific type for order items
  id: number | string; // Menu item ID
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  user_id: string | null;
  items: OrderItem[];
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
}

const OrderStatus: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { fcmToken } = useNotification(); // Consume NotificationContext
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<{ id: number; status: string }[]>([]);

  const fetchOrders = useCallback(async () => {
    if (authLoading) { // Check authLoading here as well
        // setLoading(false); // Optionally set loading to false if auth is still loading
        return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch orders for the current user or guest
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq(user ? 'user_id' : 'user_id', user?.id || null) // Filter by user_id or null for guests
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setOrders(data || []);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred while fetching orders.');
      }
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]); // Added user and authLoading to useCallback dependencies

  useEffect(() => {
    fetchOrders(); // Call fetchOrders defined outside

    // Set up Realtime subscription for order status changes
    const orderSubscription = supabase
      .channel('order_status_changes') // Channel name
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: user ? `user_id=eq.${user.id}` : 'user_id=is.null', // Filter for relevant orders
        },
        async (payload) => { // Made callback async
          const updatedOrder = payload.new as Order;
          // Update the order in the state
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === updatedOrder.id ? updatedOrder : order
            )
          );
          // Show alert and trigger push notification if status changes to 'ready'
          if (updatedOrder.status === 'ready') {
            setStatusUpdates((prevUpdates) => [
              ...prevUpdates,
              { id: updatedOrder.id, status: updatedOrder.status },
            ]);
            console.log(`Order #${updatedOrder.id} is ready!`);

            // Trigger web push notification via backend
            if (fcmToken) { // Only send if FCM token is available
              try {
                // TODO: Replace with your backend URL if not running locally
                const backendUrl = 'http://localhost:3001';
                await fetch(`${backendUrl}/send-notification`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    token: fcmToken,
                    title: 'Order Ready!',
                    body: `Your order #${updatedOrder.id} is ready for pickup!`,
                  }),
                });
                console.log('Push notification triggered for order:', updatedOrder.id);
              } catch (notificationError) {
                console.error('Failed to trigger push notification:', notificationError);
              }
            } else {
              console.log('FCM token not available, cannot send push notification.');
            }
          }
        }
      )
      .subscribe();

    return () => {
      orderSubscription.unsubscribe();
    };
  }, [fetchOrders, user, fcmToken]); // Dependencies for the main effect

  const handleRefresh = () => {
    fetchOrders(); // Now fetchOrders is in scope
  };

  if (loading || authLoading) {
    return (
      <Container>
        <Typography>Loading orders...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">Error fetching orders: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Order Status
        </Typography>
        <IconButton onClick={handleRefresh} color="primary" aria-label="refresh orders" disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Notification Area for "Order Ready" */}
      {statusUpdates.map((update, index) => (
        update.status === 'ready' && (
          <Alert
            key={index}
            severity="success" // Green alert for "Ready"
            sx={{ mb: 2 }}
            onClose={() => {
              setStatusUpdates((prevUpdates) => prevUpdates.filter((_, i) => i !== index));
            }}
          >
            Order #{update.id} is Ready!
          </Alert>
        )
      ))}

      {orders.length === 0 && !loading && (
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No active orders found.</Typography>
        </Paper>
      )}

      {orders.map((order) => (
        <Card key={order.id} sx={{ mb: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" component="div" gutterBottom>
              Order #{order.id}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: order.status === 'ready' ? 'success.main' : 'text.primary' }}>
              Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: LKR {order.total.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Payment: {order.payment_method === 'payhere' ? 'PayHere' : 'Cash on Pickup'}
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary" sx={{mt:1}}>
              Placed on: {new Date(order.created_at).toLocaleString()}
            </Typography>
            {/* Optional: Display items in a collapsible section or a modal */}
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default OrderStatus;
