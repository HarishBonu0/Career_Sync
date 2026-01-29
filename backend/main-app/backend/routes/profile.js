import express from 'express';
import UserEnrollment from '../models/UserEnrollment.js';
import User from '../models/User.js';

const router = express.Router();

// Enroll in a course
router.post('/enroll/course', async (req, res) => {
  try {
    const { userId, userEmail, courseId, courseTitle, courseModules } = req.body;

    if (!userId && !userEmail) {
      return res.status(400).json({ error: 'User ID or email required' });
    }

    // Check if already enrolled
    const existing = await UserEnrollment.findOne({
      $or: [{ userId }, { userEmail }],
      courseTitle,
      type: 'course'
    });

    if (existing) {
      return res.json({ 
        success: true, 
        message: 'Already enrolled', 
        enrollment: existing 
      });
    }

    const enrollment = await UserEnrollment.create({
      userId,
      userEmail,
      courseId,
      courseTitle,
      courseModules,
      courseProgress: 0,
      type: 'course'
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
router.post('/enroll/roadmap', async (req, res) => {
  try {
    const { userId, userEmail, roadmapId, roadmapTitle, roadmapStages } = req.body;

    if (!userId && !userEmail) {
      return res.status(400).json({ error: 'User ID or email required' });
    }

    const existing = await UserEnrollment.findOne({
      $or: [{ userId }, { userEmail }],
      roadmapTitle,
      type: 'roadmap'
    });

    if (existing) {
      return res.json({ 
        success: true, 
        message: 'Already enrolled', 
        enrollment: existing 
      });
    }

    const enrollment = await UserEnrollment.create({
      userId,
      userEmail,
      roadmapId,
      roadmapTitle,
      roadmapStages,
      roadmapCreatedAt: new Date(),
      type: 'roadmap'
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
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get enrollments by userId or email
    const courses = await UserEnrollment.find({
      $or: [{ userId }, { userEmail: userId }],
      type: 'course'
    }).sort({ createdAt: -1 });

    const roadmaps = await UserEnrollment.find({
      $or: [{ userId }, { userEmail: userId }],
      type: 'roadmap'
    }).sort({ createdAt: -1 });

    const evaluations = await UserEnrollment.find({
      $or: [{ userId }, { userEmail: userId }],
      type: 'evaluation'
    }).sort({ createdAt: -1 });

    // Try to get user info
    let user = await User.findById(userId);
    if (!user && userId.includes('@')) {
      user = await User.findOne({ email: userId });
    }

    res.json({
      success: true,
      profile: {
        userId,
        name: user?.name || 'User',
        email: user?.email || userId,
        stats: {
          totalCourses: courses.length,
          totalRoadmaps: roadmaps.length,
          totalEvaluations: evaluations.length,
          activeDays: Math.floor((Date.now() - (user?.createdAt || Date.now())) / (1000 * 60 * 60 * 24))
        },
        courses: courses.map(c => ({
          id: c.courseId,
          title: c.courseTitle,
          modules: c.courseModules,
          progress: c.courseProgress,
          enrolledAt: c.courseEnrolledAt,
          lastAccessed: c.courseLastAccessed,
          completed: c.courseCompleted
        })),
        roadmaps: roadmaps.map(r => ({
          id: r.roadmapId,
          title: r.roadmapTitle,
          stages: r.roadmapStages,
          progress: r.roadmapProgress,
          createdAt: r.roadmapCreatedAt
        })),
        evaluations: evaluations.map(e => ({
          id: e.evaluationId,
          title: e.evaluationTitle,
          score: e.evaluationScore,
          completedAt: e.evaluationCompletedAt
        }))
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update course progress
router.put('/progress/course/:enrollmentId', async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progress, completed, completedModules } = req.body;

    const enrollment = await UserEnrollment.findByIdAndUpdate(
      enrollmentId,
      {
        courseProgress: progress,
        courseCompleted: completed,
        courseLastAccessed: new Date(),
        'metadata.completedModules': completedModules
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
router.put('/progress/roadmap/:enrollmentId', async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progress, completedStages } = req.body;

    const enrollment = await UserEnrollment.findByIdAndUpdate(
      enrollmentId,
      {
        roadmapProgress: progress,
        'metadata.completedStages': completedStages,
        'metadata.lastUpdated': new Date()
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
router.post('/evaluation/submit', async (req, res) => {
  try {
    const { userId, userEmail, evaluationTitle, score, totalQuestions, correctAnswers, timeTaken } = req.body;

    if (!userId && !userEmail) {
      return res.status(400).json({ error: 'User ID or email required' });
    }

    const enrollment = await UserEnrollment.create({
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
