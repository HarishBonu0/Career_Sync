import { useEffect, useRef, useState } from 'react';
import { AssessmentSession, SimulationInput } from '../types/index';
import styles from './AssessmentPage.module.css';

interface AssessmentPageProps {
  input: SimulationInput;
  session: AssessmentSession;
  isSubmitting: boolean;
  errorMessage?: string;
  onBack: () => void;
  onComplete: (answers: Record<string, string>) => void;
}

export default function AssessmentPage({
  input,
  session,
  isSubmitting,
  errorMessage,
  onBack,
  onComplete,
}: AssessmentPageProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion = session.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isFinalQuestion = currentIndex === session.questions.length - 1;
  const canSubmit = answeredCount === session.questions.length;

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  const handleAnswer = (option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));

    if (!isFinalQuestion) {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }

      autoAdvanceTimerRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => Math.min(session.questions.length - 1, prevIndex + 1));
      }, 180);
    }
  };

  const goToQuestion = (index: number) => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    setCurrentIndex(index);
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Assessment Generated</p>
          <h1 className={styles.title}>{session.title}</h1>
          <p className={styles.subtitle}>
            These 20 questions were generated from your selected skills, target role, and resume analysis. Finish the full test to unlock your new insights, job matches, and roadmap workspace.
          </p>
        </div>

        <div className={styles.heroMeta}>
          <div>
            <span>Target Role</span>
            <strong>{input.targetRole}</strong>
          </div>
          <div>
            <span>Difficulty</span>
            <strong>{session.difficulty}</strong>
          </div>
          <div>
            <span>Progress</span>
            <strong>{answeredCount} / {session.questions.length}</strong>
          </div>
        </div>
      </section>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h2>Question Map</h2>
            <div className={styles.questionGrid}>
              {session.questions.map((question, index) => {
                const answered = Boolean(answers[question.id]);
                const isActive = index === currentIndex;

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => goToQuestion(index)}
                    className={`${styles.questionChip} ${answered ? styles.answered : ''} ${isActive ? styles.active : ''}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <h2>Skill Inputs</h2>
            <div className={styles.skillList}>
              {input.skills.map((skill) => (
                <div key={skill.name} className={styles.skillRow}>
                  <span>{skill.name}</span>
                  <strong>{skill.selfScore}%</strong>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className={styles.questionPanel}>
          <div className={styles.questionHeader}>
            <div>
              <span className={styles.questionCounter}>Question {currentIndex + 1} of {session.questions.length}</span>
              <h2>{currentQuestion.prompt}</h2>
            </div>

            <div className={styles.badges}>
              <span className={styles.badge}>{currentQuestion.sourceSkill}</span>
              <span className={styles.badgeAlt}>{currentQuestion.focusArea}</span>
            </div>
          </div>

          {currentQuestion.practicalExample && (
            <pre className={styles.example}>{currentQuestion.practicalExample}</pre>
          )}

          <div className={styles.options}>
            {currentQuestion.options.map((option) => {
              const selected = answers[currentQuestion.id] === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswer(option)}
                  disabled={isSubmitting}
                  className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
                >
                  <span className={styles.optionMarker}>{selected ? '●' : '○'}</span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onBack} className={styles.secondaryBtn} disabled={isSubmitting}>
              Back to Form
            </button>

            <div className={styles.actionCluster}>
              <button
                type="button"
                onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
                className={styles.ghostBtn}
                disabled={currentIndex === 0 || isSubmitting}
              >
                Previous
              </button>

              {!isFinalQuestion && (
                <button
                  type="button"
                  onClick={() => goToQuestion(Math.min(session.questions.length - 1, currentIndex + 1))}
                  className={styles.primaryBtn}
                  disabled={!answers[currentQuestion.id] || isSubmitting}
                >
                  Next Question
                </button>
              )}

              {isFinalQuestion && (
                <button
                  type="button"
                  onClick={() => onComplete(answers)}
                  className={styles.primaryBtn}
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? 'Building Insights Workspace...' : 'Submit Assessment'}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}