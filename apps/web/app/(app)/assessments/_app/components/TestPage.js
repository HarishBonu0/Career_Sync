'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, Loader2, Send } from 'lucide-react';
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
      router.push(`/assessments/result/${courseId}?evaluationId=${encodeURIComponent(evaluationId)}`);
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
      <div className="mx-auto max-w-2xl px-6 py-24 text-center space-y-6">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />
        <p className="text-lg text-secondary-foreground font-medium">Generating your personalized questions…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      <div className="sticky top-20 z-50 bg-background/80 backdrop-blur-xl border border-border/50 rounded-[2rem] p-6 shadow-sm mb-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              {courseName} <span className="text-accent">— {difficulty}</span>
            </h1>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mt-2">
              Answered {answered} / {questions.length}
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border-2 border-accent/20 bg-accent/5 px-6 py-2 shadow-sm">
            <Clock className="h-5 w-5 text-accent" />
            <span className="text-xl font-bold text-accent tabular-nums tracking-tight">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted mt-6">
          <div className="h-full bg-accent transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-8 pb-12">
        {questions.map((q, idx) => (
          <Card key={idx} className="rounded-[2rem] border border-border/80 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-semibold leading-relaxed text-primary">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent text-sm mr-3 font-bold">{idx + 1}</span> 
                {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-2">
              <ul className="space-y-3">
                {(q.options || []).map((option, optIdx) => {
                  const letter = OPTION_LETTERS[optIdx];
                  const selected = answers[idx] === option;
                  return (
                    <li key={optIdx}>
                      <label
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 px-5 py-4 text-base transition-all ${
                          selected
                            ? 'border-accent bg-accent/5 shadow-[0_4px_14px_rgba(184,121,36,0.1)]'
                            : 'border-border/50 hover:bg-muted hover:border-border'
                        }`}
                      >
                        <div className={`flex shrink-0 items-center justify-center w-6 h-6 rounded-full border ${selected ? 'border-accent bg-accent' : 'border-muted-foreground/30 bg-white'}`}>
                           {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <input
                          type="radio"
                          name={`question-${idx}`}
                          value={option}
                          checked={selected}
                          onChange={() => handleSelect(idx, option)}
                          className="sr-only"
                        />
                        <span className="font-medium text-secondary-foreground">
                          <span className="font-bold text-primary mr-2">{letter}.</span> {option}
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

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-xl border-t border-border/50 z-50">
        <div className="max-w-4xl mx-auto flex justify-end">
          <Button onClick={handleSubmit} size="lg" disabled={submitted || answered === 0} className="w-full sm:w-auto rounded-full px-12 h-14 text-base font-bold shadow-lg shadow-accent/20 bg-primary text-white hover:bg-primary/90 transition-transform hover:-translate-y-1">
            {submitted ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Assessment
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
