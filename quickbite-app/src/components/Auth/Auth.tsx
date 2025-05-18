import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Paper,
  Link as MuiLink,
  CircularProgress,
  Divider,
  Snackbar,
  IconButton,
  FormHelperText,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import CloseIcon from '@mui/icons-material/Close';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useAuth } from '../../hooks/useAuth';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Password validation rules
  const MIN_PASSWORD_LENGTH = 10;
  const HAS_UPPERCASE = /[A-Z]/;
  const HAS_LOWERCASE = /[a-z]/;
  const HAS_NUMBER = /[0-9]/;
  const HAS_SPECIAL = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      // Get the redirect path from the location state or default to '/'
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Validate password strength
  const validatePassword = (password: string): boolean => {
    if (!isLogin) { // Only validate on signup
      if (password.length < MIN_PASSWORD_LENGTH) {
        setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
        return false;
      }

      const missingRequirements = [];

      if (!HAS_UPPERCASE.test(password)) {
        missingRequirements.push('uppercase letter');
      }

      if (!HAS_LOWERCASE.test(password)) {
        missingRequirements.push('lowercase letter');
      }

      if (!HAS_NUMBER.test(password)) {
        missingRequirements.push('number');
      }

      if (!HAS_SPECIAL.test(password)) {
        missingRequirements.push('special character');
      }

      if (missingRequirements.length > 0) {
        setPasswordError(`Password must include: ${missingRequirements.join(', ')}`);
        return false;
      }
    }

    setPasswordError(null);
    return true;
  };

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    // Validate password on signup
    if (!isLogin && !validatePassword(password)) {
      return;
    }

    setLoading(true);

    try {
      // For development purposes, use a test account if the email contains "test"
      if (email.includes('test')) {
        // This is a development shortcut - in production, always use real authentication
        console.log('Using test account for development');
        const { error } = await supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'password123'
        });

        if (error) {
          // If test account fails, try anonymous login
          console.log('Test account failed, trying anonymous login');
          // Use signInWithPassword with a test account instead of anonymous login
          const { error: anonError } = await supabase.auth.signInWithPassword({
            email: 'guest@example.com',
            password: 'guest123'
          });
          if (anonError) {
            setError('Authentication failed. Please try again later.');
            console.error('Anonymous auth error:', anonError);
          } else {
            setMessage('Signed in as guest for testing');
            setSnackbarOpen(true);
          }
        } else {
          setMessage('Logged in with test account');
          setSnackbarOpen(true);
        }
      } else {
        // Normal authentication flow
        const { error } = isLogin
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

        if (error) {
          setError(error.message);
          console.error('Auth error details:', error);
        } else {
          setMessage(isLogin ? 'Logged in successfully!' : 'Signup successful! Check your email for confirmation.');
          setSnackbarOpen(true);
          setEmail('');
          setPassword('');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Google auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log('Attempting anonymous login...');
      // Use signInWithPassword with a guest account instead of anonymous login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'guest@example.com',
        password: 'guest123'
      });

      if (error) {
        console.error('Anonymous login error:', error);

        // If anonymous login fails, try a fallback approach for development
        if (process.env.NODE_ENV === 'development') {
          console.log('Trying development fallback...');
          // Create a temporary session in localStorage for development
          localStorage.setItem('quickbite_guest_session', JSON.stringify({
            id: 'guest-' + Math.random().toString(36).substring(2, 9),
            created_at: new Date().toISOString()
          }));

          setMessage('Continuing as guest (development mode)');
          setSnackbarOpen(true);

          // Redirect to home page after a short delay
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          setError(error.message);
        }
      } else {
        console.log('Anonymous login successful:', data);
        setMessage('Continuing as guest...');
        setSnackbarOpen(true);
        // Navigation will be handled by onAuthStateChange listener in AuthContext
      }
    } catch (err) {
      setError('Failed to continue as guest. Please try again.');
      console.error('Guest login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
      backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <Container component={Paper} maxWidth="xs" sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 2,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}>
        <Box sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}>
          {isLogin ?
            <LockOutlinedIcon sx={{ color: 'white' }} /> :
            <PersonAddOutlinedIcon sx={{ color: 'white' }} />
          }
        </Box>

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isLogin ? 'Sign In' : 'Sign Up'}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          {isLogin ?
            'Sign in to access your orders and account' :
            'Create an account to save your orders and preferences'
          }
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
            disabled={loading}
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
            onChange={(e) => {
              setPassword(e.target.value);
              if (!isLogin) {
                validatePassword(e.target.value);
              }
            }}
            disabled={loading}
            error={!isLogin && !!passwordError}
          />
          {!isLogin && passwordError && (
            <FormHelperText error sx={{ ml: 1, mt: 0 }}>
              {passwordError}
            </FormHelperText>
          )}
          {!isLogin && !passwordError && password.length > 0 && (
            <FormHelperText sx={{ ml: 1, mt: 0, color: 'success.main' }}>
              Password meets all requirements
            </FormHelperText>
          )}
          {!isLogin && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, ml: 1 }}>
              Password must be at least {MIN_PASSWORD_LENGTH} characters and include uppercase, lowercase,
              number, and special character.
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </Box>

        <Divider sx={{ width: '100%', my: 2 }}>
          <Typography variant="body2" color="text.secondary">OR</Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          sx={{ mb: 2, py: 1.2 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          startIcon={<GoogleIcon />}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign In with Google'}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={() => setIsLogin(!isLogin)}
          sx={{ mt: 1 }}
          disabled={loading}
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </Button>

        <MuiLink
          component="button"
          variant="body2"
          onClick={handleGuestLogin}
          sx={{ mt: 2, color: 'text.secondary' }}
          disabled={loading}
        >
          Continue as Guest
        </MuiLink>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={message}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default Auth;
