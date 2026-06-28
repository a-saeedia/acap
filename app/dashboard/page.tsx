import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { suggestion } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getDashboardData } from '@/app/actions/profile'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/')

  const [data, suggestions] = await Promise.all([
    getDashboardData(),
    db.select().from(suggestion).where(eq(suggestion.userId, session.user.id)).orderBy(desc(suggestion.createdAt)),
  ])
  if (!data) redirect('/')

  return <DashboardClient data={{ ...data, suggestions }} />
}
