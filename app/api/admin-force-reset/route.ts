import { db } from '@/lib/db'
import { user, verification } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from 'better-auth'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  return handleReset(searchParams.get('email') || '')
}

export async function POST(req: Request) {
  const { email } = await req.json()
  return handleReset(email)
}

async function handleReset(email: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Login first, then call this' }, { status: 401 })
    }

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

    const html = `<html dir="rtl"><body style="background:#0D1B2A;color:#E4EAF5;font-family:Vazirmatn,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center;max-width:500px;padding:2rem"><h1 style="font-size:1.5rem;margin-bottom:1rem">✅ لینک بازیابی رمز ساخته شد</h1><p style="color:#6B8DB5;margin-bottom:1.5rem">روی دکمه زیر کلیک کن:</p><a href="${resetUrl}" style="display:inline-block;padding:0.75rem 2rem;background:#A51C30;color:white;border-radius:0.75rem;text-decoration:none;font-weight:bold;font-size:1.1rem">تنظیم رمز عبور جدید</a><p style="margin-top:1rem;font-size:0.8rem;color:#6B8DB5">این لینک تا ۱ ساعت معتبر است</p></div></body></html>`
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  } catch (e) {
    console.error('admin-force-reset error:', e)
    const errHtml = `<html dir="rtl"><body style="background:#0D1B2A;color:#E4EAF5;font-family:Vazirmatn,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center;max-width:500px;padding:2rem"><h1 style="font-size:1.5rem;color:#EF4444;margin-bottom:1rem">خطا</h1><p style="color:#6B8DB5">ابتدا در سایت لاگین کنید، سپس دوباره این لینک را باز کنید</p></div></body></html>`
    return new Response(errHtml, { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }
}
