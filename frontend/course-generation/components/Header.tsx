'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = 'http://localhost:4173/auth.html'
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'

  return (
    <header className="sticky top-0 z-50 h-[72px] bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Brand */}
        <Link href="http://localhost:4173" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            C
          </div>
          <span className="text-xl font-semibold text-gray-900">CareerOS</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a 
            href="http://localhost:3002" 
            className="text-gray-700 font-medium text-sm hover:text-indigo-600 transition-colors pb-1 border-b-2 border-transparent hover:border-indigo-600 no-underline"
          >
            📚 Course Gen
          </a>
          <a 
            href="http://localhost:5173" 
            className="text-gray-700 font-medium text-sm hover:text-indigo-600 transition-colors pb-1 border-b-2 border-transparent hover:border-indigo-600 no-underline"
          >
            🗺️ Roadmaps
          </a>
          <a 
            href="http://localhost:3001" 
            className="text-gray-700 font-medium text-sm hover:text-indigo-600 transition-colors pb-1 border-b-2 border-transparent hover:border-indigo-600 no-underline"
          >
            ✅ Evaluator
          </a>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <a 
                href="http://localhost:4173/profile.html" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors no-underline"
              >
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-gray-700">{displayName}</span>
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all shadow-sm hover:shadow-md"
              >
                Sign Out
              </button>
            </>
          ) : (
            <a
              href="http://localhost:4173/auth.html"
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md no-underline"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
