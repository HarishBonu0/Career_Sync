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
  { href: '/home', label: 'Home', icon: Home },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/roadmaps', label: 'Roadmaps', icon: Map },
  { href: '/assessments', label: 'Assessments', icon: ClipboardCheck },
]

const SECONDARY_NAV: NavItem[] = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
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
        'sticky top-0 h-screen shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200',
        collapsed ? 'w-[68px]' : 'w-60'
      )}
      aria-label="Primary"
    >
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-sm">
          C
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-tight">Career Sync</span>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex flex-col gap-1 p-2">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <Separator className="my-2 bg-sidebar-border" />

      <nav className="flex flex-col gap-1 p-2">
        {SECONDARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      {mounted && (
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      )}
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
    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    active
      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={120}>
        <TooltipTrigger asChild>
          <Link href={item.href} className={cn(linkClasses, 'justify-center px-0')}>
            <Icon className="h-5 w-5" />
            <span className="sr-only">{item.label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Link href={item.href} className={linkClasses}>
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}
