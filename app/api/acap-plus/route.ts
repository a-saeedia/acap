import { db } from '@/lib/db'
import { subscription, suggestion } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return Response.json({ isPlus: false, suggestions: [] })
    const sub = await db.select().from(subscription).where(eq(subscription.userId, session.user.id)).limit(1)
    const isPlus = sub[0]?.acapPlus ?? false
    const hasRequested = !!sub[0]?.requestedAt
    let suggestions: any[] = []
    if (isPlus) {
      try { suggestions = await db.select().from(suggestion).where(eq(suggestion.userId, session.user.id)) } catch (e) { console.error('fetch suggestions error:', e) }
    }
    return Response.json({ isPlus, suggestions, hasRequested })
  } catch (e) {
    console.error('acap-plus error:', e)
    return Response.json({ isPlus: false, suggestions: [] })
  }
}
