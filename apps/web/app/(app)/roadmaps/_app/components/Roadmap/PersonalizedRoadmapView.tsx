import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Link as LinkIcon, AlertCircle, Play, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoadmapResource {
  provider?: string;
  externalId?: string;
  title: string;
  url: string;
  resourceType: string;
  rank?: number;
}

interface RoadmapStep {
  order: number;
  skill: string;
  priority: string;
  prerequisites: string[];
  resources: RoadmapResource[];
  resourceAvailability: 'available' | 'unavailable' | 'partial';
}

interface RoadmapDoc {
  title: string;
  description: string;
  targetRole: string;
  steps: RoadmapStep[];
}

export default function PersonalizedRoadmapView({ roadmap, role }: { roadmap: RoadmapDoc; role: string }) {
  const router = useRouter();
  const steps = roadmap.steps || [];
  const [activeNode, setActiveNode] = useState<number>(steps[0]?.order ?? 1);

  function openCourse(query: string): void {
    window.open(`/generate/${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  }

  const activeStepData = steps.find(s => s.order === activeNode);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start relative">
      {/* Visual Roadmap Path */}
      <div className="w-full md:w-1/3 shrink-0 sticky top-28">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Target Track</p>
          <h2 className="text-xl font-semibold text-foreground">{roadmap.targetRole || role}</h2>
          <p className="text-sm text-muted-foreground mt-1">{steps.length} priority milestones</p>
        </div>

        <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-border/60">
          {steps.map((step, idx) => {
            const isActive = activeNode === step.order;
            const isCompleted = step.order < activeNode;
            
            let statusColor = 'bg-muted border-border text-muted-foreground';
            if (isActive) statusColor = 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]';
            else if (isCompleted) statusColor = 'bg-primary/20 border-primary/50 text-primary';

            return (
              <div 
                key={step.order} 
                className={`relative cursor-pointer group transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                onClick={() => setActiveNode(step.order)}
              >
                {/* Node marker */}
                <div className={`absolute -left-[30px] flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-300 ${statusColor}`}>
                  {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <span className="text-[9px] font-bold">{step.order}</span>}
                </div>
                
                <div className={`pl-2 transition-all duration-300 ${isActive ? 'translate-x-1' : ''}`}>
                  <h3 className={`font-medium leading-tight ${isActive ? 'text-foreground text-base' : 'text-foreground/80 text-sm'}`}>
                    {step.skill}
                  </h3>
                  {isActive && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                        step.priority === 'CRITICAL' ? 'bg-destructive/10 text-destructive' :
                        step.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-blue-500/10 text-blue-600'
                      }`}>
                        {step.priority} Priority
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Node Detail Panel */}
      <div className="w-full md:w-2/3">
        {activeStepData ? (
          <div className="rounded-3xl border border-border bg-card shadow-elevated overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="p-8 border-b border-border bg-muted/20 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Milestone {activeStepData.order}</p>
                  <h2 className="text-2xl font-bold text-foreground">{activeStepData.skill}</h2>
                  {activeStepData.prerequisites?.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span>Requires: <span className="font-medium text-foreground">{activeStepData.prerequisites.join(', ')}</span></span>
                    </div>
                  )}
                </div>
                <Button onClick={() => openCourse(activeStepData.skill)} className="shrink-0 shadow-md">
                  <Play className="mr-2 h-4 w-4" />
                  Start AI Course
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Curated Resources</h3>
                </div>
                
                {activeStepData.resources && activeStepData.resources.length > 0 ? (
                  <div className="grid gap-3">
                    {activeStepData.resources.map((res, i) => (
                      <a 
                        key={i} 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                            <LinkIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{res.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize flex items-center gap-1.5">
                              {res.provider}
                              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                              {res.resourceType}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center bg-muted/10">
                    <AlertCircle className="h-8 w-8 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-foreground">No External Resources</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                      Our AI hasn't cataloged external courses for this skill yet.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => openCourse(activeStepData.skill)}>
                      Generate custom course
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer Navigation */}
            <div className="border-t border-border bg-muted/10 p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={activeNode <= 1}
                onClick={() => setActiveNode(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground font-medium">
                {activeNode} of {steps.length}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={activeNode >= steps.length}
                onClick={() => setActiveNode(prev => Math.min(steps.length, prev + 1))}
              >
                Next Milestone
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
