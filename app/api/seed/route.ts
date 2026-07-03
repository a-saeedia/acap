import { seedDatabase } from '@/lib/seed'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const users = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
    if (users[0]?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })
    const result = await seedDatabase()
    return Response.json({ success: true, ...result })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
