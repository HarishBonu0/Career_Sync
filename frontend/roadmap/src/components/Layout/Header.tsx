import { useState, useEffect } from 'react';

interface User {
  id?: string;
  email?: string;
  full_name?: string;
  username?: string;
}

interface HeaderProps {
  onConfigClick: () => void;
  showNewSimulation?: boolean;
  onNewSimulation?: () => void;
}

export default function Header({ onConfigClick, showNewSimulation, onNewSimulation }: HeaderProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    // Check auth every 2 seconds
    const interval = setInterval(checkAuthStatus, 2000);
    
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'careeros_user' || e.key === 'careeros_token') {
        checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkAuthStatus = () => {
    const user = localStorage.getItem('careeros_user');
    const token = localStorage.getItem('careeros_token');

    if (user && token) {
      try {
        setCurrentUser(JSON.parse(user));
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Invalid user data:', e);
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const logout = () => {
    localStorage.removeItem('careeros_user');
    localStorage.removeItem('careeros_token');
    localStorage.removeItem('careeros_auth');
    setIsAuthenticated(false);
    setCurrentUser(null);
    window.location.href = '/auth';
  };

  return (
    <header style={headerStyles.header}>
      <div style={headerStyles.container}>
        <a href="/" style={headerStyles.brand}>
          <div style={headerStyles.brandIcon}>C</div>
          <span>CareerOS</span>
        </a>

        <nav style={headerStyles.navLinks} className={mobileMenuOpen ? 'mobile-open' : ''}>
          <a 
            href="/course-generator"
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
            href="/roadmap"
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
            href="/evaluator"
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
            <a href="/auth" style={headerStyles.signInBtn}>
              Sign In
            </a>
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
  );
}

const headerStyles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    height: '72px',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
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
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  } as React.CSSProperties,
  brandIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '0.75rem',
    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
  } as React.CSSProperties,
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    flex: 1,
    justifyContent: 'center',
  } as React.CSSProperties,
  navLink: {
    textDecoration: 'none',
    color: '#475569',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'color 0.2s',
    cursor: 'pointer',
    padding: '8px 0',
  } as React.CSSProperties,
  navAuth: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,
  userInfo: {
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: 500,
  } as React.CSSProperties,
  signInBtn: {
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
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
  } as React.CSSProperties,
  signOutBtn: {
    backgroundColor: '#EF4444',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  mobileMenuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '8px',
    color: '#0F172A',
  } as React.CSSProperties,
}
