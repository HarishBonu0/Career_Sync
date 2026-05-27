import { Sparkles } from 'lucide-react';

interface AlertBannerProps {
  alerts: string[];
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  if (!alerts.length) return null;
  const text = alerts.join('   •   ');
  const duration = Math.max(20, text.length / 5);

  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-md border border-border bg-muted/40 px-4 py-2.5 text-sm">
      <Sparkles className="h-4 w-4 shrink-0 text-foreground" />
      <div className="relative flex-1 overflow-hidden">
        <div
          className="inline-flex whitespace-nowrap text-muted-foreground"
          style={{ animation: `careersync-marquee ${duration}s linear infinite` }}
        >
          <span className="pr-8">{text}</span>
          <span className="pr-8">{text}</span>
        </div>
      </div>
      <style jsx>{`
        @keyframes careersync-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
