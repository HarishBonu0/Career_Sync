import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate course curriculum
router.post('/generate', async (req, res) => {
  const { courseName, duration, level } = req.body;

  if (!courseName) {
    return res.status(400).json({ error: 'Course name is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Create a detailed course curriculum for "${courseName}" at ${level || 'intermediate'} level, lasting ${duration || '4 weeks'}. Include modules, topics, and learning outcomes.`;
    
    const result = await model.generateContent(prompt);
    const curriculum = result.response.text();

    res.json({ 
      courseName,
      curriculum,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Course generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all courses (mock)
router.get('/', (req, res) => {
  res.json({
    courses: [
      { id: 1, name: 'Advanced React', level: 'Advanced' },
      { id: 2, name: 'Python Basics', level: 'Beginner' },
      { id: 3, name: 'Machine Learning', level: 'Advanced' }
    ]
  });
});

export default router;
