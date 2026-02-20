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

// Fallback questions for when API is unavailable
const generateFallbackQuestions = (skillName, difficulty, questionCount) => {
  const difficultyLevelMap = {
    'beginner': 'basic',
    'intermediate': 'fundamental',
    'advanced': 'complex'
  };
  const difficultyLabel = difficultyLevelMap[difficulty] || 'standard';

  const questionGenerators = [
    () => ({
      question: `What best describes ${skillName} at a ${difficultyLabel} level?`,
      options: shuffleArray([
        `A core concept of ${skillName}`,
        'A competing technology',
        'An outdated concept',
        'Not relevant to modern development'
      ]),
      correctAnswer: `A core concept of ${skillName}`,
      practicalExample: `// ${skillName} Basic Example\nconst example = new ${skillName}();\nconsole.log('${skillName} initialized');`,
      exampleLanguage: 'javascript',
      explanation: `${skillName} is a fundamental technology used in modern development to improve efficiency and code quality.`
    }),
    () => ({
      question: `Which of the following is a key benefit of using ${skillName}?`,
      options: shuffleArray([
        'Increased efficiency and productivity',
        'It makes coding harder',
        'It requires more resources',
        'It reduces code quality'
      ]),
      correctAnswer: 'Increased efficiency and productivity',
      practicalExample: `// Demonstrating efficiency with ${skillName}\nfunction process${skillName}(data) {\n  return data.map(item => {\n    // Process using ${skillName} best practices\n    return item.transform();\n  });\n}`,
      exampleLanguage: 'javascript',
      explanation: `${skillName} improves productivity by reducing boilerplate and improving code maintainability.`
    }),
    () => ({
      question: `In a ${difficultyLabel} scenario, what is most important when applying ${skillName}?`,
      options: shuffleArray([
        'Best practices and proper implementation',
        'Speed over accuracy',
        'Ignoring error handling',
        'Not documenting code'
      ]),
      correctAnswer: 'Best practices and proper implementation',
      practicalExample: `// Best practice implementation of ${skillName}\ntry {\n  const result = await implement${skillName}();\n  console.log('Success:', result);\n} catch (error) {\n  console.error('Error in ${skillName}:', error);\n}`,
      exampleLanguage: 'javascript',
      explanation: `Following best practices with ${skillName} ensures code reliability, maintainability, and performance.`
    }),
    () => ({
      question: `Which tool or framework commonly works with ${skillName}?`,
      options: shuffleArray([
        'Modern development frameworks',
        'Obsolete technologies',
        'Hardware only',
        'Physical tools'
      ]),
      correctAnswer: 'Modern development frameworks',
      practicalExample: `// Using ${skillName} with modern frameworks\nimport ${skillName} from '@modern-framework/${skillName.toLowerCase()}';\n\nclass Component extends Framework.Component {\n  use${skillName}() {\n    return <${skillName} />;\n  }\n}`,
      exampleLanguage: 'javascript',
      explanation: `${skillName} integrates seamlessly with modern frameworks like React, Vue, and Angular.`
    }),
    () => ({
      question: `What is a common challenge when learning ${skillName} at the ${difficultyLabel} level?`,
      options: shuffleArray([
        'Understanding complex concepts',
        'It is too simple',
        'No documentation available',
        'Tools do not exist'
      ]),
      correctAnswer: 'Understanding complex concepts',
      practicalExample: `// Common challenge: Managing complex scenarios\n// This example shows handling multiple states\nconst handleComplex${skillName} = (state) => {\n  if (state.isReady && state.hasData) {\n    return state.data.process();\n  }\n  return state.error;\n};`,
      exampleLanguage: 'javascript',
      explanation: `${skillName} has complex concepts that require practice. Common challenges include state management and error handling.`
    }),
    () => ({
      question: `Which practice helps avoid mistakes when using ${skillName}?`,
      options: shuffleArray([
        'Testing and validation',
        'Skipping documentation',
        'Hardcoding everything',
        'Ignoring edge cases'
      ]),
      correctAnswer: 'Testing and validation',
      practicalExample: `// Testing ${skillName} implementation\ntest('${skillName} should work correctly', () => {\n  const instance = new ${skillName}();\n  expect(instance.validate()).toBe(true);\n  expect(instance.process()).toEqual(expectedResult);\n});`,
      exampleLanguage: 'javascript',
      explanation: `Write comprehensive tests for ${skillName} implementations to catch bugs early and ensure reliability.`
    }),
    () => ({
      question: `What would be an appropriate first step to start with ${skillName}?`,
      options: shuffleArray([
        'Learn the fundamentals and setup basics',
        'Jump directly into advanced features',
        'Ignore official documentation',
        'Avoid hands-on practice'
      ]),
      correctAnswer: 'Learn the fundamentals and setup basics',
      practicalExample: `// First step: Setup and basic initialization\nconst setup = async () => {\n  const config = {\n    debug: true,\n    version: '1.0',\n    features: ['feature1', 'feature2']\n  };\n  const instance = new ${skillName}(config);\n  await instance.initialize();\n  return instance;\n};`,
      exampleLanguage: 'javascript',
      explanation: `Start by understanding the basics: setup, configuration, and initialization. Then gradually explore advanced features.`
    })
  ];

  const requested = questionCount || 20;
  const questions = [];
  const seen = new Set();

  while (questions.length < requested) {
    const generator = questionGenerators[Math.floor(Math.random() * questionGenerators.length)];
    const q = generator();
    if (!seen.has(q.question)) {
      seen.add(q.question);
      questions.push(q);
    }
    if (seen.size >= questionGenerators.length && questions.length < requested) {
      // Allow repeats only after exhausting all templates
      questions.push(generator());
    }
  }

  return shuffleArray(questions).slice(0, requested);
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

    // Try to generate questions using Gemini API
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            topK: 40
          }
        });

        const prompt = `You are an expert assessor. Generate ${qCount} unique multiple-choice questions for evaluating "${skillName}" at ${diff} level. Make questions topic-specific, avoid repeats, and vary the style.

For EACH question, include:
1. question - The question text
2. options - Array of 4 multiple choice options
3. correctAnswer - The correct answer
4. practicalExample - A relevant code snippet or practical example (JavaScript or relevant language)
5. exampleLanguage - The language of the example (e.g., 'javascript', 'python', 'sql')
6. explanation - A brief explanation of why the answer is correct and how it applies to ${skillName}

Return ONLY a valid JSON array. Example format:
[{"question":"...","options":["A","B","C","D"],"correctAnswer":"...","practicalExample":"code here","exampleLanguage":"javascript","explanation":"..."}]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        const questionsRaw = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        questions = questionsRaw
          .map(q => {
            if (!q || !q.question || !q.options) return null;
            const opts = Array.isArray(q.options) ? q.options : Object.values(q.options);
            if (!opts || opts.length < 4) return null;
            const normalizedOptions = shuffleArray(opts.slice(0, 4));
            const normalizedAnswer = q.correctAnswer || q.answer || normalizedOptions[0];
            return {
              question: q.question,
              options: normalizedOptions,
              correctAnswer: normalizedOptions.includes(normalizedAnswer) ? normalizedAnswer : normalizedOptions[0],
              practicalExample: q.practicalExample || '',
              exampleLanguage: q.exampleLanguage || 'javascript',
              explanation: q.explanation || ''
            };
          })
          .filter(Boolean);

        const unique = new Map();
        questions.forEach(q => {
          if (q.question && !unique.has(q.question)) unique.set(q.question, q);
        });
        questions = Array.from(unique.values());

        if (questions.length === 0) throw new Error('No valid questions generated');
      } catch (apiError) {
        console.warn('Gemini API error, using fallback questions:', apiError.message);
        questions = generateFallbackQuestions(skillName, diff, qCount);
      }
    } else {
      console.warn('GEMINI_API_KEY not configured, using fallback questions');
      questions = generateFallbackQuestions(skillName, diff, qCount);
    }

    // Handle user field properly
    let userObjectId = null;
    if (userId && userId !== 'guest' && mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = userId;
    }

    if (questions.length < qCount) {
      const fallback = generateFallbackQuestions(skillName, diff, qCount - questions.length);
      questions = questions.concat(fallback);
    }

    questions = shuffleArray(questions).slice(0, qCount);

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
    res.status(500).json({ error: error.message || 'Failed to generate evaluation' });
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
