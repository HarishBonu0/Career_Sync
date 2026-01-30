import express from 'express';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SkillEvaluation from '../models/SkillEvaluation.js';

const router = express.Router();

// Save/Create a skill evaluation
router.post('/', async (req, res) => {
  try {
    const { user, userId, userEmail, skillName, title, difficulty, questions, score, percentage, feedback, status, completedAt } = req.body;

    if (!skillName && !title) {
      return res.status(400).json({ error: 'Skill name or title is required' });
    }

    // Handle user field properly
    let userObjectId = null;
    if (user && user !== 'guest' && mongoose.Types.ObjectId.isValid(user)) {
      userObjectId = user;
    }

    const evaluation = await SkillEvaluation.create({
      user: userObjectId,
      userId: userId || (user === 'guest' ? 'guest' : user),
      userEmail: userEmail || null,
      skillName: skillName || title || '',
      title: title || skillName || '',
      difficulty: difficulty || 'intermediate',
      questions: questions || [],
      totalQuestions: questions ? questions.length : 0,
      score: score || 0,
      percentage: percentage || 0,
      feedback: feedback || '',
      status: status || 'completed',
      completedAt: completedAt || (status === 'completed' ? new Date() : null)
    });

    res.status(201).json({ success: true, evaluationId: evaluation._id, data: evaluation });
  } catch (error) {
    console.error('Evaluation creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate skill evaluation questions and persist
router.post('/evaluate', async (req, res) => {
  const { skillName, difficulty, questionCount, userId, userEmail } = req.body;

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

    // Handle user field properly
    let userObjectId = null;
    if (userId && userId !== 'guest' && mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = userId;
    }

    const evalDoc = await SkillEvaluation.create({
      user: userObjectId,
      userId: userId || 'guest',
      userEmail: userEmail || null,
      skillName,
      title: `${skillName} Evaluation`,
      difficulty: diff,
      questions,
      totalQuestions: questions.length,
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
    const percentage = Math.round(score);

    evalDoc.questions = updatedQuestions;
    evalDoc.score = score;
    evalDoc.percentage = percentage;
    evalDoc.correctAnswers = correct;
    evalDoc.status = 'completed';
    evalDoc.completedAt = new Date();
    await evalDoc.save();

    res.json({
      evaluationId,
      score,
      percentage,
      correct,
      total: totalQuestions,
      status: 'completed'
    });
  } catch (error) {
    console.error('Evaluation submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List evaluations for a user
router.get('/', async (req, res) => {
  try {
    const { userId, userEmail } = req.query;
    
    let filter = {};
    if (userId) {
      if (mongoose.Types.ObjectId.isValid(userId) && userId !== 'guest') {
        filter = { user: userId };
      } else {
        filter = { userId: userId };
      }
    } else if (userEmail) {
      filter = { userEmail: userEmail };
    }
    
    const evaluations = await SkillEvaluation.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, evaluations, count: evaluations.length });
  } catch (error) {
    console.error('Evaluations fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single evaluation by ID
router.get('/:id', async (req, res) => {
  try {
    const evaluation = await SkillEvaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }
    res.json({ success: true, data: evaluation });
  } catch (error) {
    console.error('Evaluation fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
