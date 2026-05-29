import * as React from 'react'
import { cn } from '@/lib/utils'

interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export const Pill = React.forwardRef<HTMLButtonElement, PillProps>(({ className, active = false, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-primary text-white shadow-sm' : 'bg-white border border-border text-foreground hover:bg-muted/5',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
Pill.displayName = 'Pill'

export default Pill
