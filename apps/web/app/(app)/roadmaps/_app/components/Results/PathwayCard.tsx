import { useState } from 'react';
import { ChevronDown, ExternalLink, MapPin, Save, Check } from 'lucide-react';
import { Pathway, SimulationInput } from '../../types/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface PathwayCardProps {
  pathway: Pathway;
  input?: SimulationInput;
}

export default function PathwayCard({ pathway, input }: PathwayCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const difficultyClass =
    pathway.difficulty === 'HIGH'
      ? 'bg-destructive/15 text-destructive'
      : 'bg-amber-500/15 text-amber-700';

  const handleApplyNow = () => {
    const jobUrl =
      pathway.jobUrl ||
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(pathway.role)}`;
    window.open(jobUrl, '_blank');
  };

  const handleSaveRoadmap = async () => {
    if (!isAuthenticated || !user) return;
    if (isSaving || isSaved) return;
    
    setIsSaving(true);
    try {
      const milestones = (pathway.roadmap || []).map((step: any) => ({
        title: step.title,
        description: step.description,
        resources: [],
      }));

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/roadmaps`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: input?.targetRole ? `${input.targetRole} Roadmap` : 'Career Roadmap',
          currentRole: input?.currentRole || '',
          targetRole: input?.targetRole || pathway.role || '',
          timeline: pathway.timeline || '12 months',
          stages: milestones.length,
          milestones,
          status: 'draft',
        }),
      });

      const saved = await response.json();
      if (!response.ok || !saved.roadmapId) {
        throw new Error(saved.error || 'Roadmap could not be saved');
      }

      setIsSaved(true);
      router.push(`/roadmaps/${saved.roadmapId}`);
    } catch (e) {
      console.error('Roadmap persistence failed:', e);
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${difficultyClass}`}
            >
              {pathway.difficulty}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{pathway.dataSource}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse pathway' : 'Expand pathway'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        <h3 className="text-base font-semibold leading-tight">
          {pathway.company} — {pathway.role}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <Detail label="Salary" value={pathway.salary} />
          <Detail label="Timeline" value={pathway.timeline} />
        </div>

        <p className="whitespace-pre-line text-sm text-muted-foreground">{pathway.description}</p>

        {isExpanded && (
          <div className="space-y-5 border-t border-border pt-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Real-time market signals
              </h4>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Detail label="Active listings" value={`${pathway.activeListings} jobs`} />
                <Detail label="Demand level" value={pathway.demandLevel} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Execution roadmap
              </h4>
              <ol className="mt-3 space-y-3">
                {pathway.roadmap.map((step, index) => (
                  <li key={step.id} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold tabular-nums">
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                        <span>⏱ {step.duration}</span>
                        <span className="rounded-full border border-border px-2 py-0.5">
                          {step.type}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleSaveRoadmap} className="w-full" variant="default" disabled={isSaving || isSaved}>
                {isSaving ? 'Saving...' : isSaved ? 'Saved to My Roadmaps' : 'Save Roadmap'}
                {!isSaving && !isSaved && <Save className="ml-2 h-4 w-4" />}
                {isSaved && <Check className="ml-2 h-4 w-4" />}
              </Button>
              <Button onClick={handleApplyNow} className="w-full" variant="outline">
                Apply now
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
