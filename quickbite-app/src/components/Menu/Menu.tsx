import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useCart } from '../../hooks/useCart'; // Updated import path
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Import the icon

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string; // Added for potential images
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addItemToCart } = useCart();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase.from('menu').select('*');
        if (error) {
          throw error;
        }
        setMenuItems(data || []);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unexpected error occurred while fetching menu items.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">Error fetching menu: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom>
        Menu
      </Typography>
      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ backgroundColor: '#fff', boxShadow: 3 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, my: 1 }}>
                  {item.description}
                </Typography>
                <Typography variant="h6" component="p" sx={{ fontWeight: 'bold', color: 'green', mt: 1 }}>
                  LKR {item.price.toFixed(2)}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ mt: 2 }}
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => addItemToCart(item)}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Menu;
