'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { SidePanel } from '@/components/ui/sidePanel'
import Stepper from '@/components/ui/stepper'

type WizardQuestion = {
  id: number
  type: 'text' | 'single-choice' | 'multiple-choice'
  question: string
  placeholder?: string
  options?: string[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const WIZARD_STEPS = ['Discover', 'Shape', 'Refine', 'Review']

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
  const [reviewOpen, setReviewOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

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

  const currentQuestion = questions[currentStep - 1]
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined
  const progress = questions.length ? ((currentStep - 1) / questions.length) * 100 : 0
  const summaryItems = questions
    .map((question) => ({ question, answer: answers[question.id] }))
    .filter((item) => item.answer !== undefined)

  const activeStep = Math.min(3, Math.floor(((currentStep - 1) / Math.max(1, questions.length - 1)) * 4))

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
      if (!value && currentStep !== questions.length) return
      setAnswer(currentQuestion.id, value)
      setTextInput('')
    }

    if (currentStep < questions.length) {
      setCurrentStep((value) => value + 1)
      return
    }

    setReviewOpen(true)
  }

  const handleSingleChoice = (option: string) => {
    if (!currentQuestion) return
    setAnswer(currentQuestion.id, option)

    if (currentStep < questions.length) {
      setTimeout(() => setCurrentStep((value) => value + 1), 180)
    } else {
      setReviewOpen(true)
    }
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

      let courseId: string | null = null
      try {
        const token = localStorage.getItem('careersync_token') || localStorage.getItem('Career_Sync_token')
        const saveResponse = await fetch(`${API_BASE_URL}/courses/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({ course: data.course }),
        })

        if (saveResponse.ok) {
          const saveJson = await saveResponse.json()
          courseId = saveJson.courseId
        }
      } catch {
        // fall back to local storage only
      }

      localStorage.setItem('generatedCourse', JSON.stringify({ ...data.course, id: courseId }))
      router.push(`/course-generated/${courseId || topic.toLowerCase().replace(/\s+/g, '-')}`)
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'Failed to generate course')
      setIsGenerating(false)
    }
  }

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-20">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-elevated">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Preparing your wizard</h1>
          <p className="mt-3 text-sm text-muted-foreground">Building a personalized course setup for {topic || 'your topic'}.</p>
        </div>
      </div>
    )
  }

  if (questionError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-elevated-sm">
          <h1 className="text-2xl font-semibold tracking-tight">We could not load the questions</h1>
          <p className="mt-3 text-sm text-muted-foreground">{questionError}</p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return null
  }

  const canContinue =
    currentQuestion.type === 'text'
      ? textInput.trim().length > 0 || currentStep === questions.length
      : currentQuestion.type === 'single-choice'
        ? Boolean(currentAnswer)
        : Array.isArray(currentAnswer) && currentAnswer.length > 0

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.05),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ffffff_40%,#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <Badge variant="muted" className="w-fit rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em]">
              Course wizard
            </Badge>
            <div className="space-y-2">
              <h1 className="text-display-1 font-semibold tracking-tight text-foreground sm:text-display-2">Design a better course for {topic}</h1>
              <p className="max-w-2xl text-body-lg text-muted-foreground">
                Answer a focused set of questions, review the draft, and generate a personalized learning path with the new split layout.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push('/courses')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to courses
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Card className="overflow-hidden border-border/70 shadow-elevated-sm">
            <CardHeader className="space-y-4 border-b border-border bg-muted/30 px-6 py-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">
                    Step {currentStep} of {questions.length}
                  </CardTitle>
                  <CardDescription className="mt-1">{Math.round(progress)}% complete</CardDescription>
                </div>
                <Badge variant="muted">{currentQuestion.type.replace('-', ' ')}</Badge>
              </div>
              <Stepper steps={WIZARD_STEPS} current={activeStep} />
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${Math.max(progress, 8)}%` }} />
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="rounded-3xl border border-border bg-background p-6 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Question</p>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                  {currentQuestion.question.replace('{topic}', topic)}
                </h2>

                {currentQuestion.type === 'text' ? (
                  <div className="mt-6 space-y-3">
                    <textarea
                      value={textInput}
                      onChange={(event) => setTextInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          goNext()
                        }
                      }}
                      placeholder={currentQuestion.placeholder || 'Type your answer'}
                      className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/10"
                    />
                    <p className="text-xs text-muted-foreground">Press Enter to continue, or use the button below.</p>
                  </div>
                ) : currentQuestion.type === 'single-choice' ? (
                  <div className="mt-6 grid gap-3">
                    {currentQuestion.options?.map((option) => {
                      const selected = currentAnswer === option
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSingleChoice(option)}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left text-sm transition ${selected ? 'border-slate-950 bg-slate-950 text-white shadow-elevated-sm' : 'border-border bg-background hover:border-slate-300 hover:bg-muted/30'}`}
                        >
                          <span className="pr-4 leading-6">{option}</span>
                          {selected ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <span className="h-3 w-3 shrink-0 rounded-full border border-current/25" />}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="mt-6 grid gap-3">
                    {currentQuestion.options?.map((option) => {
                      const selected = Array.isArray(currentAnswer) && currentAnswer.includes(option)
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleMultiChoice(option)}
                          className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left text-sm transition ${selected ? 'border-slate-950 bg-slate-950 text-white shadow-elevated-sm' : 'border-border bg-background hover:border-slate-300 hover:bg-muted/30'}`}
                        >
                          <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${selected ? 'border-white bg-white text-slate-950' : 'border-current/25'}`}>
                            {selected ? '✓' : ''}
                          </span>
                          <span className="leading-6">{option}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {generateError ? (
                  <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {generateError}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <Button variant="outline" onClick={goBack} disabled={currentStep === 1}>
                    Previous
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => setReviewOpen(true)} disabled={!questions.length}>
                      Review answers
                    </Button>
                    <Button onClick={goNext} disabled={!canContinue}>
                      {currentStep === questions.length ? 'Review' : 'Continue'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <SidePanel title="Live summary" subtitle="Your answers update this panel while you work through the wizard.">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Topic</p>
                <p className="mt-2 text-sm font-medium text-foreground">{topic}</p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Progress</p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-slate-950" style={{ width: `${Math.max(progress, 8)}%` }} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Question {currentStep} of {questions.length}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Captured answers</p>
                {summaryItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No answers yet. Start with the current question.
                  </div>
                ) : (
                  summaryItems.slice(0, 5).map(({ question, answer }) => (
                    <div key={question.id} className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Q{question.id}</p>
                      <p className="mt-2 text-sm text-foreground line-clamp-2">{question.question.replace('{topic}', topic)}</p>
                      <p className="mt-3 text-sm text-muted-foreground">{Array.isArray(answer) ? answer.join(', ') : answer}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </SidePanel>
        </div>
      </div>

      <Modal
        open={reviewOpen}
        title="Review your answers"
        description="Confirm the details below before generating your personalized course."
        onClose={() => setReviewOpen(false)}
      >
        <div className="space-y-4">
          <div className="grid max-h-[50vh] gap-4 overflow-y-auto pr-1">
            {questions.map((question) => {
              const answer = answers[question.id]
              return (
                <div key={question.id} className="rounded-2xl border border-border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Q{question.id}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{question.question.replace('{topic}', topic)}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{Array.isArray(answer) ? answer.join(', ') : answer || 'Not answered yet'}</p>
                </div>
              )
            })}
          </div>

          {generateError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{generateError}</div> : null}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Keep editing
            </Button>
            <Button onClick={generateCourse} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isGenerating ? 'Generating...' : 'Generate course'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
