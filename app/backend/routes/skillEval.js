import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate skill evaluation questions
router.post('/evaluate', async (req, res) => {
  const { skillName, difficulty, questionCount } = req.body;

  if (!skillName) {
    return res.status(400).json({ error: 'Skill name is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const qCount = questionCount || 20;
    const diff = difficulty || 'intermediate';
    
    const prompt = `Generate ${qCount} multiple-choice questions for evaluating "${skillName}" at ${diff} level. Format as JSON array with question, options (A-D), and correct answer.`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    res.json({ 
      skillName,
      difficulty: diff,
      questions,
      totalQuestions: questions.length,
      evaluatedAt: new Date()
    });
  } catch (error) {
    console.error('Skill evaluation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit evaluation answers
router.post('/submit', (req, res) => {
  const { skillName, answers, totalQuestions } = req.body;

  if (!skillName || !answers) {
    return res.status(400).json({ error: 'Skill name and answers are required' });
  }

  try {
    // Mock scoring
    const correct = answers.filter(a => a && a.isCorrect).length;
    const score = ((correct / totalQuestions) * 100).toFixed(2);

    res.json({
      skillName,
      score: parseFloat(score),
      correctAnswers: correct,
      totalQuestions,
      submittedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available skills
router.get('/', (req, res) => {
  res.json({
    skills: [
      { id: 1, name: 'JavaScript', category: 'Programming' },
      { id: 2, name: 'Python', category: 'Programming' },
      { id: 3, name: 'React', category: 'Frontend' },
      { id: 4, name: 'Data Analysis', category: 'Data Science' }
    ]
  });
});

export default router;
