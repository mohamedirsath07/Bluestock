# Bluestock Company Management System - Backend

Complete Node.js backend API for the Bluestock company management application.

## 🚀 Features

- **JWT Authentication** (90-day validity)
- **Firebase Integration** for SMS OTP verification
- **PostgreSQL Database** with connection pooling
- **Cloudinary Integration** for image storage
- **Security Features**: Helmet, CORS, Rate Limiting
- **Input Validation & Sanitization**
- **Phone Number Validation** (libphonenumber-js)
- **Comprehensive Error Handling**

## 📋 Prerequisites

- Node.js 20.x LTS
- PostgreSQL 15
- Firebase Account (for SMS OTP)
- Cloudinary Account (for image storage)

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL credentials
- `JWT_SECRET` - Secret key for JWT (minimum 32 characters)
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` - Firebase credentials
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Cloudinary credentials

### 3. Setup Database

Create PostgreSQL database:

```bash
psql -U postgres
CREATE DATABASE bluestock_company;
\q
```

Run migrations:

```bash
npm run migrate
```

### 4. Start Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Firebase, Cloudinary config
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation middleware
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── server.js        # Express app entry point
├── database/
│   ├── schema.sql       # Database schema
│   └── migrate.js       # Migration script
├── package.json
└── .env.example
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/otp/send` - Send OTP to phone (protected)
- `POST /api/auth/otp/verify` - Verify OTP (protected)

### Company Management

- `GET /api/company` - Get company information (protected)
- `PUT /api/company` - Update company information (protected)
- `POST /api/company/upload` - Upload logo/banner (protected)
- `POST /api/company/social` - Add social media link (protected)
- `DELETE /api/company/social/:linkId` - Delete social media link (protected)

## 🔐 Security Features

- Helmet for HTTP headers security
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Speed limiting for repeated requests
- Input validation using express-validator
- HTML sanitization
- Password hashing with bcrypt
- JWT token authentication

## 📝 Development Notes

- In development mode, OTP is logged to console for testing
- Replace demo OTP with Firebase SMS in production
- JWT tokens expire in 90 days
- Images are automatically optimized when uploaded to Cloudinary

## 🧪 Testing

```bash
npm test
```

## 📄 License

ISC
