const express = require('express');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');

const router = express.Router();

// Submit test attempt
router.post('/submit', async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    if (!attemptId || !answers) {
      return res.status(400).json({ message: 'attemptId and answers are required' });
    }

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Test attempt not found' });
    }

    const questionIds = attempt.questions.map(q => q.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    let correct = 0;
    let incorrect = 0;
    const results = {};

    questionIds.forEach((qId) => {
      const question = questions.find(q => q._id.toString() === qId.toString());
      if (question) {
        const userAnswer = answers[qId] || answers[qId.toString()];
        const isCorrect = userAnswer && userAnswer === question.correctAnswer;
        if (isCorrect) correct++;
        else incorrect++;

        results[qId] = {
          correct: !!isCorrect,
          userAnswer: userAnswer || null,
          correctAnswer: question.correctAnswer
        };
      }
    });

    const totalQuestions = questionIds.length;
    const score = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;

    attempt.status = 'completed';
    attempt.score = score;
    attempt.answers = answers;
    attempt.correctAnswers = correct;
    attempt.totalQuestions = totalQuestions;
    attempt.submitted = true;
    attempt.completedAt = new Date();
    attempt.questions = attempt.questions.map(q => ({
      questionId: q.questionId,
      selectedAnswer: answers[q.questionId] || answers[q.questionId?.toString()] || null,
      isCorrect: results[q.questionId]?.correct || false
    }));

    await attempt.save();

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

    const attempt = await TestAttempt.findById(attemptId)
      .populate('skill', 'skillName')
      .lean();

    if (!attempt) {
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
