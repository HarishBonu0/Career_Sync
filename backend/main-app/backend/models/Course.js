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
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generation: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseGeneration' },
  title: { type: String, required: true },
  description: { type: String },
  level: { type: String },
  duration: { type: String },
  modules: [moduleSchema],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' }
}, { timestamps: true });

courseSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Course', courseSchema);
