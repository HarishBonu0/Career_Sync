/**
 * Gemini API Service for generating questions
 */

async function generateQuestionsWithGemini(courseName, difficulty, apiKey) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const prompt = `Generate exactly 20 multiple-choice questions for a ${difficulty} level ${courseName} course.

For each question, provide:
1. The question text
2. Exactly 4 options (labeled A, B, C, D)
3. The correct answer (letter only: A, B, C, or D)
4. A main topic category
5. A subtopic category
6. A general topic name

Return the response in the following JSON format:
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
      "mainTopic": "Main topic category",
      "subTopic": "Subtopic category",
      "topic": "General topic name"
    }
  ]
}

Important: Return ONLY valid JSON without any markdown formatting or code blocks. Make sure all questions are relevant to ${courseName} at ${difficulty} level.`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract the generated text from Gemini response
    const generatedText = data.candidates[0].content.parts[0].text;

    // Clean the response text - remove markdown code blocks if present
    let cleanedText = generatedText.trim();
    cleanedText = cleanedText.replace(/```json\s*/g, '');
    cleanedText = cleanedText.replace(/```\s*/g, '');
    cleanedText = cleanedText.trim();

    // Parse the JSON
    const parsedData = JSON.parse(cleanedText);

    // Validate we have 20 questions
    if (!parsedData.questions || parsedData.questions.length !== 20) {
      throw new Error('Did not receive exactly 20 questions from API');
    }

    return parsedData.questions;
  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    throw error;
  }
}

module.exports = {
  generateQuestionsWithGemini
};
