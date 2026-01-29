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

  const handleModuleNav = (module: string) => {
    const routes: Record<string, string> = {
      'course': 'http://localhost:3000',
      'roadmap': 'http://localhost:5173',
      'skillEval': 'http://localhost:3001'
    };
    if (routes[module]) {
      window.location.href = routes[module];
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
            href="#"
            onClick={(e) => { e.preventDefault(); handleModuleNav('course'); }}
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
            href="#"
            onClick={(e) => { e.preventDefault(); handleModuleNav('roadmap'); }}
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
            href="#"
            onClick={(e) => { e.preventDefault(); handleModuleNav('skillEval'); }}
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
    zIndex: 100,
    height: '72px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #E2E8F0',
  } as React.CSSProperties,
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '100%',
  } as React.CSSProperties,
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#0F172A',
  } as React.CSSProperties,
  brandIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: '#4F46E5',
    display: 'grid',
    placeItems: 'center',
  } as React.CSSProperties,
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  } as React.CSSProperties,
  navLink: {
    textDecoration: 'none',
    color: '#475569',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'color 0.2s',
    cursor: 'pointer',
  } as React.CSSProperties,
  navAuth: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,
  signOutBtn: {
    backgroundColor: '#4F46E5',
    color: 'white',
    fontWeight: 500,
    fontSize: '0.875rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
}
