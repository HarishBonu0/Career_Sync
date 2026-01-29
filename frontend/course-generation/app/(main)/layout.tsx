'use client'

import Navbar from '@/components/layout/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar />
        <main>{children}</main>
      </div>
    </AuthProvider>
  )
}
