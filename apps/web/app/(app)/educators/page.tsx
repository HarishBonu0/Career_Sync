'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Award, BookOpen, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react'

function EducatorForm({ onSuccess }: { onSuccess: () => void }) {
  const [reason, setReason] = useState('')
  const [focusArea, setFocusArea] = useState('Product Design')
  const [experience, setExperience] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = reason.trim().length >= 100 && experience.trim().length >= 20

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)

    const application = {
      reason: reason.trim(),
      focusArea,
      experience: experience.trim(),
      submittedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem('careeros_educator_application', JSON.stringify(application))
      onSuccess()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="focusArea" className="mb-2 block text-sm font-semibold text-slate-700">
            Teaching focus
          </label>
          <select
            id="focusArea"
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          >
            <option>Product Design</option>
            <option>Frontend Development</option>
            <option>Backend Engineering</option>
            <option>Data Science</option>
            <option>Career Coaching</option>
            <option>Leadership</option>
          </select>
        </div>

        <div>
          <label htmlFor="experience" className="mb-2 block text-sm font-semibold text-slate-700">
            Years of experience
          </label>
          <input
            id="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="e.g. 7 years"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="reason" className="mb-2 block text-sm font-semibold text-slate-700">
          Why would you like to join CareerOS Educators?
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={8}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          placeholder="Share what you teach, your experience, audience size, and the outcomes learners can expect..."
          required
        />
        <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
          <span>Minimum 100 characters</span>
          <span>{reason.length}/100</span>
        </div>
      </div>

      <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-900">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            This application is saved locally for now so you can continue without waiting on backend approval.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Saving application...' : 'Become an Educator'}
        </button>
      </div>
    </form>
  )
}

export default function EducatorsPage() {
  const [step, setStep] = useState<'intro' | 'form'>('intro')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('careeros_educator_application')
    if (saved) setSubmitted(true)
  }, [])

  if (submitted) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] flex items-center justify-center p-6">
        <div className="max-w-2xl rounded-[2rem] border border-white/60 bg-white/90 p-10 text-center shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <Sparkles className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-slate-950">
            Educator profile saved
          </h2>
          <p className="mb-8 text-lg text-slate-600">
            Your educator application has been stored locally. When the approval workflow is enabled,
            this page can post the same data to the backend without changing the experience.
          </p>
          <Link href="/home" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="container-custom py-12">
        <Link
          href="/home"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        {step === 'intro' ? (
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-950 shadow-lg shadow-slate-950/20">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
              <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-950">
                Are you an educator or subject-matter expert?
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-slate-600">
                Join CareerOS and build a teaching presence that feels premium, credible, and easy to manage.
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
              <button
                onClick={() => setStep('form')}
                className="group rounded-[1.75rem] border border-slate-200 bg-white p-8 text-left shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_24px_70px_rgba(37,99,235,0.12)]"
              >
                <div className="mb-4 text-5xl transition-transform group-hover:scale-110">
                  ✨
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-950">Yes, I want to teach</h2>
                <p className="text-slate-600">
                  Start an educator application and save your submission immediately.
                </p>
              </button>

              <Link
                href="/home"
                className="group rounded-[1.75rem] border border-slate-200 bg-white p-8 text-left shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
              >
                <div className="mb-4 text-5xl transition-transform group-hover:scale-110">
                  📚
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-950">Keep exploring</h2>
                <p className="text-slate-600">
                  Stay in learner mode and continue browsing courses and roadmaps.
                </p>
              </Link>
            </div>

            <div className="mx-auto mt-16 max-w-5xl rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <h3 className="mb-6 text-2xl font-bold text-slate-950">
                Why become a CareerOS educator?
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Award className="mt-0.5 h-5 w-5 text-primary-600" />
                  <div>
                    <h4 className="font-semibold text-slate-950">Share your expertise</h4>
                    <p className="text-sm text-slate-600">
                      Publish high-quality learning experiences with a premium presentation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-0.5 h-5 w-5 text-primary-600" />
                  <div>
                    <h4 className="font-semibold text-slate-950">Structured publishing</h4>
                    <p className="text-sm text-slate-600">
                      Keep your teaching focus organized with a clear application flow.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-primary-600" />
                  <div>
                    <h4 className="font-semibold text-slate-950">Polished application experience</h4>
                    <p className="text-sm text-slate-600">
                      The form saves locally now and can be wired to the backend later without redesign.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-primary-600" />
                  <div>
                    <h4 className="font-semibold text-slate-950">Ready for approval flow</h4>
                    <p className="text-sm text-slate-600">
                      A backend API can be added later without changing this user-facing surface.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-12">
              <h2 className="mb-2 text-3xl font-bold text-slate-950">
                Apply to become an educator
              </h2>
              <p className="mb-8 text-slate-600">
                Tell us what you teach, what you can help learners achieve, and why you should be approved.
              </p>

              <EducatorForm onSuccess={() => setSubmitted(true)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
