import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import journeyRoutes from './routes/journeys';
import courseRoutes from './routes/courses';
import topicRoutes from './routes/topics';
import { errorHandler, notFound } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/learning-journeys', journeyRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/topics', topicRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
