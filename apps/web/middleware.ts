import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_COOKIE = 'Career_Sync_token'

export function middleware(req: NextRequest) {
  // BYPASS_AUTH to let users test locally without DB
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' || process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  const queryToken = req.nextUrl.searchParams.get('token')
  const cookieToken = req.cookies.get(AUTH_COOKIE)?.value
  const hasToken = Boolean(cookieToken) || Boolean(queryToken)

  if (!hasToken) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  const res = NextResponse.next()
  if (queryToken && !cookieToken) {
    res.cookies.set(AUTH_COOKIE, queryToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: req.nextUrl.protocol === 'https:',
    })
  }

  return res
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
