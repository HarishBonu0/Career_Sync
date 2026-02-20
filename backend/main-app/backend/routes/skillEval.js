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

// Topic-specific question templates for fallback
const getTopicSpecificQuestions = (skillName, difficulty) => {
  const difficultyMap = {
    'beginner': { level: 'basic', complexity: 'fundamental concepts', keywords: ['what is', 'basic', 'introduction'] },
    'intermediate': { level: 'intermediate', complexity: 'practical implementation', keywords: ['how to', 'implement', 'use cases'] },
    'advanced': { level: 'advanced', complexity: 'complex scenarios', keywords: ['optimize', 'architecture', 'best practices', 'design patterns'] }
  };

  const diff = difficultyMap[difficulty] || difficultyMap['intermediate'];
  const skillLower = skillName.toLowerCase();

  // Theory questions
  const theoryQuestions = [
    {
      type: 'theory',
      question: `What is the primary purpose of ${skillName} in modern development?`,
      options: shuffleArray([
        `To improve efficiency and code maintainability in ${skillLower} development`,
        'To make code harder to understand',
        'To increase computational overhead',
        'To replace all existing tools'
      ]),
      correctAnswer: `To improve efficiency and code maintainability in ${skillLower} development`
    },
    {
      type: 'theory',
      question: `Which of these best describes ${skillName}?`,
      options: shuffleArray([
        `${skillName} is a ${diff.level} ${diff.complexity} used in professional development`,
        `${skillName} is an outdated technology`,
        `${skillName} is only for beginners`,
        `${skillName} is not widely used in the industry`
      ]),
      correctAnswer: `${skillName} is a ${diff.level} ${diff.complexity} used in professional development`
    },
    {
      type: 'theory',
      question: `In what scenarios is ${skillName} most effective?`,
      options: shuffleArray([
        `${skillName} is effective when you need ${difficulty === 'beginner' ? 'basic structure' : difficulty === 'intermediate' ? 'scalable solutions' : 'optimized architecture'}`,
        'It is never effective',
        'Only in old legacy systems',
        'Only in academic environments'
      ]),
      correctAnswer: `${skillName} is effective when you need ${difficulty === 'beginner' ? 'basic structure' : difficulty === 'intermediate' ? 'scalable solutions' : 'optimized architecture'}`
    }
  ];

  // Practical/Programming questions
  const practicalQuestions = [
    {
      type: 'practical',
      question: `How would you implement a basic ${skillName} solution?`,
      options: shuffleArray([
        `By following ${skillName} best practices and structuring code properly`,
        'By using any approach without planning',
        'By avoiding documentation',
        'By copying code from the internet without understanding'
      ]),
      correctAnswer: `By following ${skillName} best practices and structuring code properly`
    },
    {
      type: 'practical',
      question: `What is a common mistake when working with ${skillName}?`,
      options: shuffleArray([
        `Ignoring error handling and edge cases in ${skillName} implementations`,
        'Using ${skillName} correctly',
        'Following the documentation',
        'Testing your code thoroughly'
      ]),
      correctAnswer: `Ignoring error handling and edge cases in ${skillName} implementations`
    },
    {
      type: 'practical',
      question: `Which approach is best for debugging ${skillName} code?`,
      options: shuffleArray([
        `Use systematic testing, logging, and debugging tools appropriate for ${skillName}`,
        'Guess randomly what might be wrong',
        'Ignore errors and keep going',
        'Never test your code'
      ]),
      correctAnswer: `Use systematic testing, logging, and debugging tools appropriate for ${skillName}`
    }
  ];

  // Logical/Algorithmic questions based on difficulty
  const logicalQuestions = [];
  
  if (difficulty === 'beginner' || difficulty === 'intermediate') {
    logicalQuestions.push({
      type: 'logical',
      question: `When implementing ${skillName}, what should be your first step?`,
      options: shuffleArray([
        'Plan and understand the requirements before coding',
        'Start coding immediately without planning',
        'Copy existing code without modification',
        'Skip the design phase'
      ]),
      correctAnswer: 'Plan and understand the requirements before coding'
    });
  }
  
  if (difficulty === 'intermediate' || difficulty === 'advanced') {
    logicalQuestions.push({
      type: 'logical',
      question: `How do you optimize ${skillName} for performance?`,
      options: shuffleArray([
        `Profile code, identify bottlenecks, apply ${skillName}-specific optimization techniques`,
        'Make random changes and hope it gets faster',
        'Use the slowest approach for security',
        'Ignore performance considerations'
      ]),
      correctAnswer: `Profile code, identify bottlenecks, apply ${skillName}-specific optimization techniques`
    });
  }

  if (difficulty === 'advanced') {
    logicalQuestions.push({
      type: 'logical',
      question: `Describe an advanced architectural pattern for ${skillName} at scale.`,
      options: shuffleArray([
        `Use modular design, caching strategies, and distributed ${skillName} patterns for scalability`,
        'Use only monolithic approaches',
        'Avoid all architectural patterns',
        'Store everything in memory'
      ]),
      correctAnswer: `Use modular design, caching strategies, and distributed ${skillName} patterns for scalability`
    });
  }

  return { theoryQuestions, practicalQuestions, logicalQuestions };
};

// Enhanced fallback questions with topic awareness
const generateFallbackQuestions = (skillName, difficulty, questionCount) => {
  const { theoryQuestions, practicalQuestions, logicalQuestions } = getTopicSpecificQuestions(skillName, difficulty);
  
  const allQuestions = [...theoryQuestions, ...practicalQuestions, ...logicalQuestions];
  const questions = [];

  // Create question bank and randomly select from it
  while (questions.length < (questionCount || 20)) {
    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    const q = allQuestions[randomIndex];
    
    // Add practical example and explanation
    const enrichedQuestion = {
      ...q,
      practicalExample: generatePracticalExample(skillName, q.type, difficulty),
      exampleLanguage: 'javascript',
      explanation: `${q.correctAnswer}. This relates to ${skillName} because proper implementation and best practices are essential for effective development.`
    };
    
    questions.push(enrichedQuestion);
    
    if (questions.length >= (questionCount || 20)) break;
  }

  return shuffleArray(questions);
};

// Generate practical examples specific to question type
const generatePracticalExample = (skillName, questType, difficulty) => {
  const examples = {
    theory: {
      beginner: `// Understanding ${skillName}\nconst ${skillName.toLowerCase()} = {\n  concept: 'fundamental',\n  purpose: 'improve efficiency',\n  level: 'beginner'\n};\nconsole.log('${skillName} basics:', ${skillName.toLowerCase()});`,
      intermediate: `// ${skillName} Implementation Pattern\nclass ${skillName}Handler {\n  process(data) {\n    return data.map(item => this.transform(item));\n  }\n  transform(item) { return item.process(); }\n}`,
      advanced: `// Advanced ${skillName} Architecture\nconst ${skillName}Manager = {\n  cache: new Map(),\n  async execute(key, task) {\n    if (this.cache.has(key)) return this.cache.get(key);\n    const result = await task();\n    this.cache.set(key, result);\n    return result;\n  }\n};`
    },
    practical: {
      beginner: `// Basic ${skillName} Usage\nconst init = () => {\n  const instance = new ${skillName}();\n  instance.setup();\n  return instance;\n};\nconst app = init();`,
      intermediate: `// ${skillName} with Error Handling\nasync function process${skillName}(data) {\n  try {\n    const result = await execute(data);\n    return { success: true, data: result };\n  } catch (error) {\n    console.error('${skillName} failed:', error);\n    return { success: false, error: error.message };\n  }\n}`,
      advanced: `// Production ${skillName} Pattern\nconst create${skillName}Pipeline = (...handlers) => async (input) => {\n  let result = input;\n  for (const handler of handlers) {\n    result = await handler(result);\n  }\n  return result;\n};`
    },
    logical: {
      beginner: `// ${skillName} Logic Flow\nconst flow = (condition) => {\n  if (condition) { return 'valid'; }\n  return 'invalid';\n};\nconsole.log(flow(true));`,
      intermediate: `// ${skillName} Algorithm\nconst optimize${skillName} = (data) => {\n  const filtered = data.filter(x => x.isValid);\n  return filtered.sort((a, b) => a.priority - b.priority);\n};`,
      advanced: `// ${skillName} Complex Algorithm\nconst distributeLoad = (tasks, workers) => {\n  return tasks.reduce((acc, task, i) => {\n    acc[i % workers].push(task);\n    return acc;\n  }, Array(workers).fill([]));\n};`
    }
  };

  return examples[questType]?.[difficulty] || examples['practical']['intermediate'];
};

// Smart Gemini API generator with better prompts
const generateWithGeminiAPI = async (skillName, difficulty, questionCount) => {
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
        temperature: 0.8,
        topP: 0.9,
        topK: 40
      }
    });

    const detailedPrompt = `You are an expert technical assessor. Generate ${questionCount} diversified questions for "${skillName}" at ${difficulty} difficulty level.

IMPORTANT: Include THREE TYPES of questions:
1. Theory Questions (5): Fundamental concepts, definitions, purpose
2. Practical Questions (8): Implementation, best practices, real-world scenarios
3. Logical/Algorithmic Questions (7): Problem-solving, optimization, design patterns

For EACH question provide:
{
  "question": "Clear question text",
  "type": "theory" | "practical" | "logical",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The correct option",
  "practicalExample": "Relevant code snippet or example",
  "exampleLanguage": "javascript",
  "explanation": "Why this answer is correct and how it applies to ${skillName}"
}

Make questions:
- Specific to ${skillName}, not generic
- Appropriate for ${difficulty} level
- Varied in style and content
- Include actual code examples
- Practical and real-world relevant

Return ONLY a valid JSON array, no other text.`;

    console.log(`📡 Calling Gemini API for ${skillName} (${difficulty}) - ${questionCount} questions`);
    const result = await model.generateContent(detailedPrompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('⚠️  No JSON found in Gemini response');
      return null;
    }

    const questionsRaw = JSON.parse(jsonMatch[0]);
    console.log(`✅ Generated ${questionsRaw.length} questions from Gemini API`);

    return questionsRaw
      .map(q => {
        if (!q?.question || !Array.isArray(q?.options) || q.options.length < 4) return null;
        
        const shuffledOptions = shuffleArray(q.options.slice(0, 4));
        const correctAnswer = q.correctAnswer || shuffledOptions[0];
        
        return {
          question: q.question,
          type: q.type || 'theory',
          options: shuffledOptions,
          correctAnswer: shuffledOptions.includes(correctAnswer) ? correctAnswer : shuffledOptions[0],
          practicalExample: q.practicalExample || '',
          exampleLanguage: q.exampleLanguage || 'javascript',
          explanation: q.explanation || ''
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
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
    let source = 'unknown';

    console.log(`\n📝 Question Generation Request:`);
    console.log(`   Skill: ${skillName}`);
    console.log(`   Difficulty: ${diff}`);
    console.log(`   Count: ${qCount}`);

    // Try Gemini API first
    if (process.env.GEMINI_API_KEY) {
      console.log(`🚀 Attempting Gemini API generation...`);
      const apiQuestions = await generateWithGeminiAPI(skillName, diff, qCount);
      
      if (apiQuestions && apiQuestions.length > 0) {
        questions = apiQuestions;
        source = 'Gemini API';
        console.log(`✅ Successfully generated ${questions.length} questions from Gemini API`);
      } else {
        console.log(`⚠️  Gemini API failed or returned no questions, falling back to local generator`);
        questions = generateFallbackQuestions(skillName, diff, qCount);
        source = 'Local Fallback (API failed)';
      }
    } else {
      console.log(`ℹ️  GEMINI_API_KEY not configured, using local question generator`);
      questions = generateFallbackQuestions(skillName, diff, qCount);
      source = 'Local Fallback (No API Key)';
    }

    // Ensure we have enough questions
    if (questions.length < qCount) {
      const needed = qCount - questions.length;
      console.log(`⏸️  Need ${needed} more questions, generating from fallback...`);
      const additional = generateFallbackQuestions(skillName, diff, needed);
      questions = questions.concat(additional);
    }

    // Deduplicate and finalize
    const unique = new Map();
    questions.forEach(q => {
      if (q.question && !unique.has(q.question)) {
        unique.set(q.question, q);
      }
    });
    
    questions = shuffleArray(Array.from(unique.values())).slice(0, qCount);

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
      title: `${skillName} Evaluation (${diff})`,
      difficulty: diff,
      questions,
      totalQuestions: questions.length,
      status: 'in-progress',
      metadata: {
        generatedFrom: source,
        generatedAt: new Date()
      }
    });

    console.log(`✅ Evaluation created: ${evalDoc._id}`);
    console.log(`   Source: ${source}`);
    console.log(`   Questions: ${questions.length}\n`);

    res.json({ 
      evaluationId: evalDoc._id,
      skillName,
      difficulty: diff,
      questions,
      totalQuestions: questions.length,
      source,
      evaluatedAt: new Date()
    });
  } catch (error) {
    console.error('❌ Skill evaluation error:', error);
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
