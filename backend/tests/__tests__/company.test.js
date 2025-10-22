import request from 'supertest';
import express from 'express';
import companyRoutes from '../../src/routes/companyRoutes.js';
import authRoutes from '../../src/routes/authRoutes.js';
import pool from '../../src/config/database.js';
import { generateToken } from '../../src/utils/jwt.js';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);

describe('Company API Tests', () => {
  let authToken;
  let testUserId;
  let companyId;

  const testUser = {
    email: 'company-test@example.com',
    password: 'Test1234!',
    full_name: 'Company Test User',
    gender: 'm',
    mobile_no: '+919123456789',
  };

  const testCompany = {
    company_name: 'Test Company Inc.',
    address: '123 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    postal_code: '400001',
    website: 'https://testcompany.com',
    industry: 'Technology',
    founded_date: '2020-01-15',
    description: 'A test company for testing purposes'
  };

  // Setup test user and get auth token
  beforeAll(async () => {
    // Clean up existing test data
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);

    // Register test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    testUserId = registerResponse.body.data.user_id;

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    authToken = loginResponse.body.data.token;
  });

  // Clean up test data
  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    await pool.end();
  });

  describe('POST /api/company/register', () => {
    test('should register company profile successfully', async () => {
      const response = await request(app)
        .post('/api/company/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCompany)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registered successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.company_name).toBe(testCompany.company_name);
      expect(response.body.data.owner_id).toBe(testUserId);

      companyId = response.body.data.id;
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/company/register')
        .send(testCompany)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid JWT token', async () => {
      const response = await request(app)
        .post('/api/company/register')
        .set('Authorization', 'Bearer invalid-token')
        .send(testCompany)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail when company already exists', async () => {
      const response = await request(app)
        .post('/api/company/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCompany)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should fail with missing required fields', async () => {
      // Create new user for this test
      const newUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@example.com',
          password: 'Test1234!',
          full_name: 'Incomplete User',
          gender: 'f',
          mobile_no: '+919999888877'
        });

      const newUserToken = (await request(app)
        .post('/api/auth/login')
        .send({ email: 'incomplete@example.com', password: 'Test1234!' }))
        .body.data.token;

      const response = await request(app)
        .post('/api/company/register')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          company_name: 'Incomplete Company'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);

      // Clean up
      await pool.query('DELETE FROM users WHERE email = $1', ['incomplete@example.com']);
    });

    test('should fail with invalid website URL', async () => {
      const newUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'url-test@example.com',
          password: 'Test1234!',
          full_name: 'URL Test User',
          gender: 'm',
          mobile_no: '+919888777666'
        });

      const newUserToken = (await request(app)
        .post('/api/auth/login')
        .send({ email: 'url-test@example.com', password: 'Test1234!' }))
        .body.data.token;

      const response = await request(app)
        .post('/api/company/register')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          ...testCompany,
          website: 'invalid-url'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);

      // Clean up
      await pool.query('DELETE FROM users WHERE email = $1', ['url-test@example.com']);
    });
  });

  describe('GET /api/company/profile', () => {
    test('should get company profile successfully', async () => {
      const response = await request(app)
        .get('/api/company/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('company_name');
      expect(response.body.data).toHaveProperty('owner_id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data.company_name).toBe(testCompany.company_name);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/company/profile')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/company/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/company/profile', () => {
    test('should update company profile successfully', async () => {
      const updates = {
        description: 'Updated description for testing',
        social_links: {
          facebook: 'https://facebook.com/testcompany',
          twitter: 'https://twitter.com/testcompany',
          linkedin: 'https://linkedin.com/company/testcompany'
        }
      };

      const response = await request(app)
        .put('/api/company/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated successfully');
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.social_links).toEqual(updates.social_links);
    });

    test('should update partial fields', async () => {
      const partialUpdate = {
        company_name: 'Updated Test Company Inc.'
      };

      const response = await request(app)
        .put('/api/company/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialUpdate)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.company_name).toBe(partialUpdate.company_name);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/company/profile')
        .send({ description: 'Unauthorized update' })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should calculate setup progress correctly', async () => {
      const response = await request(app)
        .get('/api/company/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('setup_progress');
      expect(response.body.data.setup_progress).toBeGreaterThanOrEqual(0);
      expect(response.body.data.setup_progress).toBeLessThanOrEqual(100);
    });
  });

  describe('POST /api/company/upload-logo', () => {
    test('should fail without image data', async () => {
      const response = await request(app)
        .post('/api/company/upload-logo')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(500); // Will fail at Cloudinary upload

      expect(response.body.success).toBe(false);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/company/upload-logo')
        .send({ imageData: 'data:image/png;base64,test' })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/company/upload-banner', () => {
    test('should fail without image data', async () => {
      const response = await request(app)
        .post('/api/company/upload-banner')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(500); // Will fail at Cloudinary upload

      expect(response.body.success).toBe(false);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/company/upload-banner')
        .send({ imageData: 'data:image/jpeg;base64,test' })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle SQL injection attempts', async () => {
      const maliciousData = {
        ...testCompany,
        company_name: "'; DROP TABLE users; --"
      };

      // Create new user for this test
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'sql-inject@example.com',
          password: 'Test1234!',
          full_name: 'SQL Test',
          gender: 'm',
          mobile_no: '+919777666555'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'sql-inject@example.com', password: 'Test1234!' });

      const response = await request(app)
        .post('/api/company/register')
        .set('Authorization', `Bearer ${loginResponse.body.data.token}`)
        .send(maliciousData)
        .expect(201);

      // Should still work because of parameterized queries
      expect(response.body.success).toBe(true);

      // Verify users table still exists
      const usersCheck = await pool.query('SELECT COUNT(*) FROM users');
      expect(parseInt(usersCheck.rows[0].count)).toBeGreaterThan(0);

      // Clean up
      await pool.query('DELETE FROM users WHERE email = $1', ['sql-inject@example.com']);
    });

    test('should handle XSS attempts in description', async () => {
      const xssData = {
        description: '<script>alert("XSS")</script>Test description'
      };

      const response = await request(app)
        .put('/api/company/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(xssData)
        .expect(200);

      // Should be sanitized
      expect(response.body.data.description).not.toContain('<script>');
    });

    test('should handle very long text inputs', async () => {
      const longDescription = 'A'.repeat(3000); // Exceeds 2000 char limit

      const response = await request(app)
        .put('/api/company/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: longDescription })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
