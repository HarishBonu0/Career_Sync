import * as React from 'react'
import Link from 'next/link'
import { AuthProvider } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { MarketingFooter } from '@/components/layout/MarketingFooter'
import { BookOpen, Map, ClipboardCheck } from 'lucide-react'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-sm">
                C
              </div>
              <span className="text-base font-semibold tracking-tight">Career Sync</span>
            </Link>
            <nav className="ml-4 hidden items-center gap-1 md:flex">
              <Link href="/courses" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                <BookOpen className="h-4 w-4" />
                Course generator
              </Link>
              <Link href="/roadmaps" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                <Map className="h-4 w-4" />
                Roadmaps
              </Link>
              <Link href="/assessments" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                <ClipboardCheck className="h-4 w-4" />
                Skill evaluator
              </Link>
            </nav>
            <nav className="ml-auto flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Get started</Link>
              </Button>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <MarketingFooter />
      </div>
    </AuthProvider>
  )
}
