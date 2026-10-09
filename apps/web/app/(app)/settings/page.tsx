'use client'

import Link from 'next/link'
import { KeyRound, LogOut, User, Shield, Bell, Settings2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const { user, logout } = useAuth()

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-10 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-lg text-muted-foreground">Manage your account preferences and security.</p>
      </div>

      <div className="grid gap-6">
        {/* Account Settings */}
        <div className="rounded-3xl border border-border/60 bg-card/40 overflow-hidden shadow-sm">
          <div className="border-b border-border/50 bg-muted/20 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Account Profile</h2>
                <p className="text-sm text-muted-foreground">Information shown on your public profile.</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Row label="Full Name" value={user?.name || '—'} />
            <Separator className="bg-border/50" />
            <Row label="Email Address" value={user?.email || '—'} />
            {user?.role && (
              <>
                <Separator className="bg-border/50" />
                <Row label="Account Role" value={user.role} />
              </>
            )}
            <div className="pt-4 flex justify-end">
              <Button variant="secondary" className="rounded-full shadow-sm px-6">Edit Profile</Button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-3xl border border-border/60 bg-card/40 overflow-hidden shadow-sm">
          <div className="border-b border-border/50 bg-muted/20 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Security & Authentication</h2>
                <p className="text-sm text-muted-foreground">Manage your password and security keys.</p>
              </div>
            </div>
          </div>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-medium">Password</h3>
              <p className="text-sm text-muted-foreground">Reset your password via a secure code.</p>
            </div>
            <Button asChild variant="outline" className="rounded-full shrink-0">
              <Link href="/forgot-password">
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </Link>
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 overflow-hidden shadow-sm mt-8">
          <div className="border-b border-destructive/10 bg-destructive/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/20 text-destructive">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-destructive">Sign Out</h2>
                <p className="text-sm text-destructive/80">End your current session securely.</p>
              </div>
            </div>
          </div>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-destructive/80 max-w-sm">
              Signing out will clear your local session data and return you to the marketing site.
            </p>
            <Button variant="destructive" className="rounded-full shrink-0 px-8" onClick={() => logout()}>
              Sign Out Now
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-muted-foreground font-medium text-sm">{label}</span>
      <span className="truncate text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
