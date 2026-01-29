const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Submit test attempt
router.post('/submit', async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    if (!attemptId || !answers) {
      return res.status(400).json({ message: 'attemptId and answers are required' });
    }

    // Get attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (attemptError || !attempt) {
      return res.status(404).json({ message: 'Test attempt not found' });
    }

    // Get questions for this attempt
    const { data: questions, error: questionsError } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_skill_id', attempt.test_skill_id)
      .eq('level', attempt.level);

    if (questionsError) {
      throw questionsError;
    }

    // Calculate score
    let correct = 0;
    let incorrect = 0;
    const results = {};

    Object.keys(answers).forEach(questionId => {
      const question = questions.find(q => q.id === parseInt(questionId));
      if (question) {
        const isCorrect = answers[questionId] === question.correct_answer;
        if (isCorrect) correct++;
        else incorrect++;

        results[questionId] = {
          correct: isCorrect,
          userAnswer: answers[questionId],
          correctAnswer: question.correct_answer
        };
      }
    });

    const totalQuestions = Object.keys(answers).length;
    const score = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;

    // Update attempt
    const { error: updateError } = await supabase
      .from('test_attempts')
      .update({
        status: 'completed',
        score: score,
        answers: answers,
        completed_at: new Date().toISOString()
      })
      .eq('id', attemptId);

    if (updateError) {
      throw updateError;
    }

    res.json({
      attemptId,
      score,
      totalQuestions,
      correct,
      incorrect,
      results
    });

  } catch (error) {
    console.error('Test submission error:', error);
    res.status(500).json({ 
      message: 'Failed to submit test', 
      error: error.message 
    });
  }
});

// Get test attempt results
router.get('/:attemptId', async (req, res) => {
  try {
    const { attemptId } = req.params;

    const { data: attempt, error } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (error || !attempt) {
      return res.status(404).json({ message: 'Test attempt not found' });
    }

    res.json(attempt);
  } catch (error) {
    console.error('Test fetch error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch test attempt', 
      error: error.message 
    });
  }
});

module.exports = router;
