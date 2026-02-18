'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role?: 'learner' | 'educator' | 'admin'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check authentication on mount
    checkAuth()

    // Poll auth status every 10 seconds
    const authCheckInterval = setInterval(checkAuth, 10000)
    
    return () => {
      clearInterval(authCheckInterval)
    }
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include' // Include cookies
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.user || data
        setUser(userData)
        setIsAuthenticated(true)
        // Store user data for other apps to access
        if (typeof window !== 'undefined') {
          localStorage.setItem('careersync_user', JSON.stringify(userData))
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
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
        
        // Store token if provided
        if (data.token && typeof window !== 'undefined') {
          localStorage.setItem('careersync_token', data.token)
          console.log('✅ Token stored:', data.token.substring(0, 20) + '...')
        }
        
        // Store user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('careersync_user', JSON.stringify(userData))
          console.log('✅ User stored:', userData)
        }
        
        setUser(userData)
        setIsAuthenticated(true)
        return true
      }
      
      return false
    } catch (error) {
      return false
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
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('careersync_token')
      localStorage.removeItem('careersync_user')
    }
    
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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
