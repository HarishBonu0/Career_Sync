import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react';
import { AssessmentSession, SimulationInput } from '../types/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const total = session.questions.length;
  const isFinalQuestion = currentIndex === total - 1;
  const canSubmit = answeredCount === total;
  const progress = total > 0 ? (answeredCount / total) * 100 : 0;

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  const handleAnswer = (option: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
    if (!isFinalQuestion) {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => Math.min(total - 1, prev + 1));
      }, 180);
    }
  };

  const goToQuestion = (index: number) => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    setCurrentIndex(index);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Assessment generated
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{session.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            These {total} questions were generated from your skills, target role, and resume. Finish the
            test to unlock insights, job matches, and the roadmap workspace.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack} disabled={isSubmitting}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to form
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Meta label="Target role" value={input.targetRole} />
        <Meta label="Difficulty" value={session.difficulty} />
        <Meta label="Progress" value={`${answeredCount} / ${total}`} />
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-foreground transition-all" style={{ width: `${progress}%` }} />
      </div>

      {errorMessage && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Question map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {session.questions.map((question, index) => {
                  const answered = Boolean(answers[question.id]);
                  const isActive = index === currentIndex;
                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => goToQuestion(index)}
                      className={[
                        'inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium tabular-nums transition-colors',
                        isActive
                          ? 'border-foreground bg-foreground text-background'
                          : answered
                            ? 'border-foreground/30 bg-muted text-foreground'
                            : 'border-border text-muted-foreground hover:bg-muted',
                      ].join(' ')}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {input.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Skill inputs</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {input.skills.map((skill) => (
                    <li key={skill.name} className="flex items-center justify-between gap-2">
                      <span className="truncate">{skill.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {skill.selfScore}%
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </aside>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Question {currentIndex + 1} of {total}
                </p>
                <CardTitle className="mt-1 text-lg">{currentQuestion.prompt}</CardTitle>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Tag>{currentQuestion.sourceSkill}</Tag>
                <Tag variant="muted">{currentQuestion.focusArea}</Tag>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {currentQuestion.practicalExample && (
              <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-xs leading-relaxed text-foreground/80">
                {currentQuestion.practicalExample}
              </pre>
            )}

            <ul className="space-y-2">
              {currentQuestion.options.map((option) => {
                const selected = answers[currentQuestion.id] === option;
                return (
                  <li key={option}>
                    <button
                      type="button"
                      onClick={() => handleAnswer(option)}
                      disabled={isSubmitting}
                      className={[
                        'flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors',
                        selected
                          ? 'border-foreground bg-muted'
                          : 'border-border hover:bg-muted/50',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                          selected ? 'border-foreground bg-foreground' : 'border-border',
                        ].join(' ')}
                      >
                        {selected && <span className="h-1.5 w-1.5 rounded-full bg-background" />}
                      </span>
                      <span>{option}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0 || isSubmitting}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>

              {!isFinalQuestion ? (
                <Button
                  type="button"
                  onClick={() => goToQuestion(Math.min(total - 1, currentIndex + 1))}
                  disabled={!answers[currentQuestion.id] || isSubmitting}
                >
                  Next question
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => onComplete(answers)}
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? 'Building workspace…' : 'Submit assessment'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function Tag({ children, variant }: { children: React.ReactNode; variant?: 'muted' }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        variant === 'muted'
          ? 'border-border bg-muted/40 text-muted-foreground'
          : 'border-foreground/20 bg-foreground/5 text-foreground',
      ].join(' ')}
    >
      {children}
    </span>
  );
}
