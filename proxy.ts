import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getRateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1 }
  }
  if (entry.count >= max) {
    return { allowed: false, remaining: 0 }
  }
  entry.count++
  return { allowed: true, remaining: max - entry.count }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const isAuthRoute = pathname.startsWith('/api/auth/')
  const isApiRoute = pathname.startsWith('/api/')

  // Rate limiting: auth endpoints (10 req/min), other API (30 req/min)
  if (isAuthRoute) {
    const { allowed, remaining } = getRateLimit(`auth:${ip}`, 10, 60_000)
    if (!allowed) {
      return new NextResponse('Too Many Requests', { status: 429, headers: { 'Retry-After': '60' } })
    }
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    return response
  }

  if (isApiRoute) {
    const { allowed, remaining } = getRateLimit(`api:${ip}`, 30, 60_000)
    if (!allowed) {
      return new NextResponse('Too Many Requests', { status: 429, headers: { 'Retry-After': '60' } })
    }
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    return response
  }

  // Security headers for all responses
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-XSS-Protection', '0')

  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
