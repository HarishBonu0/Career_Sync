'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { AppShell } from '@/components/layout/AppShell'

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  )
}
