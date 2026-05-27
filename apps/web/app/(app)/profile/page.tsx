'use client'

import * as React from 'react'
import useSWR from 'swr'
import { BookOpen, Map, ClipboardCheck, CalendarClock, Bookmark, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('careersync_token') || localStorage.getItem('Career_Sync_token')
      : null
  const res = await fetch(url, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Your career activity and saved work.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-base text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{displayName}</CardTitle>
            <CardDescription>{email || 'No email on file'}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <StatsGrid stats={profile?.stats} loading={isLoading} />
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap dates={profile?.courses?.map(c => c.lastAccessed).filter(Boolean)} days={91} />
            <p className="mt-3 text-sm text-muted-foreground">Current streak: <span className="font-medium">{profile?.stats?.activeDays ?? 0}</span></p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-destructive">Could not load profile</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Section title="Continue learning" icon={BookOpen} loading={isLoading} empty={!profile?.courses?.length}>
        <ul className="divide-y divide-border">
          {profile?.courses
            ?.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100)
            .sort((a,b) => {
              const da = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0
              const db = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0
              return db - da
            })
            .slice(0, 6)
            .map((c, idx) => (
              <li key={c.id || idx} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.title || 'Untitled course'}</p>
                  <p className="text-xs text-muted-foreground">{Math.round(c.progress ?? 0)}% • {c.totalModules ? `${c.totalModules} modules` : ''}</p>
                </div>
                <div className="ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      try {
                        const recent = JSON.parse(localStorage.getItem('recent_courses') || '[]') || []
                        const now = Date.now()
                        const updated = [{ id: c.id, title: c.title, ts: now }, ...recent.filter((r: any) => r.id !== c.id)].slice(0, 20)
                        localStorage.setItem('recent_courses', JSON.stringify(updated))
                      } catch (e) {
                        // ignore
                      }
                      router.push(`/course/${c.id}`)
                    }}
                  >
                    Resume
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      </Section>

      <Section title="Saved" icon={Bookmark} loading={isLoading} empty={!profile?.courses?.some(c => c.isSaved)}>
        <ul className="divide-y divide-border">
          {profile?.courses?.filter(c => c.isSaved).slice(0, 8).map((c, idx) => (
            <li key={c.id || idx} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.title || 'Untitled course'}</p>
                <p className="text-xs text-muted-foreground">{c.totalModules ? `${c.totalModules} modules` : ''}</p>
              </div>
              <Button size="sm" variant="default" onClick={() => router.push(`/course/${c.id}`)}>Open</Button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Recently viewed" icon={Clock} loading={isLoading} empty={!(profile?.courses?.length || (typeof window !== 'undefined' && (JSON.parse(localStorage.getItem('recent_courses') || '[]') || []).length))}>
        <ul className="divide-y divide-border">
          {(() => {
            try {
              const recent = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('recent_courses') || '[]') || []) : []
              const byStorage = recent.map((r: any) => profile?.courses?.find(c => c.id === r.id)).filter(Boolean)
              const byLast = (profile?.courses || []).sort((a,b) => {
                const da = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0
                const db = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0
                return db - da
              }).slice(0, 6)
              const combined = [...byStorage, ...byLast].filter((v,i,self) => self.indexOf(v) === i).slice(0,6)
              return combined.map((c, idx) => (
                <li key={c.id || idx} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c?.title || 'Untitled course'}</p>
                    <p className="text-xs text-muted-foreground">{c?.lastAccessed ? new Date(c.lastAccessed).toLocaleDateString() : ''}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/course/${c.id}`)}>Open</Button>
                </li>
              ))
            } catch (e) {
              return <li className="py-2 text-sm text-muted-foreground">No recent activity yet.</li>
            }
          })()}
        </ul>
      </Section>

      <Section title="Completed" icon={ClipboardCheck} loading={isLoading} empty={!profile?.courses?.some(c => (c.progress || 0) >= 100)}>
        <ul className="divide-y divide-border">
          {profile?.courses?.filter(c => (c.progress || 0) >= 100).slice(0, 8).map((c, idx) => (
            <li key={c.id || idx} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.title || 'Untitled course'}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="default" onClick={() => {
                  // open certificate window and trigger print
                  const name = displayName
                  const title = c.title || 'Certificate'
                  const win = window.open('', '_blank', 'noopener,noreferrer')
                  if (!win) return
                  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Certificate</title><style>body{font-family: sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0} .card{border:1px solid #ddd;padding:48px;text-align:center;border-radius:12px;width:800px} h1{font-size:28px;margin-bottom:8px} p{font-size:18px;margin:6px 0}</style></head><body><div class="card"><h1>Certificate of Completion</h1><p>This certifies that</p><h2>${name}</h2><p>has completed the course</p><h3>${title}</h3><p>Date: ${new Date().toLocaleDateString()}</p></div></body></html>`
                  win.document.write(html)
                  win.document.close()
                  setTimeout(() => { win.print(); }, 250)
                }}>Download</Button>
                <Button size="sm" variant="outline" onClick={() => router.push(`/course/${c.id}`)}>View</Button>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="My courses" icon={BookOpen} loading={isLoading} empty={!profile?.courses?.length}>
        <ul className="divide-y divide-border">
          {profile?.courses?.slice(0, 8).map((c, idx) => (
            <li key={c.id || idx} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.title || 'Untitled course'}</p>
                <p className="text-xs text-muted-foreground">
                  {c.level ? `${c.level} · ` : ''}
                  {c.totalModules ? `${c.totalModules} modules` : 'No module info'}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{Math.round(c.progress ?? 0)}%</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="My roadmaps" icon={Map} loading={isLoading} empty={!profile?.roadmaps?.length}>
        <ul className="divide-y divide-border">
          {profile?.roadmaps?.slice(0, 8).map((r, idx) => (
            <li key={r.id || r._id || idx} className="flex items-center justify-between py-3">
              <p className="truncate text-sm font-medium">{r.title || 'Untitled roadmap'}</p>
              <span className="shrink-0 text-xs text-muted-foreground">{Math.round(r.progress ?? 0)}%</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Skill evaluations"
        icon={ClipboardCheck}
        loading={isLoading}
        empty={!profile?.evaluations?.length}
      >
        <ul className="divide-y divide-border">
          {profile?.evaluations?.slice(0, 8).map((e, idx) => (
            <li key={e.id || e._id || idx} className="flex items-center justify-between py-3">
              <p className="truncate text-sm font-medium">{e.title || e.skillName || 'Untitled evaluation'}</p>
              <span className="shrink-0 text-xs text-muted-foreground">
                {typeof e.score === 'number' ? `${Math.round(e.score)}%` : '—'}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}

function StatsGrid({ stats, loading }: { stats?: ProfileStats; loading: boolean }) {
  const items: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Courses', value: stats?.totalCourses ?? 0, icon: BookOpen },
    { label: 'Roadmaps', value: stats?.totalRoadmaps ?? 0, icon: Map },
    { label: 'Evaluations', value: stats?.totalEvaluations ?? 0, icon: ClipboardCheck },
    { label: 'Active days', value: stats?.activeDays ?? 0, icon: CalendarClock },
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xl font-semibold tabular-nums">
                  {loading && !stats ? '—' : item.value}
                </p>
              </div>
            </CardContent>
          </Card>
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : empty ? (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
