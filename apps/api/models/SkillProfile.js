import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, min: 0, max: 100, default: 0 },
  percentage: { type: Number, min: 0, max: 100, default: 0 },
  difficulty: { type: String },
  evaluationId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillEvaluation' },
  evaluatedAt: { type: Date },
}, { _id: false });

const skillProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: { type: [skillSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('SkillProfile', skillProfileSchema);