import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  icon: React.ReactNode;
  number?: string;
  value?: string | string[];
  label: string;
  subtext?: string;
  subLabel?: string;
  status?: string;
  type: 'number' | 'value' | 'skill' | 'sources';
  isLive?: boolean;
}

export default function StatsCard({
  icon,
  number,
  value,
  label,
  subtext,
  subLabel,
  status,
  type,
  isLive,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        </div>

        {type === 'number' && (
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums">{number}</span>
              {isLive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Live
                </span>
              )}
            </div>
            {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
          </div>
        )}

        {type === 'value' && (
          <div>
            <p className="text-lg font-semibold">{value}</p>
            {subLabel && <p className="mt-1 text-xs text-muted-foreground">{subLabel}</p>}
          </div>
        )}

        {type === 'skill' && (
          <div>
            <p className="text-lg font-semibold">{value}</p>
            {subLabel && (
              <span className="mt-2 inline-flex items-center rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                {subLabel}
              </span>
            )}
          </div>
        )}

        {type === 'sources' && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {Array.isArray(value)
                ? value.map((src) => (
                    <span
                      key={src}
                      className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs"
                    >
                      {src}
                    </span>
                  ))
                : (
                    <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs">
                      {value}
                    </span>
                  )}
            </div>
            {status && (
              <span className="inline-flex items-center rounded-full bg-emerald-600/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                {status}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
