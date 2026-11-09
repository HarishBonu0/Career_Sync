import mongoose from 'mongoose';

const AnalyzedSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  canonicalName: { type: String, required: true },
  required: { type: Boolean, default: true },
  // evidence array directly references the original SkillProfile evidence (or is copied)
  evidence: [{
    source: String,
    sourceType: String,
    factType: String,
    supportingText: String,
    confidence: Number,
    resumeIntelligenceId: mongoose.Schema.Types.ObjectId
  }]
}, { _id: false });

const SkillGapAnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillProfile', required: true },
  targetRoleId: { type: String, required: true }, // e.g. 'software-engineer'
  targetRoleTitle: { type: String, required: true },
  
  matchedSkills: [AnalyzedSkillSchema],
  partialSkills: [AnalyzedSkillSchema],
  missingSkills: [AnalyzedSkillSchema],
  
  summary: {
    required: { type: Number, default: 0 },
    matched: { type: Number, default: 0 },
    partial: { type: Number, default: 0 },
    missing: { type: Number, default: 0 },
    coveragePercentage: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Ensure a user has only one latest analysis per target role, or just let them have history.
// To keep it minimal, we can overwrite or just keep the latest.
// Let's add an index to quickly find the latest by user and role.
SkillGapAnalysisSchema.index({ user: 1, targetRoleId: 1 });

export default mongoose.model('SkillGapAnalysis', SkillGapAnalysisSchema);
