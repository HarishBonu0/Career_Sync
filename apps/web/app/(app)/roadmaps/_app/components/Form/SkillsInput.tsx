import { useState } from 'react';
import { X } from 'lucide-react';
import { SkillProfile } from '../../types/index';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SkillsInputProps {
  skills: SkillProfile[];
  onSkillsChange: (skills: SkillProfile[]) => void;
}

export default function SkillsInput({ skills, onSkillsChange }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const skill = inputValue.trim();
      const exists = skills.some((item) => item.name.toLowerCase() === skill.toLowerCase());
      if (skill && !exists) {
        onSkillsChange([...skills, { name: skill, selfScore: 60 }]);
        setInputValue('');
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter((s) => s.name !== skillToRemove));
  };

  const updateSkillScore = (skillName: string, score: number) => {
    onSkillsChange(
      skills.map((skill) =>
        skill.name === skillName ? { ...skill, selfScore: score } : skill
      )
    );
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="skills-input" className="text-sm font-bold text-primary flex items-center justify-between">
        Skills
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 hidden sm:inline-block">Press Enter to add</span>
      </Label>
      <Input
        id="skills-input"
        type="text"
        placeholder="e.g. Python, SQL, Machine Learning, React"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-12 rounded-xl border-border/80 bg-white px-4 text-base focus-visible:ring-accent focus-visible:border-accent transition-all font-medium placeholder:text-muted-foreground/60"
      />

      {skills.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 pt-2">
          {skills.map((skill) => (
            <li
              key={skill.name}
              className="rounded-[1rem] border border-border/80 bg-white p-4 shadow-sm transition-all hover:border-accent/30 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
                <span className="text-sm font-bold text-primary">{skill.name}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill.name)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label={`Remove ${skill.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Self Assessment</span>
                  <span className="text-xs font-bold text-accent">{skill.selfScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={skill.selfScore}
                  onChange={(e) => updateSkillScore(skill.name, Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-accent outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--accent)) ${skill.selfScore}%, hsl(var(--muted)) ${skill.selfScore}%)`
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
