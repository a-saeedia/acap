import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return Response.json({ error: 'Unauthorized — must be logged in' }, { status: 401 })

    const { email } = await req.json()
    if (!email?.trim()) return Response.json({ error: 'Email is required' }, { status: 400 })
    if (session.user.email?.toLowerCase() !== email.trim().toLowerCase()) {
      return Response.json({ error: 'You can only promote your own account' }, { status: 403 })
    }

    const existingAdmins = await db.select({ count: sql<number>`count(*)` }).from(user).where(eq(user.role, 'admin'))
    if (Number(existingAdmins[0]?.count) > 0) {
      return Response.json({ error: 'An admin already exists. Only one-time setup is allowed.' }, { status: 403 })
    }

    const users = await db.select().from(user).where(eq(user.email, email.trim().toLowerCase())).limit(1)
    if (users.length === 0) {
      return Response.json({ error: 'No user found with this email. Register first.' }, { status: 404 })
    }

    await db.update(user).set({ role: 'admin' }).where(eq(user.id, users[0].id))
    return Response.json({ success: true, message: `${email} is now admin` })
  } catch (e) {
    console.error('admin-setup error:', e)
    return Response.json({ error: 'Setup failed' }, { status: 500 })
  }
}
