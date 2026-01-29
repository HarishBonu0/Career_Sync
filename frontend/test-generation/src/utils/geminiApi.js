const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get or create a skill
 */
export async function getOrCreateSkill(skillName) {
  try {
    // Try to find existing skill
    const response = await fetch(`${API_BASE_URL}/skills/search/${encodeURIComponent(skillName)}`);
    const skills = await response.json();
    
    if (skills && skills.length > 0) {
      return skills[0];
    }
    
    // Create new skill
    const createResponse = await fetch(`${API_BASE_URL}/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skillName })
    });
    
    if (!createResponse.ok) throw new Error('Failed to create skill');
    return await createResponse.json();
  } catch (error) {
    console.error('Error getting/creating skill:', error);
    throw error;
  }
}

/**
 * Generate and store questions using backend API (generates 60 questions)
 * @param {string} courseName - Name of the course
 * @param {string} difficulty - Difficulty level (beginner/intermediate/advanced)
 * @returns {Promise<Object>} Generation result
 */
export async function generateQuestions(courseName, difficulty) {
  try {
    // First, create or find the skill
    let skill = await getOrCreateSkill(courseName);
    
    // Call backend API to generate 60 questions (API key is stored securely in backend)
    const response = await fetch(`${API_BASE_URL}/questions/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skillId: skill.id,
        level: difficulty
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate questions');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

/**
 * Get test questions (20 random questions for actual test)
 * @param {string} courseName - Name of the course
 * @param {string} difficulty - Difficulty level
 * @returns {Promise<Object>} Test questions and attempt ID
 */
export async function getTestQuestions(courseName, difficulty) {
  try {
    // Find skill
    let skill = await getOrCreateSkill(courseName);
    
    // Call backend to get random test questions
    const response = await fetch(`${API_BASE_URL}/questions/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skillId: skill.id,
        level: difficulty,
        userId: sessionStorage.getItem('guestUserId') || 'guest-' + Date.now()
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get test questions');
    }

    const data = await response.json();
    
    // Transform to frontend format
    const questions = data.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: Array.isArray(q.options) 
        ? q.options.reduce((acc, opt, idx) => {
            acc[String.fromCharCode(65 + idx)] = opt;
            return acc;
          }, {})
        : q.options,
      topic: q.topic || q.main_topic || 'General',
      mainTopic: q.main_topic,
      subTopic: q.sub_topic
    }));

    return {
      attemptId: data.attemptId,
      questions
    };

  } catch (error) {
    console.error('Error getting test questions:', error);
    throw error;
  }
}

/**
 * Submit test answers (includes scoring, badges, YouTube recommendations)
 */
export async function submitTest(attemptId, answers) {
  try {
    const response = await fetch(`${API_BASE_URL}/tests/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attemptId, answers })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit test');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting test:', error);
    throw error;
  }
}

/**
 * Get attempt details by ID
 */
export async function getAttemptById(attemptId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tests/attempt/${attemptId}`);
    if (!response.ok) throw new Error('Failed to fetch attempt');
    return await response.json();
  } catch (error) {
    console.error('Error fetching attempt:', error);
    throw error;
  }
}

/**
 * Get all skills
 */
export async function getSkills() {
  try {
    const response = await fetch(`${API_BASE_URL}/skills`);
    if (!response.ok) throw new Error('Failed to fetch skills');
    return await response.json();
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw error;
  }
}

/**
 * Get user test history
 */
export async function getUserTests(userId, skillId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tests/history/${skillId}?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch test history');
    return await response.json();
  } catch (error) {
    console.error('Error fetching test history:', error);
    throw error;
  }
}
