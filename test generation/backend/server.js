require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Optional: Simple auth middleware (for guest mode)
app.use((req, res, next) => {
  // Allow requests without authentication for guest mode
  req.user = req.headers.authorization ? { _id: req.headers.authorization } : null;
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Mock API Routes
app.get('/api/skills', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, skill_name: 'JavaScript' },
      { id: 2, skill_name: 'Python' },
      { id: 3, skill_name: 'React' }
    ]
  });
});

// Generate questions using Gemini API
app.post('/api/questions/generate', async (req, res) => {
  try {
    const { courseName, difficulty, apiKey } = req.body;

    if (!courseName || !difficulty || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: courseName, difficulty, apiKey'
      });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const prompt = `Generate exactly 20 multiple-choice questions for a ${difficulty} level ${courseName} course.

For each question, provide:
1. The question text
2. Exactly 4 options (labeled A, B, C, D)
3. The correct answer (letter only: A, B, C, or D)
4. A topic/subtopic category for the question

Return the response ONLY as valid JSON (no markdown, no code blocks):
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "A",
      "topic": "Topic name"
    }
  ]
}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    };

    console.log(`📝 Generating questions for ${courseName} at ${difficulty} level...`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      
      return res.status(response.status).json({
        success: false,
        error: `Gemini API Error: ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response structure from Gemini API - no candidates'
      });
    }

    const generatedText = data.candidates[0].content?.parts?.[0]?.text;
    
    if (!generatedText) {
      return res.status(500).json({
        success: false,
        error: 'No text content in Gemini API response'
      });
    }

    // Clean the response text
    let cleanedText = generatedText.trim();
    cleanedText = cleanedText.replace(/```json\s*/g, '');
    cleanedText = cleanedText.replace(/```\s*/g, '');
    cleanedText = cleanedText.trim();
    
    // Parse the JSON
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Attempted to parse:', cleanedText.substring(0, 500));
      
      return res.status(500).json({
        success: false,
        error: 'Failed to parse API response as JSON',
        details: parseError.message
      });
    }
    
    // Validate we have questions
    if (!parsedData.questions || !Array.isArray(parsedData.questions) || parsedData.questions.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'No questions found in parsed response'
      });
    }

    console.log(`✅ Successfully generated ${parsedData.questions.length} questions`);

    res.json({
      success: true,
      data: parsedData.questions,
      count: parsedData.questions.length
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({
      success: false,
      error: 'Error generating questions',
      details: error.message
    });
  }
});

app.post('/api/tests/submit', (req, res) => {
  res.json({
    success: true,
    message: 'Test submission recorded',
    score: null
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}`);
});
