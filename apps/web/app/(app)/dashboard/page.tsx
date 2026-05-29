'use client'

import * as React from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowRight, BookOpen, ClipboardCheck, Map, Sparkles, Layers3, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

type ProfilePayload = {
  profile: {
    name: string
    email: string
    stats: { totalCourses: number; totalRoadmaps: number; totalEvaluations: number; activeDays: number }
    courses: { id: string; title?: string; level?: string; progress?: number; lastAccessed?: string }[]
    roadmaps: { id?: string; _id?: string; title?: string; progress?: number }[]
    evaluations: { id?: string; _id?: string; title?: string; skillName?: string; score?: number; completedAt?: string }[]
  }
}

async function fetchProfile(url: string): Promise<ProfilePayload> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('careersync_token') || localStorage.getItem('Career_Sync_token')
      : null
  const res = await fetch(url, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok) throw new Error(`Profile fetch failed (${res.status})`)
  return res.json()
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { data, isLoading } = useSWR<ProfilePayload>(
    isAuthenticated && user?.id ? `${API_URL}/profile/${user.id}` : null,
    fetchProfile
  )

  const profile = data?.profile
  const firstName = profile?.name?.split(/\s+/)[0] || user?.name?.split(/\s+/)[0] || user?.email?.split('@')[0] || 'there'
  const recentCourses = (profile?.courses || [])
    .slice()
    .sort((a, b) => new Date(b.lastAccessed || 0).getTime() - new Date(a.lastAccessed || 0).getTime())
    .slice(0, 3)
  const roadmap = profile?.roadmaps?.[0]
  const assessment = (profile?.evaluations || [])
    .slice()
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0]

  const quickActions = [
    { title: 'Generate a course', description: 'Turn a topic into a personalized curriculum.', href: '/courses', icon: BookOpen },
    { title: 'Create a roadmap', description: 'Plan an exact path to your target role.', href: '/roadmaps', icon: Map },
    { title: 'Run an assessment', description: 'See what you know and where you need depth.', href: '/assessments', icon: ClipboardCheck },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 py-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.24),transparent_30%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="space-y-5 animate-fade-up">
            <Badge className="w-fit border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/80 hover:bg-white/10">
              Command center
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Good to see you, {firstName}. Your learning workspace is ready.
            </h1>
            <p className="max-w-2xl text-base text-white/80 sm:text-lg">
              Move between courses, roadmaps, and assessments without leaving the dashboard. The layout is designed for quick scanning and decisive next steps.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-lg shadow-indigo-500/20">
                <Link href="/courses">Open course generator</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href="/profile">View profile</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <HeroMetric label="Courses" value={profile?.stats?.totalCourses ?? 0} />
            <HeroMetric label="Roadmaps" value={profile?.stats?.totalRoadmaps ?? 0} />
            <HeroMetric label="Assessments" value={profile?.stats?.totalEvaluations ?? 0} />
            <HeroMetric label="Active days" value={profile?.stats?.activeDays ?? 0} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card key={action.title} className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{action.title}</CardTitle>
                </div>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="-ml-3 w-fit">
                  <Link href={action.href} className="flex items-center gap-1">
                    Open
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-border/70">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Continue learning</CardTitle>
            </div>
            <CardDescription>Resume your most recent course work.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : recentCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No recent courses yet. Start from the generator.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentCourses.map((course) => (
                  <li key={course.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{course.title || 'Untitled course'}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.lastAccessed ? new Date(course.lastAccessed).toLocaleDateString() : 'Recently viewed'}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/course/${course.id}`)}>
                      Resume
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Snapshot</CardTitle>
            </div>
            <CardDescription>Current account context at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <SnapshotRow label="First name" value={firstName} />
            <SnapshotRow label="Roadmap" value={roadmap?.title || 'No roadmap yet'} />
            <SnapshotRow label="Assessment" value={assessment?.title || assessment?.skillName || 'No assessment yet'} />
            <SnapshotRow label="Streak" value={`${profile?.stats?.activeDays ?? 0} days`} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function HeroMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur">
      <p className="text-xs uppercase tracking-[0.2em] text-white/65">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/30 px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  )
}
