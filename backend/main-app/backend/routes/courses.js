import express from 'express';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import CourseGeneration from '../models/CourseGeneration.js';
import Course from '../models/Course.js';

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
    const { user, userId, userEmail, title, description, level, difficulty, duration, totalModules, modules, objectives, resources, finalProject, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

<<<<<<< HEAD
    // Handle guest users - set to null if guest
    const userData = (user && user !== 'guest') ? user : null;

    const course = await Course.create({
      user: userData,
=======
    // Handle user field properly - convert "guest" to null for MongoDB
    let userObjectId = null;
    if (user && user !== 'guest' && mongoose.Types.ObjectId.isValid(user)) {
      userObjectId = user;
    }

    const normalizedModules = normalizeModules(modules || []);
    const course = await Course.create({
      user: userObjectId,
      userId: userId || (user === 'guest' ? 'guest' : user),
      userEmail: userEmail || null,
>>>>>>> karu
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
    res.status(500).json({ error: error.message });
  }
});

// Save a generated course as a curated course (legacy endpoint)
router.post('/save', async (req, res) => {
  try {
    const { userId, userEmail, generationId, title, description, level, duration, modules, course } = req.body;

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

<<<<<<< HEAD
    // Handle guest users - don't save to database for guest, or set user to null
    const userData = (userId && userId !== 'guest') ? userId : null;

    const newCourse = await Course.create({
      user: userData,
=======
    // Handle user field properly
    let userObjectId = null;
    if (userId && userId !== 'guest' && mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = userId;
    }

    console.log('✅ SAVING WITH:');
    console.log('   user:', userObjectId);
    console.log('   userId:', userId || 'guest');
    console.log('   userEmail:', userEmail || null);

    const normalizedModules = normalizeModules(courseData.modules || []);
    const newCourse = await Course.create({
      user: userObjectId,
      userId: userId || 'guest',
      userEmail: userEmail || null,
>>>>>>> karu
      generation: generationId,
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
      status: 'published'
    });

    if (generationId) {
      await CourseGeneration.findByIdAndUpdate(generationId, { status: 'saved' });
    }

    console.log('✅ COURSE SAVED WITH ID:', newCourse._id);    res.status(201).json({ success: true, courseId: newCourse._id, data: newCourse });
  } catch (error) {
    console.error('Save course error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List courses for a user
router.get('/', async (req, res) => {
  try {
    const { userId, userEmail } = req.query;
    
    let filter = {};
    if (userId) {
      // Check if it's a valid ObjectId, otherwise search by userId string field
      if (mongoose.Types.ObjectId.isValid(userId) && userId !== 'guest') {
        filter = { user: userId };
      } else {
        filter = { userId: userId };
      }
    } else if (userEmail) {
      filter = { userEmail: userEmail };
    }
    
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
