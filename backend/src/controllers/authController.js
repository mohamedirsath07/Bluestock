import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { auth } from '../config/firebase.js';

// Register new user
export const register = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, full_name, gender, mobile_no, signup_type = 'e' } = req.body;

    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1 OR mobile_no = $2',
      [email, mobile_no]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or mobile number',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const result = await client.query(
      `INSERT INTO users (email, password, full_name, signup_type, gender, mobile_no, is_email_verified, is_mobile_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, full_name, mobile_no, created_at`,
      [email, hashedPassword, full_name, signup_type, gender, mobile_no, false, false]
    );

    const user = result.rows[0];

    // Create Firebase user for authentication
    try {
      const firebaseUser = await auth.createUser({
        email,
        password,
        phoneNumber: mobile_no,
        displayName: full_name,
        emailVerified: false,
      });

      // Update user with Firebase UID
      await client.query(
        'UPDATE users SET firebase_uid = $1 WHERE id = $2',
        [firebaseUser.uid, user.id]
      );
    } catch (firebaseError) {
      console.error('Firebase user creation failed:', firebaseError);
      // Continue with local auth even if Firebase fails
    }

    // Create empty company profile
    await client.query(
      'INSERT INTO company_profile (owner_id, setup_progress) VALUES ($1, $2)',
      [user.id, 0]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify mobile OTP.',
      data: {
        user_id: user.id,
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
      'SELECT id, email, password, full_name, mobile_no, is_email_verified, is_mobile_verified FROM users WHERE email = $1',
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
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user_id: user.id,
        email: user.email,
        full_name: user.full_name,
        mobile_no: user.mobile_no,
        is_email_verified: user.is_email_verified,
        is_mobile_verified: user.is_mobile_verified,
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

// Verify email via Firebase
export const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Verify email with Firebase
    try {
      await auth.getUserByEmail(email);
      
      // Update user email verification status
      await pool.query(
        'UPDATE users SET is_email_verified = TRUE WHERE email = $1',
        [email]
      );

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (firebaseError) {
      return res.status(400).json({
        success: false,
        message: 'Email verification failed',
        error: firebaseError.message,
      });
    }
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message,
    });
  }
};

// Verify mobile via Firebase OTP
export const verifyMobile = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { mobile_no, otp_code } = req.body;

    await client.query('BEGIN');

    // Find OTP record
    const result = await client.query(
      `SELECT otp_id, otp_code, expires_at, verified, attempts
       FROM otp_verifications
       WHERE mobile_no = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [mobile_no]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this mobile number',
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
    if (otpRecord.otp_code !== otp_code) {
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

    // Update user mobile verification status
    await client.query(
      'UPDATE users SET is_mobile_verified = TRUE WHERE mobile_no = $1',
      [mobile_no]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Mobile number verified successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Verify mobile error:', error);
    res.status(500).json({
      success: false,
      message: 'Mobile verification failed',
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
      `SELECT id, email, full_name, gender, mobile_no, is_email_verified, is_mobile_verified, created_at, last_login
       FROM users
       WHERE id = $1`,
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
