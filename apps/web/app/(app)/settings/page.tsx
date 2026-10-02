'use client'

import Link from 'next/link'
import { KeyRound, LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const { user, logout } = useAuth()

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Account preferences and security.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Account</CardTitle>
          </div>
          <CardDescription>Profile fields shown on your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Name" value={user?.name || '—'} />
          <Separator />
          <Row label="Email" value={user?.email || '—'} />
          {user?.role && (
            <>
              <Separator />
              <Row label="Role" value={user.role} />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Security</CardTitle>
          </div>
          <CardDescription>Reset your password via a one-time code sent to your email.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/forgot-password">Change password</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Sign out</CardTitle>
          </div>
          <CardDescription>End this session and return to the marketing site.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => logout()}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  )
}
