import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_COOKIE = 'Career_Sync_token'

export function middleware(req: NextRequest) {
  const hasToken = Boolean(req.cookies.get(AUTH_COOKIE)?.value)
  const allowUrlAuthBypass = process.env.ENABLE_URL_AUTH_BYPASS === 'true'

  // Optional local-dev bypass. Keep disabled by default.
  const urlHasAuthToken = allowUrlAuthBypass && Boolean(req.nextUrl.searchParams.get('auth_token'))

  if (!hasToken && !urlHasAuthToken) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/courses/:path*',
    '/roadmaps/:path*',
    '/assessments/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/home/:path*',
    '/my-courses/:path*',
    '/learning-journeys/:path*',
    '/course/:path*',
    '/course-generated/:path*',
    '/generate/:path*',
    '/educators/:path*',
    '/search/:path*',
    '/studio/:path*',
  ],
}
