import mongoose from 'mongoose';

const EvidenceSchema = new mongoose.Schema({
  type: { type: String, enum: ['resume'], default: 'resume' },
  section: { type: String },
  supportingText: { type: String, required: true }
}, { _id: false });

const SkillFactSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  normalizedName: { type: String },
  factType: { type: String, enum: ['explicit', 'normalized', 'derived', 'unknown'], default: 'explicit' },
  evidence: [EvidenceSchema]
}, { _id: false });

const ExperienceFactSchema = new mongoose.Schema({
  title: { type: String },
  company: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  isCurrent: { type: Boolean },
  description: { type: String },
  technologies: [String], 
  evidence: [EvidenceSchema]
}, { _id: false });

const ProjectFactSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  technologies: [String],
  startDate: { type: String },
  endDate: { type: String },
  evidence: [EvidenceSchema]
}, { _id: false });

const CertificationFactSchema = new mongoose.Schema({
  name: { type: String },
  issuer: { type: String },
  date: { type: String },
  credentialId: { type: String },
  credentialUrl: { type: String },
  evidence: [EvidenceSchema]
}, { _id: false });

const EducationFactSchema = new mongoose.Schema({
  institution: { type: String },
  degree: { type: String },
  fieldOfStudy: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  expectedGraduation: { type: Boolean },
  evidence: [EvidenceSchema]
}, { _id: false });

const LinkFactSchema = new mongoose.Schema({
  name: { type: String },
  url: { type: String },
  evidence: [EvidenceSchema]
}, { _id: false });

const ResumeIntelligenceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  resumeHash: { type: String, required: true },
  
  extractionStatus: { type: String, enum: ['processing', 'success', 'partial', 'failed'], default: 'processing' },
  extractionReason: { type: String },

  textTruncated: { type: Boolean, default: false },
  originalTextLength: { type: Number },
  processedTextLength: { type: Number },

  summary: { type: String },
  skills: [SkillFactSchema],
  experience: [ExperienceFactSchema],
  internships: [ExperienceFactSchema],
  projects: [ProjectFactSchema],
  certifications: [CertificationFactSchema],
  education: [EducationFactSchema],
  links: [LinkFactSchema],

  rawTextLength: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

export const ResumeIntelligence = mongoose.models.ResumeIntelligence || mongoose.model('ResumeIntelligence', ResumeIntelligenceSchema);
