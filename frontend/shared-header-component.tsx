/**
 * Shared Header Component for Next.js Applications
 * Used in: course-generation, roadmap
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  full_name?: string
  username?: string
}

interface CareerosHeaderProps {
  debugMode?: boolean
  onAuthStatusChange?: (isAuthenticated: boolean, user: User | null) => void
}

export default function CareerosHeader({ debugMode = false, onAuthStatusChange }: CareerosHeaderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkAuthStatus()
    const interval = setInterval(checkAuthStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    onAuthStatusChange?.(isAuthenticated, currentUser)
  }, [isAuthenticated, currentUser, onAuthStatusChange])

  const checkAuthStatus = () => {
    const user = localStorage.getItem('careeros_user')
    const token = localStorage.getItem('careeros_token')

    if (user && token) {
      try {
        const userData = JSON.parse(user)
        setCurrentUser(userData)
        setIsAuthenticated(true)
        if (debugMode) console.log('[CareerosHeader] User authenticated:', userData.email)
      } catch (e) {
        console.error('[CareerosHeader] Invalid user data:', e)
        logout()
      }
    } else {
      setIsAuthenticated(false)
      setCurrentUser(null)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const logout = () => {
    localStorage.removeItem('careeros_user')
    localStorage.removeItem('careeros_token')
    localStorage.removeItem('careeros_auth')
    setIsAuthenticated(false)
    setCurrentUser(null)
    if (debugMode) console.log('[CareerosHeader] User logged out')
    window.location.href = 'http://localhost:4173/auth.html'
  }

  const handleModuleNav = (url: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = url
    }
  }

  return (
    <header style={headerStyles.header}>
      <div style={headerStyles.container}>
        {/* Brand */}
        <Link href="http://localhost:4173" style={headerStyles.brand}>
          <div style={headerStyles.brandIcon}>C</div>
          <span>CareerOS</span>
        </Link>

        {/* Navigation Links */}
        <nav style={headerStyles.navLinks} className={mobileMenuOpen ? 'mobile-open' : ''}>
          <a
            href="http://localhost:3000"
            style={{
              ...headerStyles.navLink,
              color: hoveredLink === 'course' ? '#4f46e5' : '#475569',
              borderBottom: hoveredLink === 'course' ? '2px solid #4f46e5' : 'none',
            }}
            onMouseEnter={() => setHoveredLink('course')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            📚 Course Gen
          </a>
          <a
            href="http://localhost:5173"
            style={{
              ...headerStyles.navLink,
              color: hoveredLink === 'roadmap' ? '#4f46e5' : '#475569',
              borderBottom: hoveredLink === 'roadmap' ? '2px solid #4f46e5' : 'none',
            }}
            onMouseEnter={() => setHoveredLink('roadmap')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            🗺️ Roadmaps
          </a>
          <a
            href="http://localhost:3001"
            style={{
              ...headerStyles.navLink,
              color: hoveredLink === 'eval' ? '#4f46e5' : '#475569',
              borderBottom: hoveredLink === 'eval' ? '2px solid #4f46e5' : 'none',
            }}
            onMouseEnter={() => setHoveredLink('eval')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            ✅ Evaluator
          </a>
        </nav>

        {/* Auth Section */}
        <div style={headerStyles.navAuth}>
          {isAuthenticated && currentUser ? (
            <>
              <span style={headerStyles.userInfo}>
                👤 {currentUser.full_name || currentUser.email || 'User'}
              </span>
              <button
                onClick={handleLogout}
                style={headerStyles.signOutBtn}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="http://localhost:4173/auth.html" style={headerStyles.signInBtn}>
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          style={headerStyles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>
    </header>
  )
}

const headerStyles = {
  header: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    height: '72px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #E2E8F0',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  container: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '100%',
  },
  brand: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '12px',
    textDecoration: 'none',
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#0F172A',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  brandIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    color: 'white',
    fontWeight: 700,
    fontSize: '0.75rem',
  },
  navLinks: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '32px',
    flex: 1,
    justifyContent: 'center' as const,
  },
  navLink: {
    textDecoration: 'none',
    color: '#475569',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'color 0.2s',
    cursor: 'pointer',
    padding: '8px 0',
  },
  navAuth: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '16px',
  },
  userInfo: {
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  signInBtn: {
    textDecoration: 'none',
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: '8px',
    padding: '10px 20px',
    background: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  signOutBtn: {
    padding: '10px 20px',
    background: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  mobileMenuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '8px',
    color: '#0F172A',
  },
}
