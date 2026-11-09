'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, RefreshCcw, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ResultPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);
  const [topicAnalysis, setTopicAnalysis] = useState({});
  const [weakAreas, setWeakAreas] = useState([]);

  useEffect(() => {
    const loadResult = async () => {
      const evaluationId = searchParams.get('evaluationId') || sessionStorage.getItem('attemptId');
      let evaluation = null;
      if (evaluationId) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const response = await fetch(`${apiUrl}/skills/${evaluationId}`, { credentials: 'include' });
          if (response.ok) evaluation = (await response.json()).data;
        } catch (error) {
          console.warn('Could not load persisted evaluation:', error);
        }
      }

      const testResult = JSON.parse(sessionStorage.getItem('testResult') || 'null');
      const questions = evaluation?.questions || JSON.parse(sessionStorage.getItem('testQuestions') || '[]');
      const userAnswers = JSON.parse(sessionStorage.getItem('userAnswers') || '{}');
      if (!questions.length || (!evaluation && !testResult)) {
        router.push('/assessments');
        return;
      }

      setScore(evaluation?.correctAnswers ?? testResult?.correctAnswers ?? testResult?.correct ?? 0);
      const resultData = questions.map((q, index) => {
        const answer = q.userAnswer ?? userAnswers[q.id] ?? userAnswers[index];
        return {
          question: q.question,
          userAnswer: answer,
          userAnswerText: answer,
          correctAnswer: q.correctAnswer,
          isCorrect: q.isCorrect ?? answer === q.correctAnswer,
          topic: q.topic || q.mainTopic || q.sourceSkill || 'General',
          options: q.options,
        };
      });
      setResults(resultData);

      const topics = {};
      resultData.forEach((result) => {
        if (!topics[result.topic]) topics[result.topic] = { total: 0, correct: 0 };
        topics[result.topic].total++;
        if (result.isCorrect) topics[result.topic].correct++;
      });
      setTopicAnalysis(topics);
      setWeakAreas(
        Object.entries(topics)
          .filter(([, stats]) => stats.correct / stats.total < 0.5)
          .map(([topic, stats]) => ({ topic, percentage: Math.round((stats.correct / stats.total) * 100) }))
      );
    };
    loadResult();
  }, [router, searchParams]);

  const total = results.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const handleRetake = () => {
    sessionStorage.clear();
    router.push('/assessments');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent shadow-sm">
          <Target className="h-3.5 w-3.5" />
          Intelligence Report
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Assessment results</h1>
        <p className="text-lg text-secondary-foreground font-medium">Score, breakdown, and targeted areas for improvement.</p>
      </div>

      <Card className="rounded-[2rem] border border-border/80 bg-white shadow-elevated overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-accent/5 to-transparent blur-2xl opacity-60 pointer-events-none" />
        <CardContent className="flex flex-col sm:flex-row items-center gap-8 p-10 relative z-10">
          <div className="flex h-36 w-36 shrink-0 flex-col items-center justify-center rounded-full border-[6px] border-accent/20 bg-accent/5 shadow-[0_0_30px_rgba(184,121,36,0.15)] relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="66" cy="66" r="60" fill="none" stroke="currentColor" strokeWidth="6" className="text-border/50" />
              <circle cx="66" cy="66" r="60" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="377" strokeDashoffset={377 - (377 * percentage) / 100} className="text-accent transition-all duration-1000 ease-out" strokeLinecap="round" />
            </svg>
            <span className="text-3xl font-bold tabular-nums text-primary relative z-10">{percentage}%</span>
            <span className="text-sm font-semibold text-accent relative z-10 mt-1">
              {score} / {total}
            </span>
          </div>
          <div className="flex-1 text-center sm:text-left space-y-3">
            <h3 className="text-2xl font-bold text-primary">
              {percentage >= 80
                ? 'Exceptional performance.'
                : percentage >= 50
                  ? 'Solid baseline established.'
                  : 'Targeted growth required.'}
            </h3>
            <p className="text-base text-secondary-foreground font-medium">
              {weakAreas.length === 0
                ? 'You demonstrated comprehensive mastery across all tested domains.'
                : `${weakAreas.length} core topic${weakAreas.length === 1 ? '' : 's'} identified for strategic improvement.`}
            </p>
          </div>
          <Button variant="outline" onClick={handleRetake} className="shrink-0 h-12 rounded-full px-6 font-bold border-border/80 hover:bg-accent/5 hover:text-accent hover:border-accent/40 transition-all">
            <RefreshCcw className="mr-2 h-4 w-4" />
            New assessment
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        {Object.keys(topicAnalysis).length > 0 && (
          <Card className="rounded-[1.5rem] border border-border/80 bg-white shadow-sm">
            <CardHeader className="p-6 border-b border-border/50 bg-background/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5 text-accent" />
                Performance by topic
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {Object.entries(topicAnalysis).map(([topic, stats]) => {
                const pct = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={topic} className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary">{topic}</span>
                      <span className="text-secondary-foreground font-medium">
                        {stats.correct}/{stats.total} <span className="font-bold text-primary ml-1">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted border border-border/50">
                      <div
                        className="h-full transition-all duration-1000 ease-out rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 50 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {weakAreas.length > 0 && (
          <Card className="rounded-[1.5rem] border border-destructive/20 bg-destructive/5 shadow-sm">
            <CardHeader className="p-6 border-b border-destructive/10 bg-white/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Strategic focus areas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-4 text-sm">
                {weakAreas.map(({ topic, percentage }) => (
                  <li key={topic} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-destructive/10 shadow-sm">
                    <div className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive font-bold text-xs">
                      !
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-primary block">{topic}</span>
                      <span className="text-secondary-foreground font-medium leading-relaxed block">
                        Currently at <span className="font-bold text-destructive">{percentage}%</span> proficiency. Recommend dedicated study in this domain.
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="rounded-[1.5rem] border border-border/80 bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-8 border-b border-border/50 bg-background/50">
          <CardTitle className="text-xl font-bold text-primary">Detailed analysis</CardTitle>
          <CardDescription className="text-base font-medium text-secondary-foreground">Review your responses against the verified answers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          {results.map((r, idx) => (
            <div key={idx} className={`rounded-xl border p-6 transition-all ${r.isCorrect ? 'border-border/80 bg-white hover:border-accent/30' : 'border-destructive/30 bg-destructive/5'}`}>
              <div className="flex items-start gap-4">
                {r.isCorrect ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent mt-0.5">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive mt-0.5">
                    <XCircle className="h-5 w-5" />
                  </div>
                )}
                <div className="space-y-3 flex-1">
                  <p className="text-base font-semibold leading-relaxed text-primary">
                    <span className="text-muted-foreground mr-2">{idx + 1}.</span> {r.question}
                  </p>
                  
                  <div className="space-y-2 mt-4 bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-secondary-foreground">
                      Your answer:{' '}
                      {r.userAnswer ? (
                        <span className={`font-bold ${r.isCorrect ? 'text-primary' : 'text-destructive'}`}>
                          {r.userAnswer}. {r.options?.[r.userAnswer]}
                        </span>
                      ) : (
                        <span className="italic">Not answered</span>
                      )}
                    </p>
                    {!r.isCorrect && r.correctAnswer && (
                      <p className="text-sm font-medium text-secondary-foreground">
                        Correct answer:{' '}
                        <span className="font-bold text-accent">
                          {r.correctAnswer}. {r.options?.[r.correctAnswer]}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultPage;
