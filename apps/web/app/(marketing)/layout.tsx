'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/contexts/AuthContext'
import { MarketingHeader } from '@/components/layout/MarketingHeader'
import { MarketingFooter } from '@/components/layout/MarketingFooter'
import { HomeFooter } from '@/components/layout/HomeFooter'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <MarketingHeader />
        <main className="flex-1">{children}</main>
        {isHome ? <HomeFooter /> : <MarketingFooter />}
      </div>
    </AuthProvider>
  )
}
