import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ExternalLink, Map as MapIcon } from 'lucide-react';
import { Pathway, RoadmapStep } from '../../types/index';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  teal: 'border-emerald-500/30 bg-emerald-500/5',
  blue: 'border-blue-500/30 bg-blue-500/5',
  purple: 'border-violet-500/30 bg-violet-500/5',
  amber: 'border-amber-500/30 bg-amber-500/5',
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
  PROJECT: 'Portfolio project',
  APPLICATION: 'Apply & interview',
  LEARNING: 'Learning track',
};

export default function RoadmapMindMap({ role, pathway }: RoadmapMindMapProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(pathway.roadmap[0]?.id ?? null);

  const stepsData = useMemo(
    () => pathway.roadmap.map((step) => ({ step, subTopics: buildSubTopics(step, role) })),
    [pathway.roadmap, role]
  );

  function openCourse(query: string): void {
    router.push(`/generate/${encodeURIComponent(query)}`);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapIcon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Career roadmap</CardTitle>
        </div>
        <CardDescription>
          Click any step to expand its learning branches. Press <strong>Learn now</strong> on any
          sub-topic to open the course generator for that topic.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border bg-muted/40 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your target</p>
          <p className="mt-0.5 text-base font-semibold">{role}</p>
          <p className="text-xs text-muted-foreground">{pathway.roadmap.length}-step career pathway</p>
        </div>

        <ol className="space-y-3">
          {stepsData.map(({ step, subTopics }, index) => {
            const isExpanded = expandedId === step.id;
            return (
              <li key={step.id} className="overflow-hidden rounded-md border border-border">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : step.id)}
                  aria-expanded={isExpanded}
                  className={[
                    'flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors',
                    isExpanded ? 'bg-muted' : 'hover:bg-muted/50',
                  ].join(' ')}
                >
                  <div className="flex flex-1 items-start gap-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-foreground/20 bg-background text-xs font-semibold tabular-nums">
                      {index + 1}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{step.title}</p>
                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {TYPE_LABELS[step.type] ?? step.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{step.duration}</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="space-y-4 border-t border-border bg-background p-4">
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {subTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className={`flex flex-col gap-3 rounded-md border p-3 ${COLOR_CLASSES[topic.colorKey]}`}
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">{topic.label}</p>
                            <p className="text-xs text-muted-foreground">{topic.description}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="self-start"
                            onClick={() => openCourse(topic.courseQuery)}
                            title={`Generate course: ${topic.courseQuery}`}
                          >
                            Learn now
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Legend dot="bg-emerald-500" label="Click a step to explore its learning branches" />
          <Legend dot="bg-foreground" label="Active step" />
          <Legend dot="bg-blue-500" label="Learn now opens the course generator" />
        </div>
      </CardContent>
    </Card>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
