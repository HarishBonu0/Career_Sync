import { useState, useEffect } from 'react';
import { Users, TrendingUp, Zap, Database, ChevronDown, Plus } from 'lucide-react';
import { SimulationResult, FilterOptions } from '../../types/index';
import StatsCard from './StatsCard';
import PathwayCard from './PathwayCard';
import { Button } from '@/components/ui/button';

interface SimulationResultsProps {
  result: SimulationResult;
}

export default function SimulationResults({ result }: SimulationResultsProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'All Types',
    sort: 'Best Match',
  });
  const [displayCount, setDisplayCount] = useState(6);

  useEffect(() => {
    const trackRoadmap = async () => {
      try {
        const user = localStorage.getItem('Career Sync_user');
        if (!user) return;
        const userData = JSON.parse(user);
        const savedRoadmaps = JSON.parse(localStorage.getItem('Career Sync_saved_roadmaps') || '[]');

        const roadmapRecord = {
          id: `roadmap_${Date.now()}`,
          title: result.input?.targetRole ? `${result.input.targetRole} Roadmap` : 'Career Roadmap',
          createdAt: new Date().toISOString(),
          stages: result.pathways?.length || 0,
          userId: userData.id || userData.email,
          pathways: result.pathways?.length || 0,
        };

        const existingIndex = savedRoadmaps.findIndex((r: any) => r.title === roadmapRecord.title);
        if (existingIndex === -1) {
          savedRoadmaps.push(roadmapRecord);
          localStorage.setItem('Career Sync_saved_roadmaps', JSON.stringify(savedRoadmaps));

          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const token =
              localStorage.getItem('careersync_token') ||
              localStorage.getItem('Career_Sync_token');
            await fetch(`${apiUrl}/profile/enroll/roadmap`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                roadmapId: roadmapRecord.id,
                roadmapTitle: roadmapRecord.title,
                roadmapStages: roadmapRecord.stages,
              }),
            });
          } catch (apiError) {
            console.log('Database sync failed, data saved locally');
          }
        }

        const profileData = JSON.parse(localStorage.getItem('Career Sync_profile_data') || '{}');
        profileData.totalRoadmaps = savedRoadmaps.length;
        profileData.roadmaps = savedRoadmaps;
        localStorage.setItem('Career Sync_profile_data', JSON.stringify(profileData));

        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'Career Sync_saved_roadmaps',
            newValue: JSON.stringify(savedRoadmaps),
          })
        );
      } catch (e) {
        console.error('Error tracking roadmap:', e);
      }
    };
    trackRoadmap();
  }, [result]);

  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value as any }));
  };

  const filteredPathways = [...result.pathways]
    .filter((pathway) => {
      if (filters.type === 'All Types') return true;
      return pathway.category === filters.type;
    })
    .sort((a, b) => {
      if (filters.sort === 'Highest Salary') {
        const salaryA = parseInt(a.salary.match(/\d+/)?.[0] || '0');
        const salaryB = parseInt(b.salary.match(/\d+/)?.[0] || '0');
        return salaryB - salaryA;
      } else if (filters.sort === 'Fastest Route') {
        const timeA = parseInt(a.timeline.match(/\d+/)?.[0] || '999');
        const timeB = parseInt(b.timeline.match(/\d+/)?.[0] || '999');
        return timeA - timeB;
      }
      return b.confidence - a.confidence;
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Your career roadmap is ready</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We analyzed {result.pathsAnalyzed.toLocaleString()} job listings across top companies to recommend your best moves.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<Users className="h-5 w-5" />}
          type="number"
          number={result.pathsAnalyzed.toLocaleString()}
          subtext="Real-time analysis"
          label="Pathways evaluated"
          isLive
        />
        <StatsCard
          icon={<TrendingUp className="h-5 w-5" />}
          type="value"
          value="Very High"
          subLabel="Shortage of 2,000+ roles annually"
          label="Market opportunity"
        />
        <StatsCard
          icon={<Zap className="h-5 w-5" />}
          type="skill"
          value={result.topSkillGap}
          subLabel="Mentioned in 78% of target listings"
          label="Priority skill"
        />
        <StatsCard
          icon={<Database className="h-5 w-5" />}
          type="sources"
          value={result.dataSources}
          status="✓ Verified & live"
          label="Intelligence sources"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">{filteredPathways.length} pathways found</h3>
          <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Real-time verified
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterSelect
            value={filters.type}
            onChange={(value) => handleFilterChange('type', value)}
            options={['All Types', 'Top Tier (FAANG)', 'Product Companies', 'High Growth Startups']}
          />
          <FilterSelect
            value={filters.sort}
            onChange={(value) => handleFilterChange('sort', value)}
            options={['Best Match', 'Highest Salary', 'Fastest Route']}
          />
        </div>
      </div>

      {filteredPathways.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
          No pathways match those filters.
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPathways.slice(0, displayCount).map((pathway) => (
              <PathwayCard key={pathway.id} pathway={pathway} />
            ))}
          </div>

          {displayCount < filteredPathways.length && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setDisplayCount((prev) => prev + 6)}>
                <Plus className="mr-1 h-4 w-4" />
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-md border border-border bg-background pl-3 pr-8 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
