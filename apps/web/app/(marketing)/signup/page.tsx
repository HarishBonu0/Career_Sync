'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Chrome, ArrowRight, Compass } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const router = useRouter()
  const { login, register, isAuthenticated } = useAuth()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home')
    }
  }, [isAuthenticated, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await register(name, email, password)
      if (!result.ok) {
        setError(result.error || 'Sign up failed.')
        return
      }
      router.push('/home')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGuestLogin() {
    setError(null)
    setSubmitting(true)
    try {
      const guestEmail = 'guest@careersync.local'
      const guestPassword = 'GuestPassword123!'
      const ok = await login(guestEmail, guestPassword)
      if (ok) {
        router.replace('/home')
        return
      }
      
      const regOk = await register('Guest User', guestEmail, guestPassword)
      if (regOk.ok) {
        router.replace('/home')
      } else {
        setError(regOk.error || 'Failed to create guest account.')
      }
    } catch {
      setError('Something went wrong during guest login.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-4">
      {/* Premium Ivory & Gold Background */}
      <div className="absolute inset-0 -z-10 bg-background overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-accent/10 to-transparent blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-accent/5 to-transparent blur-2xl opacity-60 -translate-x-1/4 translate-y-1/4 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
      </div>

      <div className="w-full max-w-[420px]">
        <div className="mb-10 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-border/50 mb-6">
            <Compass className="h-6 w-6 text-accent" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Create Account</h1>
          <p className="text-secondary-foreground text-base">Start mapping your career with AI.</p>
        </div>

        <div className="rounded-[2rem] border border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full h-12 rounded-xl bg-white hover:bg-secondary/50 border-border text-primary font-semibold shadow-sm transition-all"
              disabled={submitting}
              onClick={() => {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
                const origin = typeof window !== 'undefined' ? window.location.origin : ''
                window.location.href = `${apiUrl}/auth/google?origin=${encodeURIComponent(origin)}`
              }}
            >
              <Chrome className="mr-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              Sign up with Google
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full h-12 rounded-xl bg-white hover:bg-secondary/50 border-border text-primary font-semibold shadow-sm transition-all"
              disabled={submitting}
              onClick={handleGuestLogin}
            >
              <Compass className="mr-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              Login as Guest
            </Button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/80" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-semibold">
                <span className="bg-[#FBF9F6] px-4 text-muted-foreground rounded-full">Or</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-primary">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="h-12 rounded-xl bg-white border-border/80 focus:border-accent focus:ring-accent/20 px-4 transition-all"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-primary">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-white border-border/80 focus:border-accent focus:ring-accent/20 px-4 transition-all"
                  placeholder="alex@example.com"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-primary">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-white border-border/80 focus:border-accent focus:ring-accent/20 px-4 transition-all tracking-widest"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/5 text-destructive text-sm font-medium border border-destructive/10 text-center">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full h-14 rounded-xl text-base font-bold bg-primary text-white hover:bg-primary/90 shadow-md transition-transform hover:-translate-y-0.5" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create Account'} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <p className="text-[11px] text-center text-muted-foreground/70 leading-tight">
              (Preview Mode: Will use local storage if DB is offline)
            </p>
          </form>
        </div>
        
        <p className="mt-8 text-center text-sm font-medium text-secondary-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-accent hover:text-accent/80 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
