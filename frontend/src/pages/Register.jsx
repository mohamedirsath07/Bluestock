import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Phone } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { parsePhoneNumber } from 'libphonenumber-js';
import { authAPI } from '@api/services';
import { loginSuccess } from '@store/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpDialog, setOtpDialog] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [registeredPhone, setRegisteredPhone] = useState('');
  const [userToken, setUserToken] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.register(data);
      
      if (response.success) {
        setRegisteredPhone(data.phone);
        setUserToken(response.data.token);
        
        // Store token temporarily
        localStorage.setItem('token', response.data.token);
        
        // Send OTP
        await authAPI.sendOTP(data.phone);
        toast.info('OTP sent to your phone number');
        setOtpDialog(true);
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await authAPI.verifyOTP(registeredPhone, otpCode);
      
      if (response.success) {
        // Get user data
        const userData = await authAPI.getCurrentUser();
        
        dispatch(loginSuccess({
          user: userData.data,
          token: userToken,
        }));
        
        toast.success('Phone verified successfully!');
        setOtpDialog(false);
        navigate('/dashboard?section=settings');
      }
    } catch (error) {
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={10}
            sx={{
              p: 4,
              borderRadius: 3,
            }}
          >
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h4" color="white" fontWeight={700}>
                  J
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join Jobpilot to manage your company profile
              </Typography>
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                fullWidth
                label="Phone Number"
                type="tel"
                margin="normal"
                placeholder="+1234567890"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
                {...register('phone', {
                  required: 'Phone number is required',
                  validate: (value) => {
                    try {
                      const phoneNumber = parsePhoneNumber(value);
                      return phoneNumber.isValid() || 'Invalid phone number';
                    } catch {
                      return 'Invalid phone number';
                    }
                  },
                })}
                error={!!errors.phone}
                helperText={errors.phone?.message || 'Include country code (e.g., +1234567890)'}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain uppercase, lowercase, and number',
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                }}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Typography variant="body2" textAlign="center">
              Already have an account?{' '}
              <Link
                to="/login"
                style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}
              >
                Login
              </Link>
            </Typography>
          </Paper>
        </Container>
      </Box>

      {/* OTP Verification Dialog */}
      <Dialog open={otpDialog} onClose={() => !otpLoading && setOtpDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Verify Phone Number
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter the 6-digit OTP sent to {registeredPhone}
          </Typography>
          <TextField
            fullWidth
            label="OTP Code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '24px', letterSpacing: '8px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOtpDialog(false)} disabled={otpLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleVerifyOTP}
            disabled={otpLoading || otpCode.length !== 6}
          >
            {otpLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Register;
