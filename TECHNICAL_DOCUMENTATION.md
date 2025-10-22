# 📘 Technical Documentation - Bluestock Company Management System

## Project Overview

**Project Name**: Bluestock Company Management System  
**Version**: 1.0.0  
**Last Updated**: October 22, 2025  
**Tech Stack**: React 18, Node.js 20, PostgreSQL 15, Firebase, Cloudinary

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [External Services](#external-services)
8. [Security Implementation](#security-implementation)
9. [Environment Configuration](#environment-configuration)
10. [Deployment](#deployment)

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────┐
│   React Client  │
│   (Port 5173)   │
└────────┬────────┘
         │ HTTP/REST
         │ JWT Auth
         ▼
┌─────────────────┐
│  Express Server │
│   (Port 5000)   │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
    ▼         ▼          ▼          ▼
┌────────┐ ┌─────┐ ┌─────────┐ ┌──────────┐
│PostreSQL│ │Firebase│ │Cloudinary│ │   JWT    │
│(DB 15) │ │ (Auth)│ │ (Images)│ │  Tokens  │
└────────┘ └─────┘ └─────────┘ └──────────┘
```

### Request Flow

1. **User Registration**:
   ```
   Client → POST /api/auth/register
   → Validate Input
   → Hash Password (bcrypt)
   → Create User in PostgreSQL
   → Create Firebase User
   → Create Empty Company Profile
   → Return user_id
   ```

2. **User Login**:
   ```
   Client → POST /api/auth/login
   → Validate Credentials
   → Compare Password Hash
   → Generate JWT Token (90-day)
   → Update Last Login
   → Return Token + User Data
   ```

3. **Company Profile Update**:
   ```
   Client → PUT /api/company/profile (+ JWT)
   → Verify JWT Token
   → Validate Input
   → Update Company Record
   → Calculate Setup Progress
   → Return Updated Profile
   ```

4. **Image Upload**:
   ```
   Client → POST /api/company/upload-logo (+ JWT + Base64)
   → Verify JWT Token
   → Validate Image Data
   → Upload to Cloudinary
   → Store URL in PostgreSQL
   → Return Cloudinary URL
   ```

---

## 💻 Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.2.0 | UI Framework |
| **Vite** | 5.0.0 | Build Tool & Dev Server |
| **Redux Toolkit** | 1.9.7 | State Management |
| **React Query** | 5.12.2 | Server State Management |
| **Material-UI** | 5.15.0 | Component Library |
| **React Hook Form** | 7.48.2 | Form Management |
| **React Router** | 6.20.0 | Client-side Routing |
| **Axios** | 1.6.2 | HTTP Client |
| **React Toastify** | 9.1.3 | Notifications |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20.x LTS | Runtime Environment |
| **Express** | 4.18.2 | Web Framework |
| **PostgreSQL** | 15 | Relational Database |
| **JWT** | 9.0.2 | Authentication |
| **bcrypt** | 5.1.1 | Password Hashing |
| **Firebase Admin** | 11.11.1 | Auth & OTP |
| **Cloudinary** | 1.41.0 | Image Storage |
| **express-validator** | 7.0.1 | Input Validation |
| **Helmet** | 7.1.0 | Security Headers |

### Development & Testing

| Tool | Purpose |
|------|---------|
| **Jest** | Testing Framework |
| **Supertest** | HTTP Testing |
| **React Testing Library** | Component Testing |
| **Thunder Client** | API Testing |
| **Nodemon** | Auto-restart Server |

---

## 🗄️ Database Schema

### Complete Schema Diagram

```sql
┌─────────────────────────────────────────┐
│              users                       │
├─────────────────────────────────────────┤
│ id (PK)                    SERIAL        │
│ email                      VARCHAR(255)  │ UNIQUE
│ password                   TEXT          │
│ full_name                  VARCHAR(255)  │
│ signup_type                VARCHAR(1)    │ DEFAULT 'e'
│ gender                     CHAR(1)       │ CHECK (m/f/o)
│ mobile_no                  VARCHAR(20)   │ UNIQUE
│ is_mobile_verified         BOOLEAN       │
│ is_email_verified          BOOLEAN       │
│ firebase_uid               VARCHAR(255)  │
│ created_at                 TIMESTAMP     │
│ updated_at                 TIMESTAMP     │ AUTO
│ last_login                 TIMESTAMP     │
└──────────────┬──────────────────────────┘
               │ 1
               │
               │ owner_id (FK)
               │
               ▼ 1
┌─────────────────────────────────────────┐
│          company_profile                 │
├─────────────────────────────────────────┤
│ id (PK)                    SERIAL        │
│ owner_id (FK)              INT           │ → users.id CASCADE
│ company_name               TEXT          │
│ address                    TEXT          │
│ city                       VARCHAR(50)   │
│ state                      VARCHAR(50)   │
│ country                    VARCHAR(50)   │
│ postal_code                VARCHAR(20)   │
│ website                    TEXT          │
│ logo_url                   TEXT          │ Cloudinary URL
│ banner_url                 TEXT          │ Cloudinary URL
│ industry                   TEXT          │
│ founded_date               DATE          │
│ description                TEXT          │
│ social_links               JSONB         │ {"fb": "url", ...}
│ setup_progress             INT           │ 0-100
│ is_complete                BOOLEAN       │
│ created_at                 TIMESTAMP     │
│ updated_at                 TIMESTAMP     │ AUTO
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        otp_verifications                 │
├─────────────────────────────────────────┤
│ otp_id (PK)                SERIAL        │
│ mobile_no                  VARCHAR(20)   │
│ otp_code                   VARCHAR(6)    │
│ expires_at                 TIMESTAMP     │
│ verified                   BOOLEAN       │
│ attempts                   INT           │ MAX 3
│ created_at                 TIMESTAMP     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│             sessions                     │
├─────────────────────────────────────────┤
│ session_id (PK)            SERIAL        │
│ user_id (FK)               INT           │ → users.id
│ token                      TEXT          │
│ expires_at                 TIMESTAMP     │
│ created_at                 TIMESTAMP     │
└─────────────────────────────────────────┘
```

### Key Relationships

1. **Users ↔ Company Profile**: One-to-One
   - One user owns one company profile
   - `company_profile.owner_id` → `users.id`
   - CASCADE DELETE: Deleting user deletes their company

2. **Normalization Benefits**:
   - ✅ No data duplication
   - ✅ Referential integrity
   - ✅ Easy to query and update
   - ✅ Scalable structure

3. **JSONB social_links**:
   ```json
   {
     "facebook": "https://facebook.com/company",
     "twitter": "https://twitter.com/company",
     "linkedin": "https://linkedin.com/company/name",
     "instagram": "https://instagram.com/company"
   }
   ```

### Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mobile_no ON users(mobile_no);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_company_profile_owner_id ON company_profile(owner_id);
```

### Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_profile_updated_at
    BEFORE UPDATE ON company_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 📡 API Documentation

### Base URL

```
Development: http://localhost:5000/api
Production: https://api.bluestock.com/api
```

### Authentication

All protected endpoints require JWT in header:
```http
Authorization: Bearer <jwt_token>
```

### Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | ❌ | Register new user |
| `/auth/login` | POST | ❌ | Login user |
| `/auth/verify-email` | GET | ❌ | Verify email |
| `/auth/verify-mobile` | POST | ❌ | Verify mobile OTP |
| `/auth/me` | GET | ✅ | Get current user |
| `/company/register` | POST | ✅ | Create company profile |
| `/company/profile` | GET | ✅ | Get company profile |
| `/company/profile` | PUT | ✅ | Update company profile |
| `/company/upload-logo` | POST | ✅ | Upload logo |
| `/company/upload-banner` | POST | ✅ | Upload banner |

### Standard Response Format

**Success**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": [ ... ] // Validation errors
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing auth |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

**Complete API Documentation**: See `API_DOCUMENTATION.md`

---

## ⚛️ Frontend Architecture

### Project Structure

```
frontend/
├── public/
│   └── assets/
├── src/
│   ├── api/
│   │   ├── axios.js          # Axios instance & interceptors
│   │   └── services.js       # API service functions
│   ├── components/
│   │   ├── ProtectedRoute.jsx
│   │   └── ImageUploader.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   ├── store/
│   │   ├── index.js          # Redux store config
│   │   ├── authSlice.js      # Auth state
│   │   └── companySlice.js   # Company state
│   ├── styles/
│   │   ├── theme.js          # MUI theme
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

### State Management

**Redux Toolkit Slices**:

1. **authSlice**:
   ```javascript
   {
     user: { id, email, full_name, ... },
     token: 'jwt_token',
     isAuthenticated: boolean,
     loading: boolean,
     error: string | null
   }
   ```

2. **companySlice**:
   ```javascript
   {
     companyData: { id, company_name, ... },
     setupProgress: 0-100,
     loading: boolean,
     error: string | null
   }
   ```

### Routing

```javascript
/                  → Redirect to /dashboard
/login             → Login page
/register          → Registration page
/dashboard         → Protected dashboard
/dashboard?section=settings → Dashboard with settings tab
```

### Component Hierarchy

```
App
├── BrowserRouter
│   ├── Route: /login → Login
│   ├── Route: /register → Register
│   └── Route: /dashboard → ProtectedRoute
│       └── Dashboard
│           ├── AppBar
│           ├── LinearProgress (setup_progress)
│           └── Tabs
│               ├── Tab 1: Company Info
│               │   ├── TextField inputs
│               │   └── ImageUploader (logo/banner)
│               ├── Tab 2: Founding Info
│               ├── Tab 3: Social Media
│               └── Tab 4: Contact
```

### Form Validation

Using **react-hook-form**:
```javascript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm();

<TextField
  {...register('email', {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email format'
    }
  })}
  error={!!errors.email}
  helperText={errors.email?.message}
/>
```

---

## 🔧 Backend Architecture

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # PostgreSQL pool
│   │   ├── firebase.js       # Firebase Admin SDK
│   │   └── cloudinary.js     # Cloudinary config
│   ├── controllers/
│   │   ├── authController.js
│   │   └── companyController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   └── validator.js      # Input validation
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── companyRoutes.js
│   ├── utils/
│   │   └── jwt.js            # Token generation
│   └── server.js             # Entry point
├── database/
│   ├── schema.sql
│   └── migrate.js
├── tests/
│   ├── setup.js
│   └── __tests__/
│       ├── auth.test.js
│       └── company.test.js
├── .env.example
├── package.json
└── jest.config.json
```

### Middleware Stack

```javascript
app.use(helmet());              // Security headers
app.use(cors({ origin: FRONTEND_URL }));
app.use(compression());         // Response compression
app.use(morgan('dev'));         // Request logging
app.use(rateLimiter);          // Rate limiting (100 req/15min)
app.use(slowDown);             // Slow down (delay after 50 req)
app.use(express.json());        // JSON parser
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use(errorHandler);         // Global error handler
```

### Database Connection

```javascript
// Connection pooling
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                     // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Error Handling

Global error handler:
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});
```

---

## 🔐 Security Implementation

### 1. Password Security

**Hashing**:
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

**Requirements**:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

### 2. JWT Authentication

**Token Generation**:
```javascript
const token = jwt.sign(
  { userId, email },
  process.env.JWT_SECRET,
  { expiresIn: '90d' }
);
```

**Token Verification**:
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = { userId: decoded.userId, email: decoded.email };
```

### 3. Input Validation

**express-validator**:
```javascript
body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Valid email is required'),
body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
```

### 4. SQL Injection Prevention

**Parameterized queries**:
```javascript
// ✅ Safe
await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ Vulnerable (never do this)
await pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

### 5. XSS Protection

**sanitize-html**:
```javascript
const clean = sanitizeHtml(userInput, {
  allowedTags: [],
  allowedAttributes: {}
});
```

### 6. CORS Configuration

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### 7. Rate Limiting

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // Max 100 requests
});
```

### 8. Security Headers

```javascript
app.use(helmet());  // Sets various HTTP headers
```

---

## ☁️ External Services

### 1. Firebase

**Purpose**: Authentication & OTP Verification

**Setup**:
```javascript
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});
```

**Usage**:
```javascript
// Create user
const firebaseUser = await admin.auth().createUser({
  email,
  password,
  phoneNumber: mobile_no,
  displayName: full_name
});

// Verify user
const user = await admin.auth().getUserByEmail(email);
```

### 2. Cloudinary

**Purpose**: Image Storage (Logo & Banner)

**Setup**:
```javascript
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
```

**Usage**:
```javascript
const result = await cloudinary.uploader.upload(imageData, {
  folder: `bluestock/companies/${companyId}/logo`,
  transformation: [
    { width: 400, height: 400, crop: 'limit', quality: 'auto' }
  ]
});

const url = result.secure_url; // Store in database
```

### 3. PostgreSQL

**Purpose**: Primary Database

**Configuration**:
- **Version**: PostgreSQL 15
- **Location**: localhost:5432
- **Database**: bluestock_company
- **Connection Pooling**: Max 20 connections

---

## ⚙️ Environment Configuration

### Backend .env

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bluestock_company
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Authentication
JWT_SECRET=your-secret-key-min-32-characters-long
JWT_EXPIRES_IN=90d

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend .env

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Bluestock
```

---

## 🚀 Deployment

### Production Checklist

#### Backend

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (min 32 chars)
- [ ] Configure PostgreSQL with SSL
- [ ] Set up Firebase production project
- [ ] Configure Cloudinary production account
- [ ] Enable HTTPS
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up logging (Winston, Morgan)
- [ ] Enable monitoring (Prometheus, Grafana)
- [ ] Set up backup strategy
- [ ] Configure firewall rules

#### Frontend

- [ ] Build production bundle (`npm run build`)
- [ ] Set production API URL
- [ ] Enable service worker (PWA)
- [ ] Configure CDN (Cloudflare, AWS CloudFront)
- [ ] Set up SSL certificate
- [ ] Optimize images
- [ ] Enable gzip compression
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics)

### Deployment Platforms

**Recommended**:
- **Backend**: Heroku, AWS EC2, DigitalOcean
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: AWS RDS, DigitalOcean Managed Database

---

## 📊 Performance Optimization

### Backend

- ✅ Connection pooling (max 20)
- ✅ Response compression
- ✅ Rate limiting
- ✅ Database indexes
- ✅ Query optimization (avoid N+1)
- ✅ Caching (Redis - optional)

### Frontend

- ✅ Code splitting (React.lazy)
- ✅ Image optimization (Cloudinary)
- ✅ React Query caching
- ✅ Memoization (useMemo, useCallback)
- ✅ Lazy loading components
- ✅ Tree shaking (Vite)

---

## 🔍 Monitoring & Logging

### Backend Logging

```javascript
import morgan from 'morgan';

// Development
app.use(morgan('dev'));

// Production
app.use(morgan('combined', {
  stream: fs.createWriteStream('./logs/access.log', { flags: 'a' })
}));
```

### Error Tracking

```javascript
// Log errors
console.error('Error:', {
  timestamp: new Date(),
  error: err.message,
  stack: err.stack,
  user: req.user?.email
});
```

---

## 📚 Additional Documentation

- **API Documentation**: `API_DOCUMENTATION.md`
- **Database Schema**: `DATABASE_SCHEMA.md`
- **Setup Guide**: `SETUP_GUIDE_FULLSTACK.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **Demo Guide**: `DEMO_PREPARATION.md`

---

**Document Version**: 1.0.0  
**Last Updated**: October 22, 2025  
**Maintained By**: Development Team
