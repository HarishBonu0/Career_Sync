import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: String,
  content: String,
  resources: [String]
}, { _id: false });

const moduleSchema = new mongoose.Schema({
  title: String,
  description: String,
  lessons: [lessonSchema],
  duration: String
}, { _id: false });

const courseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for guest users
  userId: { type: String }, // For guest users or external IDs
  userEmail: { type: String }, // Optional user email
  generation: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseGeneration' },
  title: { type: String, required: true },
  description: { type: String },
  level: { type: String },
  difficulty: { type: String }, // Alternative to level
  duration: { type: String },
  totalModules: { type: Number },
  objectives: [{ type: String }],
  modules: [moduleSchema],
  resources: [{ type: mongoose.Schema.Types.Mixed }],
  finalProject: { type: mongoose.Schema.Types.Mixed },
  progress: { type: Number, default: 0 },
  completedModules: [{ type: Number }],
  status: { type: String, enum: ['draft', 'published', 'archived', 'in-progress', 'completed'], default: 'draft' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

courseSchema.index({ user: 1, createdAt: -1 });
courseSchema.index({ userId: 1, createdAt: -1 });
courseSchema.index({ userEmail: 1, createdAt: -1 });

export default mongoose.model('Course', courseSchema);
