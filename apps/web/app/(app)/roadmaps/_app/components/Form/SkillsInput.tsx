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
    <div className="space-y-2">
      <Label htmlFor="skills-input">
        Skills <span className="text-xs font-normal text-muted-foreground">— press Enter to add</span>
      </Label>
      <Input
        id="skills-input"
        type="text"
        placeholder="e.g. Python, SQL, Machine Learning, React"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {skills.length > 0 && (
        <ul className="space-y-2 pt-1">
          {skills.map((skill) => (
            <li
              key={skill.name}
              className="rounded-md border border-border bg-muted/30 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{skill.name}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill.name)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-destructive"
                  aria-label={`Remove ${skill.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="shrink-0 text-xs text-muted-foreground">Estimated level</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={skill.selfScore}
                  onChange={(e) => updateSkillScore(skill.name, Number(e.target.value))}
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
                />
                <span className="w-12 shrink-0 text-right text-xs font-medium tabular-nums">
                  {skill.selfScore}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
