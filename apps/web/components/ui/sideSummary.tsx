import * as React from 'react'
import { Badge } from './badge'

interface SideSummaryProps {
  topic: string
  progress: number
  answers: Record<number, string | string[]>
}

export const SideSummary: React.FC<SideSummaryProps> = ({ topic, progress, answers }) => {
  const compact = Object.keys(answers).slice(0, 6).map((k) => ({ k, v: answers[Number(k)] }))
  return (
    <aside className="hidden w-80 lg:block">
      <div className="card sticky top-28">
        <h4 className="mb-2 text-sm font-semibold tracking-tight">Summary</h4>
        <p className="mb-3 text-xs text-muted-foreground">{topic}</p>
        <div className="mb-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-slate-950 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Progress: {Math.round(progress)}%</div>
        </div>

        <div className="space-y-2">
          {compact.map((item) => (
            <div key={item.k} className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Q{item.k}</div>
              <div className="ml-3 text-xs font-medium truncate" title={String(item.v)}>{Array.isArray(item.v) ? item.v.join(', ') : (item.v || '—')}</div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Badge variant="muted">Personalize later</Badge>
        </div>
      </div>
    </aside>
  )
}

export default SideSummary
