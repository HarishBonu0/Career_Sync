import { Router } from 'express';
import {
  getAllJourneys,
  getJourneyBySlug,
  createJourney,
  updateJourney,
  deleteJourney,
} from '../controllers/journeyController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const createJourneySchema = z.object({
  title: z.string().min(3),
  subtitle: z.string().optional(),
  description: z.string().min(10),
  who_is_for: z.string().optional(),
  who_is_not_for: z.string().optional(),
  start_date: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
});

router.get('/', getAllJourneys);
router.get('/:slug', getJourneyBySlug);

// Protected routes - educator/admin only
router.post(
  '/',
  authenticateToken,
  requireRole('educator', 'admin'),
  validate(createJourneySchema),
  createJourney
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('educator', 'admin'),
  updateJourney
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('educator', 'admin'),
  deleteJourney
);

export default router;
