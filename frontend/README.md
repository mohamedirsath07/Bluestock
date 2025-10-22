# Bluestock Company Management System - Frontend

Modern React frontend application built with Vite, Material-UI, Redux Toolkit, and React Query.

## 🚀 Features

- **Multi-step Registration** with react-hook-form validation
- **Dashboard** with tabbed navigation for company setup
- **Redux Toolkit** for state management
- **React Query** for API calls and caching
- **Material-UI (MUI)** components with custom theme
- **Responsive Design** with mobile support
- **Toast Notifications** for user feedback
- **Image Upload** with drag-and-drop support
- **Phone Number Validation** (libphonenumber-js)
- **Firebase Integration** for OTP verification

## 📋 Prerequisites

- Node.js 18.x or later
- npm or yarn
- Backend API running on `http://localhost:5000`

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API service layer
│   │   ├── axios.js    # Axios configuration
│   │   └── services.js # API endpoints
│   ├── components/     # Reusable components
│   │   ├── ProtectedRoute.jsx
│   │   └── ImageUploader.jsx
│   ├── pages/          # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   ├── store/          # Redux store
│   │   ├── index.js
│   │   ├── authSlice.js
│   │   └── companySlice.js
│   ├── styles/         # Global styles
│   │   ├── theme.js
│   │   └── global.css
│   ├── App.jsx         # Main app with routing
│   └── main.jsx        # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Key Technologies

### Core
- **React 18.2** - UI library
- **Vite 5.0** - Build tool and dev server
- **React Router DOM 6.20** - Routing

### State Management
- **Redux Toolkit 1.9** - State management
- **React Redux 8.1** - React bindings for Redux

### UI & Styling
- **Material-UI (MUI) 5.15** - Component library
- **@emotion** - CSS-in-JS styling
- **React Toastify 9.1** - Toast notifications

### Forms & Validation
- **React Hook Form 7.48** - Form management
- **libphonenumber-js 1.10** - Phone validation

### API & Data
- **@tanstack/react-query 5.12** - API state management
- **Axios 1.6** - HTTP client

### Other
- **Firebase 10.7** - Authentication & OTP
- **react-responsive 9.0** - Responsive utilities

## 🔑 Key Features

### Authentication Flow
1. **Registration**: Email, phone, password validation
2. **OTP Verification**: SMS OTP sent via Firebase
3. **Login**: JWT token-based authentication
4. **Protected Routes**: Automatic redirect for unauthorized users

### Company Setup (Multi-step Form)
1. **Company Info**: Logo, banner, name, about us
2. **Founding Info**: Organization type, industry, team size, year, website, vision
3. **Social Media**: Platform links (coming soon)
4. **Contact**: Location, phone, email

### Progress Tracking
- Real-time setup progress calculation
- Visual progress bar in header
- Auto-save on input changes

## 🎯 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🔐 Authentication

The app uses JWT tokens stored in localStorage:
- Tokens are automatically attached to API requests
- Auto-redirect to login on 401 responses
- Token expiry: 90 days

## 📡 API Integration

All API calls are managed through:
- **Axios instance** with interceptors (`src/api/axios.js`)
- **API services** with typed endpoints (`src/api/services.js`)
- **React Query** for caching and state management

Example API call:
```javascript
const { data } = useQuery({
  queryKey: ['company'],
  queryFn: companyAPI.getCompany,
});
```

## 🎨 Theming

Custom Material-UI theme (`src/styles/theme.js`):
- Primary color: `#3B82F6` (Blue)
- Secondary color: `#8B5CF6` (Purple)
- Custom typography with Inter font
- Custom component overrides

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints handled by MUI Grid system
- Responsive navigation and forms

## 🔧 Development Tips

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add to protected routes if authentication required

### Adding New API Endpoints
1. Add method to `src/api/services.js`
2. Use React Query hooks in components
3. Handle loading/error states

### State Management
- Use Redux for global app state (auth, company)
- Use React Query for server state (API data)
- Use component state for local UI state

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Verify backend CORS configuration

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Proxy Issues
- Vite proxy configured in `vite.config.js`
- Check backend server is running

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

## 📄 Environment Variables

Required variables in `.env`:
- `VITE_API_URL` - Backend API URL

Optional (if using Firebase directly):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`

## 🤝 Contributing

1. Follow existing code structure
2. Use functional components with hooks
3. Add PropTypes for components
4. Write meaningful commit messages

## 📝 License

ISC
