import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  targetDate: Date,
  resources: [String]
}, { _id: false });

const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentRole: { type: String },
  targetRole: { type: String },
  timeline: { type: String },
  roadmapText: { type: String },
  milestones: [milestoneSchema]
}, { timestamps: true });

roadmapSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Roadmap', roadmapSchema);
