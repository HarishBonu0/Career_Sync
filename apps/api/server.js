import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongo, isMongoConnected } from './db/mongo.js';
import { getCorsOrigins } from './config/urls.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on('uncaughtException', (err) => {
  console.error('FATAL UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('FATAL UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

// Load environment variables from the backend folder
dotenv.config({ path: path.join(__dirname, '.env') });

// Import routes
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import roadmapRoutes from './routes/roadmaps.js';
import skillEvalRoutes from './routes/skillEval.js';
import profileRoutes from './routes/profile.js';
import courseGenRoutes from './routes/course-generation-v2.js';
import resumeRoutes from './routes/resume.js';
import skillGapsRoutes from './routes/skillGaps.js';

const app = express();
const PORT = process.env.PORT || 5000;

const DEFAULT_JWT = 'your-secret-key-change-in-production';
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_JWT)) {
  console.error('❌ JWT_SECRET must be set to a strong value in production');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = getCorsOrigins();
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowed.includes(cleanOrigin) || allowed.includes(origin)) return callback(null, true);
    // Automatically allow Vercel production and preview domains
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') {
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('192.168.') ||
        origin.includes('10.') ||
        origin.includes('172.')
      ) {
        return callback(null, true);
      }
    }
    callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
// Basic security headers
app.use(helmet());

// Trust reverse proxy (e.g. Vercel, Heroku, Nginx) so rate limiter gets correct client IP
app.set('trust proxy', 1);

// Simple rate limiter to protect public endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SkillRoute Backend is running',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'not set',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      mongodbConfigured: isMongoConnected(),
      mongodbUriSet: !!process.env.MONGODB_URI,
      jwtConfigured: !!process.env.JWT_SECRET
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/skills', skillEvalRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/skill-gaps', skillGapsRoutes);
// Mount specialized generation routes at /api to expose /api/generate-course-v2
app.use('/api', courseGenRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: isProduction ? 'An unexpected internal error occurred.' : err.message
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

connectMongo().then((connected) => {
  if (process.env.NODE_ENV === 'production' && !connected) {
    console.error('❌ MongoDB connection required in production. Exiting.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.info(`\n🚀 Career Sync Backend running on port ${PORT}`);
    console.info(`📡 API endpoint: http://localhost:${PORT}`);
    console.info(`✅ CORS enabled for frontend origins`);
    if (connected) {
      console.info(`✅ MongoDB: Connected`);
    } else {
      console.warn(`⚠️  MongoDB: Not connected (using localStorage only)`);
      console.info(`🔧 Fix MongoDB: https://cloud.mongodb.com/`);
    }
    console.info(`⏰ Server started at ${new Date().toISOString()}\n`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
