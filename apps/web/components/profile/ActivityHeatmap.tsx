import React from 'react'

type ActivityHeatmapProps = {
  dates?: (string | Date | null)[]
  days?: number
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function bucket(count: number) {
  if (!count) return 'bg-slate-100'
  if (count === 1) return 'bg-emerald-200'
  if (count === 2) return 'bg-emerald-400'
  if (count === 3) return 'bg-emerald-600'
  return 'bg-emerald-800'
}

export default function ActivityHeatmap({ dates = [], days = 91 }: ActivityHeatmapProps) {
  // collect counts per day
  const counts = React.useMemo(() => {
    const map = new Map<string, number>()
    dates.forEach((d) => {
      if (!d) return
      const dt = typeof d === 'string' ? new Date(d) : d
      if (Number.isNaN(dt.getTime())) return
      const k = dayKey(dt)
      map.set(k, (map.get(k) || 0) + 1)
    })
    return map
  }, [dates])

  const daysArr = React.useMemo(() => {
    const out: { date: Date; key: string; count: number }[] = []
    const today = new Date()
    // normalize to start of day
    today.setHours(0, 0, 0, 0)
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const k = dayKey(d)
      out.push({ date: d, key: k, count: counts.get(k) || 0 })
    }
    return out
  }, [counts, days])

  // render as 13 columns x 7 rows grid similar to contribution graph
  const weeks = Math.ceil(days / 7)
  const cols: Array<Array<{ date: Date; key: string; count: number }>> = []
  for (let w = 0; w < weeks; w++) {
    const col: Array<{ date: Date; key: string; count: number }> = []
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d
      if (idx < daysArr.length) col.push(daysArr[idx])
    }
    cols.push(col)
  }

  return (
    <div className="flex items-start gap-3">
      <div className="text-xs text-muted-foreground w-24">Activity</div>
      <div className="flex gap-1">
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, ri) => {
              const cell = col[ri]
              if (!cell) return <div key={ri} className="h-3 w-3" />
              const cls = bucket(cell.count)
              return (
                <div
                  key={cell.key}
                  title={`${cell.key} — ${cell.count} activity${cell.count === 1 ? '' : 's'}`}
                  aria-label={`${cell.key} ${cell.count} activities`}
                  className={`h-3 w-3 rounded-sm ${cls} border border-slate-200/50`}>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
