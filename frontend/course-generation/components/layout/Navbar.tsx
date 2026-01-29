'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [signInHovered, setSignInHovered] = useState(false)

  const handleModuleNav = (module: string) => {
    const routes: Record<string, string> = {
      'course': 'http://localhost:3000',
      'roadmap': 'http://localhost:5173',
      'skillEval': 'http://localhost:3001'
    }
    if (routes[module]) {
      window.location.href = routes[module]
    }
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
            href="http://localhost:3005"
            onClick={(e) => handleNavClick(e, 3005)}
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
            href="#"
            onClick={(e) => { e.preventDefault(); handleModuleNav('roadmap'); }}
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
            href="#"
            onClick={(e) => { e.preventDefault(); handleModuleNav('skillEval'); }}
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
    zIndex: 100,
    height: '72px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #E2E8F0',
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
  },
  brandIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: '#4F46E5',
    display: 'grid',
    placeItems: 'center',
  },
  navLinks: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '32px',
  },
  navLink: {
    textDecoration: 'none',
    color: '#475569',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'color 0.2s',
    cursor: 'pointer',
  },
  navAuth: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '16px',
  },
  signInBtn: {
    textDecoration: 'none',
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center',
    color: 'white',
    fontWeight: 500,
    fontSize: '0.875rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap' as const,
  }
}
