import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
          'flex h-12 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:bg-background focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-colors',
          className
        )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
