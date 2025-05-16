import React, { useEffect } from 'react'; // Added useEffect
import { Container, Typography, Paper, Box, Button, RadioGroup, FormControlLabel, Radio, FormControl, /*FormLabel,*/ List, ListItem, ListItemText, /*Divider,*/ Alert, TextField } from '@mui/material'; // Added TextField, removed unused FormLabel, Divider
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabaseClient'; // Uncommented supabase
import { useNavigate } from 'react-router-dom'; // For redirecting after order

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
  const navigate = useNavigate();

  // Effect to clear form or redirect if cart is empty and page is loaded directly
  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      // Optional: redirect to cart or menu if cart is empty
      // navigate('/cart');
    }
  }, [cartItems, orderPlaced, navigate]);


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
        // setMessage(`Order #${currentOrderId} created. Redirecting to PayHere for payment...`); // Removed message state usage
        console.log(`Order #${currentOrderId} created. Redirecting to PayHere for payment...`); // Log instead
        // Client-side PayHere Sandbox redirection
        // IMPORTANT: In a production app, the hash should be generated on the backend for security.
        // This is a simplified client-side approach for sandbox testing.
        const merchantId = import.meta.env.VITE_PAYHERE_MERCHANT_ID;
        const returnUrl = `${window.location.origin}/orders`; // Or a dedicated payment success page
        const cancelUrl = `${window.location.origin}/checkout`; // Or a dedicated payment cancel page
        const notifyUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/payhere-notify`; // Your backend notification URL

        interface PayHereFormData {
          merchant_id: string | undefined;
          return_url: string;
          cancel_url: string;
          notify_url: string;
          order_id: string;
          items: string;
          currency: string;
          amount: string;
          first_name: string;
          last_name: string;
          email: string | undefined;
          phone: string;
          address: string;
          city: string;
          country: string;
          [key: string]: string | undefined; // Index signature for other potential string properties
        }

        const payhereFormData: PayHereFormData = {
          merchant_id: merchantId,
          return_url: returnUrl,
          cancel_url: cancelUrl,
          notify_url: notifyUrl,
          order_id: currentOrderId.toString(),
          items: cartItems.map(item => item.name).join(', '),
          currency: 'LKR',
          amount: total.toFixed(2),
          first_name: user ? (user.user_metadata?.first_name || customerName || 'N/A') : customerName,
          last_name: user ? (user.user_metadata?.last_name || '') : '', // PayHere requires last_name
          email: user ? user.email : 'guest@example.com', // PayHere requires email
          phone: user ? (user.user_metadata?.phone || customerPhone || 'N/A') : customerPhone,
          address: user ? (user.user_metadata?.address || 'N/A') : 'N/A', // PayHere requires address
          city: user ? (user.user_metadata?.city || 'N/A') : 'N/A', // PayHere requires city
          country: 'Sri Lanka',
          // hash: 'GENERATED_ON_BACKEND_IN_PRODUCTION' // Hash is crucial for security
        };

        // Create a form and submit it
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://sandbox.payhere.lk/pay/checkout';

        for (const key in payhereFormData) {
          const value = payhereFormData[key];
          if (value !== undefined) { // Ensure value is not undefined before setting
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
          }
        }
        document.body.appendChild(form);
        clearCart(); // Clear cart before redirecting
        form.submit();
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

  // This confirmation screen is shown after cash payment or if returning from PayHere (though PayHere return is usually handled by a dedicated page)
  if (orderPlaced && paymentMethod === 'cash' && orderId) { // Check for orderId to ensure it's set
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>Order Confirmed!</Typography>
          <Typography variant="body1">
            Order #{orderId} placed successfully! Payment method: Cash on Pickup.
          </Typography>
          <Button component="a" href="/" variant="contained" sx={{ mt: 3 }}>
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }


  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Checkout
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Order Summary</Typography>
        <List disablePadding>
          {cartItems.map((item) => (
            <ListItem key={item.id} disableGutters divider>
              <ListItemText
                primary={item.name}
                secondary={`Quantity: ${item.quantity}`}
              />
              <Typography variant="body2">LKR {(item.price * item.quantity).toFixed(2)}</Typography>
            </ListItem>
          ))}
          <ListItem disableGutters sx={{ py: 2 }}>
            <ListItemText
              primary={<Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total</Typography>}
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>LKR {total.toFixed(2)}</Typography>
          </ListItem>
        </List>
      </Paper>

      {cartItems.length > 0 && !orderPlaced && ( // Only show payment form if order not yet placed
        <Paper elevation={2} sx={{ p: 3 }}>
          {!user && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Guest Details</Typography>
              <TextField
                label="Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                fullWidth
                margin="normal"
                required
                type="tel"
              />
            </Box>
          )}
          <Typography variant="h6" gutterBottom>Payment Method</Typography>
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <RadioGroup
              row
              aria-label="payment method"
              name="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'payhere' | 'cash')}
            >
              <FormControlLabel value="cash" control={<Radio />} label="Cash on Pickup" />
              <FormControlLabel value="payhere" control={<Radio />} label="PayHere (Online Payment)" />
            </RadioGroup>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handlePlaceOrder}
            disabled={loading || cartItems.length === 0}
            sx={{ mt: 2, py: 1.5 }}
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
