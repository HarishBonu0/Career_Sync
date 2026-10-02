'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, User, Settings, Search, BookOpen, Map, ClipboardCheck } from 'lucide-react'
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
  const { user, isAuthenticated, logout } = useAuth()

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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 px-4 backdrop-blur">
      <div className="flex w-full items-center gap-4">
        <Link href="/home" className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-sm">
            C
          </div>
          <span className="hidden text-sm font-semibold tracking-tight md:block">Career Sync</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
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

        <form onSubmit={handleSearch} className="mx-auto hidden w-full max-w-2xl items-center md:flex">
          <div className="relative w-full">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <input
              name="q"
              placeholder="Search courses, topics or skills..."
              className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-3">
          {isAuthenticated && user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
              <span className="hidden text-right md:block">
                <span className="block text-sm font-medium leading-tight">{displayName}</span>
                {user.email && (
                  <span className="block text-xs leading-tight text-muted-foreground">{user.email}</span>
                )}
              </span>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
            {user.email && <DropdownMenuItem disabled className="text-xs text-muted-foreground">{user.email}</DropdownMenuItem>}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
