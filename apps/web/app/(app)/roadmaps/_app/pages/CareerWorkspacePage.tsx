import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  BarChart3,
  Briefcase,
  Map as MapIcon,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  Target,
  Sparkles,
} from 'lucide-react';
import {
  AssessmentReport,
  SimulationInput,
  SimulationResult,
  SkillScoreBreakdown,
} from '../types/index';
import SimulationResults from '../components/Results/SimulationResults';
import RoadmapMindMap from '../components/Roadmap/RoadmapMindMap';
import PersonalizedRoadmapView from '../components/Roadmap/PersonalizedRoadmapView';
import { Button } from '@/components/ui/button';

interface CareerWorkspacePageProps {
  input: SimulationInput;
  report: AssessmentReport;
  simulationResult: SimulationResult;
  personalizedRoadmap?: any;
  onStartOver: () => void;
}

type WorkspaceTab = 'insights' | 'jobs' | 'roadmap';

function getTopPathway(result: SimulationResult) {
  return [...result.pathways].sort((left, right) => right.confidence - left.confidence)[0];
}

function ReadinessGauge({ score, label }: { score: number; label: string }) {
  const cx = 130;
  const cy = 130;
  const r = 90;
  const startDeg = 215;
  const totalSweep = 250;
  const scored = (score / 100) * totalSweep;
  const toRad = (d: number) => (d * Math.PI) / 180;
  function arcPath(startD: number, sweepD: number): string {
    if (sweepD <= 0) return '';
    const s = toRad(startD);
    const e = toRad(startD + sweepD);
    const sx = (cx + r * Math.cos(s)).toFixed(2);
    const sy = (cy + r * Math.sin(s)).toFixed(2);
    const ex = (cx + r * Math.cos(e)).toFixed(2);
    const ey = (cy + r * Math.sin(e)).toFixed(2);
    const large = sweepD > 180 ? 1 : 0;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
  }
  const color = score >= 80 ? 'hsl(var(--primary))' : score >= 65 ? '#f59e0b' : score >= 50 ? '#3b82f6' : '#94a3b8';

  return (
    <svg width="260" height="185" viewBox="0 0 260 185" aria-label={`Readiness score ${score}%`} className="drop-shadow-sm">
      <path d={arcPath(startDeg, totalSweep)} fill="none" stroke="hsl(var(--border))" strokeWidth="16" strokeLinecap="round" />
      {score > 0 && (
        <path d={arcPath(startDeg, scored)} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      )}
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="42" fontWeight="700" fill="currentColor">{score}</text>
      <text x={cx} y={cy + 30} textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))" fontWeight="600" className="uppercase tracking-widest">{label}</text>
    </svg>
  );
}

function RadarChart({ skills }: { skills: SkillScoreBreakdown[] }) {
  const displaySkills = skills.slice(0, 6);
  const N = displaySkills.length;
  if (N < 3) return null;

  const SIZE = 260;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const maxR = 88;
  const labelR = maxR + 25;

  const angle = (i: number) => (i * 2 * Math.PI) / N - Math.PI / 2;
  const point = (i: number, value: number) => {
    const dist = (value / 100) * maxR;
    const a = angle(i);
    return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) };
  };
  const poly = (vals: number[], stroke: string, fill: string, opacity: number) => {
    const pts = vals
      .map((v, i) => {
        const p = point(i, v);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(' ');
    return <polygon points={pts} fill={fill} fillOpacity={opacity} stroke={stroke} strokeWidth="2" strokeLinejoin="round" className="transition-all duration-1000" />;
  };

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
      {[0.25, 0.5, 0.75, 1.0].map((pct) => {
        const pts = displaySkills
          .map((_, i) => {
            const p = point(i, 100 * pct);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          })
          .join(' ');
        return <polygon key={pct} points={pts} fill="none" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray={pct === 1 ? 'none' : '4 4'} />;
      })}
      {displaySkills.map((_, i) => {
        const outer = point(i, 100);
        return (
          <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke="hsl(var(--border))" strokeWidth="1" />
        );
      })}
      {poly(displaySkills.map((s) => s.selfScore), 'hsl(var(--muted-foreground))', 'hsl(var(--muted))', 0.2)}
      {poly(displaySkills.map((s) => s.assessedScore), 'hsl(var(--primary))', 'hsl(var(--primary))', 0.2)}
      {displaySkills.map((s, i) => {
        const pa = point(i, s.assessedScore);
        const ps = point(i, s.selfScore);
        return (
          <g key={i}>
            <circle cx={pa.x.toFixed(1)} cy={pa.y.toFixed(1)} r="4" fill="hsl(var(--primary))" />
            <circle cx={ps.x.toFixed(1)} cy={ps.y.toFixed(1)} r="3" fill="hsl(var(--muted-foreground))" />
          </g>
        );
      })}
      {displaySkills.map((s, i) => {
        const lp = { x: cx + labelR * Math.cos(angle(i)), y: cy + labelR * Math.sin(angle(i)) };
        const name = s.skill.length > 12 ? s.skill.slice(0, 12) + '…' : s.skill;
        return (
          <text
            key={i}
            x={lp.x.toFixed(1)}
            y={lp.y.toFixed(1)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="600"
            fill="currentColor"
            className="text-foreground"
          >
            {name}
          </text>
        );
      })}
    </svg>
  );
}

function ScoreCompositionBar({
  assessment,
  selfScore,
  resume,
}: {
  assessment: number;
  selfScore: number;
  resume: number;
}) {
  const segments = [
    { label: 'Assessment (55%)', value: Math.round(assessment * 0.55), bg: 'bg-primary' },
    { label: 'Self-score (25%)', value: Math.round(selfScore * 0.25), bg: 'bg-primary/60' },
    { label: 'Resume (20%)', value: Math.round(resume * 0.2), bg: 'bg-primary/30' },
  ];
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  return (
    <div className="space-y-4">
      {segments.map((seg) => (
        <div key={seg.label}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-muted-foreground">{seg.label}</span>
            <span className="font-semibold text-foreground">{seg.value} pts</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
            <div
              className={`h-full ${seg.bg} transition-all duration-1000 ease-out`}
              style={{ width: `${(seg.value / Math.max(total, 1)) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CareerWorkspacePage({
  input,
  report,
  simulationResult,
  personalizedRoadmap,
  onStartOver,
}: CareerWorkspacePageProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('insights');
  const topPathway = getTopPathway(simulationResult);
  const sectionCount = report.resumeEvidence.extractedSections?.length ?? 0;

  const tabs: { key: WorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'insights', label: 'Insights', icon: BarChart3 },
    { key: 'jobs', label: 'Jobs', icon: Briefcase },
    { key: 'roadmap', label: 'Roadmap', icon: MapIcon },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl border border-border bg-card shadow-elevated-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Workspace Ready
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {report.readinessLabel} for {input.targetRole}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Assessment, self-ratings, and resume evidence processed. Switch between tabs to explore your precise career data.
          </p>
        </div>
        <div className="relative z-10 flex gap-4">
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-background border border-border min-w-[100px] shadow-sm">
            <span className="text-2xl font-bold text-foreground">{report.finalScore}%</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Readiness</span>
          </div>
        </div>
      </div>

      <div className="sticky top-20 z-40 flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/80 px-4 py-3 backdrop-blur-md shadow-sm">
        <nav className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-foreground text-background shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <Button variant="ghost" size="sm" onClick={onStartOver} className="text-muted-foreground hover:text-foreground">
          <RotateCcw className="mr-2 h-4 w-4" />
          Recalculate
        </Button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Overall Readiness</h3>
                <div className="flex flex-col items-center">
                  <ReadinessGauge score={report.finalScore} label={report.readinessLabel} />
                </div>
              </div>

              {report.scoreBreakdown.length >= 3 && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Skill Comparison</h3>
                    <div className="flex gap-3 text-[10px] uppercase font-bold tracking-wider">
                      <span className="text-primary flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Assessed</span>
                      <span className="text-muted-foreground flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground" /> Self</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <RadarChart skills={report.scoreBreakdown} />
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Score Composition</h3>
                <ScoreCompositionBar
                  assessment={report.assessmentScore}
                  selfScore={report.selfScoreAverage}
                  resume={report.resumeScore}
                />
                <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-border">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Correct Answers</p>
                    <p className="text-xl font-semibold text-foreground">{report.correctCount}/{report.answeredCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Self-Score Avg</p>
                    <p className="text-xl font-semibold text-foreground">{report.selfScoreAverage}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resume Analysis</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {report.resumeEvidence.wordCount > 0
                      ? `${report.resumeEvidence.wordCount} words analyzed · ${sectionCount} sections detected`
                      : 'No resume provided'}
                  </p>
                </div>
                {report.resumeEvidence.extractedSections?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {report.resumeEvidence.extractedSections.map((sec) => (
                      <span key={sec} className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {sec}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  {[
                    { label: 'Work experience section', ok: report.resumeEvidence.hasExperience },
                    { label: 'Education section', ok: report.resumeEvidence.hasEducation },
                    { label: 'Certifications', ok: report.resumeEvidence.hasCertifications },
                    { label: 'Skill mentions matching your profile', ok: report.resumeEvidence.skillMentions.length > 0 },
                    { label: 'Quantified impact (numbers / %)', ok: report.resumeEvidence.impactMentions > 0 },
                    { label: 'Project ownership keywords', ok: report.resumeEvidence.projectMentions > 0 },
                  ].map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-3 text-sm">
                      {ok ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-muted-foreground/50" />}
                      <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
                    </div>
                  ))}
                </div>
                
                {report.resumeEvidence.highlights.length > 0 && (
                  <div className="rounded-xl bg-muted/30 p-5 border border-border/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Key Evidence</h4>
                    <ul className="space-y-2 text-sm text-foreground">
                      {report.resumeEvidence.highlights.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Skill Breakdown</h3>
                <div className="space-y-6">
                  {report.scoreBreakdown.map((item) => (
                    <div key={item.skill} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{item.skill}</span>
                        <span className="font-semibold text-foreground">{item.combinedScore}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${item.combinedScore}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <InsightList
                  title="Strengths"
                  icon={TrendingUp}
                  items={report.strengths.length > 0 ? report.strengths : ['Build more evidence by completing all assessment questions.']}
                />
                <InsightList title="Priority Gaps" icon={AlertTriangle} items={report.priorities} />
                <InsightList title="Recommendations" icon={Target} items={report.recommendations} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && <SimulationResults result={simulationResult} />}

        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            {personalizedRoadmap ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-6 py-4 flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  AI-Personalized Track initialized based on your assessment and resume context.
                </span>
              </div>
            ) : topPathway && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Recommended Track</p>
                  <h2 className="text-xl font-semibold text-foreground">{topPathway.role} at {topPathway.company}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{topPathway.description}</p>
                </div>
                <div className="flex gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Salary</p>
                    <p className="text-sm font-medium text-foreground">{topPathway.salary}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Timeline</p>
                    <p className="text-sm font-medium text-foreground">{topPathway.timeline}</p>
                  </div>
                </div>
              </div>
            )}

            {personalizedRoadmap ? (
              <PersonalizedRoadmapView roadmap={personalizedRoadmap} role={input.targetRole} />
            ) : topPathway && (
              <RoadmapMindMap role={input.targetRole} pathway={topPathway} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InsightList({ title, icon: Icon, items }: { title: string; icon: React.ComponentType<{ className?: string }>; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
