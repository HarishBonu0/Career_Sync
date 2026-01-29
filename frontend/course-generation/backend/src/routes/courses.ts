import { Router } from 'express';
import {
  getAllCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getUserEnrollments,
  checkEnrollment,
} from '../controllers/courseController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const createCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  journey_id: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
  topic_ids: z.array(z.string()).optional(),
});

router.get('/', getAllCourses);
router.get('/:slug', getCourseBySlug);

// Protected routes - educator/admin only
router.post(
  '/',
  authenticateToken,
  requireRole('educator', 'admin'),
  validate(createCourseSchema),
  createCourse
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('educator', 'admin'),
  updateCourse
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('educator', 'admin'),
  deleteCourse
);

// Enrollment routes
router.post('/:courseId/enroll', authenticateToken, enrollInCourse);
router.get('/enrollments/my', authenticateToken, getUserEnrollments);
router.get('/:courseId/enrollment/check', authenticateToken, checkEnrollment);

export default router;
