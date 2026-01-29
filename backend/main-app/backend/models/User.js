import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    trim: true 
  },
  phone: { 
    type: String, 
    trim: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'learner', 'educator'], 
    default: 'user' 
  },
  status: { 
    type: String, 
    enum: ['active', 'blocked', 'pending'], 
    default: 'active' 
  },
  provider: { 
    type: String, 
    default: 'email' 
  },
  lastLoginAt: { 
    type: Date 
  },
  loginCount: {
    type: Number,
    default: 0
  },
  otpCode: { 
    type: String 
  },
  otpExpiresAt: { 
    type: Date 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  }
}, { 
  timestamps: true 
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: 1 });

// Methods
userSchema.methods.recordLogin = async function() {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
  return await this.save();
};

userSchema.methods.toSafeObject = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    status: this.status,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt
  };
};

// Statics
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

export default mongoose.model('User', userSchema);
