import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: String,
  options: { type: [String], default: [] },
  correctAnswer: String,
  userAnswer: String,
  isCorrect: Boolean
}, { _id: false });

const skillEvaluationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillName: { type: String, required: true },
  difficulty: { type: String },
  questions: [questionSchema],
  score: Number,
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' }
}, { timestamps: true });

skillEvaluationSchema.index({ user: 1, skillName: 1, createdAt: -1 });

export default mongoose.model('SkillEvaluation', skillEvaluationSchema);
