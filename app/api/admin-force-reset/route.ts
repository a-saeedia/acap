import { db } from '@/lib/db'
import { user, verification } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from 'better-auth'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Login first, then call this' }, { status: 401 })
    }

    const { email } = await req.json()
    if (!email?.trim()) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    const [targetUser] = await db.select().from(user).where(eq(user.email, email.trim().toLowerCase())).limit(1)
    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const token = generateId(24)
    const expiresAt = new Date(Date.now() + 3600 * 1000)

    await db.insert(verification).values({
      id: generateId(24),
      identifier: `reset-password:${token}`,
      value: targetUser.id,
      expiresAt,
    })

    const baseUrl = process.env.BETTER_AUTH_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || 'a-cap.xyz'}`
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    return Response.json({
      success: true,
      reset_url: resetUrl,
      message: 'Open this URL in your browser to set a new password',
    })
  } catch (e) {
    console.error('admin-force-reset error:', e)
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
