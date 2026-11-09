'use client'

import Link from 'next/link'
import { ArrowLeft, Sparkles, LayoutGrid, CheckCircle2, PlayCircle, GraduationCap } from 'lucide-react'
import HeroSection from '@/components/home/HeroSection'
import TopicPills from '@/components/home/TopicPills'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    title: 'Discover your topic',
    description: 'Start from the search bar or explore curated topics designed for modern careers.',
    icon: LayoutGrid,
  },
  {
    title: 'Personalize the path',
    description: 'Answer 3-4 questions. Our AI tailors the curriculum to your exact experience level.',
    icon: Sparkles,
  },
  {
    title: 'Start learning immediately',
    description: 'Get a structured course with verified external resources, videos, and articles.',
    icon: CheckCircle2,
  },
]

export default function CoursesPage() {
  return (
    <div className="relative overflow-hidden bg-background min-h-screen">
      <HeroSection />

      <TopicPills />

      <section className="container-custom py-16 md:py-24">
        <div className="mb-16 text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">How intelligence mapping works</h2>
          <p className="text-secondary-foreground max-w-2xl mx-auto text-lg">From an idea to a fully structured, personalized curriculum in seconds.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="relative group rounded-[2rem] border border-border/80 bg-white p-10 hover:shadow-elevated transition-all duration-500">
                <div className="absolute top-8 right-8 text-8xl font-black text-accent/5 select-none pointer-events-none transition-transform group-hover:-translate-y-4 group-hover:text-accent/10">
                  0{i + 1}
                </div>
                <div className="relative z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-8 border border-accent/20 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-primary">{step.title}</h3>
                  <p className="text-secondary-foreground leading-relaxed font-medium">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="container-custom py-12 pb-32">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/80 bg-white shadow-elevated">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-60" />
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 grid gap-8 p-12 md:p-20 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent border border-accent/20">
                <GraduationCap className="h-4 w-4" />
                Intelligent Generation
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">Stop searching. Start learning.</h2>
              <p className="text-lg text-secondary-foreground leading-relaxed font-medium">
                Enter any topic—from <span className="text-primary font-bold">"System Design"</span> to <span className="text-primary font-bold">"Negotiation Skills"</span>—and the generator builds a tailored curriculum instead of giving you a generic list of videos.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="rounded-full h-14 px-8 text-base font-bold shadow-lg shadow-accent/20 bg-primary text-white hover:bg-primary/90 transition-transform hover:-translate-y-1">
                <Link href="/generate/React%20Advanced%20Patterns">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Try a sample course
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
