import { useState } from 'react';
import { SkillProfile } from '../../types/index';
import styles from './SkillsInput.module.css';

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
        skill.name === skillName
          ? { ...skill, selfScore: score }
          : skill
      )
    );
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Skills * - press Enter to add</label>
      <input
        type="text"
        placeholder="e.g. Python, SQL, Machine Learning, React"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={styles.input}
      />
      <div className={styles.tagList}>
        {skills.map((skill) => (
          <div key={skill.name} className={styles.skillCard}>
            <span className={styles.tag}>
              {skill.name}
              <button
                type="button"
                onClick={() => removeSkill(skill.name)}
                className={styles.removeBtn}
                aria-label={`Remove ${skill.name}`}
              >
                ×
              </button>
            </span>

            <div className={styles.sliderWrap}>
              <span className={styles.sliderLabel}>Estimated Skill Level</span>
              <div className={styles.sliderRow}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={skill.selfScore}
                  onChange={(e) => updateSkillScore(skill.name, Number(e.target.value))}
                  className={styles.slider}
                />
                <span className={styles.scoreValue}>{skill.selfScore}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
