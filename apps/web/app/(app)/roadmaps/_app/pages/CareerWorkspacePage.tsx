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
} from 'lucide-react';
import {
  AssessmentReport,
  SimulationInput,
  SimulationResult,
  SkillScoreBreakdown,
} from '../types/index';
import SimulationResults from '../components/Results/SimulationResults';
import RoadmapMindMap from '../components/Roadmap/RoadmapMindMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CareerWorkspacePageProps {
  input: SimulationInput;
  report: AssessmentReport;
  simulationResult: SimulationResult;
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
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#f59e0b' : score >= 50 ? '#3b82f6' : '#94a3b8';

  return (
    <svg width="260" height="185" viewBox="0 0 260 185" aria-label={`Readiness score ${score}%`}>
      <path d={arcPath(startDeg, totalSweep)} fill="none" stroke="hsl(var(--muted))" strokeWidth="16" strokeLinecap="round" />
      {score > 0 && (
        <path d={arcPath(startDeg, scored)} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" />
      )}
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="38" fontWeight="800" fill="currentColor">{score}</text>
      <text x={cx} y={cy + 30} textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))" fontWeight="700">{label}</text>
      <text x="28" y="178" fontSize="9" fill="hsl(var(--muted-foreground))">0</text>
      <text x="224" y="178" fontSize="9" fill="hsl(var(--muted-foreground))">100</text>
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
  const labelR = maxR + 20;

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
    return <polygon points={pts} fill={fill} fillOpacity={opacity} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />;
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
        return <polygon key={pct} points={pts} fill="none" stroke="hsl(var(--muted))" strokeWidth="1" />;
      })}
      {displaySkills.map((_, i) => {
        const outer = point(i, 100);
        return (
          <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke="hsl(var(--muted))" strokeWidth="1" />
        );
      })}
      {poly(displaySkills.map((s) => s.selfScore), '#3b82f6', '#3b82f6', 0.1)}
      {poly(displaySkills.map((s) => s.assessedScore), '#0f766e', '#0f766e', 0.18)}
      {displaySkills.map((s, i) => {
        const pa = point(i, s.assessedScore);
        const ps = point(i, s.selfScore);
        return (
          <g key={i}>
            <circle cx={pa.x.toFixed(1)} cy={pa.y.toFixed(1)} r="5" fill="#0f766e" />
            <circle cx={ps.x.toFixed(1)} cy={ps.y.toFixed(1)} r="4" fill="#3b82f6" />
          </g>
        );
      })}
      {displaySkills.map((s, i) => {
        const lp = { x: cx + labelR * Math.cos(angle(i)), y: cy + labelR * Math.sin(angle(i)) };
        const name = s.skill.length > 11 ? s.skill.slice(0, 11) + '…' : s.skill;
        return (
          <text
            key={i}
            x={lp.x.toFixed(1)}
            y={lp.y.toFixed(1)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="700"
            fill="currentColor"
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
    { label: 'Assessment (55%)', value: Math.round(assessment * 0.55), color: 'bg-emerald-600' },
    { label: 'Self-score (25%)', value: Math.round(selfScore * 0.25), color: 'bg-blue-500' },
    { label: 'Resume (20%)', value: Math.round(resume * 0.2), color: 'bg-amber-500' },
  ];
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  return (
    <div className="space-y-3">
      {segments.map((seg) => (
        <div key={seg.label}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{seg.label}</span>
            <span className="font-semibold tabular-nums">{seg.value} pts</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full ${seg.color} transition-all duration-700`}
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
    <div className="mx-auto max-w-6xl space-y-6">
      <Card>
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr] lg:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Career workspace ready
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {report.readinessLabel} for {input.targetRole}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your assessment, self-ratings, and resume evidence have been combined into one workspace.
              Switch between insights, jobs, and roadmap without leaving the page.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ScorePill label="Final readiness" value={`${report.finalScore}%`} />
            <ScorePill label="Assessment" value={`${report.assessmentScore}%`} />
            <ScorePill label="Resume" value={`${report.resumeScore}%`} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-md border border-border bg-background p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                ].join(' ')}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <Button variant="outline" size="sm" onClick={onStartOver}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Start over
        </Button>
      </div>

      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Overall readiness</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-6">
                <ReadinessGauge score={report.finalScore} label={report.readinessLabel} />
                <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] font-medium text-muted-foreground">
                  <span className="text-emerald-600">● 80+</span>
                  <span className="text-amber-600">● 65–79</span>
                  <span className="text-blue-500">● 50–64</span>
                  <span>● &lt;50</span>
                </div>
              </CardContent>
            </Card>

            {report.scoreBreakdown.length >= 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Skill comparison</CardTitle>
                  <CardDescription className="text-xs">
                    <span className="font-semibold text-emerald-700">● Assessed</span> &nbsp;&nbsp;
                    <span className="font-semibold text-blue-500">● Self-rated</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-6">
                  <RadarChart skills={report.scoreBreakdown} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Score composition</CardTitle>
                <CardDescription className="text-xs">
                  How your final {report.finalScore}% comes together.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScoreCompositionBar
                  assessment={report.assessmentScore}
                  selfScore={report.selfScoreAverage}
                  resume={report.resumeScore}
                />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Mini label="Correct answers" value={`${report.correctCount}/${report.answeredCount}`} />
                  <Mini label="Self-score avg" value={`${report.selfScoreAverage}%`} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Resume analysis</CardTitle>
                  <CardDescription>
                    {report.resumeEvidence.wordCount > 0
                      ? `${report.resumeEvidence.wordCount} words · ${sectionCount} sections detected`
                      : 'No resume uploaded'}
                  </CardDescription>
                </div>
                {report.resumeEvidence.extractedSections?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {report.resumeEvidence.extractedSections.map((sec) => (
                      <span
                        key={sec}
                        className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">Resume quality</span>
                  <span className="font-semibold tabular-nums">{report.resumeScore}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-700"
                    style={{ width: `${report.resumeScore}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { label: 'Work experience section', ok: report.resumeEvidence.hasExperience },
                  { label: 'Education section', ok: report.resumeEvidence.hasEducation },
                  { label: 'Certifications', ok: report.resumeEvidence.hasCertifications },
                  { label: 'Skill mentions matching your profile', ok: report.resumeEvidence.skillMentions.length > 0 },
                  { label: 'Quantified impact (numbers / %)', ok: report.resumeEvidence.impactMentions > 0 },
                  { label: 'Project ownership keywords', ok: report.resumeEvidence.projectMentions > 0 },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-start gap-2 text-sm">
                    {ok ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
                  </div>
                ))}
              </div>

              {report.resumeEvidence.highlights.length > 0 && (
                <ul className="space-y-1.5 border-t border-border pt-4 text-sm text-muted-foreground">
                  {report.resumeEvidence.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Skill-by-skill breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.scoreBreakdown.map((item) => {
                  const color =
                    item.combinedScore >= 70
                      ? 'text-emerald-600'
                      : item.combinedScore >= 50
                        ? 'text-amber-600'
                        : 'text-muted-foreground';
                  return (
                    <div key={item.skill} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.skill}</span>
                        <span className={`font-semibold tabular-nums ${color}`}>{item.combinedScore}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-foreground transition-all duration-700"
                          style={{ width: `${item.combinedScore}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-muted-foreground sm:grid-cols-4">
                        <span>Assessed <span className="font-semibold text-foreground">{item.assessedScore}%</span></span>
                        <span>Self <span className="font-semibold text-foreground">{item.selfScore}%</span></span>
                        <span>Resume <span className="font-semibold text-foreground">{item.resumeScore}%</span></span>
                        <span>{item.correctCount}/{item.questionCount} correct</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <InsightList
                title="Strengths"
                icon={TrendingUp}
                items={
                  report.strengths.length > 0
                    ? report.strengths
                    : ['Build more evidence by completing all assessment questions and adding projects to your resume.']
                }
              />
              <InsightList title="Priority gaps" icon={AlertTriangle} items={report.priorities} />
              <InsightList title="Recommendations" icon={Target} items={report.recommendations} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && <SimulationResults result={simulationResult} />}

      {activeTab === 'roadmap' && topPathway && (
        <div className="space-y-5">
          <Card>
            <CardContent className="flex flex-wrap items-start justify-between gap-4 p-6">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recommended track
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">
                  {topPathway.role} at {topPathway.company}
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{topPathway.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <ScorePill label="Salary" value={topPathway.salary} />
                <ScorePill label="Timeline" value={topPathway.timeline} />
                <ScorePill label="Growth" value={topPathway.growth} />
              </div>
            </CardContent>
          </Card>

          <RoadmapMindMap role={input.targetRole} pathway={topPathway} />
        </div>
      )}
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function InsightList({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-foreground/90">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
