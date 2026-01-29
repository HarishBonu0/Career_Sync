const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  user: {
    type: String, // Can be user ID or guest ID
    required: true
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    selectedAnswer: String,
    isCorrect: Boolean
  }],
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 20
  },
  score: {
    type: Number,
    default: 0
  },
  weakTopics: [{
    type: String
  }],
  youtubeVideoLinks: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  submitted: {
    type: Boolean,
    default: false
  },
  takenAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    expires: 0 // TTL index
  }
}, { timestamps: true });

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
