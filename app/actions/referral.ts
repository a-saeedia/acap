'use server'

import { db } from '@/lib/db'
import { userProfile, referral, subscription, user } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, and, desc } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

const INVITE_MILESTONES = [
  { invites: 5, reward: 'یک هفته اشتراک رایگان', action: 'free_week' },
  { invites: 10, reward: 'یک ماه اشتراک رایگان', action: 'free_month' },
  { invites: 20, reward: 'دو ماه اشتراک رایگان', action: 'free_2months' },
  { invites: 50, reward: 'یک سال اشتراک رایگان ACAP Plus', action: 'free_year' },
]

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

  const sales = converted
  const getTier = (s: number) => {
    if (s <= 10) return { name: 'Partner', commission: 30, key: 'partner' }
    if (s <= 50) return { name: 'Silver Partner', commission: 35, key: 'silver' }
    if (s <= 200) return { name: 'Gold Partner', commission: 40, key: 'gold' }
    return { name: 'Ambassador', commission: 45, key: 'ambassador' }
  }

  const grantedMilestones = referrals.filter(r => r.rewardMilestone).map(r => r.rewardMilestone)
  const nextMilestone = INVITE_MILESTONES.find(m => !grantedMilestones.includes(m.action) && totalInvites >= m.invites)

  return {
    code,
    totalInvites,
    converted,
    pending: totalInvites - converted,
    tier: getTier(sales),
    referrals,
    nextMilestone: nextMilestone ?? null,
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

  const ref = await db.select().from(referral).where(eq(referral.id, referralId)).limit(1)
  if (ref.length === 0) throw new Error('Referral not found')

  await db.update(referral).set({ status: 'converted' }).where(eq(referral.id, referralId))

  const allReferrerRefs = await db.select().from(referral).where(
    and(eq(referral.referrerId, ref[0].referrerId), eq(referral.status, 'converted'))
  )
  const convertedCount = allReferrerRefs.length

  for (const m of INVITE_MILESTONES) {
    if (convertedCount === m.invites) {
      const existingSubs = await db.select().from(subscription).where(eq(subscription.userId, ref[0].referrerId)).limit(1)
      if (existingSubs.length > 0) {
        await db.update(subscription).set({ acapPlus: true }).where(eq(subscription.userId, ref[0].referrerId))
      }
      await db.update(referral).set({ rewardMilestone: m.action }).where(eq(referral.id, referralId))
      break
    }
  }
}

export async function getAllReferrals() {
  await requireAdmin()
  return db.select().from(referral).orderBy(desc(referral.createdAt))
}

export async function getReferralLeaderboard() {
  await requireAdmin()
  const profiles = await db.select({
    referralCode: userProfile.referralCode,
    userId: userProfile.userId,
  }).from(userProfile)

  const leaderboard: { userId: string; code: string; count: number }[] = []
  for (const p of profiles) {
    if (!p.referralCode) continue
    const refs = await db.select().from(referral).where(eq(referral.referrerId, p.userId))
    const converted = refs.filter(r => r.status === 'converted').length
    if (converted > 0) {
      leaderboard.push({ userId: p.userId, code: p.referralCode, count: converted })
    }
  }
  return leaderboard.sort((a, b) => b.count - a.count).slice(0, 20)
}
