import React from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, Divider, Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link as RouterLink } from 'react-router-dom'; // For navigation
import { useCart } from '../../hooks/useCart'; // Updated import path

const Cart: React.FC = () => {
  const { cartItems, total, removeItemFromCart } = useCart();

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 2, mb: 3 }}>
        Shopping Cart
      </Typography>
      {cartItems.length === 0 ? (
        <Typography>Your cart is empty. Add some items from the menu!</Typography>
      ) : (
        <>
          <List sx={{ backgroundColor: 'background.paper', borderRadius: 1, boxShadow: 1, p: 2 }}>
            {cartItems.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => removeItemFromCart(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={item.name}
                    secondary={`Quantity: ${item.quantity} - LKR ${(item.price * item.quantity).toFixed(2)}`}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 1, boxShadow: 1, textAlign: 'right' }}>
            <Typography variant="h5" component="p" sx={{ fontWeight: 'bold', mb: 2 }}>
              Total: LKR {total.toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              color="success" // Green color for checkout
              size="large"
              component={RouterLink}
              to="/checkout" // Link to the checkout page
            >
              Proceed to Checkout
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Cart;
