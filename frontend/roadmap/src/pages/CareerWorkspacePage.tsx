import { useState } from 'react';
import { AssessmentReport, SimulationInput, SimulationResult, SkillScoreBreakdown } from '../types/index';
import SimulationResults from '../components/Results/SimulationResults';
import RoadmapMindMap from '../components/Roadmap/RoadmapMindMap';
import styles from './CareerWorkspacePage.module.css';

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

// ─── Readiness Gauge (speedometer-style SVG) ────────────────────────────────
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
      <path d={arcPath(startDeg, totalSweep)} fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
      {score > 0 && (
        <path d={arcPath(startDeg, scored)} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" />
      )}
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="38" fontWeight="800" fill="#0b2239">{score}</text>
      <text x={cx} y={cy + 30} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="700">{label}</text>
      <text x="28" y="178" fontSize="9" fill="#9ca3af">0</text>
      <text x="224" y="178" fontSize="9" fill="#9ca3af">100</text>
    </svg>
  );
}

// ─── Skill Radar Chart ───────────────────────────────────────────────────────
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
    const pts = vals.map((v, i) => { const p = point(i, v); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ');
    return <polygon points={pts} fill={fill} fillOpacity={opacity} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />;
  };

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
      {[0.25, 0.5, 0.75, 1.0].map((pct) => {
        const pts = displaySkills.map((_, i) => { const p = point(i, 100 * pct); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ');
        return <polygon key={pct} points={pts} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
      })}
      {displaySkills.map((_, i) => { const outer = point(i, 100); return <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke="#e2e8f0" strokeWidth="1" />; })}
      {poly(displaySkills.map((s) => s.selfScore), '#3b82f6', '#3b82f6', 0.10)}
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
          <text key={i} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="#374151">
            {name}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Score composition bar ───────────────────────────────────────────────────
function ScoreCompositionBar({ assessment, selfScore, resume }: { assessment: number; selfScore: number; resume: number }) {
  const segments = [
    { label: 'Assessment (55%)', value: Math.round(assessment * 0.55), color: '#0f766e' },
    { label: 'Self-score (25%)', value: Math.round(selfScore * 0.25), color: '#3b82f6' },
    { label: 'Resume (20%)', value: Math.round(resume * 0.20), color: '#f59e0b' },
  ];
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  return (
    <div style={{ display: 'grid', gap: '0.7rem' }}>
      {segments.map((seg) => (
        <div key={seg.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>{seg.label}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: seg.color }}>{seg.value} pts</span>
          </div>
          <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(seg.value / Math.max(total, 1)) * 100}%`, background: seg.color, borderRadius: '999px', transition: 'width 0.8s ease' }} />
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

  const resumeQualityColor = report.resumeScore >= 70 ? '#10b981' : report.resumeScore >= 50 ? '#f59e0b' : '#94a3b8';
  const sectionCount = report.resumeEvidence.extractedSections?.length ?? 0;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Career Workspace Ready</p>
          <h1 className={styles.title}>{report.readinessLabel} for {input.targetRole}</h1>
          <p className={styles.subtitle}>
            Your assessment, self-ratings, and resume evidence have been combined into one workspace. Move across insights, jobs, and roadmap without leaving the page.
          </p>
        </div>

        <div className={styles.scorePanel}>
          <div>
            <span>Final Readiness</span>
            <strong>{report.finalScore}%</strong>
          </div>
          <div>
            <span>Assessment Score</span>
            <strong>{report.assessmentScore}%</strong>
          </div>
          <div>
            <span>Resume Quality</span>
            <strong style={{ color: resumeQualityColor }}>{report.resumeScore}%</strong>
          </div>
        </div>
      </section>

      <nav className={styles.tabBar} aria-label="Career workspace sections">
        {([
          { key: 'insights', label: '📊 Insights' },
          { key: 'jobs', label: '💼 Jobs' },
          { key: 'roadmap', label: '🗺️ Roadmap' },
        ] as { key: WorkspaceTab; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
          >
            {tab.label}
          </button>
        ))}

        <button type="button" onClick={onStartOver} className={styles.resetBtn}>
          Start New Assessment
        </button>
      </nav>

      {activeTab === 'insights' && (
        <section className={styles.section}>
          {/* Top charts row */}
          <div className={styles.chartsRow}>
            {/* Readiness gauge */}
            <div className={styles.card} style={{ textAlign: 'center' }}>
              <h2>Overall Readiness</h2>
              <ReadinessGauge score={report.finalScore} label={report.readinessLabel} />
              <div className={styles.gaugeKey}>
                <span style={{ color: '#10b981' }}>● 80+</span>
                <span style={{ color: '#f59e0b' }}>● 65–79</span>
                <span style={{ color: '#3b82f6' }}>● 50–64</span>
                <span style={{ color: '#94a3b8' }}>● below 50</span>
              </div>
            </div>

            {/* Radar chart */}
            {report.scoreBreakdown.length >= 3 && (
              <div className={styles.card}>
                <h2>Skill Comparison</h2>
                <p style={{ color: '#6b7280', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
                  <span style={{ color: '#0f766e', fontWeight: 700 }}>● Assessed</span>
                  &nbsp;&nbsp;
                  <span style={{ color: '#3b82f6', fontWeight: 700 }}>● Self-Rated</span>
                </p>
                <RadarChart skills={report.scoreBreakdown} />
              </div>
            )}

            {/* Score composition */}
            <div className={styles.card}>
              <h2>Score Composition</h2>
              <p style={{ color: '#6b7280', fontSize: '0.82rem', marginBottom: '1rem' }}>
                How your final {report.finalScore}% is calculated from the three signals.
              </p>
              <ScoreCompositionBar
                assessment={report.assessmentScore}
                selfScore={report.selfScoreAverage}
                resume={report.resumeScore}
              />
              <div style={{ marginTop: '1.2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div className={styles.miniStat}>
                  <span>Correct Answers</span>
                  <strong>{report.correctCount} / {report.answeredCount}</strong>
                </div>
                <div className={styles.miniStat}>
                  <span>Self-Score Avg</span>
                  <strong>{report.selfScoreAverage}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Analysis card */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ marginBottom: '0.3rem' }}>Resume Analysis</h2>
                {report.resumeEvidence.wordCount > 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                    {report.resumeEvidence.wordCount} words · {sectionCount} sections detected
                  </p>
                ) : (
                  <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No resume uploaded</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {report.resumeEvidence.extractedSections?.map((sec) => (
                  <span key={sec} className={styles.sectionBadge}>{sec}</span>
                ))}
              </div>
            </div>

            {/* Quality meter */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Resume Quality Score</span>
                <span style={{ fontWeight: 800, color: resumeQualityColor }}>{report.resumeScore}%</span>
              </div>
              <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${report.resumeScore}%`, background: `linear-gradient(90deg, ${resumeQualityColor}, #f59e0b)`, borderRadius: '999px', transition: 'width 0.8s ease' }} />
              </div>
            </div>

            {/* Checklist */}
            <div className={styles.resumeChecklist}>
              {[
                { label: 'Work Experience section', ok: report.resumeEvidence.hasExperience },
                { label: 'Education section', ok: report.resumeEvidence.hasEducation },
                { label: 'Certifications', ok: report.resumeEvidence.hasCertifications },
                { label: 'Skill mentions matching your profile', ok: report.resumeEvidence.skillMentions.length > 0 },
                { label: 'Quantified impact (numbers / %)', ok: report.resumeEvidence.impactMentions > 0 },
                { label: 'Project ownership keywords', ok: report.resumeEvidence.projectMentions > 0 },
              ].map(({ label, ok }) => (
                <div key={label} className={`${styles.checkRow} ${ok ? styles.checkOk : styles.checkMissing}`}>
                  <span>{ok ? '✓' : '✗'}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Detailed highlights */}
            <ul className={styles.bulletList} style={{ marginTop: '1rem' }}>
              {report.resumeEvidence.highlights.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          {/* Skill breakdown + strength/gaps row */}
          <div className={styles.insightLayout}>
            <div className={styles.card}>
              <h2>Skill-by-Skill Breakdown</h2>
              <div className={styles.breakdownList}>
                {report.scoreBreakdown.map((item) => (
                  <div key={item.skill} className={styles.breakdownItem}>
                    <div className={styles.breakdownHeader}>
                      <strong>{item.skill}</strong>
                      <span style={{ fontWeight: 800, color: item.combinedScore >= 70 ? '#10b981' : item.combinedScore >= 50 ? '#f59e0b' : '#94a3b8' }}>
                        {item.combinedScore}%
                      </span>
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${item.combinedScore}%` }}
                        title={`Combined: ${item.combinedScore}%`}
                      />
                    </div>
                    <div className={styles.triScore}>
                      <span>Assessed <strong>{item.assessedScore}%</strong></span>
                      <span>Self <strong>{item.selfScore}%</strong></span>
                      <span>Resume <strong>{item.resumeScore}%</strong></span>
                      <span>{item.correctCount}/{item.questionCount} correct</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.cardStack}>
              <div className={styles.card}>
                <h2>✅ Strengths</h2>
                <ul className={styles.bulletList}>
                  {report.strengths.length > 0
                    ? report.strengths.map((item) => <li key={item}>{item}</li>)
                    : <li>Build more evidence by completing all assessment questions and adding projects to your resume.</li>}
                </ul>
              </div>

              <div className={styles.card}>
                <h2>⚡ Priority Gaps</h2>
                <ul className={styles.bulletList}>
                  {report.priorities.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <div className={styles.card}>
                <h2>🎯 Recommendations</h2>
                <ul className={styles.bulletList}>
                  {report.recommendations.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'jobs' && (
        <section className={styles.section}>
          <SimulationResults result={simulationResult} />
        </section>
      )}

      {activeTab === 'roadmap' && topPathway && (
        <section className={styles.section}>
          <div className={styles.roadmapHero}>
            <div>
              <p className={styles.roadmapEyebrow}>Recommended Track</p>
              <h2>{topPathway.role} at {topPathway.company}</h2>
              <p>{topPathway.description}</p>
            </div>

            <div className={styles.roadmapStats}>
              <span>{topPathway.salary}</span>
              <span>{topPathway.timeline}</span>
              <span>{topPathway.growth}</span>
            </div>
          </div>

          <RoadmapMindMap role={input.targetRole} pathway={topPathway} />
        </section>
      )}
    </div>
  );
}
