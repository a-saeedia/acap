'use server'

import { db } from '@/lib/db'
import { quizResult } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

export async function saveQuizResult(data: {
  name: string
  phone: string
  score: number
  investorType: string
  answers: Record<string, number>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id ?? null

  const id = crypto.randomUUID()
  await db.insert(quizResult).values({
    id,
    userId,
    name: data.name,
    phone: data.phone,
    score: data.score,
    investorType: data.investorType,
    answers: data.answers,
  })
  return { id }
}

export async function getMyQuizResults() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return []
  return db.select().from(quizResult).where(eq(quizResult.userId, session.user.id))
}
