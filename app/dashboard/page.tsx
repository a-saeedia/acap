import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getDashboardData } from '@/app/actions/profile'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/')

  const data = await getDashboardData()
  if (!data) redirect('/')

  return <DashboardClient data={data} />
}
