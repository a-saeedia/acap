'use server'

import { db } from '@/lib/db'
import { quizResult, userProfile } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

export async function saveQuizResult(data: {
  name: string
  phone: string
  score: number
  investorType: string
  answers: Record<string, number>
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const userId = session?.user?.id ?? null

    const id = randomUUID()
    await db.insert(quizResult).values({
      id,
      userId,
      name: data.name,
      phone: data.phone,
      score: data.score,
      investorType: data.investorType,
      answers: data.answers,
    })

    if (userId && data.phone) {
      const existing = await db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1)
      if (existing.length === 0) {
        await db.insert(userProfile).values({
          id: randomUUID(),
          userId,
          phone: data.phone,
        })
      } else {
        await db.update(userProfile).set({ phone: data.phone }).where(eq(userProfile.userId, userId))
      }
    }

    return { id }
  } catch (e) {
    console.error('saveQuizResult error:', e)
    return { id: '' }
  }
}

export async function getMyQuizResults() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return []
    return await db.select().from(quizResult).where(eq(quizResult.userId, session.user.id))
  } catch (e) { console.error('getMyQuizResults error:', e); return [] }
}
