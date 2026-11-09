'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const topics = [
  'Python', 'System Design', 'React Advanced Patterns', 'Product Strategy', 'Technical Leadership',
  'Data Engineering', 'Machine Learning', 'Next.js 14', 'TypeScript',
  'DevOps Architecture', 'Cloud Native', 'Cybersecurity', 'Generative AI',
  'Go (Golang)', 'Rust Programming', 'Engineering Management', 'Venture Capital',
  'Financial Modeling', 'UX Research', 'Behavioral Psychology', 'Web3 Architecture'
]

interface TopicPillsProps {
  selectedTopics?: string[]
}

export default function TopicPills({ selectedTopics = [] }: TopicPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const handleTopicClick = (topic: string) => {
    // Navigate to course generation flow
    router.push(`/generate/${encodeURIComponent(topic)}`)
  }

  return (
    <section className="py-8 bg-transparent">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Trending Tracks</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border/80 bg-white hover:bg-muted text-primary" onClick={() => scroll('left')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border/80 bg-white hover:bg-muted text-primary" onClick={() => scroll('right')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative group">
          {/* Fade overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* Topic Pills */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-4"
          >
            {topics.map((topic) => {
              const isSelected = selectedTopics.includes(topic)
              return (
                <button
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className={`flex-none px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border shadow-sm ${
                    isSelected 
                      ? 'bg-primary text-white border-primary shadow-[0_8px_30px_rgba(17,17,17,0.15)] scale-105' 
                      : 'bg-white text-secondary-foreground border-border/80 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md'
                  }`}
                >
                  {topic}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
