import express from 'express';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import CourseGeneration from '../models/CourseGeneration.js';
import Course from '../models/Course.js';
import UserEnrollment from '../models/UserEnrollment.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { body, param, validationResult } from 'express-validator';
import { withAuthenticatedUser } from '../utils/requestUser.js';
import { documentOwnedByUser, ownerFilter } from '../utils/ownership.js';
import { requireMongo } from '../middleware/mongoCheck.js';

const router = express.Router();

function normalizeReadingMaterials(materials) {
  if (!Array.isArray(materials)) return [];
  return materials.map((item) => {
    if (typeof item === 'string') {
      return { title: item, url: '' };
    }
    return {
      title: item.title || item.name || 'Reading Material',
      source: item.source || item.publisher || '',
      url: item.url || item.link || '',
      difficulty: item.difficulty || '',
      estimatedReadTime: item.estimatedReadTime || item.readTime || ''
    };
  });
}

function normalizeYoutubeLinks(links) {
  if (!Array.isArray(links)) return [];
  return links.map((item) => {
    if (typeof item === 'string') {
      return { title: 'Video Resource', url: item };
    }
    return {
      title: item.title || item.name || 'Video Resource',
      url: item.url || item.link || '',
      duration: item.duration || '',
      description: item.description || '',
      channel: item.channel || '',
      thumbnail: item.thumbnail || ''
    };
  });
}

function normalizeModules(modules) {
  if (!Array.isArray(modules)) return [];
  return modules.map((module) => {
    const topics = Array.isArray(module.topics)
      ? module.topics
      : Array.isArray(module.topic)
        ? module.topic
        : Array.isArray(module.lessons)
          ? module.lessons
          : [];

    const activities = Array.isArray(module.activities)
      ? module.activities
      : Array.isArray(module.exercises)
        ? module.exercises
        : [];

    const readingMaterials = normalizeReadingMaterials(
      module.readingMaterials || module.readings || module.resources || []
    );

    const youtubeLinks = normalizeYoutubeLinks(
      module.youtubeLinks || module.videoLinks || module.videos || module.youtube || []
    );

    return {
      ...module,
      topics,
      activities,
      project: module.project || module.projects || null,
      assessment: module.assessment || module.quiz || module.evaluation || null,
      readingMaterials,
      youtubeLinks
    };
  });
}

// Generate course curriculum and persist
router.post(
  '/generate',
  authenticate,
  requireMongo,
  body('courseName').isString().trim().isLength({ min: 1, max: 200 }).withMessage('courseName is required'),
  body('duration').optional().isString().isLength({ max: 100 }),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const body = withAuthenticatedUser(req, req.body);
    const { courseName, duration, level, userId } = body;
  const ownerId = req.user?.id?.toString() || userId;

  if (!courseName) {
    return res.status(400).json({ error: 'Course name is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Create a detailed course curriculum for "${courseName}" at ${level || 'intermediate'} level, lasting ${duration || '4 weeks'}. Include modules, topics, and learning outcomes.`;
    
    const result = await model.generateContent(prompt);
    const curriculum = result.response.text();

    // Save generation
    const generationUser =
      ownerId && ownerId !== 'guest' && mongoose.Types.ObjectId.isValid(ownerId)
        ? ownerId
        : req.user?.id || null;

    if (!generationUser) {
      return res.status(401).json({ error: 'Authentication required to save generation history' });
    }

    const generation = await CourseGeneration.create({
      user: generationUser,
      courseName,
      duration,
      level,
      prompt,
      model: 'gemini-2.5-flash',
      curriculum
    });

    res.json({ 
      courseName,
      curriculum,
      generatedAt: new Date(),
      generationId: generation._id
    });
  } catch (error) {
    console.error('Course generation error:', error);
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// Helper function to generate fallback questions when AI API is unavailable
// Helper function to generate high-quality, non-overlapping questions when AI API is unavailable
function generateFallbackQuestions(topic) {
  const t = topic.trim();
  return [
    {
      id: 1,
      type: 'single-choice',
      question: `What is your primary goal or ambition with ${t}?`,
      options: [
        `Master foundational essentials and build strong core practical skills`,
        `Create meaningful real-world projects and personal creations in ${t}`,
        `Achieve advanced technique mastery and refine my expertise`,
        `Pursue ${t} as an enriching personal hobby or creative passion`,
        `Prepare for professional application, career transition, or certification in ${t}`
      ]
    },
    {
      id: 2,
      type: 'single-choice',
      question: `What is your current experience level with ${t}?`,
      options: [
        `Complete Beginner (Brand new to ${t})`,
        `Foundational (Know basic concepts, want structured guidance)`,
        `Intermediate (Have practical experience, seeking higher mastery)`,
        `Advanced (Experienced practitioner refining nuance and technique)`
      ]
    },
    {
      id: 3,
      type: 'single-choice',
      question: `How much time can you dedicate to learning ${t} per day?`,
      options: [
        `15-30 minutes / day (Bite-sized, steady pace)`,
        `30-60 minutes / day (Consistent daily progress)`,
        `1-2 hours / day (Dedicated, focused practice)`,
        `3+ hours / day (Intensive immersive learning)`
      ]
    },
    {
      id: 4,
      type: 'single-choice',
      question: `What is your target completion timeline for ${t}?`,
      options: [
        `2 Weeks (Intensive crash course / quick start)`,
        `1 Month (Standard balanced curriculum)`,
        `2-3 Months (In-depth, comprehensive mastery)`,
        `Self-paced (Flexible learning without time pressure)`
      ]
    },
    {
      id: 5,
      type: 'text',
      question: `Any specific areas, projects, techniques, or requirements you want emphasized in your ${t} course?`,
      placeholder: `e.g., Particular styles, materials, projects, or personal goals in ${t}...`
    }
  ];
}

// Generate dynamic questions based on course topic
router.post(
  '/generate-questions',
  body('topic').isString().trim().isLength({ min: 1, max: 200 }).withMessage('topic is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { topic } = req.body;

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `You are a master curriculum advisor across all human disciplines (arts, humanities, crafts, sciences, trades, languages, technology, business, culinary, wellness, etc.).
Analyze the topic: "${topic}".

Generate 4 to 6 personalized, highly tailored questions to understand this learner's background, goals, time availability, and topic-specific preferences for: "${topic}".

CRITICAL PEDAGOGY RULES:
- 100% DOMAIN-AUTHENTIC: Adapt all questions and options directly to the nature of "${topic}".
  * If "${topic}" is an Art, Craft, or Music: questions and options must be about mediums, tools, artistic style, instruments, techniques. (NEVER mention IT terms like "architecture", "deployment", "APIs", "stacks").
  * If "${topic}" is Cooking/Culinary: questions must be about cuisine style, skill level, equipment, dietary preferences.
  * If "${topic}" is Language/Linguistics: questions must be about speaking vs writing, dialect, cultural media, travel goals.
  * If "${topic}" is Software/IT: questions should be about environment, technology stack, project scale.
- NO DUPLICATE INTENTS: Every question must address a distinct facet (Goal, Starting Level, Daily Time, Specific Topic Interests, Timeline, Custom Projects).
- Return between 4 and 6 questions in valid JSON array format:
[
  {
    "id": 1,
    "type": "single-choice" | "multiple-choice" | "text",
    "question": "Clear, engaging question text specifically mentioning ${topic}",
    "placeholder": "for text type only",
    "options": ["Specific option 1", "Specific option 2", "Specific option 3", "Specific option 4"]
  }
]

Return ONLY the raw JSON array.`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const questions = JSON.parse(responseText);

        if (!Array.isArray(questions) || questions.length < 3) {
          throw new Error('Invalid questions format or too few questions received from AI');
        }

        // Deduplication & intent overlap guard
        const seenIntents = new Set();
        let hasOverlap = false;
        for (const q of questions) {
          const text = (q.question || '').toLowerCase();
          let intent = 'other';
          if (text.includes('goal') || text.includes('objective') || text.includes('aim') || text.includes('hope to')) intent = 'goal';
          else if (text.includes('experience') || text.includes('familiar') || text.includes('level') || text.includes('background') || text.includes('starting')) intent = 'experience';
          else if (text.includes('time') || text.includes('hour') || text.includes('dedicate') || text.includes('schedule') || text.includes('day')) intent = 'time';
          else if (text.includes('timeline') || text.includes('complete') || text.includes('finish') || text.includes('pace') || text.includes('deadline') || text.includes('month') || text.includes('week')) intent = 'timeline';
          else if (text.includes('require') || text.includes('project') || text.includes('custom') || text.includes('tool') || text.includes('equipment') || text.includes('material')) intent = 'requirement';

          if (intent !== 'other' && seenIntents.has(intent)) {
            hasOverlap = true;
            break;
          }
          if (intent !== 'other') seenIntents.add(intent);
        }

        if (hasOverlap) {
          console.warn('AI generated overlapping questions, falling back to clean universal questionnaire');
          throw new Error('AI generated overlapping questions');
        }

        const sanitizedQuestions = questions.map((q, idx) => ({
          ...q,
          id: idx + 1,
          question: (q.question || '').replace(/\{topic\}/g, topic),
          placeholder: q.placeholder ? q.placeholder.replace(/\{topic\}/g, topic) : q.placeholder,
          options: Array.isArray(q.options)
            ? q.options.map((opt) => (typeof opt === 'string' ? opt.replace(/\{topic\}/g, topic) : opt))
            : q.options,
        }));

        return res.json({
          success: true,
          topic,
          questions: sanitizedQuestions,
          generatedAt: new Date(),
          source: 'ai',
        });
      } catch (error) {
        console.error('AI question generation failed or invalid, using universal fallback:', error.message);
      }
    }

    const rawQuestions = generateFallbackQuestions(topic);
    res.json({
      success: true,
      topic,
      questions: rawQuestions,
      generatedAt: new Date(),
      source: 'fallback',
    });
  }
);

// Save a generated course or create a new course
router.post(
  '/',
  authenticate,
  requireMongo,
  body('title').isString().trim().isLength({ min: 1, max: 300 }).withMessage('title is required'),
  body('description').optional().isString().isLength({ max: 2000 }),
  body('modules').optional().isArray(),
  body('duration').optional().isString().isLength({ max: 200 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const {
        user,
        userId,
        userEmail,
        title,
        description,
        level,
        difficulty,
        duration,
        totalModules,
        modules,
        objectives,
        resources,
        finalProject,
        status,
      } = withAuthenticatedUser(req, req.body);

    const userObjectId = req.user.id;

    const normalizedModules = normalizeModules(modules || []);
    const course = await Course.create({
      user: userObjectId,
      userId: userId || userObjectId.toString(),
      userEmail: userEmail || req.user.email,
      title,
      description: description || '',
      level: level || difficulty || 'beginner',
      difficulty: difficulty || level || 'beginner',
      duration: duration || '8 weeks',
      totalModules: totalModules || (normalizedModules ? normalizedModules.length : 0),
      modules: normalizedModules,
      objectives: objectives || [],
      resources: resources || [],
      finalProject: finalProject || null,
      status: status || 'published'
    });

    res.status(201).json({ success: true, courseId: course._id, data: course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// Save a generated course as a curated course (legacy endpoint)
router.post(
  '/save',
  authenticate,
  requireMongo,
  body('clientRequestId').optional().isString(),
  body('generationId').optional().isString(),
  body('generationMetadata').optional().isObject(),
  body('course').optional().custom((v) => typeof v === 'object' || v === null),
  body('title').optional().isString().isLength({ min: 1 }).withMessage('title is required if course object not provided'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { userId, userEmail, generationId, generationMetadata, title, description, level, duration, modules, course, clientRequestId } =
        withAuthenticatedUser(req, req.body);

    // LOG EVERYTHING RECEIVED
    console.log('\n🔍 COURSE SAVE REQUEST RECEIVED:');
    console.log('   userId:', userId);
    console.log('   userEmail:', userEmail);
    console.log('   title:', title);
    console.log('   Full body:', JSON.stringify(req.body, null, 2));

    // Handle both formats - direct course object or individual fields
    const courseData = course || { title, description, level, duration, modules };

    if (!courseData.title) {
      return res.status(400).json({ error: 'title is required' });
    }

    if (clientRequestId) {
      const existing = await Course.findOne({
        user: req.user.id,
        'metadata.clientRequestId': clientRequestId,
      });
      if (existing) {
        return res.status(200).json({ success: true, courseId: existing._id, data: existing, deduplicated: true });
      }
    }

    const userObjectId = req.user.id;

    console.log('✅ SAVING WITH:');
    console.log('   user:', userObjectId);
    console.log('   userId:', userId);
    console.log('   userEmail:', userEmail);

    const normalizedModules = normalizeModules(courseData.modules || []);
    let persistedGenerationId = generationId;
    if (!persistedGenerationId && generationMetadata) {
      const generation = await CourseGeneration.create({
        user: userObjectId,
        courseName: courseData.title,
        duration: courseData.duration,
        level: courseData.level || courseData.difficulty,
        prompt: JSON.stringify({
          topic: generationMetadata.topic,
          answers: generationMetadata.answers,
          promptVersion: generationMetadata.promptVersion,
        }),
        model: generationMetadata.model || 'openrouter',
        curriculum: JSON.stringify({ modules: normalizedModules }),
        modules: normalizedModules.map((module) => ({
          title: module.title,
          topics: Array.isArray(module.topics) ? module.topics.map(String) : [],
          learningOutcomes: Array.isArray(module.objectives) ? module.objectives.map(String) : [],
          duration: module.duration || '',
        })),
        status: 'saved',
      });
      persistedGenerationId = generation._id;
    }
    const newCourse = await Course.create({
      user: userObjectId,
      userId: userId || userObjectId.toString(),
      userEmail: userEmail || req.user.email,
      generation: persistedGenerationId,
      title: courseData.title,
      description: courseData.description || '',
      level: courseData.level || courseData.difficulty || 'beginner',
      difficulty: courseData.difficulty || courseData.level || 'beginner',
      duration: courseData.duration || '8 weeks',
      totalModules: courseData.totalModules || (normalizedModules ? normalizedModules.length : 0),
      modules: normalizedModules,
      objectives: courseData.objectives || [],
      resources: courseData.resources || [],
      finalProject: courseData.finalProject || null,
      status: 'published',
      metadata: {
        ...(courseData.metadata || {}),
        ...(clientRequestId ? { clientRequestId } : {}),
      },
    });

    if (persistedGenerationId) {
      await CourseGeneration.findByIdAndUpdate(persistedGenerationId, { status: 'saved' });
    }

    console.log('✅ COURSE SAVED WITH ID:', newCourse._id);
    res.status(201).json({ success: true, courseId: newCourse._id, data: newCourse });
  } catch (error) {
    console.error('Save course error:', error);
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// List courses for authenticated user
router.get('/enrollments/my', authenticate, requireMongo, async (req, res) => {
  try {
    const enrollments = await UserEnrollment.find({ user: req.user.id, type: 'course' })
      .sort({ updatedAt: -1 })
      .lean();
    const courseIds = enrollments.map((item) => item.courseId).filter((id) => mongoose.Types.ObjectId.isValid(id));
    const courses = await Course.find({ _id: { $in: courseIds }, user: req.user.id }).lean();
    const courseMap = new Map(courses.map((course) => [course._id.toString(), course]));
    const data = enrollments.map((enrollment) => {
      const course = courseMap.get(enrollment.courseId) || null;
      return {
        id: enrollment._id,
        courseId: enrollment.courseId,
        title: course?.title || enrollment.courseTitle,
        description: course?.description || '',
        slug: enrollment.courseId,
        enrolled_at: enrollment.courseEnrolledAt || enrollment.createdAt,
        progress: enrollment.courseProgress ?? course?.progress ?? 0,
        completed_at: enrollment.courseCompletedAt || null,
        status: course?.status || (enrollment.courseCompleted ? 'completed' : 'in-progress'),
        completedModules: enrollment.completedModules || course?.completedModules || [],
        currentModule: enrollment.currentModule || 0,
      };
    });
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('Enrollment list error:', error);
    res.status(500).json({ error: 'Failed to load course enrollments' });
  }
});

// Persist course progress for both the course and its enrollment.
router.put(
  '/:id/progress',
  authenticate,
  requireMongo,
  param('id').isMongoId().withMessage('Invalid course id'),
  body('progress').isNumeric().custom((value) => value >= 0 && value <= 100).withMessage('progress must be 0-100'),
  body('completedModules').optional().isArray(),
  body('currentModule').optional().isInt({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      const progress = Number(req.body.progress);
      const completedModules = req.body.completedModules || [];
      const currentModule = Number.isInteger(req.body.currentModule)
        ? req.body.currentModule
        : completedModules.length;
      const completed = progress >= 100;
      const course = await Course.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        {
          progress,
          completedModules,
          status: completed ? 'completed' : 'in-progress',
        },
        { new: true }
      );
      if (!course) return res.status(404).json({ error: 'Course not found' });

      const enrollment = await UserEnrollment.findOneAndUpdate(
        { user: req.user.id, type: 'course', $or: [{ course: course._id }, { courseId: course._id.toString() }] },
        {
          course: course._id,
          courseId: course._id.toString(),
          courseTitle: course.title,
          courseModuleCount: course.totalModules || course.modules?.length || 0,
          courseProgress: progress,
          completedModules,
          currentModule,
          courseCompleted: completed,
          courseCompletedAt: completed ? new Date() : null,
          courseLastAccessed: new Date(),
        },
        { new: true }
      );

      res.json({ success: true, data: { course, enrollment } });
    } catch (error) {
      console.error('Course progress error:', error);
      res.status(500).json({ error: 'Failed to save course progress' });
    }
  }
);

router.get('/', authenticate, requireMongo, async (req, res) => {
  try {
    const filter = ownerFilter(req.user);
    const courses = await Course.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// Get a single course by ID
router.get('/:id', optionalAuth, requireMongo, param('id').isMongoId().withMessage('Invalid course id'), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.user && (!req.user || !documentOwnedByUser(course, req.user))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

export default router;
