'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateQuestions } from '../utils/geminiApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SUGGESTIONS = ['Python', 'Data Structures', 'Machine Learning', 'JavaScript', 'React', 'Java'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const SetupPage = () => {
  const router = useRouter();
  const [courseName, setCourseName] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!courseName || !difficulty) {
      setError('Choose a topic and a difficulty level.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      sessionStorage.setItem('courseName', courseName);
      sessionStorage.setItem('difficulty', difficulty);
      const result = await generateQuestions(courseName, difficulty);
      if (result && result.evaluationId) {
        sessionStorage.setItem('evaluationId', result.evaluationId);
        sessionStorage.setItem('generatedQuestions', JSON.stringify(result.questions || []));
      }
      const courseId = courseName.toLowerCase().replace(/\s+/g, '-');
      router.push(`/assessments/test/${courseId}`);
    } catch (err) {
      setError('Could not generate questions: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Skill Validation
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">New assessment</h1>
        <p className="text-lg text-secondary-foreground font-medium">
          Generate a 20-question skill check tailored to your topic and level.
        </p>
      </div>

      <Card className="rounded-[2rem] border border-border/80 bg-white shadow-elevated overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-accent/5 to-transparent blur-2xl opacity-60 pointer-events-none" />
        <form onSubmit={handleSubmit} className="relative z-10">
          <CardHeader className="border-b border-border/50 bg-background/50 px-8 py-6">
            <CardTitle className="text-xl font-bold text-primary">What do you want to be evaluated on?</CardTitle>
            <CardDescription className="text-sm font-medium text-secondary-foreground">Pick a topic and a difficulty. We&apos;ll build the test from there.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8 sm:p-10">
            <div className="space-y-3">
              <Label htmlFor="topic" className="text-sm font-bold text-primary">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g. Python, React, System Design…"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                disabled={loading}
                required
                className="h-14 rounded-xl border-border/80 bg-white px-4 text-base focus-visible:ring-accent focus-visible:border-accent transition-all font-medium placeholder:text-muted-foreground/60"
              />
              <div className="flex flex-wrap gap-2 pt-3">
                {SUGGESTIONS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setCourseName(topic)}
                    disabled={loading}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all shadow-sm ${
                      courseName === topic
                        ? 'border-primary bg-primary text-white shadow-[0_4px_14px_rgba(17,17,17,0.15)] scale-105'
                        : 'border-border/80 bg-white text-secondary-foreground hover:bg-primary hover:text-white hover:border-primary hover:shadow-md'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-primary">Difficulty</Label>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTIES.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    disabled={loading}
                    className={`rounded-xl border-2 px-4 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
                      difficulty === level
                        ? 'border-accent bg-accent/5 text-accent shadow-sm'
                        : 'border-border/50 bg-white text-secondary-foreground hover:border-accent/40 hover:bg-accent/5'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
          <div className="px-8 pb-10">
            <Button type="submit" size="lg" className="w-full h-14 rounded-full text-base font-bold shadow-lg shadow-accent/20 bg-primary text-white hover:bg-primary/90 transition-transform hover:-translate-y-0.5" disabled={!courseName || !difficulty || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating intelligence...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start assessment
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SetupPage;
