'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
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
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New assessment</h1>
        <p className="text-sm text-muted-foreground">
          Generate a 20-question skill check tailored to your topic and level.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-base">What do you want to be evaluated on?</CardTitle>
            <CardDescription>Pick a topic and a difficulty. We&apos;ll build the test from there.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g. Python, React, System Design…"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                disabled={loading}
                required
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setCourseName(topic)}
                    disabled={loading}
                    className={`rounded-full border border-border px-3 py-1 text-xs transition-colors ${
                      courseName === topic
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    disabled={loading}
                    className={`rounded-md border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                      difficulty === level
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <div className="px-6 pb-6">
            <Button type="submit" className="w-full" disabled={!courseName || !difficulty || loading}>
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? 'Generating questions…' : 'Start assessment'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SetupPage;
