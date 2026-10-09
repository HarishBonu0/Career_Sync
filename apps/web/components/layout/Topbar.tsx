'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, User, Settings, Search, LayoutDashboard, Briefcase, ClipboardCheck, Map, BookOpen, Sparkles, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const q = (form.querySelector('input[name="q"]') as HTMLInputElement)?.value?.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const navItems = [
    { href: '/home', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/roadmaps', label: 'Roadmap', icon: Map },
    { href: '/courses', label: 'Learning', icon: BookOpen },
    { href: '/assessments', label: 'Assessments', icon: ClipboardCheck },
    { href: '/career', label: 'Career', icon: Briefcase },
  ]

  return (
    <header 
      className={`sticky top-0 z-50 flex h-20 items-center justify-between px-8 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl border-b border-border/50 shadow-sm' 
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="flex items-center">
        <Link href="/home" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 duration-200">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-white shadow-[0_4px_14px_rgba(17,17,17,0.15)] relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-tr from-accent/0 via-accent/30 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10">C</span>
          </div>
          <span className="hidden text-xl font-extrabold tracking-tight text-primary md:block">
            Career<span className="text-accent">Sync</span>
          </span>
        </Link>
      </div>

      <nav className="hidden flex-1 justify-center items-center gap-1 md:flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all rounded-full group overflow-hidden ${
                isActive 
                  ? 'text-primary' 
                  : 'text-secondary-foreground hover:text-primary'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/5 rounded-full -z-10" />
              )}
              <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-primary'}`} />
              {item.label}
              {isActive && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="hidden lg:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent" />
          </div>
          <input
            name="q"
            placeholder="Search learning resources..."
            className="w-56 rounded-full border border-border/80 bg-white/50 pl-10 pr-4 py-2.5 text-sm font-medium transition-all focus:w-72 focus:bg-white focus:border-accent/50 focus:outline-none focus:ring-4 focus:ring-accent/10 shadow-sm placeholder:text-muted-foreground/60"
          />
          <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border/80 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </form>

        <Button variant="outline" size="icon" className="hidden lg:flex rounded-full border-border/80 bg-white shadow-sm hover:border-accent/40 hover:bg-accent/5 hover:text-accent transition-all w-10 h-10 shrink-0">
          <Sparkles className="h-4 w-4" />
        </Button>

        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-border/80 bg-white pl-1.5 pr-3 py-1.5 shadow-sm transition-all hover:shadow-md hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 group"
              >
                <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                  <AvatarFallback className="bg-primary text-xs font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-primary hidden sm:block max-w-[100px] truncate">{displayName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl border border-border/60 bg-white/95 backdrop-blur-xl shadow-elevated p-2 mt-2 font-medium">
              <DropdownMenuLabel className="px-3 py-2.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-primary truncate">{displayName}</p>
                  <p className="text-xs text-secondary-foreground truncate">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1.5 bg-border/40 mx-1" />
              <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 hover:bg-accent/5 hover:text-accent focus:bg-accent/5 focus:text-accent transition-colors data-[highlighted]:bg-accent/5 data-[highlighted]:text-accent">
                <Link href="/profile" className="flex items-center gap-3">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Profile settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 hover:bg-accent/5 hover:text-accent focus:bg-accent/5 focus:text-accent transition-colors data-[highlighted]:bg-accent/5 data-[highlighted]:text-accent">
                <Link href="/settings" className="flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Preferences</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1.5 bg-border/40 mx-1" />
              <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer rounded-xl px-3 py-2.5 text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive transition-colors data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive">
                <LogOut className="mr-3 h-4 w-4" />
                <span className="text-sm font-semibold">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3">
             <Button variant="ghost" asChild className="hidden sm:flex rounded-full text-sm font-bold hover:bg-accent/5 hover:text-accent transition-all px-5">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="rounded-full px-6 py-5 text-sm font-bold shadow-lg shadow-accent/20 bg-primary text-white hover:bg-primary/90 transition-transform hover:-translate-y-0.5">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
