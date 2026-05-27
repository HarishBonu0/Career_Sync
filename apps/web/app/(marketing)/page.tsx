import Link from 'next/link'
import { BookOpen, Map, ClipboardCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Module = {
  label: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  features: string[]
  cta: { href: string; label: string }
}

const MODULES: Module[] = [
  {
    label: 'Module 01',
    title: 'AI Course Generator',
    description:
      'Stop searching. Start learning. Career Sync compiles bespoke curriculums from the best resources in seconds.',
    icon: BookOpen,
    features: ['Instant syllabus generation', 'Curated video and reading materials', 'Adaptive difficulty per module'],
    cta: { href: '/courses', label: 'Open course generator' },
  },
  {
    label: 'Module 02',
    title: 'Roadmap Engine',
    description:
      'From where you are to where you want to be. Visualized, calculated, and optimized for salary and time.',
    icon: Map,
    features: ['Role-based gap analysis', 'Salary-optimized paths', 'Milestone-based progress tracking'],
    cta: { href: '/roadmaps', label: 'Launch roadmap generator' },
  },
  {
    label: 'Module 03',
    title: 'Skill Evaluator',
    description:
      'Don’t guess. Prove it. AI-driven evaluations validate your expertise and surface hidden gaps.',
    icon: ClipboardCheck,
    features: ['Dynamic AI questioning', 'Weakness identification', 'Personalized study recommendations'],
    cta: { href: '/assessments', label: 'Run a skill check' },
  },
]

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_34%),linear-gradient(to_bottom,rgba(248,250,252,0.96),rgba(255,255,255,1))]" />
        <div className="absolute left-0 top-20 -z-10 h-56 w-56 rounded-full bg-indigo-400/10 blur-3xl animate-float" />
        <div className="absolute right-0 top-48 -z-10 h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl animate-float" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6 animate-fade-up">
            <span className="inline-flex items-center rounded-full border border-border bg-white/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              Next-gen career intelligence
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Master your <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent animate-gradient-pan">future</span> with AI precision.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              One platform for career roadmaps, on-demand courses, and skill assessments, all backed by your own progress data.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/signup">Create your account</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/courses">Open course generator</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <HeroStat label="Course generator" value="Topic to curriculum" />
              <HeroStat label="Roadmaps" value="Career paths" />
              <HeroStat label="Skill evaluator" value="Gap analysis" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="overflow-hidden border-border/80 shadow-xl shadow-slate-200/60 animate-pop-in">
              <CardHeader className="bg-gradient-to-br from-indigo-600/10 via-white to-fuchsia-600/10">
                <CardTitle className="text-base">Three guided flows</CardTitle>
                <CardDescription>Start where you are and move with intent.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <MiniFeature title="Course generator" description="Turn any topic into a tailored plan." />
                <MiniFeature title="Roadmaps" description="See the skill path for the role you want." />
                <MiniFeature title="Profile hub" description="Review saved work, activity, and recent courses." />
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <InsightTile label="Learning mode" value="Adaptive" />
              <InsightTile label="Resources" value="Real links" />
              <InsightTile label="Profile sync" value="One tap" />
              <InsightTile label="Motion" value="Polished" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-6 py-20">
        {MODULES.map((m, idx) => (
          <ModuleRow key={m.title} module={m} reversed={idx % 2 === 1} />
        ))}
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Deploy your potential.</h2>
          <p className="mt-4 text-base text-muted-foreground">
            Join the intelligence network today.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link href="/signup">Access the platform</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm backdrop-blur">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function MiniFeature({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-background/80 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-foreground/80" />
    </div>
  )
}

function InsightTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function ModuleRow({ module: m, reversed }: { module: Module; reversed: boolean }) {
  const Icon = m.icon
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className={reversed ? 'lg:order-2' : ''}>
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{m.label}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{m.title}</h2>
        <p className="mt-4 text-base text-muted-foreground">{m.description}</p>
        <ul className="mt-6 space-y-2.5">
          {m.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-7">
          <Button asChild>
            <Link href={m.cta.href}>{m.cta.label}</Link>
          </Button>
        </div>
      </div>
      <div className={reversed ? 'lg:order-1' : ''}>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-3 bg-gradient-to-br from-indigo-600/5 to-purple-600/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{m.title}</CardTitle>
              <CardDescription className="text-xs">{m.label}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="bg-card pt-6">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {m.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
