'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [signInHovered, setSignInHovered] = useState(false)

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, port: number) => {
    e.preventDefault()
    window.location.href = `http://localhost:${port}`
  }

  return (
    <header style={navbarStyles.header}>
      <div style={navbarStyles.container}>
        {/* Brand */}
        <a href="http://localhost:4173" style={navbarStyles.brand}>
          <div style={navbarStyles.brandIcon}></div>
          CareerOS
        </a>

        {/* Navigation Links */}
        <nav style={navbarStyles.navLinks}>
          <a 
            href="http://localhost:3000"
            onClick={(e) => handleNavClick(e, 3000)}
            style={{
              ...navbarStyles.navLink,
              color: hoveredLink === 'course' ? '#4f46e5' : '#374151',
            }}
            onMouseEnter={() => setHoveredLink('course')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Course Gen
          </a>
          <a 
            href="http://localhost:5173"
            onClick={(e) => handleNavClick(e, 5173)}
            style={{
              ...navbarStyles.navLink,
              color: hoveredLink === 'roadmap' ? '#4f46e5' : '#374151',
            }}
            onMouseEnter={() => setHoveredLink('roadmap')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Roadmaps
          </a>
          <a 
            href="http://localhost:3001"
            onClick={(e) => handleNavClick(e, 3001)}
            style={{
              ...navbarStyles.navLink,
              color: hoveredLink === 'eval' ? '#4f46e5' : '#374151',
            }}
            onMouseEnter={() => setHoveredLink('eval')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Evaluator
          </a>
        </nav>

        {/* Auth Area - Only show Sign Out button when logged in */}
        {isAuthenticated && (
          <div style={navbarStyles.navAuth}>
            <button
              onClick={logout}
              style={{
                ...navbarStyles.signInBtn,
                backgroundColor: signInHovered ? '#1a1a1a' : '#111111',
                boxShadow: signInHovered ? '0 8px 24px rgba(79, 70, 229, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={() => setSignInHovered(true)}
              onMouseLeave={() => setSignInHovered(false)}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

const navbarStyles = {
  header: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  container: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    height: '80px',
    gap: '2rem',
  },
  brand: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '0.75rem',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#111111',
    letterSpacing: '-0.5px',
    flexShrink: 0,
  },
  brandIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #10b981 100%)',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
  },
  navLinks: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '2rem',
    flex: 1,
  },
  navLink: {
    textDecoration: 'none',
    color: '#374151',
    fontWeight: 600,
    fontSize: '0.95rem',
    letterSpacing: '0.3px',
    transition: 'color 0.3s ease',
    cursor: 'pointer',
  },
  navAuth: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '1rem',
  },
  signInBtn: {
    textDecoration: 'none',
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.9rem',
    padding: '0.625rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap' as const,
  }
}
