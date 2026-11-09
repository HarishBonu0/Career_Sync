'use client'

import * as React from 'react'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Check, Loader2, Sparkles, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type WizardQuestion = {
  id: number
  type: 'text' | 'single-choice' | 'multiple-choice'
  question: string
  placeholder?: string
  options?: string[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function GenerateCoursePage() {
  const params = useParams()
  const router = useRouter()
  const topic = decodeURIComponent(String(Array.isArray(params.topic) ? params.topic[0] : params.topic || ''))

  const [questions, setQuestions] = useState<WizardQuestion[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [textInput, setTextInput] = useState('')
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [questionError, setQuestionError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const loadQuestions = async () => {
      setLoadingQuestions(true)
      setQuestionError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/courses/generate-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic }),
        })

        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to load questions')
        }

        const normalizedQuestions = (payload.questions || []).map((question: WizardQuestion, index: number) => ({
          ...question,
          id: question.id || index + 1,
        }))

        setQuestions(normalizedQuestions)
        setCurrentStep(1)
        setAnswers({})
        setTextInput('')
      } catch (error) {
        setQuestionError(error instanceof Error ? error.message : 'Failed to load questions')
      } finally {
        setLoadingQuestions(false)
      }
    }

    if (topic) loadQuestions()
  }, [topic])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentStep])

  const currentQuestion = questions[currentStep - 1]
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined
  const progress = questions.length ? ((currentStep - 1) / questions.length) * 100 : 0
  const isReviewStep = currentStep === questions.length + 1;

  const setAnswer = (questionId: number, value: string | string[]) => {
    setAnswers((current) => ({ ...current, [questionId]: value }))
  }

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((value) => value - 1)
  }

  const goNext = () => {
    if (!currentQuestion) return

    if (currentQuestion.type === 'text') {
      const value = textInput.trim()
      if (!value) return
      setAnswer(currentQuestion.id, value)
      setTextInput('')
    }
    setCurrentStep((value) => value + 1)
  }

  const handleSingleChoice = (option: string) => {
    if (!currentQuestion) return
    setAnswer(currentQuestion.id, option)
    setTimeout(() => setCurrentStep((value) => value + 1), 250)
  }

  const toggleMultiChoice = (option: string) => {
    if (!currentQuestion) return
    const current = Array.isArray(currentAnswer) ? currentAnswer : []
    const next = current.includes(option) ? current.filter((item) => item !== option) : [...current, option]
    setAnswer(currentQuestion.id, next)
  }

  const generateCourse = async () => {
    setIsGenerating(true)
    setGenerateError(null)

    try {
      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ topic, answers }),
        signal: AbortSignal.timeout(180000),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to generate course')
      }

      if (!data.course) {
        throw new Error('Course generation returned no course data')
      }

      const saveIntentId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      sessionStorage.setItem('coursePreview', JSON.stringify({
        ...data.course,
        id: 'preview',
        saveIntentId,
        generationMetadata: data.generationMetadata,
      }))
      router.push('/course-generated/preview')
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'Failed to generate course')
      setIsGenerating(false)
    }
  }

  if (loadingQuestions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-6" />
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Analyzing topic...</h1>
        <p className="mt-3 text-lg text-muted-foreground animate-pulse">Building a personalized curriculum wizard for {topic}.</p>
      </div>
    )
  }

  if (questionError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
        <h1 className="text-3xl font-semibold tracking-tight text-destructive">Failed to load questions</h1>
        <p className="mt-3 text-lg text-muted-foreground">{questionError}</p>
        <Button className="mt-8 px-8 rounded-full" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  const renderReviewStep = () => (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">Almost there.</h1>
        <p className="text-xl text-muted-foreground">Review your goals before we generate the perfect course.</p>
      </div>
      
      <div className="space-y-6 mb-12">
        {questions.map((q, idx) => {
          const ans = answers[q.id];
          return (
            <div key={q.id} className="group relative rounded-2xl border border-border/50 bg-card/50 p-6 transition-all hover:bg-card hover:border-border cursor-pointer" onClick={() => setCurrentStep(idx + 1)}>
              <div className="flex gap-4">
                <span className="text-primary font-mono text-sm mt-1">{idx + 1}.</span>
                <div className="flex-1">
                  <p className="text-lg text-foreground font-medium mb-2">{q.question.replace('{topic}', topic)}</p>
                  <p className="text-muted-foreground">{Array.isArray(ans) ? ans.join(', ') : (ans || '—')}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-muted/50 rounded-full h-8 w-8 text-muted-foreground">
                  ✎
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {generateError && (
        <div className="mb-8 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive flex items-center gap-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {generateError}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button size="lg" className="rounded-full px-8 text-base h-14" onClick={generateCourse} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Sparkles className="mr-3 h-5 w-5" />}
          {isGenerating ? 'Building Curriculum...' : 'Generate Course'}
        </Button>
        <Button variant="ghost" size="lg" className="rounded-full px-6" onClick={() => setCurrentStep(questions.length)}>
          Go Back
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Dynamic Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-muted z-50">
        <div 
          className="h-full bg-primary transition-all duration-700 ease-out" 
          style={{ width: `${isReviewStep ? 100 : progress}%` }} 
        />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-40">
        <Button variant="ghost" className="rounded-full hover:bg-muted" onClick={() => router.push('/courses')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Exit Setup
        </Button>
        {!isReviewStep && (
          <div className="text-sm font-medium text-muted-foreground font-mono">
            {currentStep} / {questions.length}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 w-full max-w-5xl mx-auto min-h-screen">
        {isReviewStep ? (
          renderReviewStep()
        ) : currentQuestion ? (
          <div key={currentQuestion.id} className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="flex gap-4 md:gap-6 mb-8 md:mb-12">
              <span className="text-primary font-mono text-xl md:text-2xl mt-1 md:mt-2 shrink-0">{currentStep}.</span>
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
                {currentQuestion.question.replace('{topic}', topic)}
              </h1>
            </div>

            <div className="pl-8 md:pl-12">
              {currentQuestion.type === 'text' ? (
                <div className="space-y-6">
                  <textarea
                    ref={inputRef}
                    value={textInput}
                    onChange={(event) => setTextInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        if (textInput.trim()) goNext()
                      }
                    }}
                    placeholder={currentQuestion.placeholder || 'Type your answer here...'}
                    className="w-full min-h-[120px] bg-transparent border-b-2 border-muted-foreground/30 focus:border-primary text-2xl md:text-3xl text-foreground placeholder:text-muted-foreground/40 outline-none resize-none transition-colors py-2"
                  />
                  <div className="flex items-center gap-4 pt-4">
                    <Button 
                      size="lg" 
                      className="rounded-full px-8 text-base h-12" 
                      onClick={goNext} 
                      disabled={!textInput.trim()}
                    >
                      OK <Check className="ml-2 h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground hidden md:inline-flex items-center gap-1">
                      press <kbd className="bg-muted px-2 py-1 rounded text-xs font-mono">Enter ↵</kbd>
                    </span>
                  </div>
                </div>
              ) : currentQuestion.type === 'single-choice' ? (
                <div className="grid gap-3">
                  {currentQuestion.options?.map((option, idx) => {
                    const selected = currentAnswer === option
                    const letter = String.fromCharCode(65 + idx)
                    return (
                      <button
                        key={option}
                        onClick={() => handleSingleChoice(option)}
                        className={`group relative flex items-center w-full rounded-xl border p-4 transition-all duration-300 text-left ${
                          selected 
                            ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary))]' 
                            : 'border-border/60 hover:border-primary/50 bg-card hover:bg-card/80'
                        }`}
                      >
                        <div className={`flex items-center justify-center h-8 w-8 rounded-md border text-sm font-mono transition-colors mr-4 shrink-0 ${
                          selected ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border text-muted-foreground group-hover:border-primary/50'
                        }`}>
                          {letter}
                        </div>
                        <span className={`text-lg md:text-xl transition-colors ${selected ? 'text-foreground font-medium' : 'text-foreground/80'}`}>
                          {option}
                        </span>
                        {selected && <Check className="absolute right-6 h-5 w-5 text-primary animate-in zoom-in" />}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid gap-3">
                    {currentQuestion.options?.map((option, idx) => {
                      const selected = Array.isArray(currentAnswer) && currentAnswer.includes(option)
                      const letter = String.fromCharCode(65 + idx)
                      return (
                        <button
                          key={option}
                          onClick={() => toggleMultiChoice(option)}
                          className={`group relative flex items-center w-full rounded-xl border p-4 transition-all duration-300 text-left ${
                            selected 
                              ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary))]' 
                              : 'border-border/60 hover:border-primary/50 bg-card hover:bg-card/80'
                          }`}
                        >
                          <div className={`flex items-center justify-center h-8 w-8 rounded-md border text-sm transition-colors mr-4 shrink-0 ${
                            selected ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border text-muted-foreground group-hover:border-primary/50'
                          }`}>
                            {selected ? <Check className="h-4 w-4" /> : <span className="font-mono">{letter}</span>}
                          </div>
                          <span className={`text-lg md:text-xl transition-colors ${selected ? 'text-foreground font-medium' : 'text-foreground/80'}`}>
                            {option}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <Button 
                    size="lg" 
                    className="rounded-full px-8 text-base h-12" 
                    onClick={goNext}
                    disabled={!Array.isArray(currentAnswer) || currentAnswer.length === 0}
                  >
                    OK <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>

      {/* Navigation Footer for multi-step */}
      {!isReviewStep && currentQuestion && (
        <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-t from-background via-background to-transparent pointer-events-none z-40">
          <div className="pointer-events-auto">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-12 w-12 border-border/60 shadow-sm"
              onClick={goBack} 
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}
