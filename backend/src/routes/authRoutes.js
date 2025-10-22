import express from 'express';
import {
  register,
  login,
  sendOTP,
  verifyOTP,
  getCurrentUser,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
  registerValidation,
  loginValidation,
  otpValidation,
  validate,
} from '../middleware/validator.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// Protected routes
router.use(authenticate);
router.get('/me', getCurrentUser);
router.post('/otp/send', sendOTP);
router.post('/otp/verify', otpValidation, validate, verifyOTP);

export default router;
