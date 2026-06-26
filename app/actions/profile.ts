'use server'

import { db } from '@/lib/db'
import { userProfile, quizResult } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

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
  const existing = await db.select().from(userProfile).where(eq(userProfile.userId, userId))
  const id = crypto.randomUUID()
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
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const userId = session.user.id
  const [profiles, results] = await Promise.all([
    db.select().from(userProfile).where(eq(userProfile.userId, userId)),
    db.select().from(quizResult).where(eq(quizResult.userId, userId)),
  ])
  return { user: session.user, profile: profiles[0] ?? null, quizResults: results }
}
