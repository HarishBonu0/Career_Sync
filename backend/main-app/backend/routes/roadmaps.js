import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate career roadmap
router.post('/generate', async (req, res) => {
  const { currentRole, targetRole, timeline } = req.body;

  if (!currentRole || !targetRole) {
    return res.status(400).json({ error: 'Current and target roles are required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Create a detailed career roadmap from "${currentRole}" to "${targetRole}" within ${timeline || '12 months'}. Include skill gaps, learning resources, and milestones.`;
    
    const result = await model.generateContent(prompt);
    const roadmap = result.response.text();

    res.json({ 
      currentRole,
      targetRole,
      roadmap,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sample roadmaps
router.get('/', (req, res) => {
  res.json({
    roadmaps: [
      { id: 1, from: 'Junior Dev', to: 'Senior Dev', duration: '12 months' },
      { id: 2, from: 'Data Analyst', to: 'ML Engineer', duration: '18 months' }
    ]
  });
});

export default router;
