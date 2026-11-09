import * as React from 'react'
import { cn } from '@/lib/utils'

type SidePanelProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export function SidePanel({ title, subtitle, children, className }: SidePanelProps) {
  return (
    <aside className={cn('hidden lg:block lg:w-[22rem] xl:w-[24rem]', className)}>
      <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-elevated-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{title}</p>
          {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </aside>
  )
}

export default SidePanel