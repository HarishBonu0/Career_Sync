export interface SkillProfile {
  name: string;
  selfScore: number;
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  practicalExample?: string;
  type: 'theory' | 'practical' | 'logical';
  sourceSkill: string;
  focusArea: string;
}

export interface AssessmentSession {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  generatedAt: string;
  questions: AssessmentQuestion[];
  derivedSkills?: SkillProfile[];
  profileInsights?: {
    summary: string;
    observedSkills: string[];
    missingSkills: string[];
    highlights: string[];
  };
}

export interface QuestionOutcome {
  questionId: string;
  sourceSkill: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface SkillScoreBreakdown {
  skill: string;
  selfScore: number;
  assessedScore: number;
  resumeScore: number;
  combinedScore: number;
  questionCount: number;
  correctCount: number;
}

export interface ResumeEvidence {
  evidenceScore: number;
  projectMentions: number;
  impactMentions: number;
  skillMentions: string[];
  highlights: string[];
  wordCount: number;
  hasEducation: boolean;
  hasExperience: boolean;
  hasCertifications: boolean;
  extractedSections: string[];
}

export interface AssessmentReport {
  answeredCount: number;
  correctCount: number;
  assessmentScore: number;
  selfScoreAverage: number;
  resumeScore: number;
  finalScore: number;
  readinessLabel: string;
  scoreBreakdown: SkillScoreBreakdown[];
  resumeEvidence: ResumeEvidence;
  strengths: string[];
  priorities: string[];
  recommendations: string[];
  questionOutcomes: QuestionOutcome[];
}

export interface RoadmapSupportItem {
  title: string;
  description: string;
  proof: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  summary: string;
  duration: string;
  type: 'ROOT' | 'STEP' | 'SUPPORT';
  support: RoadmapSupportItem[];
  children?: RoadmapNode[];
}

export interface SimulationInput {
  currentRole: string;
  experienceYears?: string;
  currentSalary?: string;
  targetRole: string;
  skills: SkillProfile[];
  dailyLearningTime: string;
  dailyStudyHours: number;
  targetSalary?: string;
  resumeFileName?: string;
  resumeText?: string;
  projects?: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'CERTIFICATION' | 'LEARNING' | 'APPLICATION' | 'PROJECT';
}

export interface Pathway {
  id: string;
  company: string;
  role: string;
  difficulty: 'MEDIUM' | 'HIGH';
  confidence: number;
  dataSource: string;
  salary: string;
  timeline: string;
  growth: string;
  description: string;
  roadmap: RoadmapStep[];
  activeListings: number;
  demandLevel: string;
  jobUrl?: string;
  category?: 'Top Tier (FAANG)' | 'Product Companies' | 'High Growth Startups';
}

export interface SimulationResult {
  input: SimulationInput;
  pathsAnalyzed: number;
  marketDemand: string;
  topSkillGap: string;
  dataSources: string[];
  pathways: Pathway[];
  alerts: string[];
}

export interface FilterOptions {
  type: string;
  sort: string;
}
