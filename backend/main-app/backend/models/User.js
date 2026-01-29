import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, trim: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'blocked', 'pending'], default: 'active' },
  provider: { type: String, default: 'email' },
  lastLoginAt: { type: Date },
  otpCode: { type: String },
  otpExpiresAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);
