import { db } from '@/lib/db'
import { user, userProfile, quizResult, subscription } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const users = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  if (users[0]?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const allUsers = await db.select().from(user).orderBy(desc(user.createdAt))
  const profiles = await db.select().from(userProfile)
  const results = await db.select().from(quizResult)
  const subs = await db.select().from(subscription)

  const profileMap = Object.fromEntries(profiles.map(p => [p.userId, p]))
  const subMap = Object.fromEntries(subs.map(s => [s.userId, s]))
  const resultsMap: Record<string, typeof results> = {}
  for (const r of results) {
    if (r.userId) (resultsMap[r.userId] ??= []).push(r)
  }

  const TYPE_LABELS: Record<string, string> = {
    conservative: 'محافظه‌کار',
    balanced: 'متعادل',
    growth: 'رشدگرا',
    aggressive: 'تهاجمی',
  }

  const rows = [['نام', 'ایمیل', 'موبایل', 'سن', 'A|CAP+', 'تاریخ ثبت‌نام', 'امتیاز تست', 'نوع سرمایه‌گذاری', 'تاریخ تست'].join(',')]

  for (const u of allUsers) {
    const p = profileMap[u.id]
    const s = subMap[u.id]
    const rs = resultsMap[u.id] || []
    const phone = p?.phone || rs.find(r => r.phone)?.phone || ''

    if (rs.length === 0) {
      rows.push([
        `"${u.name}"`,
        `"${u.email}"`,
        `"${phone}"`,
        p?.age ?? '',
        s?.acapPlus ? 'بله' : 'خیر',
        new Date(u.createdAt).toLocaleDateString('fa-IR'),
        '', '', '',
      ].join(','))
    } else {
      for (const r of rs) {
        rows.push([
          `"${u.name}"`,
          `"${u.email}"`,
          `"${phone}"`,
          p?.age ?? '',
          s?.acapPlus ? 'بله' : 'خیر',
          new Date(u.createdAt).toLocaleDateString('fa-IR'),
          r.score,
          `"${TYPE_LABELS[r.investorType] || r.investorType}"`,
          new Date(r.createdAt).toLocaleDateString('fa-IR'),
        ].join(','))
      }
    }
  }

  return new Response('\uFEFF' + rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="acap-users.csv"',
    },
  })
}
