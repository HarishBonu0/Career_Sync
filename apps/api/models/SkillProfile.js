import mongoose from 'mongoose';

const skillEvidenceSchema = new mongoose.Schema({
  source: { type: String, required: true }, // e.g., 'resume'
  sourceType: { type: String, required: true }, // 'resume_experience', 'resume_project', 'resume_education', 'resume_certification', 'resume_skill', 'resume_other'
  factType: { type: String }, // 'explicit', 'normalized', 'derived'
  supportingText: { type: String },
  confidence: { type: Number, default: 1.0 },
  resumeIntelligenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResumeIntelligence' }
}, { _id: false });

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  canonicalName: { type: String },
  score: { type: Number, min: 0, max: 100, default: 0 },
  percentage: { type: Number, min: 0, max: 100, default: 0 },
  difficulty: { type: String },
  evaluationId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillEvaluation' },
  evaluatedAt: { type: Date },
  proficiency: { type: String, default: null },
  evidence: { type: [skillEvidenceSchema], default: [] }
}, { _id: false });

const skillProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: { type: [skillSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('SkillProfile', skillProfileSchema);