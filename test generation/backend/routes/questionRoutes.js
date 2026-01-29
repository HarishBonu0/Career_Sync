const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate 60 questions for a skill
router.post('/generate', async (req, res) => {
  try {
    const { skillId, level } = req.body;

    if (!skillId || !level) {
      return res.status(400).json({ message: 'skillId and level are required' });
    }

    // Get skill info
    const { data: skill, error: skillError } = await supabase
      .from('test_skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (skillError || !skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Server configuration error: API key not configured' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Generate 60 multiple-choice questions for the skill "${skill.skill_name}" at "${level}" level.
      Each question must have:
        - A mainTopic (general category)
        - A subTopic (specific subcategory)
        - A clearly defined topic
        - 4 options (A, B, C, D) but answers should be text values
        - The correct answer (write the actual text of the correct option, not just "A" or "B")
      Return strictly valid JSON ONLY. Do NOT include markdown, code fences, or any explanation.

      Format:
      [
        {
          "mainTopic": "string",
          "subTopic": "string",
          "topic": "string",
          "question": "string",
          "options": ["A","B","C","D"], 
          "correctAnswer": "string" 
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const rawText = result.response?.text?.() || '';

    // Sanitize JSON
    const cleanedText = rawText
      .replace(/```json|```/g, '')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/[\u0000-\u001F]+/g, '')
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

    // Prepare questions for Supabase
    const questionsToInsert = questions.map(q => ({
      test_skill_id: skillId,
      level: level,
      main_topic: q.mainTopic,
      sub_topic: q.subTopic,
      topic: q.topic,
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer,
      created_at: new Date().toISOString()
    }));

    // Insert questions
    const { data: insertedQuestions, error: insertError } = await supabase
      .from('test_questions')
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      throw insertError;
    }

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

// Get 20 random test questions
router.post('/test', async (req, res) => {
  try {
    const { skillId, level, userId } = req.body;

    if (!skillId || !level) {
      return res.status(400).json({ message: 'skillId and level are required' });
    }

    const userIdToUse = userId || `guest-${Date.now()}`;

    // Get all questions for this skill and level
    const { data: allQuestions, error: questionsError } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_skill_id', skillId)
      .eq('level', level);

    if (questionsError) {
      throw questionsError;
    }

    if (!allQuestions || allQuestions.length < 20) {
      return res.status(400).json({ 
        message: 'Not enough questions available. Generate questions first.',
        available: allQuestions?.length || 0
      });
    }

    // Shuffle and pick 20 random questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 20);

    // Create test attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('test_attempts')
      .insert([{
        user_id: userIdToUse,
        test_skill_id: skillId,
        level: level,
        status: 'in-progress',
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (attemptError) {
      throw attemptError;
    }

    res.json({
      attemptId: attempt.id,
      questions: selectedQuestions
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
