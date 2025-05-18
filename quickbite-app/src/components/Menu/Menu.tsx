import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useCart } from '../../hooks/useCart';
import {
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Box,
  Chip,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import BrunchDiningIcon from '@mui/icons-material/BrunchDining';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category?: string;
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { addItemToCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(576));
  const isTablet = useMediaQuery(theme.breakpoints.between(576, 992));

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Items', icon: <FastfoodIcon /> },
    { id: 'burgers', name: 'Burgers', icon: <BrunchDiningIcon /> },
    { id: 'drinks', name: 'Drinks', icon: <LocalDrinkIcon /> },
    { id: 'sides', name: 'Sides', icon: <LocalPizzaIcon /> },
  ];

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        console.log('Fetching menu items from Supabase...');
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

        // Log the first few characters of the key for debugging (never log the full key)
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        console.log('Anon Key (first 10 chars):', anonKey.substring(0, 10) + '...');

        const { data, error } = await supabase.from('menu').select('*');

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Menu data received:', data);
        const items = data || [];
        setMenuItems(items);
        setFilteredItems(items);
      } catch (e: unknown) {
        console.error('Error in fetchMenuItems:', e);
        if (e instanceof Error) {
          setError(`${e.message} (Check console for details)`);
        } else {
          setError('An unexpected error occurred while fetching menu items. Check console for details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Filter menu items based on category
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredItems(menuItems);
    } else {
      // Filter based on the category field from the database
      const filtered = menuItems.filter(item => item.category === activeFilter);
      setFilteredItems(filtered);
    }
  }, [activeFilter, menuItems]);

  // AppBar is now handled in App.tsx

  if (loading) {
    return (
    <>
      <Container sx={{ py: 6, pt: 10, px: { xs: 0, sm: 3 }, maxWidth: 'none !important', minHeight: '100dvh', width: '100%' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
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
              Our Menu
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            backgroundColor: '#fff',
            borderRadius: 2,
            boxShadow: 3,
            maxWidth: '600px',
            mx: 'auto'
          }}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>Loading Menu Items</Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Please wait while we fetch the latest menu items...
            </Typography>
          </Box>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Container sx={{ py: 6, pt: 10, maxWidth: 'none !important', width: '100%', minHeight: '100dvh' }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
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
              Our Menu
            </Typography>
          </Box>

          <Box sx={{
            maxWidth: '700px',
            mx: 'auto',
            backgroundColor: '#fff',
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'hidden'
          }}>
            <Alert
              severity="error"
              variant="filled"
              sx={{
                borderRadius: 0,
                py: 1
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Connection Error
              </Typography>
            </Alert>

            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="error" gutterBottom>
                Error fetching menu:
              </Typography>

              <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                {error}
              </Typography>

              <Typography variant="body2" sx={{ mt: 3, mb: 2 }}>
                Possible issues:
              </Typography>

              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Supabase connection error - check your API keys
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Network connectivity issues
                </Typography>
                <Typography component="li" variant="body2">
                  CORS configuration problems
                </Typography>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mr: 2 }}
                  onClick={() => window.location.reload()}
                >
                  Retry Connection
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </>
    );
  }

  const gridTemplateColumns = isMobile
      ? 'repeat(1, 1fr)'
      : isTablet
      ? 'repeat(2, 1fr)'
      : 'repeat(3, 1fr)';

  return (
    <>
      <Container
        disableGutters
        maxWidth={false}
        sx={{
          py: 4,
          pt: { xs: 8, sm: 10 },
          px: { xs: 0, sm: 0, md: 0 },
          width: '100%',
          maxWidth: 'none !important',
          minHeight: '100dvh',
        }}
      >
        <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              position: 'relative',
              display: 'inline-block',
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
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
            Our Menu
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{
              maxWidth: '600px',
              mx: 'auto',
              mt: 2,
              mb: 4,
              px: { xs: 2, sm: 0 } // Added responsive padding
            }}
          >
            Delicious food made with fresh ingredients, ready for pickup
          </Typography>

          {/* Enhanced Category filter with better spacing */}
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: { xs: 0.5, sm: 1 },
              py: { xs: 1.5, sm: 2 },
              px: { xs: 2, sm: 3 },
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 2,
              boxShadow: 1,
              mb: { xs: 2, sm: 3 }
            }}
          >
            {categories.map((category) => (
              <Chip
                key={category.id}
                icon={category.icon}
                label={isMobile ? undefined : category.name}
                onClick={() => setActiveFilter(category.id)}
                color={activeFilter === category.id ? 'primary' : 'default'}
                variant={activeFilter === category.id ? 'filled' : 'outlined'}
                sx={{
                  px: { xs: 0.5, sm: 1.5 },
                  py: { xs: 0.5, sm: 0.75 },
                  height: { xs: 32, sm: 'auto' },
                  '& .MuiChip-label': {
                    px: { xs: 0.5, sm: 1.5 },
                    display: { xs: isMobile ? 'none' : 'block', sm: 'block' }
                  },
                  '& .MuiChip-icon': {
                    ml: isMobile ? 0 : 0.5,
                    mr: isMobile ? 0 : -0.5
                  },
                  fontWeight: activeFilter === category.id ? 'bold' : 'normal',
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            ))}
          </Paper>
        </Box>

        {filteredItems.length === 0 ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            px: 3,
            backgroundColor: '#fff',
            borderRadius: 2,
            boxShadow: 3,
            width: '100%',
            mx: 'auto'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
              {menuItems.length === 0 ? 'No menu items available' : 'No items in this category'}
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              {menuItems.length === 0
                ? "We're currently updating our menu. Please check back later or contact the restaurant."
                : "Try selecting a different category from the filter options above."}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 4 }}
              onClick={() => window.location.reload()}
            >
              Refresh Menu
            </Button>
          </Box>
        ) : (
          <Box sx={{
            mx: 'auto',
            width: '100%',
            maxWidth: 'none !important',
            display: 'grid',
            gridTemplateColumns,
            gap: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 3, md: 4 }
          }}>
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  borderRadius: { xs: 1.5, sm: 2 },
                  overflow: 'hidden',
                  maxWidth: { xs: '100%', sm: '100%' },
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.01)',
                    boxShadow: 6
                  },
                }}
                elevation={3}
              >
                <Box
                  sx={{
                    height: { xs: 160, sm: 180 },
                    backgroundImage: `url(${item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '30%',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0))',
                    }
                  }}
                />
                <CardContent sx={{
                  flexGrow: 1,
                  p: { xs: 1.5, sm: 2, md: 3 },
                  pb: { xs: 0.5, sm: 1 } // Reduced bottom padding
                }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 'bold',
                      mb: 1,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: { xs: '2.4em', sm: '2.6em' }
                    }}
                  >
                    {item.description}
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: { xs: 1, sm: 2 },
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <Typography
                      variant="h6"
                      component="p"
                      sx={{
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        bgcolor: 'success.light',
                        color: 'success.dark',
                        px: { xs: 1, sm: 1.5 },
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                        order: { xs: 2, sm: 1 },
                        flexGrow: { xs: 1, sm: 0 }
                      }}
                    >
                      <Box component="span" sx={{ fontSize: '0.7rem', mr: 0.5, opacity: 0.8 }}>LKR</Box>
                      {item.price.toFixed(2)}
                    </Typography>

                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      order: { xs: 1, sm: 2 }
                    }}>
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          bgcolor: 'primary.light',
                          color: 'primary.dark',
                          px: { xs: 0.75, sm: 1 },
                          py: 0.25,
                          borderRadius: 1,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          fontWeight: 'bold'
                        }}
                      >
                        ★ {(4 + Math.random()).toFixed(1)}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
                <Box sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1 } }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<ShoppingCartIcon fontSize={isMobile ? "small" : "medium"} />}
                    onClick={() => addItemToCart(item)}
                    sx={{
                      borderRadius: '8px',
                      py: { xs: 0.75, sm: 1 },
                      textTransform: 'none',
                      fontWeight: 'bold',
                      fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                        transform: 'scale(1.02)'
                      },
                    }}
                  >
                    Add to Cart
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </>
  );
};

export default Menu;
