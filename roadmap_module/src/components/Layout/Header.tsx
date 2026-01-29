import styles from './Header.module.css';

interface HeaderProps {
  onConfigClick: () => void;
  showNewSimulation?: boolean;
  onNewSimulation?: () => void;
}

import { useState } from 'react';

interface HeaderProps {
  onConfigClick: () => void;
  showNewSimulation?: boolean;
  onNewSimulation?: () => void;
}

export default function Header({ onConfigClick, showNewSimulation, onNewSimulation }: HeaderProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // Check auth state from localStorage (shared with landing page)
  const isAuthenticated = typeof window !== 'undefined' && 
    localStorage.getItem('careeros_user') !== null;

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('careeros_user');
      window.location.href = 'http://localhost:4173';
    }
  };

  return (
    <header style={headerStyles.header}>
      <div style={headerStyles.container}>
        <a href="http://localhost:4173" style={headerStyles.brand}>
          <div style={headerStyles.brandIcon}></div>
          CareerOS
        </a>

        <nav style={headerStyles.navLinks}>
          <a 
            href="http://localhost:3000"
            style={{
              ...headerStyles.navLink,
              color: hoveredLink === 'course' ? '#4f46e5' : '#374151',
            }}
            onMouseEnter={() => setHoveredLink('course')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Course Gen
          </a>
          <a 
            href="http://localhost:5173"
            style={{
              ...headerStyles.navLink,
              color: hoveredLink === 'roadmap' ? '#4f46e5' : '#374151',
            }}
            onMouseEnter={() => setHoveredLink('roadmap')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Roadmaps
          </a>
          <a 
            href="http://localhost:3001"
            style={{
              ...headerStyles.navLink,
              color: hoveredLink === 'eval' ? '#4f46e5' : '#374151',
            }}
            onMouseEnter={() => setHoveredLink('eval')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Evaluator
          </a>
        </nav>

        {/* Show Sign Out only when authenticated */}
        {isAuthenticated && (
          <div style={headerStyles.navAuth}>
            <button
              onClick={handleLogout}
              style={headerStyles.signOutBtn}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

const headerStyles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  } as React.CSSProperties,
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    height: '80px',
    gap: '2rem',
  } as React.CSSProperties,
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#111111',
    letterSpacing: '-0.5px',
    flexShrink: 0,
  } as React.CSSProperties,
  brandIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #10b981 100%)',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
  } as React.CSSProperties,
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    flex: 1,
  } as React.CSSProperties,
  navLink: {
    textDecoration: 'none',
    color: '#374151',
    fontWeight: 600,
    fontSize: '0.95rem',
    letterSpacing: '0.3px',
    transition: 'color 0.3s ease',
    cursor: 'pointer',
  } as React.CSSProperties,
  navAuth: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  } as React.CSSProperties,
  signOutBtn: {
    backgroundColor: '#111111',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.9rem',
    padding: '0.625rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,
}
