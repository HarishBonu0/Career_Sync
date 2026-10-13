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

function syncAuthToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem('Career_Sync_token', token)
    const isHttps = window.location.protocol === 'https:'
    document.cookie = `Career_Sync_token=${token}; path=/; max-age=604800; SameSite=Lax${isHttps ? '; Secure' : ''}`
  } else {
    localStorage.removeItem('Career_Sync_token')
    localStorage.removeItem('localUser')
    document.cookie = 'Career_Sync_token=; path=/; max-age=0'
  }
}

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
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const urlToken = urlParams.get('token')
        if (urlToken) {
          syncAuthToken(urlToken)
          urlParams.delete('token')
          const cleanSearch = urlParams.toString() ? `?${urlParams.toString()}` : ''
          window.history.replaceState({}, document.title, window.location.pathname + cleanSearch)
        }
      }

      // Check localStorage first if in dev mode to prevent 401 spam
      if (process.env.NODE_ENV === 'development') {
        const localUser = localStorage.getItem('localUser')
        if (localUser) {
          setUser(JSON.parse(localUser))
          setAuthStatus('authenticated')
          return
        }
      }

      const headers: Record<string, string> = {}
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('Career_Sync_token')
        if (token) {
          syncAuthToken(token) // ensure cookie is also active on the Vercel domain
          headers['Authorization'] = `Bearer ${token}`
        }
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include', // Include cookies
        headers,
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.user || data
        setUser(userData)
        setAuthStatus('authenticated')
        return
      }

      if (response.status === 401) {
        syncAuthToken(null)
        setUser(null)
        setAuthStatus('unauthenticated')
        return
      }
      setUser(null)
      setAuthStatus('error')
    } catch (error) {
      console.warn('Backend auth check temporarily unavailable:', error)
      setUser(null)
      setAuthStatus('unauthenticated')
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
        if (data.token) {
          syncAuthToken(data.token)
        }
        setUser(userData)
        setAuthStatus('authenticated')
        return true
      }
      
      const data = await response.json().catch(() => ({}))
      if (process.env.NODE_ENV === 'development' && (data.useLocalStorage || response.status === 503)) {
        const localUser = { id: 'local', name: 'Local User', email }
        localStorage.setItem('localUser', JSON.stringify(localUser))
        setUser(localUser)
        setAuthStatus('authenticated')
        return true
      }
      
      return false
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // Fallback to local on complete network failure if needed
        const localUser = { id: 'local', name: 'Local User', email }
        localStorage.setItem('localUser', JSON.stringify(localUser))
        setUser(localUser)
        setAuthStatus('authenticated')
        return true
      }
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
      if (!response.ok) {
        if (process.env.NODE_ENV === 'development' && (data.useLocalStorage || response.status === 503)) {
          const localUser = { id: 'local', name, email }
          localStorage.setItem('localUser', JSON.stringify(localUser))
          setUser(localUser)
          setAuthStatus('authenticated')
          return { ok: true }
        }
        return { ok: false, error: data.error || data.message || 'Sign up failed.' }
      }
      if (data.token) {
        syncAuthToken(data.token)
      }
      setUser(data.user || null)
      setAuthStatus('authenticated')
      return { ok: true }
    } catch {
      if (process.env.NODE_ENV === 'development') {
        const localUser = { id: 'local', name, email }
        localStorage.setItem('localUser', JSON.stringify(localUser))
        setUser(localUser)
        setAuthStatus('authenticated')
        return { ok: true }
      }
      return { ok: false, error: 'Sign up failed due to a network error.' }
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
    
    syncAuthToken(null)
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
