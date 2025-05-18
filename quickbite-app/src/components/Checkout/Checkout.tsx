import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Button, RadioGroup, FormControlLabel, Radio, FormControl, List, ListItem, ListItemText, Alert, TextField, useTheme, useMediaQuery } from '@mui/material';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import payhereService, { PayHerePaymentData } from '../../services/payhereService';

const Checkout: React.FC = () => {
  const { cartItems, total, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = React.useState<'payhere' | 'cash'>('cash');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  // const [message, setMessage] = React.useState<string | null>(null); // Removed message state
  const [orderPlaced, setOrderPlaced] = React.useState<boolean>(false);
  const [orderId, setOrderId] = React.useState<number | string | null>(null); // Can be string from Supabase
  const [customerName, setCustomerName] = React.useState<string>('');
  const [customerPhone, setCustomerPhone] = React.useState<string>('');
  const [notifyUrl, setNotifyUrl] = useState<string>('');
  const navigate = useNavigate();

  // Responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(576));

  // Effect to clear form or redirect if cart is empty and page is loaded directly
  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      // Optional: redirect to cart or menu if cart is empty
      // navigate('/cart');
    }
  }, [cartItems, orderPlaced, navigate]);

  // Set up the notify URL for PayHere
  useEffect(() => {
    // Determine environment and set appropriate notify URL
    const isDevelopment = import.meta.env.MODE === 'development';
    const paymentNotifyUrl = isDevelopment
      ? 'http://localhost:3001/payhere-notify'
      : 'https://quickbite-backend.vercel.app/payhere-notify';

    setNotifyUrl(paymentNotifyUrl);
    console.log('PayHere notify URL set to:', paymentNotifyUrl);
  }, []);


  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    // setMessage(null); // Removed message state usage
    // setOrderPlaced(false); // Don't reset orderPlaced here, only on new attempt
    // setOrderId(null);

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      setLoading(false);
      return;
    }

    if (!user && (!customerName || !customerPhone)) {
      setError('Please enter your name and phone number for guest checkout.');
      setLoading(false);
      return;
    }

    const orderData = {
      user_id: user?.id || null,
      items: cartItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })), // Ensure items are in a good format
      total: total,
      status: paymentMethod === 'payhere' ? 'pending_payment' : 'pending', // 'pending_payment' for PayHere until webhook confirms
      payment_method: paymentMethod,
      customer_name: user ? (user.user_metadata?.full_name || user.email) : customerName,
      customer_phone: user ? (user.user_metadata?.phone) : customerPhone, // Assuming phone might be in user_metadata
    };

    try {
      const { data: insertedOrderData, error: insertError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single(); // Assuming you want the single inserted order back

      if (insertError) {
        throw insertError;
      }

      if (!insertedOrderData) {
        throw new Error('Failed to place order, no data returned.');
      }

      const currentOrderId = insertedOrderData.id;
      setOrderId(currentOrderId);

      if (paymentMethod === 'payhere') {
        try {
          console.log(`Order #${currentOrderId} created. Redirecting to PayHere for payment...`);

          // Check if we're in development mode
          const isDevelopment = import.meta.env.MODE === 'development';

          // For testing PayHere in development mode, we'll skip the simulation
          // Uncomment the following block if you want to simulate payments instead of using PayHere sandbox
          /*
          if (isDevelopment) {
            // In development mode, simulate a successful payment without actually going to PayHere
            console.log('Development mode detected. Simulating PayHere payment...');

            // Update the order status to 'processing' to simulate a successful payment
            await supabase
              .from('orders')
              .update({ status: 'processing' })
              .eq('id', currentOrderId);

            // Clear cart
            clearCart();

            // Show success message
            setOrderPlaced(true);
            setError(null);

            // Store the order ID in localStorage for the Orders page to display
            localStorage.setItem('last_order_id', currentOrderId.toString());
            localStorage.setItem('last_order_timestamp', Date.now().toString());

            // Simulate a payment processing delay
            setTimeout(() => {
              // Update the order status to 'confirmed' after a delay
              supabase
                .from('orders')
                .update({ status: 'confirmed' })
                .eq('id', currentOrderId)
                .then(() => {
                  console.log(`Order #${currentOrderId} status updated to 'confirmed'`);
                })
                .catch(error => {
                  console.error('Error updating order status:', error);
                });
            }, 5000); // 5 second delay

            return; // Exit early - don't proceed with actual PayHere integration
          }
          */

          console.log('Proceeding with actual PayHere sandbox integration...');

          // Prepare PayHere payment data
          const returnUrl = `${window.location.origin}/payment-success?order_id=${currentOrderId}`;
          const cancelUrl = `${window.location.origin}/payment-cancel?order_id=${currentOrderId}`;
          // Use the notify URL from state (which might be using ngrok in development)
          const paymentNotifyUrl = notifyUrl || (isDevelopment
            ? `http://localhost:3001/payhere-notify`
            : `https://quickbite-backend.vercel.app/payhere-notify`);

          console.log('Using PayHere notify URL:', paymentNotifyUrl);

          // Create payment data object for PayHere
          const payherePaymentData: PayHerePaymentData = {
            merchant_id: payhereService.MERCHANT_ID,
            return_url: returnUrl,
            cancel_url: cancelUrl,
            notify_url: paymentNotifyUrl,
            order_id: currentOrderId.toString(),
            items: cartItems.map(item => item.name).join(', '),
            currency: 'LKR',
            amount: total.toFixed(2),
            first_name: customerName || 'Customer',
            last_name: 'User',
            email: user?.email || 'guest@example.com',
            phone: customerPhone || '0771234567',
            address: 'N/A',
            city: 'Colombo',
            country: 'Sri Lanka',
            // sandbox parameter will be added automatically in development mode
          };

          // Initiate payment using our service
          await payhereService.initiatePayment(payherePaymentData);

          // Clear cart
          clearCart();

          // Show success message
          setOrderPlaced(true);
          setError(null);

          // For testing purposes only - should be removed in production
          if (isDevelopment) {
            // Simulate a successful payment after 10 seconds if the user hasn't returned from PayHere
            setTimeout(() => {
              const pendingOrderId = localStorage.getItem('pending_order_id');
              if (pendingOrderId === currentOrderId.toString()) {
                console.log(`Simulating successful payment for order #${currentOrderId} after timeout`);

                // Update the order status to 'processing'
                supabase
                  .from('orders')
                  .update({ status: 'processing' })
                  .eq('id', currentOrderId)
                  .then(() => {
                    console.log(`Order #${currentOrderId} status updated to 'processing'`);
                    payhereService.clearPendingPayment();

                    // Store as last completed order
                    localStorage.setItem('last_order_id', currentOrderId.toString());
                    localStorage.setItem('last_order_timestamp', Date.now().toString());
                  })
                  .then(undefined, (error: Error) => {
                    console.error('Error updating order status:', error);
                  });
              }
            }, 10000); // 10 second timeout
          }

        } catch (paymentError) {
          console.error('PayHere payment error:', paymentError);
          setError('Payment processing error. Please try again or use Cash on Pickup.');
          setLoading(false);

          // Update the order status to indicate payment issue
          await supabase
            .from('orders')
            .update({ status: 'payment_failed' })
            .eq('id', currentOrderId);
        }
        // setLoading(false) will not be reached if submit is successful

      } else { // Cash on Pickup
        setOrderPlaced(true);
        // setMessage(`Order #${currentOrderId} placed successfully! Payment: Cash on Pickup.`); // Removed message state usage
        clearCart();
        setLoading(false);
      }

    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred while placing the order.');
      }
      setLoading(false);
    }
  };

  // This confirmation screen is shown after placing an order (cash or PayHere)
  if (orderPlaced && orderId) { // Check for orderId to ensure it's set
    return (
      <Container maxWidth="sm" sx={{ py: 4, pt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 }, minHeight: '100dvh', textAlign: 'center' }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            mb: 4,
            fontWeight: 'bold',
            color: 'primary.main',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            position: 'relative',
            display: 'inline-block',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '60%',
              height: '3px',
              bottom: '-8px',
              left: '20%',
              backgroundColor: 'primary.main',
              borderRadius: '2px'
            }
          }}
        >
          Order Confirmed
        </Typography>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ py: 2 }}>
            <Typography variant="h5" gutterBottom color="success.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Thank You!
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              Order #{orderId} placed successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
              Payment method: {paymentMethod === 'payhere' ? 'PayHere (Online Payment)' : 'Cash on Pickup'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
              You can track your order status in the Orders section.
            </Typography>
            {paymentMethod === 'payhere' && (
              <>
                {import.meta.env.MODE === 'development' ? (
                  // Development mode message
                  <Typography variant="body2" color="success.main" sx={{ mb: 3, fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 'medium' }}>
                    <strong>Development Mode:</strong> Payment has been simulated successfully. Your order is being processed.
                  </Typography>
                ) : (
                  // Production mode messages
                  <>
                    <Typography variant="body2" color="info.main" sx={{ mb: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 'medium' }}>
                      A new window has opened for PayHere payment. After completing payment, please return to this page and check your order status.
                    </Typography>
                    <Typography variant="body2" color="warning.main" sx={{ mb: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 'medium' }}>
                      Note: If the PayHere window did not open, please check your popup blocker settings.
                    </Typography>
                    <Typography variant="body2" color="info.main" sx={{ mb: 3, fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 'medium' }}>
                      <strong>Important:</strong> Keep the payment window open until the transaction is complete. Do not close it manually.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => {
                        const orderId = localStorage.getItem('pending_order_id');
                        if (orderId) {
                          // Get the order details from Supabase
                          supabase
                            .from('orders')
                            .select('*')
                            .eq('id', orderId)
                            .single()
                            .then(({ data, error }) => {
                              if (error || !data) {
                                console.error('Error fetching order:', error);
                                alert('Could not retrieve order information. Please try again.');
                                return;
                              }

                              // Create payment data
                              const paymentData: PayHerePaymentData = {
                                merchant_id: payhereService.MERCHANT_ID,
                                return_url: `${window.location.origin}/payment-success?order_id=${orderId}`,
                                cancel_url: `${window.location.origin}/payment-cancel?order_id=${orderId}`,
                                notify_url: notifyUrl || (import.meta.env.MODE === 'development'
                                  ? `http://localhost:3001/payhere-notify`
                                  : `https://quickbite-backend.vercel.app/payhere-notify`),
                                order_id: orderId,
                                items: data.items.map((item: any) => item.name).join(', '),
                                currency: 'LKR',
                                amount: data.total.toFixed(2),
                                first_name: data.customer_name?.split(' ')[0] || 'Customer',
                                last_name: data.customer_name?.split(' ').slice(1).join(' ') || 'User',
                                email: 'guest@example.com',
                                phone: data.customer_phone || '0000000000',
                                address: 'N/A',
                                city: 'Colombo',
                                country: 'Sri Lanka',
                                // sandbox parameter will be added automatically in development mode
                              };

                              // Initiate payment
                              payhereService.initiatePayment(paymentData)
                                .then(undefined, (error: Error) => {
                                  console.error('Error reopening PayHere window:', error);
                                  alert('Error reopening PayHere window. Please try again.');
                                });
                            });
                        } else {
                          alert('No pending payment found.');
                        }
                      }}
                      sx={{ mb: 3 }}
                    >
                      Reopen PayHere Window
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      onClick={() => {
                        // Manually mark the payment as successful
                        const orderId = localStorage.getItem('pending_order_id');
                        if (orderId) {
                          supabase
                            .from('orders')
                            .update({ status: 'processing' })
                            .eq('id', orderId)
                            .then(() => {
                              console.log(`Order #${orderId} status manually updated to 'processing'`);
                              localStorage.removeItem('pending_order_id');
                              localStorage.removeItem('pending_order_timestamp');
                              localStorage.setItem('last_order_id', orderId);
                              localStorage.setItem('last_order_timestamp', Date.now().toString());
                              alert('Payment marked as successful!');
                            })
                            .then(undefined, (error: Error) => {
                              console.error('Error updating order status:', error);
                              alert('Error marking payment as successful. Please try again.');
                            });
                        }
                      }}
                      sx={{ mb: 3, ml: 2 }}
                    >
                      Mark as Paid
                    </Button>
                  </>
                )}
              </>
            )}
          </Box>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            gap: { xs: 1.5, sm: 2 }
          }}>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              sx={{
                py: { xs: 1, sm: 1.2 },
                px: 3,
                width: { xs: '100%', sm: 'auto' },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                }
              }}
            >
              Continue Shopping
            </Button>
            <Button
              component={RouterLink}
              to="/orders"
              variant="outlined"
              sx={{
                py: { xs: 1, sm: 1.2 },
                px: 3,
                width: { xs: '100%', sm: 'auto' },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              View Orders
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }


  return (
    <Container maxWidth="md" sx={{ py: 4, pt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 }, minHeight: '100dvh' }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          mb: 3,
          fontWeight: 'bold',
          color: 'primary.main',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          position: 'relative',
          display: 'inline-block',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '60%',
            height: '3px',
            bottom: '-8px',
            left: '20%',
            backgroundColor: 'primary.main',
            borderRadius: '2px'
          }
        }}
      >
        Checkout
      </Typography>

      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Order Summary</Typography>
        <List disablePadding>
          {cartItems.map((item) => (
            <ListItem key={item.id} disableGutters divider sx={{ py: { xs: 1.5, sm: 2 } }}>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 'medium', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {item.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Quantity: {item.quantity}
                  </Typography>
                }
              />
              <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                LKR {(item.price * item.quantity).toFixed(2)}
              </Typography>
            </ListItem>
          ))}
          <ListItem disableGutters sx={{ py: { xs: 2, sm: 2.5 } }}>
            <ListItemText
              primary={<Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Total</Typography>}
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              LKR {total.toFixed(2)}
            </Typography>
          </ListItem>
        </List>
      </Paper>

      {cartItems.length > 0 && !orderPlaced && ( // Only show payment form if order not yet placed
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
          {!user && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Guest Details</Typography>
              <TextField
                label="Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                fullWidth
                margin="normal"
                required
                size={isMobile ? "small" : "medium"}
                sx={{ mb: { xs: 1.5, sm: 2 } }}
              />
              <TextField
                label="Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                fullWidth
                margin="normal"
                required
                type="tel"
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          )}
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Payment Method</Typography>
          <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
            <RadioGroup
              row={!isMobile}
              aria-label="payment method"
              name="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'payhere' | 'cash')}
            >
              <FormControlLabel
                value="cash"
                control={<Radio size={isMobile ? "small" : "medium"} />}
                label={<Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Cash on Pickup</Typography>}
                sx={{ mb: { xs: 1, sm: 0 } }}
              />
              <FormControlLabel
                value="payhere"
                control={<Radio size={isMobile ? "small" : "medium"} />}
                label={<Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>PayHere (Online Payment)</Typography>}
              />
            </RadioGroup>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handlePlaceOrder}
            disabled={loading || cartItems.length === 0}
            sx={{
              mt: 3,
              py: { xs: 1.2, sm: 1.5 },
              borderRadius: 2,
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '&:hover': {
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {loading ? 'Placing Order...' : `Place Order & Pay ${paymentMethod === 'cash' ? 'with Cash' : 'via PayHere'}`}
          </Button>
        </Paper>
      )}

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
      {/* Message state removed, so this line is no longer needed
      {message && !orderPlaced && <Alert severity="info" sx={{ mt: 3 }}>{message}</Alert>} */}

    </Container>
  );
};

export default Checkout;
