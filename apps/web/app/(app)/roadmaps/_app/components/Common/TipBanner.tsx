import { Info } from 'lucide-react';

export default function TipBanner() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <Info className="h-3.5 w-3.5" />
      <span>Tip: Configure API keys in settings for real-time data.</span>
    </div>
  );
}
