import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Paper, Alert, Card, CardContent, Box, IconButton, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';

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
    if (authLoading) {
        return;
    }
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // If user is logged in, filter by user_id
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        // For guest users, show all orders with null user_id
        // This is a simplified approach - in production, you might want to use
        // a session ID or other identifier stored in localStorage
        query = query.is('user_id', null);
      }

      const { data, error } = await query;

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
  }, [user, authLoading]);

  useEffect(() => {
    fetchOrders(); // Call fetchOrders defined outside

    // Set up Realtime subscription for order status changes
    const orderSubscription = supabase
      .channel('order_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: user ? `user_id=eq.${user.id}` : 'user_id=is.null',
        },
        async (payload) => {
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
            if (fcmToken) {
              try {
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
  }, [fetchOrders, user, fcmToken]);

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

      {(
        <>
          {statusUpdates.map((update, index) => (
            update.status === 'ready' && (
              <Alert
                key={index}
                severity="success"
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
            <Paper
              elevation={2}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                backgroundColor: 'white',
                maxWidth: '600px',
                mx: 'auto',
                mt: 4
              }}
            >
              <Typography variant="h6" gutterBottom>No Orders Found</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                You don't have any orders yet. Start by adding items to your cart!
              </Typography>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/"
                sx={{ mt: 2 }}
              >
                Browse Menu
              </Button>
            </Paper>
          )}

          {orders.map((order) => (
            <Card
              key={order.id}
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" component="div" gutterBottom>
                  Order #{order.id}
                </Typography>
                <Typography variant="body1" sx={{
                  fontWeight: 'bold',
                  color: order.status === 'ready' ? 'success.main' :
                         order.status === 'preparing' ? 'info.main' :
                         order.status === 'pending' ? 'warning.main' :
                         order.status === 'delivered' ? 'success.dark' :
                         'text.primary'
                }}>
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

                {/* Order Items Section */}
                {order.items && order.items.length > 0 && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Order Items:
                    </Typography>
                    {order.items.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          {item.quantity}x {item.name}
                        </Typography>
                        <Typography variant="body2">
                          LKR {(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Container>
  );
};

export default OrderStatus;
