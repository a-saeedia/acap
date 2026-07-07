'use server'

import { db } from '@/lib/db'
import { userProfile, referral, user, quizResult } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, and, desc, inArray, sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `ACAP-${code}`
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://a-cap.xyz'
}

async function getSessionOrNull() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session
  } catch { return null }
}

export async function ensureReferralCode(): Promise<string | null> {
  try {
    const session = await getSessionOrNull()
    if (!session?.user) return null
    const profiles = await db.select().from(userProfile).where(eq(userProfile.userId, session.user.id)).limit(1)
    const profile = profiles[0]
    if (!profile) return null
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
  } catch (e) { console.error('ensureReferralCode error:', e); return null }
}

export async function getMyReferralStats() {
  try {
    const session = await getSessionOrNull()
    if (!session?.user) return null
    const profiles = await db.select().from(userProfile).where(eq(userProfile.userId, session.user.id)).limit(1)
    const profile = profiles[0]
    if (!profile) return null

    let code = profile.referralCode
    if (!code) code = await ensureReferralCode()
    if (!code) return null

    const referralsList = await db.select().from(referral).where(eq(referral.referrerId, session.user.id)).orderBy(desc(referral.createdAt))
    const totalInvites = referralsList.length
    const converted = referralsList.filter(r => r.status === 'converted').length
    const active = referralsList.filter(r => r.status === 'active').length

    let quizCompleted = 0
    if (totalInvites > 0) {
      const referredIds = referralsList.map(r => r.referredId)
      const quizResultsData = await db.select({ userId: quizResult.userId }).from(quizResult).where(inArray(quizResult.userId, referredIds))
      const uniqueQuizTakers = new Set(quizResultsData.map(r => r.userId))
      quizCompleted = uniqueQuizTakers.size
    }

    const totalRewards = profile.totalRewards ?? 0
    const level = profile.referralLevel ?? 1
    const nextLevelThreshold = level * 5

    return {
      code,
      inviteLink: `${getBaseUrl()}?ref=${code}`,
      totalInvites,
      active,
      converted,
      quizCompleted,
      totalRewards,
      level,
      nextLevelThreshold,
      referrals: referralsList.map(r => ({
        id: r.id,
        email: r.email,
        name: r.name,
        phone: r.phone,
        status: r.status,
        rewardAmount: r.rewardAmount,
        convertedAt: r.convertedAt,
        createdAt: r.createdAt,
      })),
    }
  } catch (e) {
    console.error('getMyReferralStats error:', e)
    return null
  }
}

export async function getReferralLeaderboard(limit = 10) {
  try {
    const rows = await db.select({
      userId: userProfile.userId,
      referralCode: userProfile.referralCode,
      totalRewards: userProfile.totalRewards,
      referralLevel: userProfile.referralLevel,
      totalInvites: sql<number>`(SELECT COUNT(*) FROM ${referral} WHERE ${referral.referrerId} = ${userProfile.userId})`.as('totalInvites'),
    })
      .from(userProfile)
      .where(sql`${userProfile.referralCode} IS NOT NULL`)
      .orderBy(desc(sql`totalInvites`))
      .limit(limit)

    const userIds = rows.map(r => r.userId)
    const usersMap = userIds.length > 0
      ? Object.fromEntries((await db.select({ id: user.id, name: user.name, image: user.image }).from(user).where(inArray(user.id, userIds))).map(u => [u.id, u]))
      : {}

    return rows.map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      name: usersMap[r.userId]?.name || 'کاربر',
      image: usersMap[r.userId]?.image || null,
      code: r.referralCode,
      totalInvites: Number(r.totalInvites),
      totalRewards: r.totalRewards ?? 0,
      level: r.referralLevel ?? 1,
    }))
  } catch (e) { console.error('getReferralLeaderboard error:', e); return [] }
}

export async function applyReferralCode(refCode: string) {
  const session = await getSessionOrNull()
  if (!session?.user) throw new Error('لطفاً ابتدا وارد حساب خود شوید')

  const code = refCode.toUpperCase().trim()

  const referrerProfiles = await db.select().from(userProfile).where(eq(userProfile.referralCode, code)).limit(1)
  if (referrerProfiles.length === 0) throw new Error('کد معرف معتبر نیست')
  if (referrerProfiles[0].userId === session.user.id) throw new Error('نمی‌توانید کد معرف خود را وارد کنید')

  const myProfile = await db.select().from(userProfile).where(eq(userProfile.userId, session.user.id)).limit(1)
  if (myProfile.length > 0 && myProfile[0].referredBy) throw new Error('شما قبلاً توسط یک کد معرف ثبت‌نام کرده‌اید')

  const existing = await db.select().from(referral).where(
    and(eq(referral.referredId, session.user.id), eq(referral.referrerId, referrerProfiles[0].userId))
  ).limit(1)
  if (existing.length > 0) throw new Error('این معرفی قبلاً ثبت شده است')

  const currentUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)

  const id = randomUUID()
  await db.insert(referral).values({
    id,
    referrerId: referrerProfiles[0].userId,
    referredId: session.user.id,
    email: session.user.email ?? null,
    name: currentUser[0]?.name ?? session.user.name ?? null,
    phone: myProfile[0]?.phone ?? null,
    status: 'active',
  })

  await db.update(userProfile).set({ referredBy: code }).where(eq(userProfile.userId, session.user.id))

  // Increment referrer's reward level
  const referrerReferrals = await db.select({ count: sql<number>`COUNT(*)` }).from(referral).where(eq(referral.referrerId, referrerProfiles[0].userId))
  const totalCount = Number(referrerReferrals[0]?.count ?? 0)
  const newLevel = Math.floor(totalCount / 5) + 1
  await db.update(userProfile).set({ referralLevel: newLevel }).where(eq(userProfile.userId, referrerProfiles[0].userId))

  return true
}

export async function markReferralConverted(referralId: string, rewardAmount = 0) {
  try {
    const session = await getSessionOrNull()
    if (!session?.user) return false
    const users = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
    if (users[0]?.role !== 'admin') return false

    await db.update(referral).set({
      status: 'converted',
      rewardAmount,
      convertedAt: new Date(),
    }).where(eq(referral.id, referralId))

    // Update referrer's total rewards
    const ref = await db.select().from(referral).where(eq(referral.id, referralId)).limit(1)
    if (ref[0]) {
      await db.update(userProfile).set({
        totalRewards: sql`COALESCE(${userProfile.totalRewards}, 0) + ${rewardAmount}`,
      }).where(eq(userProfile.userId, ref[0].referrerId))
    }
    return true
  } catch (e) { console.error('markReferralConverted error:', e); return false }
}

export async function getAllReferrals() {
  try {
    const session = await getSessionOrNull()
    if (!session?.user) return []
    const users = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
    if (users[0]?.role !== 'admin') return []
    return db.select().from(referral).orderBy(desc(referral.createdAt))
  } catch { return [] }
}

export async function generateCodesForAllQuizTakers() {
  try {
    const session = await getSessionOrNull()
    if (!session?.user) return 0
    const users = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
    if (users[0]?.role !== 'admin') return 0

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
  } catch (e) { console.error('generateCodesForAllQuizTakers error:', e); return 0 }
}
