'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  provider?: 'email' | 'google' | 'both'
  authProviders?: ('email' | 'google')[]
  role?: 'learner' | 'educator' | 'admin'
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  authStatus: AuthStatus
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    checkAuth()

    const authCheckInterval = setInterval(checkAuth, 10000)
    
    return () => {
      clearInterval(authCheckInterval)
    }
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include', // Include cookies
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.user || data
        setUser(userData)
        setAuthStatus('authenticated')
        return
      }
      if (response.status === 401) {
        setUser(null)
        setAuthStatus('unauthenticated')
        return
      }
      setUser(null)
      setAuthStatus('error')
    } catch (error) {
      console.error('Backend auth check failed:', error)
      setUser(null)
      setAuthStatus('error')
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.user || data
        setUser(userData)
        setAuthStatus('authenticated')
        return true
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) return { ok: false, error: data.error || data.message || 'Sign up failed.' }
      setUser(data.user || null)
      setAuthStatus('authenticated')
      return { ok: true }
    } catch {
      return { ok: false, error: 'Unable to reach the authentication server.' }
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    setUser(null)
    setAuthStatus('unauthenticated')
  }

  const isAuthenticated = authStatus === 'authenticated'

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, authStatus }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
