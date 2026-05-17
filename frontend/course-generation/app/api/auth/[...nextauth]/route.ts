import { NextResponse } from 'next/server'

/** NextAuth is disabled — use MongoDB backend auth via AuthContext. */
export async function GET() {
  return NextResponse.json(
    {
      error: 'NextAuth is disabled for CareerSync',
      message: 'Use the Express API auth endpoints via NEXT_PUBLIC_API_URL',
    },
    { status: 410 }
  )
}

export async function POST() {
  return GET()
}
