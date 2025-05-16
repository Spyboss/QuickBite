import React from 'react';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom'; // Removed BrowserRouter
import { useAuth } from './hooks/useAuth'; // Updated import path
import { supabase } from './supabaseClient'; // Import supabase for signout
import Auth from './components/Auth/Auth';
import Menu from './components/Menu/Menu';
import Cart from './components/Cart/Cart';
import Checkout from './components/Checkout/Checkout'; // Import Checkout
import OrderStatus from './components/OrderStatus/OrderStatus'; // Import OrderStatus
import AdminDashboard from './admin'; // Import AdminDashboard
import { Container, Typography, Box, AppBar, Toolbar, Button, CircularProgress, IconButton, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import FastfoodIcon from '@mui/icons-material/Fastfood'; // For logo
import { useCart } from './hooks/useCart'; // To display cart item count

function App() {
  const { user, loading } = useAuth();
  const { cartItems } = useCart(); // Get cart items for badge
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Redirect to home or login after sign out
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    // <BrowserRouter> REMOVED - It's now in main.tsx
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{ backgroundColor: 'white', color: 'primary.main', boxShadow: '0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 5px 0 rgba(0,0,0,0.06), 0 1px 10px 0 rgba(0,0,0,0.04)' }}> {/* Added sticky and subtle shadow */}
        <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="logo"
              component={RouterLink}
              to="/"
              sx={{ mr: 1 }}
            >
              <FastfoodIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              QuickBite
            </Typography>
            
            <Button color="inherit" component={RouterLink} to="/">Menu</Button>
            <Button color="inherit" component={RouterLink} to="/orders">Orders</Button>
            
            <IconButton color="inherit" component={RouterLink} to="/cart" aria-label="cart">
              <Badge badgeContent={cartItems.length} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {user && (
               <Button color="inherit" component={RouterLink} to="/admin">Admin</Button>
            )}

            {user ? (
              <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <Button color="inherit" startIcon={<LoginIcon />} component={RouterLink} to="/auth">
                Sign In
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 3, mb: 3 }}>
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderStatus />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin/*" element={user ? <AdminDashboard /> : <Auth />} />
            {/* Optional: A more specific "Not Found" page could be added here */}
            <Route path="*" element={user ? <Menu /> : <Auth />} /> {/* Default to menu if logged in, else auth */}
          </Routes>
        </Container>
      </Box>
    // </BrowserRouter> REMOVED
  );
}

export default App;
