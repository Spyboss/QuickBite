import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Paper, Box, Button, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { supabase } from '../../supabaseClient';
import payhereService from '../../services/payhereService';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get order_id from URL query parameters
        const params = new URLSearchParams(location.search);
        const orderIdParam = params.get('order_id');

        if (!orderIdParam) {
          // Try to get from localStorage if not in URL
          const pendingOrderId = localStorage.getItem('pending_order_id');
          if (pendingOrderId) {
            setOrderId(pendingOrderId);

            // Update order status to processing
            await supabase
              .from('orders')
              .update({ status: 'processing' })
              .eq('id', pendingOrderId);

            // Clear pending payment using our service
            payhereService.clearPendingPayment();

            // Store as last completed order
            localStorage.setItem('last_order_id', pendingOrderId);
            localStorage.setItem('last_order_timestamp', Date.now().toString());
          } else {
            throw new Error('Order ID not found');
          }
        } else {
          setOrderId(orderIdParam);

          // Update order status to processing
          await supabase
            .from('orders')
            .update({ status: 'processing' })
            .eq('id', orderIdParam);

          // Clear pending payment if it matches
          const pendingOrderId = localStorage.getItem('pending_order_id');
          if (pendingOrderId === orderIdParam) {
            payhereService.clearPendingPayment();
          }

          // Store as last completed order
          localStorage.setItem('last_order_id', orderIdParam);
          localStorage.setItem('last_order_timestamp', Date.now().toString());
        }

        // Simulate a delay to show the success message
        setTimeout(() => {
          setLoading(false);
        }, 1500);

      } catch (error) {
        console.error('Error processing payment:', error);
        setError('An error occurred while processing your payment. Please contact support.');
        setLoading(false);
      }
    };

    processPayment();
  }, [location.search]);

  // Redirect to orders page after 5 seconds
  useEffect(() => {
    if (!loading && !error) {
      const timer = setTimeout(() => {
        navigate('/orders');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [loading, error, navigate]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Processing your payment...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Payment Error
          </Typography>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/orders')}
          >
            View Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" color="success.main" gutterBottom>
          Payment Successful!
        </Typography>
        <Typography variant="body1" paragraph>
          Thank you for your order. Your payment has been processed successfully.
        </Typography>
        {orderId && (
          <Typography variant="body1" paragraph>
            Order ID: <strong>{orderId}</strong>
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" paragraph>
          You will be redirected to the orders page in a few seconds...
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/orders')}
          >
            View Orders
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentSuccess;
