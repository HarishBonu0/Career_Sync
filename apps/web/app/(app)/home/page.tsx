'use client'

import * as React from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowRight, BookOpen, Map, ClipboardCheck, Target, Brain, Compass, Clock, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

type ProfilePayload = {
  profile: {
    name: string
    email: string
    targetRole?: string
    stats: { totalCourses: number; totalRoadmaps: number; totalEvaluations: number; activeDays: number }
    courses: { id: string; title?: string; level?: string; progress?: number; lastAccessed?: string }[]
    roadmaps: { id?: string; _id?: string; title?: string; progress?: number }[]
    evaluations: { id?: string; _id?: string; title?: string; skillName?: string; score?: number; completedAt?: string }[]
  }
}

async function fetchProfile(url: string): Promise<ProfilePayload> {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error(`Profile fetch failed (${res.status})`)
  return res.json()
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { data, isLoading } = useSWR<ProfilePayload>(
    isAuthenticated && user?.id ? `${API_URL}/profile/${user.id}` : null,
    fetchProfile
  )

  const profile = data?.profile
  const firstName = profile?.name?.split(/\s+/)[0] || user?.name?.split(/\s+/)[0] || user?.email?.split('@')[0] || 'there'
  const targetRole = profile?.targetRole || 'Software Engineer' // Fallback if undefined

  const recentCourses = (profile?.courses || [])
    .slice()
    .sort((a, b) => new Date(b.lastAccessed || 0).getTime() - new Date(a.lastAccessed || 0).getTime())
    .slice(0, 3)

  const roadmap = profile?.roadmaps?.[0]
  const assessment = (profile?.evaluations || [])
    .slice()
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0]

  const handleResume = (courseId: string, title?: string) => {
    try {
      const recent = JSON.parse(localStorage.getItem('recent_courses') || '[]') || []
      const updated = [{ id: courseId, title, ts: Date.now() }, ...recent.filter((item: any) => item.id !== courseId)].slice(0, 20)
      localStorage.setItem('recent_courses', JSON.stringify(updated))
    } catch {}
    router.push(`/course-generated/${courseId}`)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-6 py-12">
      {/* Header Section */}
      <section className="flex flex-col gap-2">
        <h1 className="text-display-1 font-bold tracking-tight text-primary">
          Welcome back, {firstName}.
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10">
             <Target className="h-3.5 w-3.5 text-accent" />
          </div>
          <span className="text-sm">Career Target: <strong className="font-semibold text-primary">{targetRole}</strong></span>
        </div>
      </section>

      {/* Primary Action / Next Best Action */}
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-white shadow-elevated transition-all hover:shadow-elevated-hover group">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-transparent opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10 p-8 sm:p-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent border border-accent/20">
              <Play className="h-3 w-3 fill-accent" /> Next Best Action
            </span>
            <h2 className="text-3xl font-bold text-primary tracking-tight">
              {roadmap ? 'Continue your Roadmap' : 'Build your Career Roadmap'}
            </h2>
            <p className="text-base text-secondary-foreground">
              {roadmap 
                ? 'You have an active roadmap. Focus on the next prioritized skill to close your career gap and move closer to your target role.' 
                : 'Analyze your skills against your target role to discover exactly what you need to learn next. CareerSync will generate a personalized path.'}
            </p>
          </div>
          <Button size="lg" className="shrink-0 rounded-full h-14 px-8 text-base font-bold shadow-[0_8px_30px_rgba(184,121,36,0.2)] bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 transition-all" asChild>
            <Link href="/roadmaps">
              {roadmap ? 'Resume Roadmap' : 'Start Analysis'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Learning */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Recent Learning
          </h3>
          <div className="rounded-[1.5rem] border border-border bg-white shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-sm text-muted-foreground animate-pulse">Loading...</div>
            ) : recentCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="h-16 w-16 rounded-full bg-accent/5 flex items-center justify-center mb-4 border border-accent/10">
                  <Compass className="h-8 w-8 text-accent/50" />
                </div>
                <p className="text-sm font-medium text-secondary-foreground mb-4">No active courses. Generate a new course to begin learning.</p>
                <Button variant="outline" className="rounded-full border-border bg-transparent text-primary hover:bg-muted" asChild>
                  <Link href="/courses">Generate Course</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentCourses.map((course) => (
                  <li key={course.id} className="flex items-center justify-between gap-4 p-6 transition-colors hover:bg-muted/30 group">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20 group-hover:scale-105 transition-transform">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-primary">{course.title || 'Untitled course'}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs font-medium text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{course.lastAccessed ? new Date(course.lastAccessed).toLocaleDateString() : 'Recently viewed'}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="rounded-full bg-primary/5 text-primary hover:bg-primary hover:text-white border border-primary/10 transition-colors" onClick={() => handleResume(course.id, course.title)}>
                      Resume
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Snapshot / Quick Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" /> Snapshot
          </h3>
          <div className="rounded-[1.5rem] border border-border bg-white shadow-sm p-6 space-y-8">
            
            <div className="space-y-5">
              <SnapshotItem icon={<Map className="h-5 w-5" />} label="Active Roadmap" value={roadmap?.title || 'None'} />
              <SnapshotItem icon={<ClipboardCheck className="h-5 w-5" />} label="Last Assessment" value={assessment?.skillName || 'None'} />
              <SnapshotItem icon={<Brain className="h-5 w-5" />} label="Learning Streak" value={`${profile?.stats?.activeDays ?? 0} days`} />
            </div>

            <div className="pt-6 border-t border-border space-y-3">
              <Button variant="outline" className="w-full justify-start text-sm font-semibold text-primary border-border hover:bg-muted rounded-xl h-12" asChild>
                <Link href="/assessments">Take Skill Assessment</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm font-semibold text-primary border-border hover:bg-muted rounded-xl h-12" asChild>
                <Link href="/profile">Update Profile & Resume</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SnapshotItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 group">
      <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent border border-accent/20">
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="truncate text-sm font-bold text-primary max-w-[120px]" title={value}>
        {value}
      </span>
    </div>
  )
}
