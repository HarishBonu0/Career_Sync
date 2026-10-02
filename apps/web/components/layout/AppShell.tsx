'use client'

import * as React from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}
