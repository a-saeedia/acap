'use server'

import { db } from '@/lib/db'
import { userProfile, quizResult, subscription } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function saveProfile(data: {
  phone: string
  age?: number
  investmentCapital?: number
}) {
  const userId = await getUserId()
  if (!data.phone || !/^0\d{10}$/.test(data.phone)) throw new Error('Invalid phone')
  const existing = await db.select().from(userProfile).where(eq(userProfile.userId, userId))
  const id = randomUUID()
  if (existing.length === 0) {
    await db.insert(userProfile).values({ id, userId, phone: data.phone, age: data.age, investmentCapital: data.investmentCapital })
  } else {
    await db.update(userProfile).set({ phone: data.phone, age: data.age, investmentCapital: data.investmentCapital, updatedAt: new Date() }).where(eq(userProfile.userId, userId))
  }
}

export async function getMyProfile() {
  const userId = await getUserId()
  const profiles = await db.select().from(userProfile).where(eq(userProfile.userId, userId))
  return profiles[0] ?? null
}

export async function getDashboardData() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return null
    const userId = session.user.id
    const [profiles, results, subs] = await Promise.all([
      db.select().from(userProfile).where(eq(userProfile.userId, userId)),
      db.select().from(quizResult).where(eq(quizResult.userId, userId)),
      db.select().from(subscription).where(eq(subscription.userId, userId)),
    ])
    return {
      user: session.user,
      profile: profiles[0] ?? null,
      quizResults: results,
      subscription: subs[0] ?? null,
    }
  } catch (e) { console.error('getDashboardData error:', e); return null }
}
