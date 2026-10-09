'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  Map,
  ClipboardCheck,
  User,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Briefcase
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const PRIMARY_NAV: NavItem[] = [
  { href: '/home', label: 'Dashboard', icon: Home },
  { href: '/roadmaps', label: 'Roadmap', icon: Map },
  { href: '/courses', label: 'Learning', icon: BookOpen },
  { href: '/assessments', label: 'Assessments', icon: ClipboardCheck },
  { href: '/career', label: 'Career', icon: Briefcase },
]

const SECONDARY_NAV: NavItem[] = [
  { href: '/profile', label: 'Profile Settings', icon: User },
  { href: '/settings', label: 'Preferences', icon: Settings },
]

const COLLAPSE_KEY = 'careersync_sidebar_collapsed'

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(COLLAPSE_KEY)
    if (stored === '1') setCollapsed(true)
  }, [])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
    }
  }

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen shrink-0 border-r border-border/50 bg-background/95 backdrop-blur-xl text-primary transition-all duration-300 shadow-[2px_0_8px_rgba(0,0,0,0.02)] z-40',
        collapsed ? 'w-[76px]' : 'w-72'
      )}
      aria-label="Primary"
    >
      <div className="flex h-24 items-center gap-4 px-6 border-b border-border/50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-white shadow-[0_4px_14px_rgba(17,17,17,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/0 via-accent/30 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative z-10">C</span>
        </div>
        {!collapsed && (
          <span className="truncate text-xl font-extrabold tracking-tight text-primary transition-opacity duration-300">
            Career<span className="text-accent">Sync</span>
          </span>
        )}
      </div>

      <div className="flex flex-col h-[calc(100vh-6rem)] justify-between pb-6">
        <div className="py-6 px-4 space-y-8 overflow-y-auto">
          <nav className="flex flex-col gap-2">
            {!collapsed && <p className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 mb-2">Platform</p>}
            {PRIMARY_NAV.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} active={isActive(pathname, item.href)} />
            ))}
          </nav>

          <nav className="flex flex-col gap-2">
            {!collapsed && <p className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 mb-2">Account</p>}
            {SECONDARY_NAV.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} active={isActive(pathname, item.href)} />
            ))}
          </nav>
        </div>

        {mounted && (
          <div className="px-4">
            <button
              type="button"
              onClick={toggle}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="flex w-full items-center justify-center rounded-xl p-3 text-muted-foreground hover:bg-accent/5 hover:text-accent transition-colors border border-transparent hover:border-accent/10"
            >
              {collapsed ? <ChevronsRight className="h-5 w-5" /> : (
                <div className="flex items-center gap-3 w-full px-2">
                  <ChevronsLeft className="h-5 w-5" />
                  <span className="text-sm font-semibold">Collapse</span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (href === '/home') return pathname === '/home'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem
  collapsed: boolean
  active: boolean
}) {
  const Icon = item.icon

  const linkClasses = cn(
    'group relative flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 overflow-hidden',
    active
      ? 'text-primary'
      : 'text-secondary-foreground hover:text-primary'
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={120}>
        <TooltipTrigger asChild>
          <Link href={item.href} className={cn(linkClasses, 'justify-center px-0 w-11 h-11 mx-auto')}>
            {active && <div className="absolute inset-0 bg-primary/5 rounded-xl -z-10" />}
            <Icon className={cn("h-5 w-5 transition-colors", active ? "text-accent" : "text-muted-foreground group-hover:text-primary")} />
            <span className="sr-only">{item.label}</span>
            {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-l-full bg-accent" />}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-semibold">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Link href={item.href} className={linkClasses}>
      {active && <div className="absolute inset-0 bg-primary/5 rounded-xl -z-10" />}
      <Icon className={cn("h-5 w-5 shrink-0 transition-colors", active ? "text-accent" : "text-muted-foreground group-hover:text-primary")} />
      <span className="truncate">{item.label}</span>
      {active && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(184,121,36,0.5)]" />}
    </Link>
  )
}
