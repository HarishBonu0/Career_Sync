'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Map, MapPin, CheckCircle, Circle, Play, RefreshCw, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface Milestone {
  title: string
  description: string
  targetDate?: string
  resources?: string[]
}

interface Roadmap {
  _id: string
  title: string
  description?: string
  currentRole?: string
  targetRole?: string
  timeline?: string
  stages?: number
  progress?: number
  status?: string
  milestones?: Milestone[]
}

async function fetcher(url: string) {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch roadmap')
  return res.json()
}

export default function RoadmapViewerPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const roadmapId = params.id as string

  const { data, error, isLoading, mutate } = useSWR<{ data: Roadmap }>(
    isAuthenticated && roadmapId ? `${API_URL}/roadmaps/${roadmapId}` : null,
    fetcher
  )

  const roadmap = data?.data

  const updateProgress = async (newProgress: number) => {
    try {
      const res = await fetch(`${API_URL}/roadmaps/${roadmapId}/progress`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress }),
      })
      if (res.ok) {
        mutate() // Refresh data
      }
    } catch (e) {
      console.error('Failed to update progress', e)
    }
  }

  const handleMarkComplete = (index: number) => {
    if (!roadmap?.milestones) return
    const total = roadmap.milestones.length
    // Basic approximation: assuming completion of milestones up to `index`
    // In a real system, we'd track individual milestone completion.
    const newProgress = Math.min(100, Math.round(((index + 1) / total) * 100))
    updateProgress(newProgress)
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !roadmap) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Button variant="ghost" onClick={() => router.push('/profile')} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Profile
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Roadmap not found</CardTitle>
            <CardDescription>{error?.message || "This roadmap doesn't exist or you don't have access."}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
      <div>
        <Button variant="ghost" onClick={() => router.push('/profile')} className="mb-4 -ml-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Profile
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{roadmap.title}</h1>
        {roadmap.description && <p className="mt-2 text-sm text-muted-foreground">{roadmap.description}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Target Role</div>
            <div className="mt-1 font-semibold">{roadmap.targetRole || 'Not specified'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Timeline</div>
            <div className="mt-1 font-semibold">{roadmap.timeline || 'Flexible'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="mt-1 font-semibold capitalize">{roadmap.status || 'Draft'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Progress</div>
            <div className="mt-1 font-semibold">{roadmap.progress || 0}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Execution Roadmap</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="relative border-l border-border ml-3 space-y-6">
            {roadmap.milestones?.map((step, index) => {
              const currentProgress = roadmap.progress || 0
              const threshold = Math.round(((index) / roadmap.milestones!.length) * 100)
              const isCompleted = currentProgress > threshold

              return (
                <li key={index} className="ml-8">
                  <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-8 ring-background">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </span>
                  <h3 className="mb-1 text-base font-semibold leading-tight">{step.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground whitespace-pre-line">{step.description}</p>
                  
                  {!isCompleted && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleMarkComplete(index)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Stage Complete
                    </Button>
                  )}
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
