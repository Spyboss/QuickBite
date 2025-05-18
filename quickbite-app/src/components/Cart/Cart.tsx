import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  ButtonGroup,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

const Cart: React.FC = () => {
  const { cartItems, total, removeItemFromCart, updateItemQuantity } = useCart();

  const handleQuantityChange = (itemId: number, delta: number, currentQuantity: number) => {
    const newQuantity = Math.max(1, currentQuantity + delta);
    updateItemQuantity(itemId, newQuantity);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, pt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 }, minHeight: '100dvh', mx: 'auto' }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          mt: 2,
          mb: 4,
          fontWeight: 'bold',
          color: 'primary.main',
          position: 'relative',
          display: 'inline-block',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
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
        Shopping Cart
      </Typography>

      {cartItems.length === 0 ? (
        <Paper
          elevation={2}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: 'white'
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Your cart is empty</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Add items from the menu to get started.
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
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
          {cartItems.map((item) => (
            <Box key={item.id}>
              <Card
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 }, alignItems: { sm: 'center' } }}>
                    <Box sx={{ flex: { sm: 1 } }}>
                      <Typography variant="h6" component="div" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        LKR {item.price.toFixed(2)} each
                      </Typography>
                    </Box>
                    <Box sx={{ flex: { sm: 1 } }}>
                      <Stack
                        direction={{ xs: 'row', sm: 'row' }}
                        spacing={{ xs: 1, sm: 2 }}
                        alignItems="center"
                        justifyContent={{ xs: "space-between", sm: "flex-end" }}
                        sx={{ width: '100%', mt: { xs: 1, sm: 0 } }}
                      >
                        <ButtonGroup size="small" aria-label="quantity adjustment">
                          <Button
                            onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                            disabled={item.quantity <= 1}
                            aria-label="decrease quantity"
                          >
                            <RemoveIcon fontSize="small" />
                          </Button>
                          <Button disableRipple sx={{ cursor: 'default', fontWeight: 'bold', minWidth: '36px' }}>
                            {item.quantity}
                          </Button>
                          <Button
                            onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                            aria-label="increase quantity"
                          >
                            <AddIcon fontSize="small" />
                          </Button>
                        </ButtonGroup>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: { xs: 'auto', sm: '100px' },
                            textAlign: { xs: 'right', sm: 'right' },
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                          }}
                        >
                          LKR {(item.price * item.quantity).toFixed(2)}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => removeItemFromCart(item.id)}
                          aria-label="delete"
                          size="small"
                          sx={{ ml: { xs: 0, sm: 1 } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}

          <Box>
            <Divider sx={{ my: 2 }} />
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                backgroundColor: 'white'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                  <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Order Summary</Typography>
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>
                    Total: LKR {total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  component={RouterLink}
                  to="/checkout"
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  PROCEED TO CHECKOUT
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Cart;
