'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { submitTest as submitTestApi } from '../utils/geminiApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const TestPage = () => {
  const params = useParams();
  const courseId = params?.courseId;
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    const cn = sessionStorage.getItem('courseName');
    const diff = sessionStorage.getItem('difficulty');
    setCourseName(cn || '');
    setDifficulty(diff || '');

    if (!cn || !diff) {
      router.push('/assessments');
      return;
    }

    try {
      const evaluationId = sessionStorage.getItem('evaluationId');
      const storedQuestions = sessionStorage.getItem('generatedQuestions');
      if (!evaluationId || !storedQuestions) {
        throw new Error('Test data not found. Please start from the setup page.');
      }
      const parsed = JSON.parse(storedQuestions);
      setQuestions(parsed);
      sessionStorage.setItem('attemptId', evaluationId);
      setLoading(false);
    } catch (err) {
      console.error('Test init failed:', err);
      router.push('/assessments');
    }
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    if (Object.keys(answers).length === 0) {
      alert('Please answer at least one question.');
      return;
    }
    setSubmitted(true);
    try {
      const evaluationId = sessionStorage.getItem('attemptId');
      const formattedAnswers = {};
      questions.forEach((_q, index) => {
        if (answers[index] !== undefined) {
          formattedAnswers[index] = answers[index];
        }
      });
      const result = await submitTestApi(evaluationId, formattedAnswers);
      sessionStorage.setItem('testResult', JSON.stringify(result));
      sessionStorage.setItem('testQuestions', JSON.stringify(questions));
      sessionStorage.setItem('userAnswers', JSON.stringify(answers));
      router.push(`/assessments/result/${courseId}`);
    } catch (err) {
      alert('Could not submit: ' + err.message);
      setSubmitted(false);
    }
  }, [submitted, questions, answers, courseId, router]);

  useEffect(() => {
    if (loading || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, loading, submitted, handleSubmit]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const answered = Object.keys(answers).length;
  const progress = questions.length ? (answered / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">Generating your personalized questions…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {courseName} <span className="text-muted-foreground">— {difficulty}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Answered {answered}/{questions.length}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm tabular-nums shadow-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-foreground transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="text-base">
                <span className="text-muted-foreground">{idx + 1}.</span> {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(q.options || []).map((option, optIdx) => {
                  const letter = OPTION_LETTERS[optIdx];
                  const selected = answers[idx] === option;
                  return (
                    <li key={optIdx}>
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors ${
                          selected
                            ? 'border-foreground bg-muted'
                            : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${idx}`}
                          value={option}
                          checked={selected}
                          onChange={() => handleSelect(idx, option)}
                          className="mt-1"
                        />
                        <span>
                          <span className="font-semibold">{letter}.</span> {option}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-2">
        <Button onClick={handleSubmit} disabled={submitted || answered === 0} className="w-full sm:w-auto">
          {submitted ? 'Submitting…' : 'Submit assessment'}
        </Button>
      </div>
    </div>
  );
};

export default TestPage;
