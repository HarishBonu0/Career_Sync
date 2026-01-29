import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SkillEvaluation from '../models/SkillEvaluation.js';

const router = express.Router();

// Generate skill evaluation questions and persist
router.post('/evaluate', async (req, res) => {
  const { skillName, difficulty, questionCount, userId } = req.body;

  if (!skillName) {
    return res.status(400).json({ error: 'Skill name is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const qCount = questionCount || 20;
    const diff = difficulty || 'intermediate';
    
    const prompt = `Generate ${qCount} multiple-choice questions for evaluating "${skillName}" at ${diff} level. Format as JSON array with question, options (A-D), and correct answer.`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const questionsRaw = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    const questions = questionsRaw
      .map(q => {
        if (!q || !q.question || !q.options) return null;
        const opts = Array.isArray(q.options) ? q.options : Object.values(q.options);
        if (!opts || opts.length < 4) return null;
        return {
          question: q.question,
          options: opts.slice(0, 4),
          correctAnswer: q.correctAnswer || q.answer
        };
      })
      .filter(Boolean);

    const evalDoc = await SkillEvaluation.create({
      user: userId,
      skillName,
      difficulty: diff,
      questions,
      status: 'in-progress'
    });

    res.json({ 
      evaluationId: evalDoc._id,
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

// Submit evaluation answers and score
router.post('/submit', async (req, res) => {
  const { evaluationId, answers } = req.body;

  if (!evaluationId || !answers) {
    return res.status(400).json({ error: 'evaluationId and answers are required' });
  }

  try {
    const evalDoc = await SkillEvaluation.findById(evaluationId);
    if (!evalDoc) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    let correct = 0;
    const updatedQuestions = evalDoc.questions.map((q, idx) => {
      const userAnswer = answers[idx] || answers[q.question];
      const isCorrect = userAnswer && userAnswer === q.correctAnswer;
      if (isCorrect) correct += 1;
      return { ...q.toObject(), userAnswer, isCorrect };
    });

    const totalQuestions = updatedQuestions.length || 1;
    const score = (correct / totalQuestions) * 100;

    evalDoc.questions = updatedQuestions;
    evalDoc.score = score;
    evalDoc.status = 'completed';
    await evalDoc.save();

    res.json({
      evaluationId,
      score,
      correct,
      totalQuestions,
      submittedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get evaluations for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { user: userId } : {};
    const evaluations = await SkillEvaluation.find(filter).sort({ createdAt: -1 });
    res.json({ evaluations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
