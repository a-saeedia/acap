import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return Response.json({ admin: false })
    const users = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
    return Response.json({ admin: users[0]?.role === 'admin' })
  } catch (e) {
    console.error('admin-check error:', e)
    return Response.json({ admin: false })
  }
}
