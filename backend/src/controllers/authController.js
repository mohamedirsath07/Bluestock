import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { auth } from '../config/firebase.js';

// Register new user
export const register = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, phone } = req.body;

    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT user_id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in database
    const result = await client.query(
      `INSERT INTO users (email, password_hash, phone, email_verified, phone_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, email, phone, created_at`,
      [email, passwordHash, phone, false, false]
    );

    const user = result.rows[0];

    // Create Firebase user for authentication
    try {
      const firebaseUser = await auth.createUser({
        email,
        password,
        phoneNumber: phone,
        emailVerified: false,
      });

      // Update user with Firebase UID
      await client.query(
        'UPDATE users SET firebase_uid = $1 WHERE user_id = $2',
        [firebaseUser.uid, user.user_id]
      );
    } catch (firebaseError) {
      console.error('Firebase user creation failed:', firebaseError);
      // Continue with local auth even if Firebase fails
    }

    // Create empty company profile
    await client.query(
      'INSERT INTO companies (user_id, setup_progress) VALUES ($1, $2)',
      [user.user_id, 0]
    );

    await client.query('COMMIT');

    // Generate JWT token
    const token = generateToken(user.user_id, user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user.user_id,
        email: user.email,
        phone: user.phone,
        token,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT user_id, email, password_hash, phone, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Generate JWT token
    const token = generateToken(user.user_id, user.email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.user_id,
        email: user.email,
        phone: user.phone,
        emailVerified: user.email_verified,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.userId;

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await pool.query(
      `INSERT INTO otp_verifications (user_id, phone, otp_code, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [userId, phone, otpCode, expiresAt]
    );

    // Send OTP via Firebase (or SMS service)
    // For demo purposes, we'll return the OTP in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 OTP for ${phone}: ${otpCode}`);
      return res.json({
        success: true,
        message: 'OTP sent successfully',
        otp: otpCode, // Only in development
      });
    }

    // In production, use Firebase to send SMS
    // await messaging.send({ ... });

    res.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message,
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { phone, otpCode } = req.body;
    const userId = req.user.userId;

    await client.query('BEGIN');

    // Find OTP record
    const result = await client.query(
      `SELECT otp_id, otp_code, expires_at, verified, attempts
       FROM otp_verifications
       WHERE user_id = $1 AND phone = $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, phone]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this phone number',
      });
    }

    const otpRecord = result.rows[0];

    // Check if already verified
    if (otpRecord.verified) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'OTP already verified',
      });
    }

    // Check expiration
    if (new Date() > new Date(otpRecord.expires_at)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded',
      });
    }

    // Verify OTP
    if (otpRecord.otp_code !== otpCode) {
      await client.query(
        'UPDATE otp_verifications SET attempts = attempts + 1 WHERE otp_id = $1',
        [otpRecord.otp_id]
      );
      await client.query('COMMIT');
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Mark OTP as verified
    await client.query(
      'UPDATE otp_verifications SET verified = TRUE WHERE otp_id = $1',
      [otpRecord.otp_id]
    );

    // Update user phone verification status
    await client.query(
      'UPDATE users SET phone_verified = TRUE WHERE user_id = $1',
      [userId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Phone number verified successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT user_id, email, phone, email_verified, phone_verified, created_at, last_login
       FROM users
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};
