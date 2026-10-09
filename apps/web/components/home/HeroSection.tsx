'use client'

import { Search, Sparkles, BookOpen, Target, Network } from 'lucide-react'
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
    <section className="relative overflow-hidden pt-24 pb-16 bg-background">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-accent/10 to-transparent blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />

      <div className="container-custom relative z-10">
        <div className="mx-auto max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Intelligence
          </div>
          
          <h1 className="text-display-2 sm:text-6xl lg:text-[5.5rem] font-bold tracking-tight text-primary leading-[1.05]">
            What do you want to <br className="hidden sm:block" />
            <span className="text-gradient-gold">learn today?</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-secondary-foreground sm:text-xl font-medium leading-relaxed">
            Enter any topic. Our intelligence engine will build a tailored, production-ready curriculum with verified resources in seconds.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mt-10">
            <div className="group relative rounded-full bg-white p-2 shadow-elevated border border-border/80 transition-all hover:border-accent/40 focus-within:border-accent/40 focus-within:shadow-[0_8px_30px_rgba(184,121,36,0.15)]">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Advanced System Design, Product Management..."
                className="h-14 w-full rounded-full bg-transparent pl-14 pr-44 text-lg text-primary placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 font-medium"
              />
              <div className="absolute inset-y-2 right-2">
                <Button type="submit" size="lg" className="h-full rounded-full px-8 text-base font-bold shadow-md bg-primary text-white hover:bg-primary/90 transition-transform hover:-translate-y-0.5 active:translate-y-0">
                  Generate Course
                </Button>
              </div>
            </div>
          </form>

          <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <MetricCard icon={<Target strokeWidth={2.5} />} label="Tailored" value="To Your Goal" />
            <MetricCard icon={<Network strokeWidth={2.5} />} label="Structured" value="Curriculum" />
            <MetricCard icon={<BookOpen strokeWidth={2.5} />} label="Verified" value="Resources" />
            <MetricCard icon={<Sparkles strokeWidth={2.5} />} label="Adaptive" value="Pacing" />
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode, label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-border/80 bg-white shadow-sm p-6 transition-all hover:shadow-md hover:border-accent/20 group">
      <div className="text-muted-foreground group-hover:text-accent transition-colors mb-4 h-6 w-6">
        {icon}
      </div>
      <p className="text-base font-bold text-primary">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
    </div>
  )
}
