import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { createResetToken } from '@/lib/reset-password'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return Response.json({ error: 'Email required' }, { status: 400 })

  const [found] = await db.select().from(user).where(eq(user.email, email)).limit(1)
  if (!found) return Response.json({ error: 'User not found' }, { status: 404 })

  const token = await createResetToken(email)
  const base = process.env.BETTER_AUTH_URL || 'http://localhost:3333'
  const url = `${base}/reset-password?token=${token}`

  return Response.json({ ok: true, url })
}
