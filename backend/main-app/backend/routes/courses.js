import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import CourseGeneration from '../models/CourseGeneration.js';
import Course from '../models/Course.js';

const router = express.Router();

// Generate course curriculum and persist
router.post('/generate', async (req, res) => {
  const { courseName, duration, level, userId } = req.body;

  if (!courseName) {
    return res.status(400).json({ error: 'Course name is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Create a detailed course curriculum for "${courseName}" at ${level || 'intermediate'} level, lasting ${duration || '4 weeks'}. Include modules, topics, and learning outcomes.`;
    
    const result = await model.generateContent(prompt);
    const curriculum = result.response.text();

    // Save generation
    const generation = await CourseGeneration.create({
      user: userId,
      courseName,
      duration,
      level,
      prompt,
      model: 'gemini-pro',
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
    res.status(500).json({ error: error.message });
  }
});

// Save a generated course or create a new course
router.post('/', async (req, res) => {
  try {
    const { user, title, description, level, duration, modules, objectives, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const course = await Course.create({
      user: user || null,
      title,
      description: description || '',
      level: level || 'beginner',
      duration: duration || '8 weeks',
      modules: modules || [],
      objectives: objectives || [],
      status: status || 'published'
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save a generated course as a curated course (legacy endpoint)
router.post('/save', async (req, res) => {
  try {
    const { userId, generationId, title, description, level, duration, modules, course } = req.body;

    // Handle both formats - direct course object or individual fields
    const courseData = course || { title, description, level, duration, modules };

    if (!courseData.title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const newCourse = await Course.create({
      user: userId || null,
      generation: generationId,
      title: courseData.title,
      description: courseData.description || '',
      level: courseData.level || courseData.difficulty || 'beginner',
      duration: courseData.duration || '8 weeks',
      modules: courseData.modules || [],
      objectives: courseData.objectives || [],
      status: 'published'
    });

    if (generationId) {
      await CourseGeneration.findByIdAndUpdate(generationId, { status: 'saved' });
    }

    res.status(201).json({ success: true, courseId: newCourse._id, data: newCourse });
  } catch (error) {
    console.error('Save course error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List courses for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { user: userId } : {};
    const courses = await Course.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
