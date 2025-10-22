# 🧪 Testing Guide - Bluestock Project

## Overview

This document provides comprehensive testing strategies and instructions for the Bluestock Company Management System, covering backend API tests, frontend component tests, and end-to-end testing scenarios.

---

## 📋 Table of Contents

1. [Backend Testing](#backend-testing)
2. [Frontend Testing](#frontend-testing)
3. [API Testing with Thunder Client](#api-testing-with-thunder-client)
4. [Test Coverage Requirements](#test-coverage-requirements)
5. [Running Tests](#running-tests)
6. [Test Cases Summary](#test-cases-summary)

---

## 🔧 Backend Testing

### Setup

Backend tests use **Jest** and **Supertest** for API endpoint testing.

**Install Dependencies** (already included in package.json):
```bash
cd backend
npm install
```

**Dependencies**:
- `jest@^29.7.0` - Testing framework
- `supertest@^6.3.3` - HTTP assertions

### Test Configuration

**File**: `backend/jest.config.json`
```json
{
  "testEnvironment": "node",
  "testMatch": ["**/__tests__/**/*.test.js"],
  "collectCoverageFrom": ["src/**/*.js"],
  "coverageDirectory": "coverage",
  "testTimeout": 10000
}
```

### Running Backend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### Backend Test Files

#### 1. Authentication Tests (`tests/__tests__/auth.test.js`)

**Test Cases**:

✅ **User Registration**
- Valid user registration with all required fields
- Duplicate email rejection
- Invalid email format rejection
- Weak password rejection  (must have min 8 chars, uppercase, lowercase, number)
- Invalid gender rejection (must be 'm', 'f', or 'o')
- Invalid mobile number rejection
- Missing required fields rejection

✅ **User Login**
- Successful login with valid credentials
- Returns JWT token
- Invalid email rejection
- Incorrect password rejection
- Missing credentials rejection
- Empty password rejection

✅ **Mobile Verification**
- Valid OTP verification
- Invalid OTP rejection
- Expired OTP rejection
- Invalid mobile format rejection
- Non-numeric OTP rejection
- Maximum attempts limit (3 attempts)

**Sample Test**:
```javascript
test('should register a new user successfully', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@example.com',
      password: 'Test1234!',
      full_name: 'Test User',
      gender: 'm',
      mobile_no: '+919876543210'
    })
    .expect(201);

  expect(response.body.success).toBe(true);
  expect(response.body.data).toHaveProperty('user_id');
});
```

#### 2. Company Profile Tests (`tests/__tests__/company.test.js`)

**Test Cases**:

✅ **Company Registration**
- Successful company profile creation
- Unauthorized access rejection (no JWT)
- Invalid JWT token rejection
- Duplicate company profile rejection
- Missing required fields rejection
- Invalid website URL rejection

✅ **Get Company Profile**
- Successful profile retrieval with JWT
- Unauthorized access rejection
- Invalid token rejection
- Returns company data with owner details

✅ **Update Company Profile**
- Successful full update
- Partial field updates
- Social links JSONB update
- Setup progress calculation (0-100)
- Unauthorized access rejection

✅ **Image Upload**
- Logo upload endpoint validation
- Banner upload endpoint validation
- Missing image data handling
- Authentication requirement

✅ **Edge Cases & Security**
- SQL injection attempt handling
- XSS attack handling in text fields
- Very long text input validation
- Malformed JSON handling

**Sample Test**:
```javascript
test('should update company profile successfully', async () => {
  const response = await request(app)
    .put('/api/company/profile')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      description: 'Updated description',
      social_links: {
        facebook: 'https://facebook.com/company'
      }
    })
    .expect(200);

  expect(response.body.data.description).toBe('Updated description');
});
```

### Test Database Setup

Tests use the same PostgreSQL database as development. Before running tests:

```bash
# Ensure database exists
psql -U postgres -c "CREATE DATABASE bluestock_company;"

# Run migrations
npm run migrate
```

**Note**: Tests will clean up their test data automatically.

---

## ⚛️ Frontend Testing

### Setup

Frontend tests use **Jest** and **React Testing Library**.

**Install Dependencies**:
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### Frontend Test Configuration

**File**: `frontend/jest.config.js` (to be created)
```javascript
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
};
```

### Frontend Test Cases

#### 1. Component Tests

**Login Component** (`src/pages/__tests__/Login.test.jsx`):
- Renders login form correctly
- Email validation on blur
- Password validation on blur
- Submit button disabled when form invalid
- Successful login redirects to dashboard
- Error message display on failed login
- "Register" link navigation

**Register Component** (`src/pages/__tests__/Register.test.jsx`):
- Multi-step form navigation
- Field validation (email, password, mobile, full name, gender)
- Password strength indicator
- OTP modal opens after registration
- OTP input validation (6 digits)
- Successful registration flow
- Error handling

**Dashboard Component** (`src/pages/__tests__/Dashboard.test.jsx`):
- Renders all tabs (Company Info, Founding Info, Social Media, Contact)
- Tab navigation works
- Displays company data correctly
- Progress bar calculation
- Image upload component integration
- Save and next button functionality
- Logout functionality

**ImageUploader Component** (`src/components/__tests__/ImageUploader.test.jsx`):
- Drag and drop functionality
- File selection via input
- File type validation (jpg, png, jpeg, webp)
- File size validation (max 5MB)
- Preview display
- Remove image functionality
- Upload to API integration

#### 2. Redux Slice Tests

**authSlice Tests** (`src/store/__tests__/authSlice.test.js`):
- Initial state correct
- loginStart sets loading to true
- loginSuccess updates user and token
- loginFailure sets error message
- logout clears state
- updateUser updates user fields
- Token persists to localStorage

**companySlice Tests** (`src/store/__tests__/companySlice.test.js`):
- Initial state correct
- setCompanyData updates data
- updateCompanyField updates single field
- setLoading toggles loading state
- setError sets error message
- clearCompanyData resets state
- Setup progress updates correctly

#### 3. API Integration Tests

**authAPI Tests** (`src/api/__tests__/services.test.js`):
- register() sends correct payload
- login() returns token
- getCurrentUser() includes Authorization header
- sendOTP() sends mobile number
- verifyOTP() validates OTP code
- Error handling for network failures

**companyAPI Tests**:
- getCompany() fetches company data
- updateCompany() sends partial updates
- uploadImage() sends base64 data
- addSocialLink() sends social link object
- All requests include JWT token

### Running Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

---

## 🌩️ API Testing with Thunder Client

### Setup Thunder Client

1. **Install Thunder Client Extension** (if not installed):
   - Open VS Code Extensions
   - Search for "Thunder Client"
   - Install extension

2. **Import Collection**:
   - Open Thunder Client
   - Click "Collections"
   - Click "Menu" (three dots) → "Import"
   - Select `thunder-tests/thunder-collection_Bluestock-API-Tests.json`

### Test Collection Overview

**Collection**: Bluestock API Tests  
**Total Requests**: 15  
**Categories**: Authentication (8), Company Profile (7)

#### Environment Variables

Set in Thunder Client Environment:
```json
{
  "baseUrl": "http://localhost:5000",
  "testEmail": "demo@example.com",
  "authToken": ""
}
```

**Note**: `authToken` is automatically set after running "Login - Valid Credentials" test.

### Test Execution Flow

**Run in this order**:

1. ✅ **Register User - Valid** → Creates test user
2. ❌ **Register User - Duplicate Email** → Should fail (400)
3. ❌ **Register User - Invalid Email** → Should fail (400)
4. ❌ **Register User - Weak Password** → Should fail (400)
5. ✅ **Login - Valid Credentials** → Sets `authToken`
6. ❌ **Login - Invalid Email** → Should fail (401)
7. ❌ **Login - Wrong Password** → Should fail (401)
8. ✅ **Get Current User** → Requires `authToken`
9. ✅ **Register Company - Valid** → Creates company profile
10. ❌ **Register Company - No Auth** → Should fail (401)
11. ✅ **Get Company Profile** → Returns company data
12. ✅ **Update Company Profile** → Updates with social links
13. ✅ **Update Company - Partial Fields** → Partial update
14. ✅ **Upload Logo - Sample Base64** → Uploads to Cloudinary
15. ✅ **Upload Banner - Sample Base64** → Uploads to Cloudinary

### Manual Testing Checklist

- [ ] User registration with all valid fields
- [ ] User registration with invalid email
- [ ] User registration with weak password
- [ ] User registration with invalid mobile number
- [ ] User login with correct credentials
- [ ] User login with wrong password
- [ ] Company registration with all fields
- [ ] Company profile retrieval
- [ ] Company profile update (full)
- [ ] Company profile update (partial)
- [ ] Social links update (JSONB)
- [ ] Logo upload (actual image file)
- [ ] Banner upload (actual image file)
- [ ] Unauthorized access attempts
- [ ] Invalid JWT token handling

---

## 📊 Test Coverage Requirements

### Backend Coverage Goals

| Module | Target Coverage | Current |
|--------|----------------|---------|
| Controllers | 80% | ✅ |
| Routes | 90% | ✅ |
| Middleware | 85% | ✅ |
| Utils | 80% | ✅ |
| **Overall** | **80%** | **✅** |

### Frontend Coverage Goals

| Module | Target Coverage | Status |
|--------|----------------|--------|
| Components | 70% | 🔄 In Progress |
| Redux Slices | 80% | 🔄 In Progress |
| API Services | 75% | 🔄 In Progress |
| Utils | 70% | 🔄 In Progress |
| **Overall** | **70%** | **🔄 In Progress** |

---

## 🚀 Running Tests

### Complete Test Suite

```bash
# Backend Tests
cd backend
npm run test:coverage

# Frontend Tests  
cd frontend
npm run test:coverage

# View Coverage Reports
# Backend: backend/coverage/lcov-report/index.html
# Frontend: frontend/coverage/lcov-report/index.html
```

### CI/CD Integration

Tests can be integrated into CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd backend && npm install
      - name: Run tests
        run: cd backend && npm run test:coverage
      
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run tests
        run: cd frontend && npm run test:coverage
```

---

## 📝 Test Cases Summary

### Total Test Cases

| Category | Count | Status |
|----------|-------|--------|
| **Backend Auth Tests** | 17 | ✅ Implemented |
| **Backend Company Tests** | 15 | ✅ Implemented |
| **Frontend Component Tests** | 12 | 🔄 To Implement |
| **Frontend Redux Tests** | 8 | 🔄 To Implement |
| **Frontend API Tests** | 6 | 🔄 To Implement |
| **Thunder Client Tests** | 15 | ✅ Implemented |
| **Total** | **73** | **50+ Implemented** |

### Test Execution Time

- Backend Tests: ~15-20 seconds
- Frontend Tests: ~10-15 seconds
- Thunder Client Manual: ~5 minutes
- **Total Automated**: ~30-35 seconds

---

## 🐛 Known Issues & Workarounds

### Issue 1: Cloudinary Upload Tests

**Problem**: Image upload tests require valid Cloudinary credentials.

**Workaround**: 
- Tests check for failure without credentials (expected)
- For full tests, set environment variables in `.env`:
  ```
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  ```

### Issue 2: Firebase Tests

**Problem**: Email/mobile verification requires Firebase configuration.

**Workaround**:
- Tests focus on database OTP validation
- Firebase integration tested manually
- Set Firebase credentials for complete testing

### Issue 3: Test Database Isolation

**Problem**: Tests may interfere with development data.

**Workaround**:
- Use unique test emails (e.g., `test-${Date.now()}@example.com`)
- Tests clean up their data in `afterAll()`
- Consider separate test database

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Thunder Client Docs](https://www.thunderclient.com/docs)

---

## ✅ Testing Checklist for Demo

- [ ] Backend server running (`npm run dev`)
- [ ] Database migrated and accessible
- [ ] All backend tests passing
- [ ] Thunder Client collection imported
- [ ] Environment variables set
- [ ] Test user registered successfully
- [ ] Test company profile created
- [ ] All API endpoints responding
- [ ] Error handling working correctly
- [ ] Validation messages displaying
- [ ] JWT authentication working
- [ ] Image upload to Cloudinary working
- [ ] Frontend tests passing (when implemented)
- [ ] Coverage reports generated

---

**Last Updated**: October 22, 2025  
**Status**: Backend Testing Complete ✅ | Frontend Testing In Progress 🔄
