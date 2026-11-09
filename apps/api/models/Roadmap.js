import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  targetDate: Date,
  resources: [String]
}, { _id: false });

const roadmapResourceSchema = new mongoose.Schema({
  provider: String,
  externalId: String,
  title: String,
  url: String,
  resourceType: String,
  rank: Number
}, { _id: false });

const roadmapStepSchema = new mongoose.Schema({
  order: Number,
  skill: String,
  priority: String,
  prerequisites: [String],
  resources: [roadmapResourceSchema],
  resourceAvailability: { type: String, enum: ['available', 'unavailable', 'partial'], default: 'unavailable' }
}, { _id: false });

const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId: { type: String },
  userEmail: { type: String },
  currentRole: { type: String },
  targetRole: { type: String },
  timeline: { type: String },
  roadmapText: { type: String },
  title: { type: String },
  description: { type: String },
  stages: { type: Number },
  progress: { type: Number, default: 0 },
  milestones: [milestoneSchema],
  steps: [roadmapStepSchema],
  status: { type: String, enum: ['draft', 'in-progress', 'completed', 'ready', 'partial'], default: 'draft' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

roadmapSchema.index({ user: 1, createdAt: -1 });
roadmapSchema.index({ userId: 1, createdAt: -1 });
roadmapSchema.index({ userEmail: 1, createdAt: -1 });
roadmapSchema.index({ user: 1, status: 1, updatedAt: -1 });

export default mongoose.model('Roadmap', roadmapSchema);
