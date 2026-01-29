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
    // Check localStorage for saved user and token
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setToken(savedToken)
    }
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
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', data.token)
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
      setToken('mock-token-' + Date.now())
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', 'mock-token-' + Date.now())
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
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
