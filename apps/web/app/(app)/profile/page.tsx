'use client'

import * as React from 'react'
import useSWR from 'swr'
import { BookOpen, Map, ClipboardCheck, CalendarClock, Bookmark, Clock, Award, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import ActivityHeatmap from '@/components/profile/ActivityHeatmap'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

type ProfileStats = {
  totalCourses: number
  totalRoadmaps: number
  totalEvaluations: number
  activeDays: number
}

type ProfileCourse = {
  id: string
  title?: string
  level?: string
  duration?: string
  totalModules?: number
  progress?: number
  enrolledAt?: string
  lastAccessed?: string
  isSaved?: boolean
  currentModule?: number
}

type ProfileRoadmap = {
  id?: string
  _id?: string
  title?: string
  progress?: number
  createdAt?: string
}

type ProfileEvaluation = {
  id?: string
  _id?: string
  title?: string
  skillName?: string
  score?: number
  completedAt?: string
}

type ProfileData = {
  profile: {
    userId: string
    name: string
    email: string
    stats: ProfileStats
    courses: ProfileCourse[]
    roadmaps: ProfileRoadmap[]
    evaluations: ProfileEvaluation[]
  }
}

async function fetchProfile(url: string): Promise<ProfileData> {
  const res = await fetch(url, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`Profile fetch failed (${res.status})`)
  }
  return res.json()
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const userId = user?.id
  const { data, error, isLoading } = useSWR<ProfileData>(
    isAuthenticated && userId ? `${API_URL}/profile/${userId}` : null,
    fetchProfile
  )

  const profile = data?.profile
  const displayName = profile?.name || user?.name || user?.email?.split('@')[0] || 'User'
  const email = profile?.email || user?.email
  const initials =
    displayName
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-10 pb-24">
      {/* Header Profile Section */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-8 md:p-12 shadow-sm">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <Avatar className="h-28 w-28 md:h-32 md:w-32 ring-4 ring-background shadow-xl">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-3xl font-medium text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
              <Star className="h-3.5 w-3.5 fill-primary" />
              Pro Member
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{displayName}</h1>
            <p className="text-lg text-muted-foreground">{email || 'No email on file'}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full shadow-sm" onClick={() => router.push('/settings')}>
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        {/* Main Content Column */}
        <div className="space-y-8">
          <StatsGrid stats={profile?.stats} loading={isLoading} />

          <Section title="Continue Learning" icon={BookOpen} loading={isLoading} empty={!profile?.courses?.length}>
            <div className="grid gap-4">
              {profile?.courses
                ?.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100)
                .sort((a,b) => {
                  const da = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0
                  const db = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0
                  return db - da
                })
                .slice(0, 4)
                .map((c, idx) => (
                  <div key={c.id || idx} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/60 bg-card/40 hover:bg-card hover:border-border transition-all">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="truncate text-base font-semibold text-foreground group-hover:text-primary transition-colors">{c.title || 'Untitled course'}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${Math.round(c.progress ?? 0)}%` }} />
                          </div>
                          {Math.round(c.progress ?? 0)}%
                        </span>
                        {c.totalModules && <span>• {c.totalModules} modules</span>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 rounded-full w-full sm:w-auto"
                      onClick={() => {
                        try {
                          const recent = JSON.parse(localStorage.getItem('recent_courses') || '[]') || []
                          const now = Date.now()
                          const updated = [{ id: c.id, title: c.title, ts: now }, ...recent.filter((r: any) => r.id !== c.id)].slice(0, 20)
                          localStorage.setItem('recent_courses', JSON.stringify(updated))
                        } catch (e) {}
                        const currentTopic = c.currentModule || 1
                        router.push(`/course/${c.id}/topic/${currentTopic}`)
                      }}
                    >
                      Resume
                    </Button>
                  </div>
                ))}
            </div>
          </Section>

          <Section title="Completed Certificates" icon={Award} loading={isLoading} empty={!profile?.courses?.some(c => (c.progress || 0) >= 100)}>
            <div className="grid gap-4 sm:grid-cols-2">
              {profile?.courses?.filter(c => (c.progress || 0) >= 100).slice(0, 4).map((c, idx) => (
                <div key={c.id || idx} className="flex flex-col gap-4 p-5 rounded-2xl border border-border/60 bg-card/40 hover:bg-card transition-all">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-semibold">{c.title || 'Untitled course'}</p>
                    <p className="text-xs text-muted-foreground">100% Completed</p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button size="sm" variant="outline" className="flex-1 rounded-full text-xs" onClick={() => {
                      const name = displayName
                      const title = c.title || 'Certificate'
                      const win = window.open('', '_blank', 'noopener,noreferrer')
                      if (!win) return
                      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Certificate</title><style>body{font-family: sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0} .card{border:1px solid #ddd;padding:48px;text-align:center;border-radius:12px;width:800px} h1{font-size:28px;margin-bottom:8px} p{font-size:18px;margin:6px 0}</style></head><body><div class="card"><h1>Certificate of Completion</h1><p>This certifies that</p><h2>${name}</h2><p>has completed the course</p><h3>${title}</h3><p>Date: ${new Date().toLocaleDateString()}</p></div></body></html>`
                      win.document.write(html)
                      win.document.close()
                      setTimeout(() => { win.print(); }, 250)
                    }}>Download</Button>
                    <Button size="sm" variant="secondary" className="flex-1 rounded-full text-xs" onClick={() => router.push(`/course-generated/${c.id}`)}>View</Button>
                  </div>
                </div>
              ))}
            </div>
          </Section>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarClock className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold">Activity Heatmap</h3>
            </div>
            <ActivityHeatmap
              dates={(profile?.courses?.map((course) => course.lastAccessed).filter((date): date is string => Boolean(date)) ?? []) as (string | Date | null)[]}
              days={91}
            />
            <div className="mt-6 flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
              <span className="text-sm text-muted-foreground font-medium">Current Streak</span>
              <span className="text-lg font-bold text-foreground">{profile?.stats?.activeDays ?? 0} days</span>
            </div>
          </div>

          <Section title="Active Roadmaps" icon={Map} loading={isLoading} empty={!profile?.roadmaps?.length}>
            <div className="space-y-3">
              {profile?.roadmaps?.slice(0, 4).map((r, idx) => (
                <div key={r.id || r._id || idx} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/30 hover:bg-card transition-colors cursor-pointer" onClick={() => window.open(`/roadmaps/${r.id || r._id}`, '_blank', 'noopener,noreferrer')}>
                  <div className="min-w-0 pr-4">
                    <p className="truncate text-sm font-medium">{r.title || 'Untitled roadmap'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{Math.round(r.progress ?? 0)}% complete</p>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Saved Courses" icon={Bookmark} loading={isLoading} empty={!profile?.courses?.some(c => c.isSaved)}>
            <div className="space-y-3">
              {profile?.courses?.filter(c => c.isSaved).slice(0, 5).map((c, idx) => (
                <div key={c.id || idx} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/30 hover:bg-card transition-colors cursor-pointer" onClick={() => window.open(`/course-generated/${c.id}`, '_blank', 'noopener,noreferrer')}>
                  <div className="min-w-0 pr-4">
                    <p className="truncate text-sm font-medium">{c.title || 'Untitled course'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.totalModules ? `${c.totalModules} modules` : 'Preview'}</p>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </Section>

        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load profile: {error.message}
        </div>
      )}

    </div>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}

function StatsGrid({ stats, loading }: { stats?: ProfileStats; loading: boolean }) {
  const items: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Courses Enrolled', value: stats?.totalCourses ?? 0, icon: BookOpen },
    { label: 'Roadmaps Built', value: stats?.totalRoadmaps ?? 0, icon: Map },
    { label: 'Skills Evaluated', value: stats?.totalEvaluations ?? 0, icon: ClipboardCheck },
    { label: 'Learning Streak', value: stats?.activeDays ?? 0, icon: CalendarClock },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.label} className="flex flex-col p-5 rounded-3xl border border-border/60 bg-card/40 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full transition-transform group-hover:scale-110" />
            <Icon className="h-5 w-5 text-muted-foreground mb-4" />
            <p className="text-3xl font-bold tracking-tight text-foreground mb-1">
              {loading && !stats ? '—' : item.value}
            </p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
          </div>
        )
      })}
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  loading,
  empty,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  loading: boolean
  empty: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      
      {loading ? (
        <div className="p-6 text-center text-sm text-muted-foreground border border-border/50 rounded-2xl bg-muted/20">
          Loading…
        </div>
      ) : empty ? (
        <div className="p-8 text-center border border-dashed border-border/60 rounded-2xl bg-muted/10">
          <p className="text-sm text-muted-foreground">Nothing to show yet.</p>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
