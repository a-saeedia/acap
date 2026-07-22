import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { email, secret } = await req.json()
    if (!email?.trim()) return Response.json({ error: 'Email is required' }, { status: 400 })
    if (!secret || secret !== process.env.ADMIN_SETUP_SECRET) {
      return Response.json({ error: 'Invalid setup secret' }, { status: 403 })
    }
    if (session.user.email?.toLowerCase() !== email.trim().toLowerCase()) {
      return Response.json({ error: 'You can only promote your own account' }, { status: 403 })
    }

    const existingAdmins = await db.select().from(user).where(eq(user.role, 'admin'))
    if (existingAdmins.length > 0) {
      return Response.json({ error: 'An admin already exists. Ask the current admin to promote you.' }, { status: 403 })
    }

    const users = await db.select().from(user).where(eq(user.email, email.trim().toLowerCase())).limit(1)
    if (users.length === 0) {
      return Response.json({ error: 'No user found with this email' }, { status: 404 })
    }

    await db.update(user).set({ role: 'admin' }).where(eq(user.id, users[0].id))
    return Response.json({ success: true, message: `${email} is now admin` })
  } catch (e) {
    console.error('admin-setup error:', e)
    return Response.json({ error: 'Setup failed' }, { status: 500 })
  }
}
