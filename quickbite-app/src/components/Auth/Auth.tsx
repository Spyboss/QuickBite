import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Paper, // For a card-like appearance for the form
  Link as MuiLink, // For the guest link
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google'; // Google Icon

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else {
      setMessage(isLogin ? 'Logged in successfully!' : 'Signup successful! Check your email for confirmation.');
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      setError(error.message);
    } else {
      setMessage('Continuing as guest...');
      // Navigation will be handled by onAuthStateChange listener in AuthContext
    }
    setLoading(false);
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Container component={Paper} maxWidth="xs" sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isLogin ? 'Sign In' : 'Sign Up'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{message}</Alert>}
        <Box component="form" onSubmit={handleAuth} sx={{ width: '100%', mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          startIcon={<GoogleIcon />}
        >
          Sign In with Google
        </Button>
        <Button fullWidth variant="text" onClick={() => setIsLogin(!isLogin)} sx={{ mt: 1 }}>
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </Button>
        <MuiLink component="button" variant="body2" onClick={handleGuestLogin} sx={{ mt: 2 }} disabled={loading}>
          Continue as Guest
        </MuiLink>
      </Container>
    </Box>
  );
};

export default Auth;
