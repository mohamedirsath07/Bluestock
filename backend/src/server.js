import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Slow down repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes
  delayMs: 500, // Add 500ms delay per request after limit
});

app.use('/api/', speedLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   🚀 Bluestock Backend Server Started       ║
║                                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                     ║
║   Port: ${PORT}                                ║
║   API: http://localhost:${PORT}/api           ║
║                                              ║
║   Endpoints:                                 ║
║   • POST /api/auth/register                  ║
║   • POST /api/auth/login                     ║
║   • GET  /api/auth/me                        ║
║   • POST /api/auth/otp/send                  ║
║   • POST /api/auth/otp/verify                ║
║   • GET  /api/company                        ║
║   • PUT  /api/company                        ║
║   • POST /api/company/upload                 ║
║   • POST /api/company/social                 ║
║   • DEL  /api/company/social/:id             ║
║                                              ║
╚══════════════════════════════════════════════╝
  `);
});

export default app;
