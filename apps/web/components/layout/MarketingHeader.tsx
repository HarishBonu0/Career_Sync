'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LogOut, Menu, X, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { label: 'Platform', href: '/home' },
  { label: 'Learning', href: '/courses' },
  { label: 'Roadmaps', href: '/roadmaps' },
  { label: 'Assessments', href: '/assessments' },
]

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U'

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    router.push('/login')
  }

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl border-b border-border/50 shadow-sm' 
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 duration-200" onClick={() => setMenuOpen(false)}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-white shadow-[0_4px_14px_rgba(17,17,17,0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/0 via-accent/30 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10">C</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-primary">
            Career<span className="text-accent">Sync</span>
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="relative rounded-full px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-all hover:text-primary group overflow-hidden"
            >
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated && user ? (
            <>
              <Link href="/profile" aria-label={`Open profile for ${displayName}`} className="transition-transform hover:scale-105">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-transparent transition-all hover:ring-accent/30">
                  <AvatarFallback className="bg-primary text-xs font-bold text-white">{initials}</AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-secondary-foreground hover:text-destructive hover:bg-destructive/10 rounded-full px-4 font-semibold transition-all">
                <LogOut size={16} /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-secondary-foreground hover:text-primary hover:bg-accent/5 rounded-full px-6 font-bold transition-all">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="rounded-full px-7 h-11 text-sm font-bold shadow-lg shadow-accent/20 bg-primary text-white hover:bg-primary/90 transition-all hover:-translate-y-0.5 group">
                <Link href="/signup">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <button 
          type="button" 
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-primary hover:bg-accent/5 transition-colors md:hidden" 
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} 
          aria-expanded={menuOpen} 
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-border/50 bg-white/95 backdrop-blur-xl absolute w-full ${
          menuOpen ? 'max-h-[400px] py-4 shadow-xl' : 'max-h-0'
        }`}
      >
        <div className="px-6 space-y-2">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={() => setMenuOpen(false)} 
                className="rounded-xl px-4 py-3 text-base font-bold text-secondary-foreground hover:bg-accent/5 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="mt-4 flex flex-col gap-3 border-t border-border/50 pt-4">
            {isAuthenticated && user ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-bold text-primary hover:bg-accent/5 transition-colors">
                  <Avatar className="h-8 w-8 border border-white shadow-sm">
                    <AvatarFallback className="bg-primary text-xs font-bold text-white">{initials}</AvatarFallback>
                  </Avatar>
                  {displayName}
                </Link>
                <Button variant="ghost" onClick={handleLogout} className="justify-start px-4 text-destructive hover:bg-destructive/10 hover:text-destructive font-bold h-12 rounded-xl">
                  <LogOut className="mr-3 h-5 w-5" /> Sign out
                </Button>
              </>
            ) : (
              <div className="flex gap-3">
                <Button asChild variant="outline" className="flex-1 rounded-xl h-12 font-bold border-border/80 text-primary">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild className="flex-1 rounded-xl h-12 font-bold bg-primary text-white shadow-md shadow-accent/20">
                  <Link href="/signup">Get started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
