import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { Pathway, RoadmapStep } from '../../types/index';
import { Button } from '@/components/ui/button';

interface MindMapSubTopic {
  id: string;
  label: string;
  description: string;
  courseQuery: string;
  colorKey: 'teal' | 'blue' | 'purple' | 'amber';
}

interface RoadmapMindMapProps {
  role: string;
  pathway: Pathway;
}

const TECH_KEYWORDS = [
  'python', 'javascript', 'typescript', 'react', 'vue', 'angular', 'nextjs',
  'nodejs', 'express', 'fastapi', 'flask', 'django', 'java', 'spring',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform',
  'machine learning', 'deep learning', 'nlp', 'computer vision',
  'data science', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch',
  'html', 'css', 'tailwind', 'graphql', 'rest api', 'microservices',
  'system design', 'algorithm', 'data structures', 'devops', 'ci/cd',
  'git', 'github', 'testing', 'jest', 'cypress', 'agile', 'scrum',
];

const COLORS: Array<'teal' | 'blue' | 'purple' | 'amber'> = ['teal', 'blue', 'purple', 'amber'];

const COLOR_CLASSES: Record<MindMapSubTopic['colorKey'], string> = {
  teal: 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 hover:bg-emerald-500/10',
  blue: 'border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40 hover:bg-blue-500/10',
  purple: 'border-violet-500/20 bg-violet-500/5 hover:border-violet-500/40 hover:bg-violet-500/10',
  amber: 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 hover:bg-amber-500/10',
};

function capitalize(str: string): string {
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function extractTechFromText(text: string): string[] {
  const lower = text.toLowerCase();
  return TECH_KEYWORDS.filter((k) => lower.includes(k));
}

function getTypeBaseTopics(step: RoadmapStep, role: string): MindMapSubTopic[] {
  if (step.type === 'CERTIFICATION') {
    return [
      { id: 'c1', label: 'Exam prep course', description: `Focused preparation and study plan for ${step.title}.`, courseQuery: `${step.title} certification exam preparation`, colorKey: 'teal' },
      { id: 'c2', label: 'Practice tests', description: 'Timed mock exams with detailed answer explanations.', courseQuery: `${step.title} practice test mock exam`, colorKey: 'blue' },
      { id: 'c3', label: 'Core concepts', description: 'Master the essential theory and techniques behind this certification.', courseQuery: `${step.title} fundamentals concepts`, colorKey: 'purple' },
    ];
  }
  if (step.type === 'PROJECT') {
    return [
      { id: 'p1', label: 'System design', description: `Architecture design patterns for ${role} projects.`, courseQuery: `system design for ${role}`, colorKey: 'teal' },
      { id: 'p2', label: 'Build the project', description: `Step-by-step project implementation guide: ${step.title}.`, courseQuery: step.title, colorKey: 'blue' },
      { id: 'p3', label: 'Testing & deployment', description: 'Write tests, set up CI/CD, and deploy to production.', courseQuery: 'testing CI/CD deployment pipeline', colorKey: 'purple' },
      { id: 'p4', label: 'Portfolio write-up', description: 'Document your project clearly for recruiters and your portfolio.', courseQuery: 'technical portfolio documentation writing', colorKey: 'amber' },
    ];
  }
  if (step.type === 'APPLICATION') {
    return [
      { id: 'a1', label: 'Interview prep', description: `Technical and behavioral interview coaching for ${role}.`, courseQuery: `${role} interview preparation`, colorKey: 'teal' },
      { id: 'a2', label: 'DSA & coding rounds', description: 'Algorithms, data structures, and competitive problem solving.', courseQuery: 'data structures algorithms coding interview', colorKey: 'blue' },
      { id: 'a3', label: 'System design interview', description: 'Scalable system design for senior-level interview rounds.', courseQuery: 'system design interview guide', colorKey: 'purple' },
      { id: 'a4', label: 'Resume & LinkedIn', description: `Write a targeted resume and LinkedIn profile for ${role}.`, courseQuery: `resume writing LinkedIn optimization ${role}`, colorKey: 'amber' },
    ];
  }
  return [
    { id: 'l1', label: `${role} fundamentals`, description: `Core knowledge and skills required for ${role}.`, courseQuery: `${role} fundamentals beginner course`, colorKey: 'teal' },
    { id: 'l2', label: 'Hands-on projects', description: 'Reinforce learning by building real-world projects.', courseQuery: `${role} hands-on project tutorial`, colorKey: 'blue' },
    { id: 'l3', label: 'Advanced patterns', description: 'Go beyond basics and master professional-level techniques.', courseQuery: `${role} advanced concepts patterns`, colorKey: 'purple' },
    { id: 'l4', label: `${step.title} deep dive`, description: `Comprehensive deep-dive course on: ${step.title}.`, courseQuery: step.title, colorKey: 'amber' },
  ];
}

function buildSubTopics(step: RoadmapStep, role: string): MindMapSubTopic[] {
  const techTerms = extractTechFromText(`${step.title} ${step.description}`);
  const techTopics: MindMapSubTopic[] = techTerms.slice(0, 3).map((tech, i) => ({
    id: `tt-${i}`,
    label: capitalize(tech),
    description: `Structured course on ${capitalize(tech)} for ${role} — from fundamentals to professional-level mastery.`,
    courseQuery: `${tech} for ${role}`,
    colorKey: COLORS[i % COLORS.length],
  }));
  const typeTopics = getTypeBaseTopics(step, role);
  const combined: MindMapSubTopic[] = [...techTopics];
  for (const t of typeTopics) {
    if (combined.length >= 4) break;
    const isDuplicate = combined.some((e) => e.label.toLowerCase() === t.label.toLowerCase());
    if (!isDuplicate) combined.push(t);
  }
  return combined.slice(0, 4).map((topic, i) => ({
    ...topic,
    colorKey: COLORS[i % COLORS.length],
  }));
}

const TYPE_LABELS: Record<string, string> = {
  CERTIFICATION: 'Certification',
  PROJECT: 'Portfolio Project',
  APPLICATION: 'Apply & Interview',
  LEARNING: 'Learning Track',
};

export default function RoadmapMindMap({ role, pathway }: RoadmapMindMapProps) {
  const router = useRouter();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const stepsData = useMemo(
    () => pathway.roadmap.map((step) => ({ step, subTopics: buildSubTopics(step, role) })),
    [pathway.roadmap, role]
  );

  function openCourse(query: string): void {
    window.open(`/generate/${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  }

  const activeData = stepsData[activeStepIndex];

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start relative">
      {/* Visual Roadmap Path */}
      <div className="w-full md:w-1/3 shrink-0 sticky top-28">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Standard Track</p>
          <h2 className="text-xl font-semibold text-foreground">{role}</h2>
          <p className="text-sm text-muted-foreground mt-1">{pathway.roadmap.length} major milestones</p>
        </div>

        <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-border/60">
          {stepsData.map(({ step }, index) => {
            const isActive = activeStepIndex === index;
            const isCompleted = index < activeStepIndex;
            
            let statusColor = 'bg-muted border-border text-muted-foreground';
            if (isActive) statusColor = 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]';
            else if (isCompleted) statusColor = 'bg-primary/20 border-primary/50 text-primary';

            return (
              <div 
                key={step.id} 
                className={`relative cursor-pointer group transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                onClick={() => setActiveStepIndex(index)}
              >
                {/* Node marker */}
                <div className={`absolute -left-[30px] flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-300 ${statusColor}`}>
                  {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <span className="text-[9px] font-bold">{index + 1}</span>}
                </div>
                
                <div className={`pl-2 transition-all duration-300 ${isActive ? 'translate-x-1' : ''}`}>
                  <h3 className={`font-medium leading-tight ${isActive ? 'text-foreground text-base' : 'text-foreground/80 text-sm'}`}>
                    {step.title}
                  </h3>
                  {isActive && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">
                        {TYPE_LABELS[step.type] ?? step.type}
                      </span>
                      <span className="text-xs text-muted-foreground">{step.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Node Detail Panel */}
      <div className="w-full md:w-2/3">
        {activeData ? (
          <div className="rounded-3xl border border-border bg-card shadow-elevated overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="p-8 border-b border-border bg-muted/20 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Milestone {activeStepIndex + 1}</p>
                  <h2 className="text-2xl font-bold text-foreground">{activeData.step.title}</h2>
                  <p className="mt-3 text-sm text-muted-foreground max-w-lg leading-relaxed">
                    {activeData.step.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Learning Branches</h3>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {activeData.subTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`group flex flex-col justify-between gap-4 rounded-xl border p-5 transition-all ${COLOR_CLASSES[topic.colorKey]}`}
                    >
                      <div className="space-y-1.5">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{topic.label}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{topic.description}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="self-start shadow-sm"
                        onClick={() => openCourse(topic.courseQuery)}
                        title={`Generate course: ${topic.courseQuery}`}
                      >
                        <Play className="mr-2 h-3 w-3" />
                        Learn Now
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Footer Navigation */}
            <div className="border-t border-border bg-muted/10 p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={activeStepIndex <= 0}
                onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground font-medium">
                {activeStepIndex + 1} of {stepsData.length}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={activeStepIndex >= stepsData.length - 1}
                onClick={() => setActiveStepIndex(prev => Math.min(stepsData.length - 1, prev + 1))}
              >
                Next Milestone
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
