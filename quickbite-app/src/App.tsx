import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth'; // Updated import path
import { supabase } from './supabaseClient'; // Import supabase for signout
import Auth from './components/Auth/Auth';
import Menu from './components/Menu/Menu';
import Cart from './components/Cart/Cart';
import Checkout from './components/Checkout/Checkout'; // Import Checkout
import OrderStatus from './components/OrderStatus/OrderStatus'; // Import OrderStatus
import AdminDashboard from './admin'; // Import AdminDashboard
import PaymentSuccess from './components/Payment/PaymentSuccess'; // Import PaymentSuccess
import PaymentCancel from './components/Payment/PaymentCancel'; // Import PaymentCancel
import { Container, Typography, Box, AppBar, Toolbar, Button, CircularProgress, IconButton, Badge, Alert, Snackbar } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import FastfoodIcon from '@mui/icons-material/Fastfood'; // For logo
import { useCart } from './hooks/useCart'; // To display cart item count
import ListAltIcon from '@mui/icons-material/ListAlt'; // Import for Orders icon
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // Import for Admin icon
import { useTheme, useMediaQuery } from '@mui/material';
import { useState, useEffect } from 'react';


const useStyles = () => {
  const theme = useTheme();
  return {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
  };
};

function App() {
  const { user, loading } = useAuth();
  const { cartItems } = useCart(); // Get cart items for badge
  const navigate = useNavigate();
  const { isMobile } = useStyles();
  const [, setNotificationError] = useState(false); // Used in useEffect
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  // Check for notification support and service worker errors
  useEffect(() => {
    // Only show the banner in production
    if (import.meta.env.MODE === 'production') {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        setNotificationError(true);
        setShowNotificationBanner(true);
      } else if (Notification.permission === 'denied') {
        setNotificationError(true);
        setShowNotificationBanner(true);
      }

      // Check for service worker errors
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
          .then(registrations => {
            const hasFCMServiceWorker = registrations.some(reg =>
              reg.scope.includes('firebase-cloud-messaging-push-scope') ||
              (reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js'))
            );

            if (!hasFCMServiceWorker) {
              setNotificationError(true);
              setShowNotificationBanner(true);
            }
          })
          .catch(() => {
            // If there's an error checking, assume there's an issue
            setNotificationError(true);
            setShowNotificationBanner(true);
          });
      }
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Redirect to home or login after sign out
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', maxWidth: 'none !important' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', width: '100%', maxWidth: 'none !important', overflowX: 'hidden' }}>
      {/* Notification Banner */}
      <Snackbar
        open={showNotificationBanner}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: { xs: 56, sm: 64 } }} // Position below AppBar
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => setShowNotificationBanner(false)}
          sx={{ width: '100%' }}
        >
          Notifications are currently disabled. Some features may not work properly.
        </Alert>
      </Snackbar>
      {/* Enhanced AppBar with improved responsiveness */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: 'white',
          color: 'primary.main',
          boxShadow: '0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 5px 0 rgba(0,0,0,0.06), 0 1px 10px 0 rgba(0,0,0,0.04)',
          top: 0,
          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{
            flexWrap: 'nowrap',
            justifyContent: 'space-between',
            padding: { xs: 1, sm: 2 },
            gap: { xs: 0.5, sm: 2 } // Reduced gap on mobile
          }}
        >
          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
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
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '1.25rem', sm: '1.5rem' } // Responsive font size
              }}
            >
              QuickBite
            </Typography>
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 1 },
            ml: { xs: 1, sm: 2 }
          }}>
            {/* Menu Button/Icon */}
            {isMobile ? (
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/"
                aria-label="menu"
                size="small"
                sx={{ p: { xs: 0.5, sm: 1 } }}
              >
                <FastfoodIcon fontSize="small" />
              </IconButton>
            ) : (
              <Button
                color="inherit"
                component={RouterLink}
                to="/"
                sx={{
                  fontWeight: 'medium',
                  minWidth: 'auto',
                  px: { xs: 1, sm: 2 },
                }}
              >
                Menu
              </Button>
            )}

            {/* Orders Button/Icon */}
            {isMobile ? (
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/orders"
                aria-label="orders"
                size="small"
                sx={{ p: { xs: 0.5, sm: 1 } }}
              >
                <ListAltIcon fontSize="small" />
              </IconButton>
            ) : (
              <Button
                color="inherit"
                component={RouterLink}
                to="/orders"
                sx={{
                  fontWeight: 'medium',
                  minWidth: 'auto',
                  px: { xs: 1, sm: 2 },
                }}
              >
                Orders
              </Button>
            )}

            {/* Cart Button */}
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/cart"
              aria-label="cart"
              size={isMobile ? "small" : "medium"}
              sx={{ p: { xs: 0.5, sm: 1 } }}
            >
              <Badge
                badgeContent={cartItems.length}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.7rem',
                    height: '18px',
                    minWidth: '18px',
                    padding: '0 4px',
                  },
                }}
              >
                <ShoppingCartIcon fontSize={isMobile ? "small" : "medium"} />
              </Badge>
            </IconButton>

            {/* Admin Button/Icon */}
            {user && (
              <>
                {isMobile ? (
                  <IconButton
                    color="inherit"
                    component={RouterLink}
                    to="/admin"
                    aria-label="admin"
                    size="small"
                    sx={{ p: { xs: 0.5, sm: 1 } }}
                  >
                    <AdminPanelSettingsIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin"
                    sx={{
                      fontWeight: 'medium',
                      minWidth: 'auto',
                      px: { xs: 1, sm: 2 },
                    }}
                  >
                    Admin
                  </Button>
                )}
              </>
            )}

            {/* Sign Out/Sign In Button */}
            {user ? (
              isMobile ? (
                <IconButton
                  color="inherit"
                  onClick={handleSignOut}
                  aria-label="sign out"
                  size="small"
                  sx={{ p: { xs: 0.5, sm: 1 } }}
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              ) : (
                <Button
                  color="inherit"
                  startIcon={<LogoutIcon />}
                  onClick={handleSignOut}
                  sx={{
                    fontWeight: 'medium',
                    minWidth: 'auto',
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Sign Out
                </Button>
              )
            ) : (
              isMobile ? (
                <IconButton
                  color="inherit"
                  component={RouterLink}
                  to="/auth"
                  aria-label="sign in"
                  size="small"
                  sx={{ p: { xs: 0.5, sm: 1 } }}
                >
                  <LoginIcon fontSize="small" />
                </IconButton>
              ) : (
                <Button
                  color="inherit"
                  startIcon={<LoginIcon />}
                  component={RouterLink}
                  to="/auth"
                  sx={{
                    fontWeight: 'medium',
                    minWidth: 'auto',
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Sign In
                </Button>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{
        flexGrow: 1,
        width: '100%',
        maxWidth: 'none !important',
        pt: { xs: 2, sm: 3 },
        pb: { xs: 4, sm: 5 },
        px: { xs: 0, sm: 0, md: 0 } // Removed horizontal padding to let components handle it
      }}>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderStatus />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          <Route path="/admin/*" element={user ? <AdminDashboard /> : <Auth />} />
          <Route path="*" element={user ? <Menu /> : <Auth />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
