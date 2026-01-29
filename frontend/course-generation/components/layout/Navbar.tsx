'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface User {
  id?: string
  email?: string
  full_name?: string
  username?: string
}

export default function Navbar() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const saveUserData = () => {
    const userStr = localStorage.getItem('careeros_user')
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        const profileData = {
          ...userData,
          lastAccessed: new Date().toISOString(),
          visitCount: (parseInt(localStorage.getItem('careeros_profile_visits') || '0') + 1)
        }
        localStorage.setItem('careeros_profile_data', JSON.stringify(profileData))
        localStorage.setItem('careeros_profile_visits', profileData.visitCount.toString())
      } catch (e) {
        console.error('Error saving profile data:', e)
      }
    }
  }

  const getUserDisplayName = () => {
    if (!user) return 'User'
    return user.name || user.full_name || user.username || user.email?.split('@')[0] || 'User'
  }

  return (
    <header style={navbarStyles.header}>
      <div style={navbarStyles.container}>
        {/* Brand */}
        <a href="http://localhost:4173" style={navbarStyles.brand}>
          <div style={navbarStyles.brandIcon}>C</div>
          <span>CareerOS</span>
        </a>

        {/* Navigation Links */}
        <nav style={navbarStyles.navLinks} className={mobileMenuOpen ? 'mobile-open' : ''}>
          <a 
            href="http://localhost:3002"
            style={{
              ...navbarStyles.navLink,
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
              ...navbarStyles.navLink,
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
              ...navbarStyles.navLink,
              color: hoveredLink === 'eval' ? '#4f46e5' : '#475569',
              borderBottom: hoveredLink === 'eval' ? '2px solid #4f46e5' : 'none',
            }}
            onMouseEnter={() => setHoveredLink('eval')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            ✅ Evaluator
          </a>
        </nav>

        {/* Auth Area */}
        <div style={navbarStyles.navAuth}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a 
                href="http://localhost:4173/profile.html"
                onClick={saveUserData}
                style={{
                  color: '#475569',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{
                  display: 'inline-block',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '15px',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                }}>
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </span>
                <span style={{ fontWeight: 500 }}>{getUserDisplayName()}</span>
              </a>
              <button
                onClick={() => {
                  logout()
                  window.location.href = 'http://localhost:4173/auth.html'
                }}
                style={navbarStyles.signOutBtn}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          style={navbarStyles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>
    </header>
  )
}

const navbarStyles = {
  header: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    height: '72px',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
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
    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
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
