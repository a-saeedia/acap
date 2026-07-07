'use server'

import { db } from '@/lib/db'
import { userProfile, referral, user, quizResult } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, and, desc, inArray, isNull } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `ACAP-${code}`
}

export async function ensureReferralCode(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const profiles = await db.select().from(userProfile).where(eq(userProfile.userId, session.user.id)).limit(1)
  const profile = profiles[0]
  if (!profile) throw new Error('Profile not found')
  if (profile.referralCode) return profile.referralCode
  let code = generateCode()
  let tries = 0
  while (tries < 10) {
    const existing = await db.select().from(userProfile).where(eq(userProfile.referralCode, code)).limit(1)
    if (existing.length === 0) break
    code = generateCode()
    tries++
  }
  await db.update(userProfile).set({ referralCode: code }).where(eq(userProfile.userId, session.user.id))
  return code
}

export async function getMyReferralStats() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const profiles = await db.select().from(userProfile).where(eq(userProfile.userId, session.user.id)).limit(1)
  const profile = profiles[0]
  if (!profile) throw new Error('Profile not found')

  let code = profile.referralCode
  if (!code) code = await ensureReferralCode()

  const referrals = await db.select().from(referral).where(eq(referral.referrerId, session.user.id)).orderBy(desc(referral.createdAt))
  const totalInvites = referrals.length
  const converted = referrals.filter(r => r.status === 'converted').length

  let quizCompleted = 0
  if (totalInvites > 0) {
    const referredIds = referrals.map(r => r.referredId)
    const quizResultsData = await db.select({ userId: quizResult.userId }).from(quizResult).where(inArray(quizResult.userId, referredIds))
    const uniqueQuizTakers = new Set(quizResultsData.map(r => r.userId))
    quizCompleted = uniqueQuizTakers.size
  }

  return {
    code,
    totalInvites,
    converted,
    quizCompleted,
    inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://a-cap.xyz'}?ref=${code}`,
  }
}

export async function applyReferralCode(refCode: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  const code = refCode.toUpperCase()

  const referrer = await db.select().from(userProfile).where(eq(userProfile.referralCode, code)).limit(1)
  if (referrer.length === 0) throw new Error('کد معرف معتبر نیست')
  if (referrer[0].userId === session.user.id) throw new Error('نمی‌توانید خودتان را معرفی کنید')

  const myProfile = await db.select().from(userProfile).where(eq(userProfile.userId, session.user.id)).limit(1)
  if (myProfile.length > 0 && myProfile[0].referredBy) throw new Error('شما قبلاً توسط کد معرف ثبت‌نام کرده‌اید')

  const existing = await db.select().from(referral).where(
    and(eq(referral.referredId, session.user.id), eq(referral.referrerId, referrer[0].userId))
  ).limit(1)
  if (existing.length > 0) throw new Error('این معرفی قبلاً ثبت شده است')

  const id = randomUUID()
  await db.insert(referral).values({
    id,
    referrerId: referrer[0].userId,
    referredId: session.user.id,
    email: session.user.email ?? null,
    status: 'active',
  })

  await db.update(userProfile).set({ referredBy: code }).where(eq(userProfile.userId, session.user.id))

  return true
}

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const users = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  if (users[0]?.role !== 'admin') throw new Error('Forbidden')
  return session.user.id
}

export async function markReferralConverted(referralId: string) {
  await requireAdmin()
  await db.update(referral).set({ status: 'converted' }).where(eq(referral.id, referralId))
}

export async function getAllReferrals() {
  await requireAdmin()
  return db.select().from(referral).orderBy(desc(referral.createdAt))
}

export async function generateCodesForAllQuizTakers() {
  await requireAdmin()
  const quizTakers = await db.select({ userId: quizResult.userId }).from(quizResult)
  const uniqueUserIds = [...new Set(quizTakers.map(q => q.userId).filter(Boolean) as string[])]

  let count = 0
  for (const userId of uniqueUserIds) {
    const profiles = await db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1)
    if (profiles.length === 0) continue
    if (profiles[0].referralCode) continue
    let code = generateCode()
    let tries = 0
    while (tries < 10) {
      const existing = await db.select().from(userProfile).where(eq(userProfile.referralCode, code)).limit(1)
      if (existing.length === 0) break
      code = generateCode()
      tries++
    }
    await db.update(userProfile).set({ referralCode: code }).where(eq(userProfile.userId, userId))
    count++
  }
  return count
}
