import Link from 'next/link'
import { ArrowUpRight, Check } from 'lucide-react'
import styles from './home.module.css'

const MODULES = [
  {
    number: 'Module 01',
    title: 'AI Course Generator',
    description: "Stop searching. Start learning. Our agents compile bespoke curriculums from the world's best resources in seconds.",
    features: ['Instant syllabus generation', 'Curated video & reading materials'],
    button: 'Open Course Generator',
    href: '/courses',
  },
  {
    number: 'Module 02',
    title: 'Roadmap Engine',
    description: 'From where you are to where you want to be. Visualized, calculated, and optimized for salary and time.',
    features: ['Role-based gap analysis', 'Salary-optimized paths', 'Milestone-based progress tracking'],
    button: 'Launch Roadmap Generator',
    href: '/roadmaps',
  },
  {
    number: 'Module 03',
    title: 'Skill Evaluator',
    description: "Don't guess. Prove it. Our AI interviews you to validate expertise and uncover hidden gaps.",
    features: ['Dynamic AI questioning', 'Weakness identification', 'Personalized study recommendations'],
    button: 'Evaluate Skill',
    href: '/assessments',
  },
]

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}><span className={styles.eyebrowDot} /> Next-gen career intelligence</span>
            <h1 className={styles.title}>Master Your<span className={styles.titleAccent}>Future</span><span className={styles.titleLine}>With AI Precision</span></h1>
            <p className={styles.description}>Orchestrate your professional journey with the world&apos;s most advanced career intelligence platform.</p>
            <Link href="/courses" className={styles.cta}>Start Intelligence Engine <ArrowUpRight size={16} /></Link>
          </div>
          <CubeVisual />
        </div>
      </section>

      <main className={styles.modules}>
        <ShowcaseModule module={MODULES[0]} visual={<CoursePreview />} className={styles.moduleOne} />
        <ShowcaseModule module={MODULES[1]} visual={<RoadmapPreview />} className={styles.moduleTwo} />
        <ShowcaseModule module={MODULES[2]} visual={<AnalysisPreview />} className={styles.moduleThree} />
      </main>

      <section className={styles.finalCta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.finalTitle}>Deploy Your Potential</h2>
          <p className={styles.finalText}>Join the intelligence network today.</p>
          <Link href="/signup" className={styles.finalButton}>Access Platform <ArrowUpRight size={16} /></Link>
        </div>
      </section>
    </div>
  )
}

function ShowcaseModule({ module, visual, className }: { module: typeof MODULES[number]; visual: React.ReactNode; className: string }) {
  return (
    <section className={`${styles.module} ${className}`}>
      <div className={styles.moduleInner}>
        <div className={styles.moduleVisual}>{visual}</div>
        <div className={styles.moduleCopy}>
          <p className={styles.moduleLabel}>{module.number}</p>
          <h2 className={styles.moduleTitle}>{module.title}</h2>
          <p className={styles.moduleDescription}>{module.description}</p>
          <ul className={styles.checkList}>
            {module.features.map((feature) => <li key={feature}><span className={styles.check}><Check size={11} /></span>{feature}</li>)}
          </ul>
          <Link href={module.href} className={styles.moduleButton}>{module.button} <ArrowUpRight size={15} /></Link>
        </div>
      </div>
    </section>
  )
}

function CubeVisual() {
  return (
    <div className={styles.heroVisual} aria-label="AI and Skills 3D visualization" role="img">
      <div className={styles.orbit} />
      <div className={styles.prism} aria-hidden="true">
        <div className={`${styles.face} ${styles.front}`}><span className={styles.faceLabel}>AI</span></div>
        <div className={`${styles.face} ${styles.side}`}><span className={styles.faceLabel}>Skills</span></div>
        <div className={`${styles.face} ${styles.top}`} />
      </div>
    </div>
  )
}

function CoursePreview() {
  return <div className={styles.preview}><div className={styles.previewBar}><span /><span /><span /></div><div className={styles.code}><div><span className={styles.codeAccent}>generate</span>(<span className={styles.codeStrong}>&quot;Advanced React&quot;</span>)</div><div className={styles.code}>// compiling 12 modules...</div><div className={styles.previewRule} /><div className={styles.codeGreen}>✓ Video Lectures Ready</div><div className={styles.codeGreen}>✓ Labs Configured</div><div className={styles.codeGreen}>✓ Practice Review Ready</div></div></div>
}

function RoadmapPreview() {
  return <div className={styles.roadmapPreview}><p className={styles.roadmapTitle}>Career progression</p><div className={styles.roadmap}><div className={styles.roadStep}><span className={styles.roadDot} /><div><strong>Current</strong><span>Skills mapped</span></div></div><div className={styles.roadStep}><span className={styles.roadDot} /><div><strong>Step 01</strong><span>Build core capability</span></div></div><div className={styles.roadStep}><span className={styles.roadDot} /><div><strong>Goal</strong><span>Role-ready profile</span></div></div></div></div>
}

function AnalysisPreview() {
  return <div className={styles.analysisPreview}><div className={styles.analysisTop}><span>AI skill analysis</span><span className={styles.score}>98%</span></div><div className={styles.graph} /><span className={styles.analysisBadge}>Analysis: 98%</span><div className={styles.gapRow}><span>Skill confidence</span><strong>Advanced</strong></div><div className={styles.gapRow}><span>Next focus</span><strong>System design</strong></div></div>
}
