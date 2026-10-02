'use client'

import Link from 'next/link'
import { ArrowLeft, Sparkles, ArrowRight, LayoutGrid, CheckCircle2 } from 'lucide-react'
import HeroSection from '@/components/home/HeroSection'
import TopicPills from '@/components/home/TopicPills'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const STEPS = [
  {
    title: 'Choose a topic',
    description: 'Start from the search bar or one of the topic chips below.',
    icon: LayoutGrid,
  },
  {
    title: 'Answer a few questions',
    description: 'We personalize the curriculum around your goal, pace, and experience.',
    icon: Sparkles,
  },
  {
    title: 'Review real resources',
    description: 'Your generated course includes stable links and a saved profile record.',
    icon: CheckCircle2,
  },
]

export default function CoursesPage() {
  return (
    <div className="relative overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.14),transparent_40%)]" />
      <div className="container-custom py-6">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      <HeroSection />

      <section className="container-custom py-6 pb-14">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <Card key={step.title} className="border-border/70 shadow-sm animate-pop-in">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                  </div>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <TopicPills />

      <section className="container-custom py-8 pb-16">
        <Card className="overflow-hidden border-border/70">
          <CardHeader className="bg-gradient-to-r from-indigo-600/5 via-background to-fuchsia-600/5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">What happens next</CardTitle>
            </div>
            <CardDescription>
              Pick a topic and the generator takes you into a focused flow instead of a generic suggestion list.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Personalized questions for your goal, level, and study cadence.</p>
              <p>• Stable external resources for every module.</p>
              <p>• Saved output in your profile so you can resume later.</p>
            </div>
            <Button asChild size="lg" className="w-fit justify-self-start lg:justify-self-end">
              <Link href="/generate/Python" className="flex items-center gap-2">
                Try a sample generator flow
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
