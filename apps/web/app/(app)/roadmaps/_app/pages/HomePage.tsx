import { SimulationInput } from '../types/index';
import SimulationForm from '../components/Form/SimulationForm';
import { Target, MapPin, Sparkles, BookOpen } from 'lucide-react';

interface HomePageProps {
  onStartAssessment: (input: SimulationInput) => void;
  isLoading: boolean;
  errorMessage?: string;
  savedRoadmaps?: any[];
}

const STEPS = [
  { icon: <MapPin className="h-4 w-4" />, label: 'Define your profile & upload resume.' },
  { icon: <Sparkles className="h-4 w-4" />, label: 'Complete a personalized skill assessment.' },
  { icon: <Target className="h-4 w-4" />, label: 'Submit answers to calculate readiness.' },
  { icon: <BookOpen className="h-4 w-4" />, label: 'Navigate insights & customized roadmap.' },
];

export default function HomePage({ onStartAssessment, isLoading, errorMessage, savedRoadmaps = [] }: HomePageProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between py-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-accent shadow-sm">
            Career Intelligence Flow
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl">
            Build your path to the next level.
          </h1>
          <p className="text-lg text-secondary-foreground leading-relaxed font-medium">
            Generate a precise career roadmap based on real skill data. Upload your resume, complete a quick assessment, and unlock a customized learning workspace.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, idx) => (
          <div key={idx} className="flex flex-col gap-4 rounded-[1.5rem] border border-border/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-accent/20 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:scale-105 transition-transform border border-accent/20">
              {step.icon}
            </div>
            <p className="text-sm font-semibold text-primary leading-relaxed">{step.label}</p>
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="mx-auto flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive">
          <div className="h-2 w-2 rounded-full bg-destructive animate-pulse shrink-0" />
          {errorMessage}
        </div>
      )}

      {savedRoadmaps.length > 0 && (
        <div className="space-y-6 pt-4">
          <h2 className="text-xl font-bold text-primary tracking-tight">Active Roadmaps</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedRoadmaps.slice(0, 6).map((roadmap) => (
              <div key={roadmap._id} className="group relative overflow-hidden rounded-[1.5rem] border border-border/80 bg-white p-6 shadow-sm transition-all hover:shadow-elevated hover:border-accent/30">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  <div>
                    <h3 className="font-bold text-primary line-clamp-1 text-lg">{roadmap.title || roadmap.targetRole || 'Career Roadmap'}</h3>
                    <p className="mt-1 text-sm font-medium text-secondary-foreground line-clamp-1">
                      {roadmap.currentRole || 'Current Role'} → {roadmap.targetRole || 'Target Role'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">Progress</span>
                      <span className="text-xs font-bold text-accent">{roadmap.progress || 0}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted border border-border/50">
                      <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${roadmap.progress || 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[2rem] border border-border/80 bg-white shadow-elevated overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-accent/5 to-transparent blur-2xl opacity-60 pointer-events-none" />
        <div className="relative z-10">
          <div className="border-b border-border/50 bg-background/50 px-8 py-6">
            <h2 className="text-xl font-bold tracking-tight text-primary">New Assessment</h2>
          </div>
          <div className="p-8 sm:p-10">
            <SimulationForm onSubmit={onStartAssessment} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
