'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ResultPage = () => {
  const router = useRouter();

  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);
  const [topicAnalysis, setTopicAnalysis] = useState({});
  const [weakAreas, setWeakAreas] = useState([]);

  useEffect(() => {
    const testResult = JSON.parse(sessionStorage.getItem('testResult') || 'null');
    const questions = JSON.parse(sessionStorage.getItem('testQuestions') || '[]');
    const userAnswers = JSON.parse(sessionStorage.getItem('userAnswers') || '{}');

    if (!testResult || !questions.length) {
      router.push('/assessments');
      return;
    }

    setScore(testResult.correctAnswers);

    const resultData = questions.map((q) => {
      const userAnswerLetter = userAnswers[q.id];
      const userAnswerText = userAnswerLetter ? q.options[userAnswerLetter] : null;
      let correctAnswerLetter = '';
      Object.entries(q.options || {}).forEach(([letter, text]) => {
        if (text === q.correctAnswer || testResult.weakTopics) {
          correctAnswerLetter = letter;
        }
      });
      return {
        question: q.question,
        userAnswer: userAnswerLetter,
        userAnswerText,
        correctAnswer: correctAnswerLetter,
        isCorrect: userAnswerText === q.correctAnswer,
        topic: q.topic || q.mainTopic,
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
        .map(([topic, stats]) => ({
          topic,
          percentage: Math.round((stats.correct / stats.total) * 100),
        }))
    );
  }, [router]);

  const total = results.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const handleRetake = () => {
    sessionStorage.clear();
    router.push('/assessments');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assessment results</h1>
        <p className="text-sm text-muted-foreground">Score, breakdown, and areas to focus on.</p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 border-foreground/10 bg-muted">
            <span className="text-xl font-semibold tabular-nums">{percentage}%</span>
            <span className="text-xs text-muted-foreground">
              {score}/{total}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-base font-medium">
              {percentage >= 80
                ? 'Strong performance.'
                : percentage >= 50
                  ? 'Solid baseline.'
                  : 'Room to grow.'}
            </p>
            <p className="text-sm text-muted-foreground">
              {weakAreas.length === 0
                ? 'No clear weak topics — keep going.'
                : `${weakAreas.length} topic${weakAreas.length === 1 ? '' : 's'} below 50%.`}
            </p>
          </div>
          <Button variant="outline" onClick={handleRetake}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            New assessment
          </Button>
        </CardContent>
      </Card>

      {Object.keys(topicAnalysis).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance by topic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(topicAnalysis).map(([topic, stats]) => {
              const pct = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={topic} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{topic}</span>
                    <span className="text-muted-foreground">
                      {stats.correct}/{stats.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 50 ? 'hsl(142 71% 45%)' : 'hsl(0 84% 60%)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detailed answers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {results.map((r, idx) => (
            <div key={idx} className="rounded-md border border-border p-4">
              <div className="flex items-start gap-2">
                {r.isCorrect ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {idx + 1}. {r.question}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your answer:{' '}
                    {r.userAnswer ? (
                      <span className="font-medium text-foreground">
                        {r.userAnswer}. {r.options?.[r.userAnswer]}
                      </span>
                    ) : (
                      <span className="italic">Not answered</span>
                    )}
                  </p>
                  {!r.isCorrect && r.correctAnswer && (
                    <p className="text-xs text-muted-foreground">
                      Correct:{' '}
                      <span className="font-medium text-foreground">
                        {r.correctAnswer}. {r.options?.[r.correctAnswer]}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {weakAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Areas to improve</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {weakAreas.map(({ topic, percentage }) => (
                <li key={topic} className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                  <span>
                    <span className="font-medium">{topic}</span>{' '}
                    <span className="text-muted-foreground">— {percentage}%. Review core concepts and run focused practice.</span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultPage;
