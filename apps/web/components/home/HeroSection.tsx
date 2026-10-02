'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  onSearch?: (query: string) => void
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) router.push(`/generate/${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <section className="relative overflow-hidden pt-20 pb-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_36%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.6),transparent)]" />
      <div className="container-custom">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6 animate-fade-up">
            <span className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              Course generator home
            </span>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Build a course that matches your goal, pace, and starting point.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Enter a topic and we will turn it into a focused curriculum with a review flow, real resources, and a saved course record.
            </p>

            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <label htmlFor="hero-search" className="sr-only">Search topic</label>
              <div className="rounded-2xl border border-border bg-card p-2 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                <input
                  id="hero-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Try: Product design fundamentals"
                  className="h-14 w-full rounded-xl border-0 bg-transparent px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                />

                <div className="mt-2 flex flex-wrap gap-3 px-1 pb-1">
                  <Button type="submit" size="lg" className="shadow-lg shadow-indigo-500/20">
                    Generate course
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="/roadmaps">Explore roadmaps</a>
                  </Button>
                </div>
              </div>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="animate-pop-in rounded-3xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Three features</p>
              <div className="mt-4 space-y-3">
                <FeatureRow title="Course generator" description="Turn any topic into a tailored plan." />
                <FeatureRow title="Roadmaps" description="Map a role, the skills, and the gap." />
                <FeatureRow title="Skill evaluator" description="See where you are before you start." />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <MetricCard label="Topic search" value="1 prompt" />
              <MetricCard label="Resources" value="Real links" />
              <MetricCard label="Saved courses" value="Profile sync" />
              <MetricCard label="Feedback" value="Adaptive" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureRow({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-muted/30 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-foreground/80" />
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
