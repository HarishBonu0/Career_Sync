const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Skill = require('../models/Skill');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');

const router = express.Router();

// Generate questions for a skill and store them in MongoDB
router.post('/generate', async (req, res) => {
  try {
    const { skillId, level } = req.body;

    if (!skillId || !level) {
      return res.status(400).json({ message: 'skillId and level are required' });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on the server' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Generate 60 multiple-choice questions for the skill "${skill.skillName}" at "${level}" level.
      Each question must have:
        - mainTopic: general category
        - subTopic: specific subcategory
        - topic: short topic label
        - question: the question text
        - options: an array of exactly 4 answer strings
        - correctAnswer: the exact answer text that is correct (must match one of the options)
      Return ONLY valid JSON (no markdown, no code fences). The JSON must be an array of objects.
    `;

    const result = await model.generateContent(prompt);
    const rawText = result.response?.text?.() || '';

    const cleanedText = rawText
      .replace(/```json|```/g, '')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .trim();

    let questions;
    try {
      questions = JSON.parse(cleanedText);
    } catch (err) {
      return res.status(500).json({ message: 'AI returned invalid JSON', error: err.message });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ message: 'AI did not generate any questions' });
    }

    const normalized = questions
      .map(q => {
        if (!q || !q.question || !q.correctAnswer) return null;

        const optionList = Array.isArray(q.options)
          ? q.options
          : Object.values(q.options || {});

        if (!Array.isArray(optionList) || optionList.length < 4) return null;

        return {
          skill: skill._id,
          level,
          mainTopic: q.mainTopic || q.topic || '',
          subTopic: q.subTopic || '',
          topic: q.topic || '',
          question: q.question,
          options: optionList.slice(0, 4),
          correctAnswer: q.correctAnswer
        };
      })
      .filter(Boolean);

    if (normalized.length === 0) {
      return res.status(500).json({ message: 'AI response did not include valid questions' });
    }

    const insertedQuestions = await Question.insertMany(normalized);

    res.status(201).json({
      message: 'AI-generated questions saved successfully',
      totalGenerated: questions.length,
      totalAdded: insertedQuestions.length,
      data: insertedQuestions
    });

  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate questions', 
      error: error.message 
    });
  }
});

// Create a test attempt and return 20 random questions
router.post('/test', async (req, res) => {
  try {
    const { skillId, level, userId } = req.body;

    if (!skillId || !level) {
      return res.status(400).json({ message: 'skillId and level are required' });
    }

    const userIdToUse = userId || `guest-${Date.now()}`;

    const allQuestions = await Question.find({ skill: skillId, level }).lean();

    if (!allQuestions || allQuestions.length < 20) {
      return res.status(400).json({ 
        message: 'Not enough questions available. Generate questions first.',
        available: allQuestions?.length || 0
      });
    }

    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 20);

    const attempt = await TestAttempt.create({
      user: userIdToUse,
      skill: skillId,
      level,
      status: 'in-progress',
      questions: selectedQuestions.map(q => ({ questionId: q._id })),
      totalQuestions: selectedQuestions.length,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
    });

    res.json({
      attemptId: attempt._id,
      questions: selectedQuestions.map(q => ({
        id: q._id,
        mainTopic: q.mainTopic,
        subTopic: q.subTopic,
        topic: q.topic,
        question: q.question,
        options: q.options
      }))
    });

  } catch (error) {
    console.error('Test question fetch error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch test questions', 
      error: error.message 
    });
  }
});

module.exports = router;
