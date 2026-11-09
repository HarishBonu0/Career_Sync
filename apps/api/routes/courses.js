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
  const topicLower = t.toLowerCase();
  
  // Categorize topics
  let category = 'technical';
  if (topicLower.match(/english|spanish|french|german|chinese|japanese|korean|hindi|language|grammar|vocabulary|pronunciation|telugu|tamil|malayalam|arabic|portuguese|russian|italian|dutch|swedish/)) {
    category = 'language';
  } else if (topicLower.match(/art|drawing|painting|music|guitar|piano|photography|design|ui|ux|graphic|video editing|animation|creative writing|illustration|3d modeling|digital art|figma/)) {
    category = 'creative';
  } else if (topicLower.match(/business|marketing|finance|management|economics|accounting|entrepreneurship|sales|stock market|investing|startup|leadership|hr|operations|product management/)) {
    category = 'business';
  } else if (!topicLower.match(/programming|code|coding|javascript|python|java|c\+\+|react|angular|vue|web|software|data|algorithm|api|database|sql|machine learning|ai|devops|cloud|aws|azure|cybersecurity|blockchain|html|css|node|django|flask|spring|kotlin|swift|rust|go|typescript|php|docker|kubernetes/)) {
    category = 'academic';
  }

  // 1. Goal options
  let goalOptions = [
    `Build real-world production projects with ${t}`,
    `Prepare for technical job interviews & career transition`,
    `Master core architecture and professional best practices`,
    `Learn ${t} fundamentals to expand my technical skill set`,
    `Automate workflows or solve specific business problems with ${t}`
  ];

  if (category === 'language') {
    goalOptions = [
      `Conversational fluency for travel and everyday communication`,
      `Professional & business communication in ${t}`,
      `Academic certification, exams, or language proficiency test`,
      `Connect with native speakers and understand cultural media`,
      `Grammar mastery and comprehensive reading/writing`
    ];
  } else if (category === 'creative') {
    goalOptions = [
      `Build a professional portfolio in ${t}`,
      `Freelancing and client design/creative work`,
      `Personal artistic expression and creative hobby`,
      `Create high-engagement digital content and assets`,
      `Master industry-standard workflows and tools`
    ];
  } else if (category === 'business') {
    goalOptions = [
      `Launch or scale a business/startup using ${t}`,
      `Career advancement, promotion, and leadership growth`,
      `Drive better strategic decisions and KPI outcomes`,
      `Master practical execution frameworks and case studies`,
      `Gain formal industry certification or credentials`
    ];
  } else if (category === 'academic') {
    goalOptions = [
      `Exams and academic coursework preparation`,
      `Competitive examination or certification mastery`,
      `In-depth theoretical understanding and research`,
      `Applied problem-solving and real-world understanding`,
      `Broad foundational knowledge and lifelong learning`
    ];
  }

  // 4. Focus Area options
  let focusOptions = [
    `Core syntax, architecture, and design patterns in ${t}`,
    `Hands-on project development and modern workflows`,
    `API integration, state handling, and data structures`,
    `Performance tuning, debugging, and testing strategies`,
    `Production deployment and industry best practices`
  ];

  if (topicLower.match(/react|vue|angular|frontend|next\.?js/)) {
    focusOptions = [
      `Component architecture, JSX, and Props`,
      `State management, Hooks, and lifecycle effects`,
      `Client-side routing, layout structure, and navigation`,
      `API data fetching, caching, and async handling`,
      `Performance optimization, memoization, and unit testing`
    ];
  } else if (topicLower.match(/python/)) {
    focusOptions = [
      `Core data structures, OOP, and functional paradigms`,
      `Data analysis and visualization (Pandas, NumPy, Matplotlib)`,
      `Web frameworks and REST APIs (FastAPI / Django / Flask)`,
      `Automation, web scraping, and scripting`,
      `Machine learning and algorithmic problem-solving`
    ];
  } else if (topicLower.match(/machine learning|ai|deep learning|data science/)) {
    focusOptions = [
      `Data preprocessing, exploratory analysis, and feature engineering`,
      `Supervised learning algorithms (Regression, Classification)`,
      `Neural network architectures and deep learning frameworks`,
      `Model evaluation, hyperparameter tuning, and validation`,
      `MLOps, model serving, and real-world deployment`
    ];
  } else if (topicLower.match(/sql|database|mongodb|postgres/)) {
    focusOptions = [
      `Schema design, normalization, and relational modeling`,
      `Complex queries, joins, aggregations, and subqueries`,
      `Indexing strategies, query optimization, and execution plans`,
      `Transactions, concurrency control, and ACID compliance`,
      `Database migration, backup strategies, and security`
    ];
  } else if (category === 'language') {
    focusOptions = [
      `Everyday conversational dialogues and practical phrases`,
      `Pronunciation, listening comprehension, and phonetics`,
      `Core grammar rules, sentence structure, and tenses`,
      `High-frequency vocabulary and idiom acquisition`,
      `Reading comprehension and written expression`
    ];
  } else if (category === 'creative') {
    focusOptions = [
      `Foundational design theory: color, contrast, and typography`,
      `Software shortcuts, tools, and technical execution`,
      `Layout composition and visual hierarchy`,
      `Client brief interpretation and concept ideation`,
      `Exporting, asset optimization, and portfolio presentation`
    ];
  } else if (category === 'business') {
    focusOptions = [
      `Strategic frameworks and competitive market analysis`,
      `Financial modeling, unit economics, and budgeting`,
      `Customer acquisition, sales funnels, and marketing metrics`,
      `Operations optimization and team leadership`,
      `Risk mitigation and growth execution`
    ];
  }

  return [
    {
      id: 1,
      type: 'single-choice',
      question: `What is your primary goal with ${t}?`,
      options: goalOptions
    },
    {
      id: 2,
      type: 'single-choice',
      question: `What is your current experience level with ${t}?`,
      options: [
        `Complete Beginner (New to ${t})`,
        `Foundational (Know the basics, need structured guidance)`,
        `Intermediate (Have built small projects or used it before)`,
        `Advanced (Looking to master advanced architecture and patterns)`
      ]
    },
    {
      id: 3,
      type: 'single-choice',
      question: `How much time can you dedicate to learning ${t} per day?`,
      options: [
        `15-30 minutes / day (Bite-sized pace)`,
        `30-60 minutes / day (Steady progress)`,
        `1-2 hours / day (Dedicated learning)`,
        `3+ hours / day (Intensive bootcamp pace)`
      ]
    },
    {
      id: 4,
      type: 'multiple-choice',
      question: `Which specific areas of ${t} do you want to prioritize? (Select all that apply)`,
      options: focusOptions
    },
    {
      id: 5,
      type: 'single-choice',
      question: `What is your target completion timeline for ${t}?`,
      options: [
        `2 Weeks (Fast track / Crash course)`,
        `1 Month (Recommended standard pace)`,
        `2-3 Months (In-depth comprehensive mastery)`,
        `Self-paced (Learn flexibly without pressure)`
      ]
    },
    {
      id: 6,
      type: 'text',
      question: `Any specific projects, tools, or requirements you want included in your ${t} course?`,
      placeholder: `e.g., Build a real-world ${t} application, prepare for upcoming interviews...`
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

  // Try AI generation first, fallback to predefined questions if it fails
  // Try AI generation first, fallback to predefined questions if it fails
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Generate exactly 6 personalized questions to understand a learner's needs for the topic: "${topic}".

RULES:
- Each question must have a DIFFERENT intent/purpose. No two questions should ask about the same thing.
- Do NOT ask about experience level twice. Do NOT ask about goals twice.
- Replace {topic} in question text with the actual topic name.
- Make ALL options SPECIFIC to "${topic}" — never generic like "Learn the basics".
- Options must be concrete and actionable for "${topic}".

The 6 questions MUST cover these 6 distinct topics (one each):
1. What is their PRIMARY GOAL with ${topic}? (career, project, hobby, etc.)
2. What is their current EXPERIENCE LEVEL with ${topic}?
3. How much TIME PER DAY can they dedicate to ${topic}?
4. What SPECIFIC AREAS of ${topic} excite them most? (make options very specific to ${topic})
5. What is their TARGET TIMELINE to complete the ${topic} course?
6. Any SPECIFIC REQUIREMENT or custom topic they want covered in ${topic}? (text input)

Format each question as:
{
  "id": number,
  "type": "text" | "single-choice" | "multiple-choice",
  "question": "question text (use actual topic name, not placeholder)",
  "placeholder": "for text type only",
  "options": ["option1", "option2", ...] // for choice types, 4-6 options VERY SPECIFIC to ${topic}
}

GOOD example for topic "React":
- Q4 options: ["React Hooks & functional components", "State management with Redux/Context", "React Router & navigation", "Performance optimization & memoization", "Server-side rendering with Next.js"]

BAD example (too generic):
- Q4 options: ["Fundamentals", "Advanced topics", "Practical applications", "Best practices"]

Return ONLY the JSON array, nothing else.`;
      
      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();
      
      // Clean up response - remove markdown code blocks if present
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Parse JSON
      const questions = JSON.parse(responseText);
      
      // Validate structure
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format received from AI');
      }

      const sanitizedQuestions = questions.map((q) => ({
        ...q,
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
        source: 'ai'
      });
    } catch (error) {
      console.error('AI question generation failed, using fallback:', error.message);
      // Fall through to fallback
    }
  }
  
  // Use fallback questions (avoids Gemini API rate limits)
  const rawQuestions = generateFallbackQuestions(topic);
  // Replace all {topic} placeholders with actual topic
  const questions = rawQuestions.map(q => ({
    ...q,
    question: q.question.replace(/\{topic\}/g, topic),
    placeholder: q.placeholder ? q.placeholder.replace(/\{topic\}/g, topic) : q.placeholder,
  }));
  res.json({ 
    success: true,
    topic,
    questions,
    generatedAt: new Date(),
    source: 'fallback'
  });
});

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
