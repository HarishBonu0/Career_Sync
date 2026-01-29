const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General'
  }
}, { timestamps: true });

// Ensure name and skillName are synced
skillSchema.pre('save', function(next) {
  if (!this.name && this.skillName) {
    this.name = this.skillName;
  } else if (!this.skillName && this.name) {
    this.skillName = this.name;
  }
  next();
});

module.exports = mongoose.model('Skill', skillSchema);
