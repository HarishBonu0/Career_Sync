import mongoose from 'mongoose';

const SkillLearningResourceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRoleId: { type: String, required: true },
  skillCanonicalName: { type: String, required: true },
  
  provider: { type: String, required: true },
  externalId: { type: String, required: true },
  
  title: { type: String, required: true },
  url: { type: String, required: true },
  resourceType: { type: String, required: true }, // e.g., 'video', 'course'
  
  description: { type: String },
  thumbnailUrl: { type: String },
  author: { type: String },
  
  // provider metadata
  rating: { type: Number },
  reviewCount: { type: Number },
  duration: { type: String },
  publishedAt: { type: Date },
  
  validationStatus: { type: String, enum: ['discovered', 'validated', 'rejected', 'unavailable'], default: 'discovered' },
  rank: { type: Number, default: 0 },
  
  discoveredAt: { type: Date, default: Date.now },
  lastValidatedAt: { type: Date }
}, { timestamps: true });

// Ensure idempotency for user + provider + externalId + skill
SkillLearningResourceSchema.index({ user: 1, targetRoleId: 1, skillCanonicalName: 1, provider: 1, externalId: 1 }, { unique: true });

export default mongoose.model('SkillLearningResource', SkillLearningResourceSchema);
