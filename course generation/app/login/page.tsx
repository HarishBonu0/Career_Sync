'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await login(email, password)
    
    if (success) {
      router.push('/home')
    } else {
      setError('Invalid email or password')
    }
    
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/home" className="text-4xl font-bold text-gray-900 inline-block mb-4">
            º/º
          </Link>
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600">Sign in to continue learning</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Demo accounts:{' '}
            <span className="font-medium">learner@example.com</span> or{' '}
            <span className="font-medium">educator@example.com</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">Password: password123</p>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-gray-900 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
