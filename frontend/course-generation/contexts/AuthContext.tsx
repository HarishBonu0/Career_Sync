'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'learner' | 'educator' | 'admin'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Mock users as fallback when backend is not running
const mockUsers = [
  { id: '1', email: 'learner@example.com', password: 'password123', name: 'John Doe', role: 'learner' as const },
  { id: '2', email: 'educator@example.com', password: 'password123', name: 'Jane Smith', role: 'educator' as const },
  { id: '3', email: 'admin@example.com', password: 'password123', name: 'Admin User', role: 'admin' as const },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check localStorage for saved user and token (use careeros keys for consistency)
    const savedUser = localStorage.getItem('careeros_user')
    const savedToken = localStorage.getItem('careeros_token')
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser))
        setToken(savedToken)
      } catch (e) {
        console.error('Invalid user data:', e)
        localStorage.removeItem('careeros_user')
        localStorage.removeItem('careeros_token')
      }
    }
    
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'careeros_user' || e.key === 'careeros_token') {
        if (e.key === 'careeros_user' && e.newValue) {
          try {
            setUser(JSON.parse(e.newValue))
          } catch (err) {
            console.error('Invalid user data:', err)
          }
        } else if (e.key === 'careeros_user' && !e.newValue) {
          setUser(null)
        }
        
        if (e.key === 'careeros_token') {
          setToken(e.newValue)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try backend API first
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        }
        setUser(userData)
        setToken(data.token)
        localStorage.setItem('careeros_user', JSON.stringify(userData))
        localStorage.setItem('careeros_token', data.token)
        return true
      }
    } catch (error) {
      console.log('Backend not available, using mock authentication')
    }

    // Fallback to mock authentication
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    )
    
    if (foundUser) {
      const userData = { 
        id: foundUser.id,
        name: foundUser.name, 
        email: foundUser.email, 
        role: foundUser.role 
      }
      setUser(userData)
      const mockToken = 'mock-token-' + Date.now()
      setToken(mockToken)
      localStorage.setItem('careeros_user', JSON.stringify(userData))
      localStorage.setItem('careeros_token', mockToken)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('careeros_user')
    localStorage.removeItem('careeros_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
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
