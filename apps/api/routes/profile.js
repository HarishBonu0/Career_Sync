import express from 'express';
import mongoose from 'mongoose';
import UserEnrollment from '../models/UserEnrollment.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Roadmap from '../models/Roadmap.js';
import SkillEvaluation from '../models/SkillEvaluation.js';
import SkillProfile from '../models/SkillProfile.js';
import { authenticate } from '../middleware/auth.js';
import { userOwnsParam, withAuthenticatedUser } from '../utils/requestUser.js';
import { body, param, validationResult } from 'express-validator';
import { requireMongo } from '../middleware/mongoCheck.js';

const router = express.Router();

// Enroll in a course
router.post(
  '/enroll/course',
  authenticate,
  requireMongo,
  body('courseTitle').isString().trim().isLength({ min: 1 }).withMessage('courseTitle is required'),
  body('courseId').optional().isString(),
  body('courseModuleCount').optional().isInt({ min: 0 }),
  body('courseModules').optional().custom((value) => Array.isArray(value) || Number.isInteger(value)).withMessage('courseModules must be an array or module count'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { courseId, courseTitle, courseModuleCount, courseModules } = req.body;
      const { userId, userEmail } = withAuthenticatedUser(req, {});
      const user = req.user.id;
      let course = null;

      if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
        course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        if (course.user && course.user.toString() !== user.toString()) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }

      const moduleCount = Number.isInteger(courseModuleCount)
        ? courseModuleCount
        : Array.isArray(courseModules)
          ? courseModules.length
          : Number.isInteger(courseModules)
            ? courseModules
            : course?.modules?.length || 0;

    // Check if already enrolled
    const existing = await UserEnrollment.findOne({
      user,
      type: 'course',
      $or: [
        ...(courseId ? [{ courseId }] : []),
        ...(course ? [{ course: course._id }] : []),
        { courseTitle },
      ],
    });

    if (existing) {
      return res.json({ 
        success: true, 
        message: 'Already enrolled', 
        enrollment: existing 
      });
    }

    const enrollment = await UserEnrollment.create({
      user,
      userId,
      userEmail,
      course: course?._id,
      courseId,
      courseTitle,
      courseModules: Array.isArray(courseModules) ? courseModules : undefined,
      courseModuleCount: moduleCount,
      courseProgress: 0,
      type: 'course',
    });

    res.json({ 
      success: true, 
      message: 'Course enrolled successfully', 
      enrollment 
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enroll in a roadmap
router.post(
  '/enroll/roadmap',
  authenticate,
  requireMongo,
  body('roadmapTitle').isString().trim().isLength({ min: 1 }).withMessage('roadmapTitle is required'),
  body('roadmapId').optional().isString(),
  body('roadmapStages').optional().custom((value) => Array.isArray(value) || Number.isInteger(value)).withMessage('roadmapStages must be an array or stage count'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { roadmapId, roadmapTitle, roadmapStages } = req.body;
      const { userId, userEmail } = withAuthenticatedUser(req, {});
      const user = req.user.id;
      let roadmap = null;

      if (roadmapId && mongoose.Types.ObjectId.isValid(roadmapId)) {
        roadmap = await Roadmap.findById(roadmapId);
        if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });
        if (roadmap.user && roadmap.user.toString() !== user.toString()) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }

      const stageCount = Array.isArray(roadmapStages)
        ? roadmapStages.length
        : Number.isInteger(roadmapStages)
          ? roadmapStages
          : roadmap?.stages || 0;

    const existing = await UserEnrollment.findOne({
      user,
      type: 'roadmap',
      $or: [
        ...(roadmapId ? [{ roadmapId }] : []),
        ...(roadmap ? [{ roadmap: roadmap._id }] : []),
        { roadmapTitle },
      ],
    });

    if (existing) {
      return res.json({ 
        success: true, 
        message: 'Already enrolled', 
        enrollment: existing 
      });
    }

    const enrollment = await UserEnrollment.create({
      user,
      userId,
      userEmail,
      roadmap: roadmap?._id,
      roadmapId,
      roadmapTitle,
      roadmapStages: stageCount,
      roadmapCreatedAt: new Date(),
      type: 'roadmap',
    });

    res.json({ 
      success: true, 
      message: 'Roadmap saved successfully', 
      enrollment 
    });
  } catch (error) {
    console.error('Roadmap enrollment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user profile with all enrollments
router.get('/:userId', authenticate, requireMongo, param('userId').isString().isLength({ min: 1 }).withMessage('userId required'), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const requestedUserId = req.params.userId === 'me' ? req.user.id.toString() : req.params.userId;
    const userId = requestedUserId;

    if (!userOwnsParam(req, userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    console.log('Fetching profile for userId:', userId);

    // Determine if userId is an ObjectId or string identifier
    let userQuery = {};
    let isObjectId = mongoose.Types.ObjectId.isValid(userId) && userId !== 'guest';
    
    if (isObjectId) {
      userQuery = { _id: userId };
    } else if (userId.includes('@')) {
      userQuery = { email: userId };
    } else {
      userQuery = { _id: userId }; // Try as ObjectId anyway
    }

    // Try to get user info
    let user = null;
    try {
      user = await User.findOne(userQuery);
    } catch (err) {
      console.log('User not found in User collection:', err.message);
    }

    // Build query for finding user's data
    let dataQuery = {};
    if (isObjectId && user) {
      dataQuery = { $or: [{ user: userId }, { userId: userId }, { userEmail: user.email }] };
    } else if (userId.includes('@')) {
      dataQuery = { $or: [{ userEmail: userId }, { userId: userId }] };
    } else {
      dataQuery = { $or: [{ userId: userId }, { userEmail: userId }] };
    }

    console.log('Data query:', JSON.stringify(dataQuery));

    // Get data from actual collections (not just enrollments)
    const [courses, roadmaps, evaluations, enrollmentCourses, enrollmentRoadmaps, enrollmentEvaluations, skillProfile] = await Promise.all([
      Course.find(dataQuery).sort({ createdAt: -1 }).lean(),
      Roadmap.find(dataQuery).sort({ createdAt: -1 }).lean(),
      SkillEvaluation.find(dataQuery).sort({ createdAt: -1 }).lean(),
      UserEnrollment.find({ ...dataQuery, type: 'course' }).sort({ createdAt: -1 }).lean(),
      UserEnrollment.find({ ...dataQuery, type: 'roadmap' }).sort({ createdAt: -1 }).lean(),
      UserEnrollment.find({ ...dataQuery, type: 'evaluation' }).sort({ createdAt: -1 }).lean(),
      SkillProfile.findOne({ user: req.user.id }).lean(),
    ]);

    console.log('Found:', { 
      courses: courses.length, 
      roadmaps: roadmaps.length, 
      evaluations: evaluations.length,
      enrollmentCourses: enrollmentCourses.length,
      enrollmentRoadmaps: enrollmentRoadmaps.length,
      enrollmentEvaluations: enrollmentEvaluations.length
    });

    // Combine enrollment data with actual data
    const allCourses = [...courses, ...enrollmentCourses.map(e => ({
      _id: e.courseId || e._id,
      title: e.courseTitle,
      modules: e.courseModules,
      progress: e.courseProgress,
      enrolledAt: e.courseEnrolledAt,
      completed: e.courseCompleted,
      source: 'enrollment'
    }))];

    const allRoadmaps = [...roadmaps, ...enrollmentRoadmaps.map(e => ({
      _id: e.roadmapId || e._id,
      title: e.roadmapTitle,
      stages: e.roadmapStages,
      progress: e.roadmapProgress,
      createdAt: e.roadmapCreatedAt,
      source: 'enrollment'
    }))];

    const allEvaluations = [...evaluations, ...enrollmentEvaluations.map(e => ({
      _id: e.evaluationId || e._id,
      title: e.evaluationTitle,
      skillName: e.evaluationTitle,
      score: e.evaluationScore,
      completedAt: e.evaluationCompletedAt,
      source: 'enrollment'
    }))];

    // Remove duplicates
    const uniqueCourses = Array.from(new Map(allCourses.map(c => [c._id?.toString() || c.title, c])).values());
    const uniqueRoadmaps = Array.from(new Map(allRoadmaps.map(r => [r._id?.toString() || r.title, r])).values());
    const uniqueEvaluations = Array.from(new Map(allEvaluations.map(e => [e._id?.toString() || e.title, e])).values());

    res.json({
      success: true,
      profile: {
        userId,
        name: user?.name || 'User',
        email: user?.email || userId,
        stats: {
          totalCourses: uniqueCourses.length,
          totalRoadmaps: uniqueRoadmaps.length,
          totalEvaluations: uniqueEvaluations.length,
          activeDays: user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0
        },
        courses: uniqueCourses.map(c => ({
          id: c._id,
          title: c.title,
          description: c.description,
          level: c.level || c.difficulty,
          duration: c.duration,
          modules: c.modules || c.totalModules,
          totalModules: c.totalModules || (Array.isArray(c.modules) ? c.modules.length : 0),
          progress: c.progress ?? 0,
          enrolledAt: c.enrolledAt || c.createdAt,
          lastAccessed: c.lastAccessedAt || c.lastAccessed,
          completed: c.completed || c.status === 'completed',
          status: c.status
        })),
        roadmaps: uniqueRoadmaps.map(r => ({
          id: r._id,
          title: r.title,
          description: r.description,
          currentRole: r.currentRole,
          targetRole: r.targetRole,
          timeline: r.timeline,
          stages: r.stages || 0,
          progress: r.progress || 0,
          createdAt: r.createdAt,
          status: r.status
        })),
        evaluations: uniqueEvaluations.map(e => ({
          id: e._id,
          title: e.title || e.skillName,
          skillName: e.skillName,
          difficulty: e.difficulty,
          score: e.score,
          percentage: e.percentage,
          totalQuestions: e.totalQuestions,
          correctAnswers: e.correctAnswers,
          completedAt: e.completedAt,
          status: e.status
        })),
        skillProfile: skillProfile || { user: req.user.id, skills: [] }
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update course progress
router.put(
  '/progress/course/:enrollmentId',
  authenticate,
  param('enrollmentId').isMongoId().withMessage('Invalid enrollment id'),
  body('progress').isNumeric().withMessage('progress must be numeric').custom((v) => v >= 0 && v <= 100).withMessage('progress must be 0-100'),
  body('completed').optional().isBoolean(),
  body('completedModules').optional().isArray(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { enrollmentId } = req.params;
      const { progress, completed, completedModules } = req.body;

    const enrollment = await UserEnrollment.findOneAndUpdate(
      { _id: enrollmentId, user: req.user.id },
      {
        courseProgress: progress,
        courseCompleted: completed,
        completedModules: completedModules || [],
        currentModule: completedModules?.length || 0,
        courseCompletedAt: completed ? new Date() : null,
        courseLastAccessed: new Date(),
        'metadata.completedModules': completedModules || [],
      },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({ success: true, enrollment });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update roadmap progress
router.put(
  '/progress/roadmap/:enrollmentId',
  authenticate,
  param('enrollmentId').isMongoId().withMessage('Invalid enrollment id'),
  body('progress').isNumeric().withMessage('progress must be numeric').custom((v) => v >= 0 && v <= 100).withMessage('progress must be 0-100'),
  body('completedStages').optional().isArray(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { enrollmentId } = req.params;
      const { progress, completedStages } = req.body;

    const enrollment = await UserEnrollment.findOneAndUpdate(
      { _id: enrollmentId, user: req.user.id },
      {
        roadmapProgress: progress,
        'metadata.completedStages': completedStages,
        'metadata.lastUpdated': new Date(),
      },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({ success: true, enrollment });
  } catch (error) {
    console.error('Roadmap progress update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit skill evaluation/test
router.post(
  '/evaluation/submit',
  authenticate,
  body('evaluationTitle').optional().isString(),
  body('score').isNumeric().withMessage('score is required'),
  body('totalQuestions').optional().isInt(),
  body('correctAnswers').optional().isInt(),
  body('timeTaken').optional().isNumeric(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { evaluationTitle, score, totalQuestions, correctAnswers, timeTaken } = req.body;
      const { userId, userEmail, user } = withAuthenticatedUser(req, {});

    const enrollment = await UserEnrollment.create({
      user,
      userId,
      userEmail,
      evaluationTitle,
      evaluationScore: score,
      evaluationCompletedAt: new Date(),
      type: 'evaluation',
      metadata: {
        totalQuestions,
        correctAnswers,
        timeTaken
      }
    });

    res.json({ 
      success: true, 
      message: 'Evaluation submitted successfully', 
      enrollment 
    });
  } catch (error) {
    console.error('Evaluation submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
