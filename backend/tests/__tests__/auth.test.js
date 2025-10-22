import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/authRoutes.js';
import pool from '../../src/config/database.js';
import bcrypt from 'bcrypt';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API Tests', () => {
  let testUserId;
  const testUser = {
    email: 'test@example.com',
    password: 'Test1234!',
    full_name: 'Test User',
    gender: 'm',
    mobile_no: '+919876543210',
    signup_type: 'e'
  };

  // Clean up test data before all tests
  beforeAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  // Clean up test data after all tests
  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registered successfully');
      expect(response.body.data).toHaveProperty('user_id');
      
      testUserId = response.body.data.user_id;
    });

    test('should fail with duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should fail with invalid email format', async () => {
      const invalidUser = { ...testUser, email: 'invalid-email' };
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail with weak password', async () => {
      const weakPasswordUser = {
        ...testUser,
        email: 'weak@example.com',
        password: 'weak'
      };
      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid gender', async () => {
      const invalidGenderUser = {
        ...testUser,
        email: 'gender@example.com',
        gender: 'x'
      };
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidGenderUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid mobile number', async () => {
      const invalidMobileUser = {
        ...testUser,
        email: 'mobile@example.com',
        mobile_no: '123'
      };
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidMobileUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail with missing required fields', async () => {
      const incompleteUser = {
        email: 'incomplete@example.com',
        password: 'Test1234!'
      };
      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Login successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user_id');
      expect(response.body.data.email).toBe(testUser.email);
    });

    test('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    test('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    test('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail with empty password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: ''
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/verify-mobile', () => {
    beforeAll(async () => {
      // Insert test OTP
      await pool.query(
        `INSERT INTO otp_verifications (mobile_no, otp_code, expires_at)
         VALUES ($1, $2, $3)`,
        [testUser.mobile_no, '123456', new Date(Date.now() + 10 * 60 * 1000)]
      );
    });

    test('should verify mobile with valid OTP', async () => {
      const response = await request(app)
        .post('/api/auth/verify-mobile')
        .send({
          mobile_no: testUser.mobile_no,
          otp_code: '123456'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('verified successfully');
    });

    test('should fail with invalid OTP', async () => {
      // Insert new OTP for this test
      await pool.query(
        `INSERT INTO otp_verifications (mobile_no, otp_code, expires_at)
         VALUES ($1, $2, $3)`,
        ['+919999999999', '111111', new Date(Date.now() + 10 * 60 * 1000)]
      );

      const response = await request(app)
        .post('/api/auth/verify-mobile')
        .send({
          mobile_no: '+919999999999',
          otp_code: '999999'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid OTP');
    });

    test('should fail with expired OTP', async () => {
      // Insert expired OTP
      await pool.query(
        `INSERT INTO otp_verifications (mobile_no, otp_code, expires_at)
         VALUES ($1, $2, $3)`,
        ['+918888888888', '222222', new Date(Date.now() - 1000)]
      );

      const response = await request(app)
        .post('/api/auth/verify-mobile')
        .send({
          mobile_no: '+918888888888',
          otp_code: '222222'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('expired');
    });

    test('should fail with invalid mobile format', async () => {
      const response = await request(app)
        .post('/api/auth/verify-mobile')
        .send({
          mobile_no: '123',
          otp_code: '123456'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail with non-numeric OTP', async () => {
      const response = await request(app)
        .post('/api/auth/verify-mobile')
        .send({
          mobile_no: testUser.mobile_no,
          otp_code: 'abcdef'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
