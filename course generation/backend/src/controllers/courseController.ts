import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db/connection';
import { ApiError } from '../middleware/errorHandler';
import { nanoid } from 'nanoid';
import { generateUniqueSlug } from '../utils/slugify';

// Mock enrollment store for development (when database is not available)
const mockEnrollments = new Map<string, any>();

export const getAllCourses = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 30, journeyId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT c.*, u.name as creator_name, u.avatar_url as creator_avatar
      FROM courses c
      LEFT JOIN users u ON c.creator_id = u.id
    `;

    const params: any[] = [limit, offset];
    
    if (journeyId) {
      queryText += ' WHERE c.journey_id = $3';
      params.push(journeyId);
    }

    queryText += ' ORDER BY c.published_date DESC LIMIT $1 OFFSET $2';

    const result = await query(queryText, params);

    const countQuery = journeyId
      ? 'SELECT COUNT(*) FROM courses WHERE journey_id = $1'
      : 'SELECT COUNT(*) FROM courses';
    
    const countParams = journeyId ? [journeyId] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        courses: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getCourseBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await query(
      `SELECT c.*, u.name as creator_name, u.avatar_url as creator_avatar,
              j.title as journey_title, j.slug as journey_slug
       FROM courses c
       LEFT JOIN users u ON c.creator_id = u.id
       LEFT JOIN learning_journeys j ON c.journey_id = j.id
       WHERE c.slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Course not found');
    }

    const course = result.rows[0];

    // Get topics for this course
    const topicsResult = await query(
      `SELECT t.* FROM topics t
       INNER JOIN course_topics ct ON t.id = ct.topic_id
       WHERE ct.course_id = $1`,
      [course.id]
    );

    course.topics = topicsResult.rows;

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    throw error;
  }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, journey_id, thumbnail_url, topic_ids } =
      req.body;

    const courseId = nanoid();
    const slug = generateUniqueSlug(title, courseId);
    const creatorId = req.user!.id;

    const result = await query(
      `INSERT INTO courses 
       (id, title, slug, description, published_date, creator_id, journey_id, thumbnail_url)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)
       RETURNING *`,
      [courseId, title, slug, description, creatorId, journey_id, thumbnail_url]
    );

    const course = result.rows[0];

    // Add topics if provided
    if (topic_ids && topic_ids.length > 0) {
      for (const topicId of topic_ids) {
        await query(
          'INSERT INTO course_topics (course_id, topic_id) VALUES ($1, $2)',
          [courseId, topicId]
        );
      }
    }

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    throw error;
  }
};

export const updateCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, journey_id, thumbnail_url, topic_ids } =
      req.body;

    // Check if course exists and user is the creator
    const checkResult = await query(
      'SELECT creator_id FROM courses WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      throw new ApiError(404, 'Course not found');
    }

    if (checkResult.rows[0].creator_id !== req.user!.id) {
      throw new ApiError(403, 'Not authorized to update this course');
    }

    const slug = title ? generateUniqueSlug(title, id) : undefined;

    const result = await query(
      `UPDATE courses 
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           journey_id = COALESCE($4, journey_id),
           thumbnail_url = COALESCE($5, thumbnail_url),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, slug, description, journey_id, thumbnail_url, id]
    );

    // Update topics if provided
    if (topic_ids) {
      await query('DELETE FROM course_topics WHERE course_id = $1', [id]);
      for (const topicId of topic_ids) {
        await query(
          'INSERT INTO course_topics (course_id, topic_id) VALUES ($1, $2)',
          [id, topicId]
        );
      }
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    throw error;
  }
};

export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if course exists and user is the creator
    const checkResult = await query(
      'SELECT creator_id FROM courses WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      throw new ApiError(404, 'Course not found');
    }

    if (checkResult.rows[0].creator_id !== req.user!.id) {
      throw new ApiError(403, 'Not authorized to delete this course');
    }

    await query('DELETE FROM courses WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

export const enrollInCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.id;
    const enrollmentKey = `${userId}-${courseId}`;

    // Check if already enrolled in mock store
    if (mockEnrollments.has(enrollmentKey)) {
      return res.json({
        success: true,
        message: 'Already enrolled in this course',
        data: { alreadyEnrolled: true },
      });
    }

    // Try database first
    try {
      // Check if course exists
      const courseResult = await query(
        'SELECT id, title FROM courses WHERE id = $1',
        [courseId]
      );

      if (courseResult.rows.length === 0) {
        throw new ApiError(404, 'Course not found');
      }

      // Check if already enrolled
      const existingEnrollment = await query(
        'SELECT id FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, courseId]
      );

      if (existingEnrollment.rows.length > 0) {
        return res.json({
          success: true,
          message: 'Already enrolled in this course',
          data: { alreadyEnrolled: true },
        });
      }

      // Create enrollment
      const enrollmentId = nanoid();
      await query(
        `INSERT INTO course_enrollments (id, user_id, course_id, enrolled_at, progress)
         VALUES ($1, $2, $3, NOW(), 0)`,
        [enrollmentId, userId, courseId]
      );

      res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        data: { 
          enrollmentId,
          courseTitle: courseResult.rows[0].title,
        },
      });
    } catch (dbError) {
      // Fallback to mock store if database unavailable
      console.log('Using mock enrollment store');
      
      const enrollmentId = nanoid();
      const enrollment = {
        id: enrollmentId,
        userId,
        courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completedAt: null,
      };
      
      mockEnrollments.set(enrollmentKey, enrollment);
      
      res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        data: { 
          enrollmentId,
          courseTitle: 'Mock Course',
        },
      });
    }
  } catch (error) {
    throw error;
  }
};

export const getUserEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    try {
      const result = await query(
        `SELECT c.*, ce.enrolled_at, ce.progress, ce.completed_at,
                u.name as creator_name, u.avatar_url as creator_avatar
         FROM course_enrollments ce
         INNER JOIN courses c ON ce.course_id = c.id
         LEFT JOIN users u ON c.creator_id = u.id
         WHERE ce.user_id = $1
         ORDER BY ce.enrolled_at DESC`,
        [userId]
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (dbError) {
      // Fallback to mock store
      console.log('Using mock enrollment store for getUserEnrollments');
      const userEnrollments: any[] = [];
      
      mockEnrollments.forEach((enrollment, key) => {
        if (enrollment.userId === userId) {
          userEnrollments.push({
            id: enrollment.id,
            title: `Course ${enrollment.courseId}`,
            slug: `course-${enrollment.courseId}`,
            description: 'This is a mock course enrollment',
            thumbnail_url: null,
            enrolled_at: enrollment.enrolledAt,
            progress: enrollment.progress,
            completed_at: enrollment.completedAt,
            creator_name: 'Mock Creator',
          });
        }
      });

      res.json({
        success: true,
        data: userEnrollments,
      });
    }
  } catch (error) {
    throw error;
  }
};

export const checkEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.id;
    const enrollmentKey = `${userId}-${courseId}`;

    try {
      const result = await query(
        'SELECT id, progress, enrolled_at, completed_at FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, courseId]
      );

      res.json({
        success: true,
        data: {
          isEnrolled: result.rows.length > 0,
          enrollment: result.rows[0] || null,
        },
      });
    } catch (dbError) {
      // Fallback to mock store
      console.log('Using mock enrollment store for checkEnrollment');
      const enrollment = mockEnrollments.get(enrollmentKey);
      
      res.json({
        success: true,
        data: {
          isEnrolled: !!enrollment,
          enrollment: enrollment || null,
        },
      });
    }
  } catch (error) {
    throw error;
  }
};
