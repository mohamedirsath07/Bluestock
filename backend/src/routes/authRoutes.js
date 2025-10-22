import express from 'express';
import {
  register,
  login,
  verifyEmail,
  verifyMobile,
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
router.get('/verify-email', verifyEmail);
router.post('/verify-mobile', otpValidation, validate, verifyMobile);

// Protected routes
router.use(authenticate);
router.get('/me', getCurrentUser);

export default router;
