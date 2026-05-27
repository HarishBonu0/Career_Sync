'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

type Step = 'request' | 'verify'

export default function LoginOtpPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>('request')
  const [email, setEmail] = React.useState('')
  const [otp, setOtp] = React.useState('')
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
      setStep('verify')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/auth/login-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Invalid or expired code.')
        return
      }
      if (data.token) localStorage.setItem('careersync_token', data.token)
      if (data.user) localStorage.setItem('careersync_user', JSON.stringify(data.user))
      router.push('/dashboard')
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
          <CardTitle>Sign in with a one-time code</CardTitle>
          <CardDescription>
            {step === 'request' && 'We’ll email you a short code instead of a password.'}
            {step === 'verify' && 'Enter the code we just sent.'}
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
                Prefer a password?{' '}
                <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
                  Sign in normally
                </Link>
              </p>
            </CardFooter>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={verifyOtp}>
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
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Verifying…' : 'Verify and sign in'}
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
      </Card>
    </section>
  )
}
