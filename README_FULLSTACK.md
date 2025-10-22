# Bluestock Company Management System

Full-stack company profile management application with authentication, multi-step forms, and image uploads.

## 🏗️ Architecture

```
Bluestock/
├── backend/           # Node.js + Express + PostgreSQL
├── frontend/          # React + Vite + Material-UI
└── src/              # Legacy vanilla JS (deprecated)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x LTS
- PostgreSQL 15
- Firebase account (for OTP)
- Cloudinary account (for images)

### 1. Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Create database
psql -U postgres -c "CREATE DATABASE bluestock_company;"

# Run migrations
npm run migrate

# Start server
npm run dev
```

Backend runs on `http://localhost:5000`

### 2. Setup Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env (default API URL is already set)

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📚 Documentation

- [Backend README](./backend/README.md) - API documentation, endpoints, database schema
- [Frontend README](./frontend/README.md) - Component structure, routing, state management

## 🎯 Features

### Authentication
- ✅ Email/Password registration
- ✅ Phone verification via SMS OTP (Firebase)
- ✅ JWT-based authentication (90-day validity)
- ✅ Protected routes

### Company Management
- ✅ Multi-step form (Company Info, Founding Info, Social Media, Contact)
- ✅ Image uploads (Logo & Banner) via Cloudinary
- ✅ Real-time progress tracking
- ✅ Auto-save functionality
- ✅ Drag-and-drop image upload

### Tech Stack

#### Backend
- Node.js 20.x + Express
- PostgreSQL 15
- JWT + bcrypt
- Firebase Admin SDK
- Cloudinary
- Input validation & sanitization

#### Frontend
- React 18 + Vite
- Redux Toolkit + React Query
- Material-UI (MUI)
- React Hook Form
- Axios

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      # Register user
POST   /api/auth/login         # Login
GET    /api/auth/me            # Get current user
POST   /api/auth/otp/send      # Send OTP
POST   /api/auth/otp/verify    # Verify OTP
```

### Company
```
GET    /api/company            # Get company data
PUT    /api/company            # Update company
POST   /api/company/upload     # Upload images
POST   /api/company/social     # Add social link
DELETE /api/company/social/:id # Delete social link
```

## 🗄️ Database Schema

### Tables
- `users` - User accounts and authentication
- `companies` - Company profile information
- `social_media_links` - Social media profiles
- `otp_verifications` - OTP codes for phone verification
- `sessions` - User sessions (optional)

See [backend/database/schema.sql](./backend/database/schema.sql) for full schema.

## 🔐 Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bluestock_company
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES_IN=90d

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 User Flow

1. **Register** → Enter email, phone, password
2. **Verify OTP** → Receive SMS code, verify phone
3. **Dashboard** → Redirected to company setup
4. **Setup Company** → Fill multi-step form
   - Company Info (logo, banner, name, about)
   - Founding Info (type, industry, size, year, website, vision)
   - Social Media (platforms and links)
   - Contact (location, phone, email)
5. **Progress Tracking** → See completion percentage
6. **Save & Navigate** → Auto-save, move between sections

## 🛠️ Development

### Start Both Servers
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Database Migrations
```bash
cd backend
npm run migrate
```

### Build for Production
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 🔍 Testing

### Test Backend API
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234","phone":"+1234567890"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

## 🚀 Deployment

### Backend (Node.js)
- Deploy to: Heroku, Railway, Render, DigitalOcean
- Set environment variables
- Run migrations on production database

### Frontend (React)
- Deploy to: Vercel, Netlify, Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`

### Database
- PostgreSQL on: Supabase, Railway, Neon, AWS RDS

## 📝 Next Steps

- [ ] Implement social media links CRUD in frontend
- [ ] Add email verification
- [ ] Add forgot password functionality
- [ ] Add company profile public view
- [ ] Add analytics dashboard
- [ ] Add team member management
- [ ] Add file upload for additional documents
- [ ] Add search and filter for companies (admin)

## 🐛 Common Issues

### CORS Error
- Check backend CORS configuration
- Verify `FRONTEND_URL` in backend `.env`
- Ensure both servers are running

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### OTP Not Received
- In development, OTP is logged to console
- Check Firebase configuration
- Verify phone number format (+country code)

## 📄 License

ISC

## 👨‍💻 Author

Mohamed Irsath

## 🙏 Acknowledgments

- Bluestock Fintech for the internship opportunity
- Assignment requirements and design references
