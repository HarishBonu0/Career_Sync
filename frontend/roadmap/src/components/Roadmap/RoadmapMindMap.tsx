import { useMemo, useState } from 'react';
import { Pathway, RoadmapStep } from '../../types/index';
import styles from './RoadmapMindMap.module.css';

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

function capitalize(str: string): string {
  return str.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function extractTechFromText(text: string): string[] {
  const lower = text.toLowerCase();
  return TECH_KEYWORDS.filter((k) => lower.includes(k));
}

function getTypeBaseTopics(step: RoadmapStep, role: string): MindMapSubTopic[] {
  if (step.type === 'CERTIFICATION') {
    return [
      { id: 'c1', label: 'Exam Prep Course', description: `Focused preparation and study plan for ${step.title}.`, courseQuery: `${step.title} certification exam preparation`, colorKey: 'teal' },
      { id: 'c2', label: 'Practice Tests', description: 'Timed mock exams with detailed answer explanations.', courseQuery: `${step.title} practice test mock exam`, colorKey: 'blue' },
      { id: 'c3', label: 'Core Concepts', description: 'Master the essential theory and techniques behind this certification.', courseQuery: `${step.title} fundamentals concepts`, colorKey: 'purple' },
    ];
  }
  if (step.type === 'PROJECT') {
    return [
      { id: 'p1', label: 'System Design', description: `Architecture design patterns for ${role} projects.`, courseQuery: `system design for ${role}`, colorKey: 'teal' },
      { id: 'p2', label: 'Build the Project', description: `Step-by-step project implementation guide: ${step.title}.`, courseQuery: step.title, colorKey: 'blue' },
      { id: 'p3', label: 'Testing & Deployment', description: 'Write tests, set up CI/CD, and deploy to production.', courseQuery: 'testing CI/CD deployment pipeline', colorKey: 'purple' },
      { id: 'p4', label: 'Portfolio Write-up', description: 'Document your project clearly for recruiters and your portfolio.', courseQuery: 'technical portfolio documentation writing', colorKey: 'amber' },
    ];
  }
  if (step.type === 'APPLICATION') {
    return [
      { id: 'a1', label: 'Interview Prep', description: `Technical and behavioral interview coaching for ${role}.`, courseQuery: `${role} interview preparation`, colorKey: 'teal' },
      { id: 'a2', label: 'DSA & Coding Rounds', description: 'Algorithms, data structures, and competitive problem solving.', courseQuery: 'data structures algorithms coding interview', colorKey: 'blue' },
      { id: 'a3', label: 'System Design Interview', description: 'Scalable system design for senior-level interview rounds.', courseQuery: 'system design interview guide', colorKey: 'purple' },
      { id: 'a4', label: 'Resume & LinkedIn', description: `Write a targeted resume and LinkedIn profile for ${role}.`, courseQuery: `resume writing LinkedIn optimization ${role}`, colorKey: 'amber' },
    ];
  }
  // LEARNING default
  return [
    { id: 'l1', label: `${role} Fundamentals`, description: `Core knowledge and skills required for ${role}.`, courseQuery: `${role} fundamentals beginner course`, colorKey: 'teal' },
    { id: 'l2', label: 'Hands-on Projects', description: 'Reinforce learning by building real-world projects.', courseQuery: `${role} hands-on project tutorial`, colorKey: 'blue' },
    { id: 'l3', label: 'Advanced Patterns', description: 'Go beyond basics and master professional-level techniques.', courseQuery: `${role} advanced concepts patterns`, colorKey: 'purple' },
    { id: 'l4', label: `${step.title} Deep Dive`, description: `Comprehensive deep-dive course on: ${step.title}.`, courseQuery: step.title, colorKey: 'amber' },
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

  // Merge: tech topics first, fill remaining slots from type topics
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

function getCourseBaseUrl(): string {
  const urls = (window as any).getModuleUrls?.() ?? {};
  return (urls.course as string) ?? 'http://localhost:3005';
}

const TYPE_LABELS: Record<string, string> = {
  CERTIFICATION: '🏆 Certification',
  PROJECT: '🛠 Portfolio Project',
  APPLICATION: '📨 Apply & Interview',
  LEARNING: '📚 Learning Track',
};

export default function RoadmapMindMap({ role, pathway }: RoadmapMindMapProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    pathway.roadmap[0]?.id ?? null,
  );

  const stepsData = useMemo(
    () => pathway.roadmap.map((step) => ({ step, subTopics: buildSubTopics(step, role) })),
    [pathway.roadmap, role],
  );

  function openCourse(query: string): void {
    const base = getCourseBaseUrl();
    window.open(`${base}/generate/${encodeURIComponent(query)}`, '_blank');
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>🗺️ Career Roadmap Mind Map</h3>
        <p className={styles.headerSub}>
          Click any step node to expand its learning branches. Press{' '}
          <strong>Learn Now</strong> on any sub-topic to open the course generator for that topic.
        </p>
      </div>

      {/* Root role node */}
      <div className={styles.rootRow}>
        <div className={styles.rootNode}>
          <span className={styles.rootEyebrow}>Your Target</span>
          <span className={styles.rootTitle}>{role}</span>
          <span className={styles.rootSub}>{pathway.roadmap.length}-step career pathway</span>
        </div>
      </div>

      {/* Trunk line */}
      <div className={styles.trunk} />

      {/* Horizontal connector track */}
      <div className={styles.horizontalTrack} />

      {/* Step columns */}
      <div className={styles.stepsRow}>
        {stepsData.map(({ step, subTopics }, index) => {
          const isExpanded = expandedId === step.id;

          return (
            <div key={step.id} className={styles.stepColumn}>
              {/* Vertical stem up to horizontal track */}
              <div className={styles.stemUp} />

              {/* Step node */}
              <button
                type="button"
                className={`${styles.stepNode} ${isExpanded ? styles.stepActive : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : step.id)}
                aria-expanded={isExpanded}
              >
                <div className={styles.stepTopRow}>
                  <span className={styles.stepNum}>{index + 1}</span>
                  <span className={styles.stepTypeTag}>{TYPE_LABELS[step.type] ?? step.type}</span>
                </div>
                <span className={styles.stepTitle}>{step.title}</span>
                <span className={styles.stepDuration}>{step.duration}</span>
                <span className={styles.expandHint}>{isExpanded ? '▲ Collapse' : '▼ Explore branches'}</span>
              </button>

              {/* Expanded sub-branch area */}
              {isExpanded && (
                <div className={styles.subArea}>
                  <div className={styles.stemDown} />
                  <div className={styles.stepDescCard}>
                    <p>{step.description}</p>
                  </div>
                  <div className={styles.stemDown} />
                  <div className={styles.subGrid}>
                    {subTopics.map((topic) => (
                      <div key={topic.id} className={`${styles.subCard} ${styles[`color_${topic.colorKey}`]}`}>
                        <div className={styles.subCardBody}>
                          <strong className={styles.subLabel}>{topic.label}</strong>
                          <p className={styles.subDesc}>{topic.description}</p>
                        </div>
                        <button
                          type="button"
                          className={styles.learnBtn}
                          onClick={() => openCourse(topic.courseQuery)}
                          title={`Generate course: ${topic.courseQuery}`}
                        >
                          Learn Now →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#0f766e' }} />
          Click a step to see what to learn
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#f59e0b' }} />
          Active / selected step
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#2563eb' }} />
          Learn Now → opens course generator
        </span>
      </div>
    </div>
  );
}
