import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModalProps = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Modal({ open, title, description, onClose, children, className }: ModalProps) {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    if (open) {
      document.addEventListener('keydown', onKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className={cn('relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-elevated', className)}>
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <button
            type="button"
            aria-label="Close modal"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal