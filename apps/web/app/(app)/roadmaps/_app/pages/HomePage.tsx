import { SimulationInput } from '../types/index';
import SimulationForm from '../components/Form/SimulationForm';
import { Card, CardContent } from '@/components/ui/card';

interface HomePageProps {
  onStartAssessment: (input: SimulationInput) => void;
  isLoading: boolean;
  errorMessage?: string;
  savedRoadmaps?: any[];
}

const STEPS = [
  'Complete the profile and upload the resume.',
  'Generate a 20-question skill assessment.',
  'Submit answers to calculate combined readiness.',
  'Navigate insights, jobs, and roadmap tabs in one workspace.',
];

export default function HomePage({ onStartAssessment, isLoading, errorMessage, savedRoadmaps = [] }: HomePageProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="overflow-hidden border-border">
        <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.4fr_1fr] lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Career intelligence flow
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Build your assessment, then unlock insights, jobs, and a roadmap in one flow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Complete the profile, upload the resume, and generate a fresh 20-question assessment using
              your declared skills and resume evidence. After submission, the app builds a new workspace
              with insights, job matches, and the roadmap directly below the header.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-5">
            <ol className="space-y-3">
              {STEPS.map((step, idx) => (
                <li key={step} className="flex items-start gap-3 text-sm">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed text-foreground/90">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      {errorMessage && (
        <div className="mx-auto max-w-2xl rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {savedRoadmaps.length > 0 && (
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Saved roadmaps</h2>
                <p className="text-sm text-muted-foreground">Loaded from your CareerOS account.</p>
              </div>
              <span className="text-xs text-muted-foreground">{savedRoadmaps.length} saved</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {savedRoadmaps.slice(0, 6).map((roadmap) => (
                <div key={roadmap._id} className="rounded-md border border-border p-4">
                  <p className="font-medium">{roadmap.title || roadmap.targetRole || 'Career roadmap'}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {roadmap.currentRole || 'Current role'} to {roadmap.targetRole || 'Target role'} · {roadmap.progress || 0}% complete
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <SimulationForm onSubmit={onStartAssessment} isLoading={isLoading} />
    </div>
  );
}
