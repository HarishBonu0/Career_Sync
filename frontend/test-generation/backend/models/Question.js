const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
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
  mainTopic: { 
    type: String, 
    required: true 
  },
  subTopic: { 
    type: String, 
    required: true 
  },
  topic: {
    type: String,
    required: true
  },
  question: { 
    type: String, 
    required: true 
  },
  options: [{ 
    type: String, 
    required: true 
  }],
  correctAnswer: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
