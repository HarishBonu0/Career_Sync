import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Roadmap from '../models/Roadmap.js';

const router = express.Router();

// Generate career roadmap and persist
router.post('/generate', async (req, res) => {
  const { currentRole, targetRole, timeline, userId } = req.body;

  if (!currentRole || !targetRole) {
    return res.status(400).json({ error: 'Current and target roles are required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Create a detailed career roadmap from "${currentRole}" to "${targetRole}" within ${timeline || '12 months'}. Include skill gaps, learning resources, and milestones.`;
    
    const result = await model.generateContent(prompt);
    const roadmapText = result.response.text();

    const roadmap = await Roadmap.create({
      user: userId,
      currentRole,
      targetRole,
      timeline,
      roadmapText
    });

    res.json({ 
      currentRole,
      targetRole,
      roadmap: roadmapText,
      roadmapId: roadmap._id,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List roadmaps for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { user: userId } : {};
    const roadmaps = await Roadmap.find(filter).sort({ createdAt: -1 });
    res.json({ roadmaps });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
