import express from 'express';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SkillEvaluation from '../models/SkillEvaluation.js';

const router = express.Router();

const shuffleArray = (items) => {
  const arr = Array.isArray(items) ? [...items] : [];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Simple minimal fallback for when API fails completely
const generateMinimalFallback = (skillName, difficulty) => {
  return [
    {
      question: `What is ${skillName}?`,
      options: [`A technology related to ${skillName}`, 'Something unrelated', 'An old concept', 'Not used today'],
      correctAnswer: `A technology related to ${skillName}`,
      practicalExample: `// ${skillName} example\nconsole.log('${skillName} initialized');`,
      exampleLanguage: 'javascript',
      explanation: `${skillName} is a key technology in modern development.`
    }
  ];
};

// Retry helper function for networks and rate limit issues
const retryWithExponentialBackoff = async (fn, maxRetries = 3, initialDelayMs = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit = error.status === 429 || error.message.includes('429') || error.message.includes('rate');
      const isTimeout = error.message.includes('timeout') || error.message.includes('ETIMEDOUT');
      const isNetworkError = error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND');
      
      const isRetryable = isRateLimit || isTimeout || isNetworkError;
      
      if (isRetryable && attempt < maxRetries) {
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(`⚠️  Attempt ${attempt} failed (${error.message}). Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
    }
  }
};

// ML-based question generation using Gemini API with timeout handling
const generateQuestionsWithAI = async (skillName, difficulty, questionCount) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiKey) {
    console.log('⚠️  GEMINI_API_KEY not configured');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 1.0,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8000
      }
    });

    const difficultyGuide = {
      'beginner': 'fundamental concepts, basic syntax, core principles, simple use cases',
      'intermediate': 'real-world scenarios, implementation patterns, performance considerations, practical problem-solving',
      'advanced': 'complex architectures, optimization techniques, design patterns, edge cases, scalability, system design'
    };

    // Add timestamp and random seed to ensure different questions each time
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000000);

    const detailedPrompt = `[Session ID: ${timestamp}-${randomSeed}] You are an expert technical assessor creating a NEW, FRESH assessment.

Generate ${questionCount} COMPLETELY NEW AND DIFFERENT multiple-choice questions for "${skillName}" at ${difficulty} difficulty level.

CRITICAL REQUIREMENTS:
- DO NOT reuse questions from previous assessments
- Each question MUST be UNIQUE and ORIGINAL
- VARY the topics covered within ${skillName}
- Mix question styles: conceptual, practical coding, debugging, best practices, real-world scenarios
- Focus on: ${difficultyGuide[difficulty]}
- Include WORKING code examples in questions
- Questions should test DIFFERENT aspects of ${skillName}

For EACH question, return this EXACT JSON structure:
{
  "question": "Specific question about ${skillName} (must be different from others)",
  "type": "theory|practical|logical",
  "options": ["Correct option", "Wrong option 1", "Wrong option 2", "Wrong option 3"],
  "correctAnswer": "Correct option (MUST match one of the 4 options exactly)",
  "practicalExample": "Working code snippet demonstrating the concept (use proper ${skillName} syntax)",
  "exampleLanguage": "javascript",
  "explanation": "2-3 sentence explanation of why this is correct for ${skillName}"
}

EXAMPLES OF QUESTION VARIETY FOR ${skillName}:
- Theory: "What is the purpose of X in ${skillName}?"
- Practical: "How would you implement Y using ${skillName}?"
- Debugging: "What's wrong with this ${skillName} code?"
- Performance: "Which approach is more efficient in ${skillName}?"
- Best Practice: "What's the recommended way to do Z in ${skillName}?"

RETURN FORMAT:
- ONLY return a valid JSON array
- NO markdown, NO code blocks, NO explanations
- Start with [ and end with ]
- Generate exactly ${questionCount} questions

Generate NOW with session ${timestamp}:`;

    console.log(`📡 Calling Gemini AI [Session: ${timestamp}-${randomSeed}]`);
    console.log(`   Topic: ${skillName} | Difficulty: ${difficulty} | Count: ${questionCount}`);
    
    // Wrap API call with retry logic and timeout
    let result;
    await retryWithExponentialBackoff(async () => {
      result = await Promise.race([
        model.generateContent(detailedPrompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gemini API call timeout (>45s)')), 45000)
        )
      ]);
    }, 3, 1000);
    
    const responseText = result.response.text();
    
    console.log(`📥 Received response (${responseText.length} chars)`);
    
    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('⚠️  No valid JSON array found in AI response');
      console.warn('Response preview:', responseText.substring(0, 200));
      return null;
    }

    let questionsRaw = [];
    try {
      questionsRaw = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.warn('⚠️  Failed to parse AI JSON:', parseError.message);
      console.warn('JSON preview:', jsonMatch[0].substring(0, 200));
      return null;
    }

    if (!Array.isArray(questionsRaw) || questionsRaw.length === 0) {
      console.warn('⚠️  AI returned invalid or empty array');
      return null;
    }

    console.log(`✅ Parsed ${questionsRaw.length} raw questions from AI`);

    // Process and validate questions
    const processedQuestions = questionsRaw
      .filter((q, idx) => {
        if (!q?.question || !Array.isArray(q?.options) || q.options.length !== 4) {
          console.warn(`⚠️  Question ${idx + 1} invalid format (missing question or not 4 options)`);
          return false;
        }
        return true;
      })
      .map((q, idx) => {
        const shuffledOptions = shuffleArray([...q.options]);
        const correctAnswer = q.correctAnswer?.trim() || q.options[0];
        
        // Find correct answer in shuffled options (case-insensitive match)
        let finalCorrectAnswer = shuffledOptions.find(opt => 
          opt.trim().toLowerCase() === correctAnswer.toLowerCase()
        ) || shuffledOptions[0];

        return {
          question: q.question.trim(),
          type: q.type || 'theory',
          options: shuffledOptions,
          correctAnswer: finalCorrectAnswer,
          practicalExample: q.practicalExample || `// ${skillName} example\nconsole.log('Example for ${skillName}');`,
          exampleLanguage: q.exampleLanguage || 'javascript',
          explanation: q.explanation || `This is important for understanding ${skillName}.`
        };
      })
      .slice(0, questionCount);

    console.log(`✅ Successfully processed ${processedQuestions.length} valid questions\n`);
    return processedQuestions.length > 0 ? processedQuestions : null;
  } catch (error) {
    console.error('❌ AI generation error:', error.message);
    console.error('❌ Error details:', error.toString());
    console.error('❌ Error type:', error.constructor.name);
    if (error.stack) console.error('Stack trace:', error.stack.split('\n').slice(0, 5).join('\n'));
    return null;
  }
};

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

// Diagnostic endpoint to check environment configuration
router.get('/config-check', (req, res) => {
  res.json({
    geminiApiKeyConfigured: !!process.env.GEMINI_API_KEY,
    geminiApiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    mongodbConfigured: !!process.env.MONGODB_URI,
    nodeEnv: process.env.NODE_ENV || 'not set',
    timestamp: new Date().toISOString()
  });
});

// Generate skill evaluation questions and persist
router.post('/evaluate', async (req, res) => {
  const { skillName, difficulty, questionCount, userId, userEmail } = req.body;

  if (!skillName) {
    return res.status(400).json({ error: 'Skill name is required' });
  }

  try {
    const qCount = questionCount || 20;
    const diff = difficulty || 'intermediate';
    let questions = [];
    let source = 'AI (Gemini)';

    console.log(`\n📝 ========== Question Generation Request ==========`);
    console.log(`   Topic: ${skillName}`);
    console.log(`   Difficulty: ${diff}`);
    console.log(`   Questions: ${qCount}`);
    console.log(`   GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
    console.log(`   Using: AI-based random generation\n`);

    // Use AI to generate random questions based on topic and difficulty
    if (!process.env.GEMINI_API_KEY) {
      console.error(`❌ ERROR: GEMINI_API_KEY not configured`);
      console.error(`   Environment check:`);
      console.error(`   - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
      console.error(`   - All env vars: ${Object.keys(process.env).filter(k => !k.includes('SECRET')).join(', ')}\n`);
      
      return res.status(500).json({ 
        error: 'Configuration Error',
        message: 'GEMINI_API_KEY environment variable is not configured on the server. Please set it in Render Dashboard -> Environment Variables.',
        details: {
          requiredVar: 'GEMINI_API_KEY',
          configured: false,
          fix: 'Add GEMINI_API_KEY to Render environment variables'
        }
      });
    }
    
    if (process.env.GEMINI_API_KEY) {
      console.log(`🤖 Calling AI to generate unique questions for "${skillName}"...`);
      const aiQuestions = await generateQuestionsWithAI(skillName, diff, qCount);
      
      if (aiQuestions && aiQuestions.length > 0) {
        questions = aiQuestions;
        console.log(`✅ AI generated ${questions.length} unique questions\n`);
      } else {
        console.log(`❌ AI generation failed, using minimal fallback...\n`);
        questions = generateMinimalFallback(skillName, diff);
        source = 'Minimal Fallback (AI failed)';
      }
    }

    // Ensure we have requested number of questions
    if (questions.length < qCount) {
      const needed = qCount - questions.length;
      console.log(`⚠️  Need ${needed} more questions, requesting additional from AI...`);
      const additional = await generateQuestionsWithAI(skillName, diff, needed);
      if (additional && additional.length > 0) {
        questions = questions.concat(additional);
      }
    }

    // Deduplicate by question text to ensure uniqueness
    const unique = new Map();
    questions.forEach(q => {
      const questionKey = q.question.toLowerCase().trim();
      if (!unique.has(questionKey)) {
        unique.set(questionKey, q);
      }
    });
    
    questions = shuffleArray(Array.from(unique.values())).slice(0, qCount);

    // CRITICAL: Ensure we have at least some questions
    if (!questions || questions.length === 0) {
      console.error('❌ CRITICAL ERROR: No questions available after deduplication');
      console.error('   Try increasing the requested questionCount or check API logs');
      
      // Emergency fallback
      console.log('🆘 Using emergency fallback questions...');
      questions = generateMinimalFallback(skillName, diff);
      source = 'Emergency Fallback (Critical)';
      
      if (!questions || questions.length === 0) {
        throw new Error(`Unable to generate any questions for ${skillName}. This should never happen. Check API connectivity and rate limits.`);
      }
    }

    // Handle user field
    let userObjectId = null;
    if (userId && userId !== 'guest' && mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = userId;
    }

    // Save evaluation to database
    const evalDoc = await SkillEvaluation.create({
      user: userObjectId,
      userId: userId || 'guest',
      userEmail: userEmail || null,
      skillName,
      title: `${skillName} Assessment (${diff})`,
      difficulty: diff,
      questions,
      totalQuestions: questions.length,
      status: 'in-progress',
      metadata: {
        generatedFrom: source,
        generatedAt: new Date(),
        generationMethod: 'AI-based random generation'
      }
    });

    console.log(`✅ Evaluation created successfully`);
    console.log(`   Evaluation ID: ${evalDoc._id}`);
    console.log(`   Total Questions: ${questions.length}`);
    console.log(`   Source: ${source}\n`);

    res.json({ 
      evaluationId: evalDoc._id,
      skillName,
      difficulty: diff,
      questions,
      totalQuestions: questions.length,
      source,
      message: 'AI-generated unique questions based on your topic',
      evaluatedAt: new Date()
    });
  } catch (error) {
    console.error('❌ ========== EVALUATION REQUEST FAILED ==========');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error details:', error.toString());
    if (error.stack) console.error('❌ Stack:\n', error.stack);
    console.error('❌ =============================================\n');
    
    // Return detailed error to help with debugging
    res.status(500).json({ 
      error: 'Failed to generate evaluation',
      message: error.message,
      type: error.constructor.name,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
      suggestion: error.message.includes('timeout') ? 'Gemini API is slow. Try with fewer questions or wait a moment.' 
                  : error.message.includes('rate') ? 'Too many requests. Wait a moment before trying again.'
                  : 'Check server logs for details. This may be a temporary issue.',
      timestamp: new Date().toISOString()
    });
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
