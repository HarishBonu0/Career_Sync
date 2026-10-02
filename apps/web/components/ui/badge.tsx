import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'muted'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = 'default', ...props }, ref) => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold'
  const variants: Record<string, string> = {
    default: 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-neutral-100',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-orange-100 text-orange-800',
    error: 'bg-red-100 text-red-800',
    muted: 'bg-muted/20 text-muted-foreground',
  }
  return (
    <span ref={ref} className={cn(base, variants[variant] ?? variants.default, className)} {...props} />
  )
})
Badge.displayName = 'Badge'

export default Badge
