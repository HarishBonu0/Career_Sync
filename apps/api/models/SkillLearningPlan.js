import mongoose from 'mongoose';

const PrioritizedGapSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  canonicalName: { type: String, required: true },
  priority: { type: String, enum: ['foundational', 'normal', 'downstream'], required: true },
  order: { type: Number, required: true },
  prerequisites: [{ type: String }],
  satisfiedPrerequisites: [{ type: String }],
  reason: { type: String, required: true }
}, { _id: false });

const SkillLearningPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillGapAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillGapAnalysis', required: true },
  targetRoleId: { type: String, required: true },
  targetRole: { type: String, required: true },
  
  prioritizedGaps: [PrioritizedGapSchema],
  
  summary: {
    totalGaps: { type: Number, default: 0 },
    foundationalGaps: { type: Number, default: 0 },
    normalGaps: { type: Number, default: 0 },
    downstreamGaps: { type: Number, default: 0 }
  }
}, { timestamps: true });

SkillLearningPlanSchema.index({ user: 1, targetRoleId: 1 });

export default mongoose.model('SkillLearningPlan', SkillLearningPlanSchema);
