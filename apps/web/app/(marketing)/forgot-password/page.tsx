'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

type Step = 'request' | 'reset' | 'done'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>('request')
  const [email, setEmail] = React.useState('')
  const [otp, setOtp] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not send the code. Try again.')
        return
      }
      setStep('reset')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not reset the password.')
        return
      }
      setStep('done')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            {step === 'request' && 'Enter your email and we’ll send a one-time code.'}
            {step === 'reset' && 'Enter the code we sent and choose a new password.'}
            {step === 'done' && 'Password updated. Redirecting to your dashboard.'}
          </CardDescription>
        </CardHeader>

        {step === 'request' && (
          <form onSubmit={requestOtp}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send code'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Remembered it?{' '}
                <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={resetPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="otp">One-time code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  pattern="\d{4,8}"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Updating…' : 'Set new password'}
              </Button>
              <button
                type="button"
                onClick={() => setStep('request')}
                className="text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Resend the code
              </button>
            </CardFooter>
          </form>
        )}

        {step === 'done' && (
          <CardContent className="pb-6">
            <p className="text-sm text-muted-foreground">
              Taking you to{' '}
              <Link href="/dashboard" className="font-medium text-foreground underline underline-offset-4">
                /dashboard
              </Link>
              .
            </p>
          </CardContent>
        )}
      </Card>
    </section>
  )
}
