# Bluestock Setup Guide

Complete step-by-step setup instructions for the Bluestock Company Management System.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 20.x LTS installed
- [ ] PostgreSQL 15 installed and running
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Firebase account (free tier)
- [ ] Cloudinary account (free tier)

## 🔧 Step-by-Step Setup

### 1. Clone & Install

```bash
# Clone repository
cd D:\Studiess\Intern\Bluestock

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Enable **Authentication** → **Phone** sign-in method
4. Go to **Project Settings** → **Service Accounts**
5. Click **Generate New Private Key**
6. Download the JSON file
7. Extract these values for `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

### 3. Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up or log in
3. Go to **Dashboard**
4. Copy these values for `.env`:
   - Cloud name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

### 4. PostgreSQL Database Setup

#### Windows (PowerShell)
```powershell
# Start PostgreSQL service (if not running)
Start-Service postgresql-x64-15

# Create database
psql -U postgres -c "CREATE DATABASE bluestock_company;"

# Verify
psql -U postgres -l
```

#### macOS/Linux
```bash
# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql # macOS

# Create database
createdb bluestock_company

# Verify
psql -l
```

### 5. Backend Configuration

```bash
cd backend

# Copy environment file
cp .env.example .env
```

Edit `backend/.env`:
```env
# Server
PORT=5000
NODE_ENV=development

# Database (adjust if needed)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bluestock_company
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

# JWT (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=90d

# Firebase (from step 2)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKey\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Cloudinary (from step 3)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret

# CORS
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Generate JWT Secret:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online: https://randomkeygen.com/
```

### 6. Run Database Migration

```bash
cd backend
npm run migrate
```

Expected output:
```
🚀 Starting database migration...
✅ Database connected successfully
✅ Database migration completed successfully!
```

### 7. Frontend Configuration

```bash
cd ../frontend

# Copy environment file
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 8. Start Development Servers

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Expected output:
```
╔══════════════════════════════════════════════╗
║   🚀 Bluestock Backend Server Started       ║
║                                              ║
║   Environment: development                   ║
║   Port: 5000                                ║
║   API: http://localhost:5000/api            ║
╚══════════════════════════════════════════════╝
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 9. Verify Installation

1. Open browser: `http://localhost:5173`
2. You should see the **Login** page
3. Click **Register Now**
4. Fill the registration form
5. Submit and check backend terminal for OTP code
6. Enter OTP in the dialog
7. Should redirect to **Dashboard**

## 🧪 Test the Application

### 1. Test Registration Flow

```bash
# Using curl (PowerShell)
$body = @{
    email = "test@example.com"
    password = "Test@1234"
    phone = "+1234567890"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### 2. Check Database

```bash
psql -U postgres -d bluestock_company

# List tables
\dt

# View users
SELECT * FROM users;

# View companies
SELECT * FROM companies;

# Exit
\q
```

### 3. Test Image Upload

1. Login to dashboard
2. Go to **Company Info** tab
3. Upload logo (drag & drop or click)
4. Check Cloudinary dashboard for uploaded image

## 🐛 Troubleshooting

### Backend Won't Start

**Error: Database connection failed**
```bash
# Check PostgreSQL is running
# Windows
Get-Service postgresql-x64-15

# macOS/Linux
sudo service postgresql status

# Verify credentials
psql -U postgres -d bluestock_company
```

**Error: Port 5000 already in use**
```bash
# Change PORT in backend/.env
PORT=5001

# Update frontend/.env
VITE_API_URL=http://localhost:5001/api
```

### Frontend Won't Start

**Error: Cannot find module**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: CORS policy**
- Verify backend `FRONTEND_URL` matches frontend port
- Restart both servers

### Migration Fails

**Error: relation already exists**
```bash
# Drop all tables and re-migrate
psql -U postgres -d bluestock_company

DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS otp_verifications CASCADE;
DROP TABLE IF EXISTS social_media_links CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

\q

npm run migrate
```

### OTP Not Working

**In Development:**
- OTP is logged to backend console
- Copy the 6-digit code from terminal
- Paste in OTP dialog

**For Production:**
- Ensure Firebase Phone Auth is enabled
- Add phone number to Firebase test numbers (optional)
- Check Firebase quotas

### Images Not Uploading

**Check Cloudinary:**
- Verify credentials in `.env`
- Check Cloudinary dashboard for errors
- Ensure upload preset allows unsigned uploads

## 🚀 Production Deployment

### Backend (Railway/Render)

1. Create account on [Railway](https://railway.app) or [Render](https://render.com)
2. Create new PostgreSQL database
3. Create new web service
4. Connect GitHub repository
5. Set environment variables from `.env`
6. Set build command: `cd backend && npm install`
7. Set start command: `cd backend && npm start`
8. Deploy

### Frontend (Vercel/Netlify)

1. Create account on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Import repository
3. Set root directory: `frontend`
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variable: `VITE_API_URL=https://your-backend.railway.app/api`
7. Deploy

## 📞 Support

If you encounter issues:

1. Check error messages in browser console (F12)
2. Check backend terminal for errors
3. Verify all environment variables
4. Ensure PostgreSQL is running
5. Check network requests in browser DevTools

## ✅ Installation Complete!

You should now have:
- ✅ Backend running on `http://localhost:5000`
- ✅ Frontend running on `http://localhost:5173`
- ✅ Database created and migrated
- ✅ Firebase and Cloudinary configured
- ✅ Full authentication flow working
- ✅ Company setup form functional

**Next:** Start developing features or deploy to production!
