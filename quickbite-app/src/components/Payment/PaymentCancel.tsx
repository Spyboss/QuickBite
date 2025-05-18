import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Paper, Box, Button, CircularProgress } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { supabase } from '../../supabaseClient';
import payhereService from '../../services/payhereService';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCancel = async () => {
      try {
        // Get order_id from URL query parameters
        const params = new URLSearchParams(location.search);
        const orderIdParam = params.get('order_id');

        if (!orderIdParam) {
          // Try to get from localStorage if not in URL
          const pendingOrderId = localStorage.getItem('pending_order_id');
          if (pendingOrderId) {
            setOrderId(pendingOrderId);

            // Update order status to cancelled
            await supabase
              .from('orders')
              .update({ status: 'cancelled' })
              .eq('id', pendingOrderId);

            // Clear pending payment using our service
            payhereService.clearPendingPayment();
          } else {
            throw new Error('Order ID not found');
          }
        } else {
          setOrderId(orderIdParam);

          // Update order status to cancelled
          await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderIdParam);

          // Clear pending payment if it matches
          const pendingOrderId = localStorage.getItem('pending_order_id');
          if (pendingOrderId === orderIdParam) {
            payhereService.clearPendingPayment();
          }
        }

        // Simulate a delay to show the cancel message
        setTimeout(() => {
          setLoading(false);
        }, 1000);

      } catch (error) {
        console.error('Error processing payment cancellation:', error);
        setError('An error occurred while processing your payment cancellation. Please contact support.');
        setLoading(false);
      }
    };

    processCancel();
  }, [location.search]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Processing your cancellation...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error
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
        <CancelIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" color="error" gutterBottom>
          Payment Cancelled
        </Typography>
        <Typography variant="body1" paragraph>
          Your payment has been cancelled. No charges have been made.
        </Typography>
        {orderId && (
          <Typography variant="body1" paragraph>
            Order ID: <strong>{orderId}</strong>
          </Typography>
        )}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/checkout')}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
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

export default PaymentCancel;
