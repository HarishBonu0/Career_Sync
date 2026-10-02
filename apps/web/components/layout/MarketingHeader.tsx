'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut, Menu, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { label: 'Course Gen', href: '/courses' },
  { label: 'Roadmaps', href: '/roadmaps' },
  { label: 'Evaluator', href: '/assessments' },
]

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U'

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#ececf4]/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-[1180px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#5d52ce] to-[#8b7cf1] text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(98,83,208,0.2)]">C</span>
          <span className="text-[15px] font-extrabold tracking-[-0.02em] text-[#171936]">Career Sync</span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-[13px] font-semibold text-[#747a91] transition-colors hover:bg-[#f4f2ff] hover:text-[#5145b8]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <>
              <Link href="/profile" aria-label={`Open profile for ${displayName}`}>
                <Avatar className="h-9 w-9 border border-[#dedafb]">
                  <AvatarFallback className="bg-[#f0efff] text-xs font-bold text-[#5d52ce]">{initials}</AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-[#68708c] hover:text-[#5145b8]">
                <LogOut size={15} /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-[#68708c] hover:text-[#5145b8]"><Link href="/login">Sign in</Link></Button>
              <Button asChild size="sm" className="rounded-lg bg-[#5d52ce] px-4 shadow-[0_8px_18px_rgba(98,83,208,0.18)] hover:bg-[#4f45b8]"><Link href="/signup">Get started</Link></Button>
            </>
          )}
        </div>

        <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#5d52ce] hover:bg-[#f4f2ff] md:hidden" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#ececf4] bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-[#68708c] hover:bg-[#f4f2ff] hover:text-[#5145b8]">{item.label}</Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-2 border-t border-[#ececf4] pt-3">
            {isAuthenticated && user ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#68708c]"><Avatar className="h-8 w-8"><AvatarFallback className="bg-[#f0efff] text-xs font-bold text-[#5d52ce]">{initials}</AvatarFallback></Avatar>{displayName}</Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut size={15} /></Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="flex-1"><Link href="/login">Sign in</Link></Button>
                <Button asChild className="flex-1 bg-[#5d52ce] hover:bg-[#4f45b8]"><Link href="/signup">Get started</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
