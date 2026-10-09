'use client'

import * as React from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'

import { Topbar } from '@/components/layout/Topbar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Topbar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </TooltipProvider>
  )
}
