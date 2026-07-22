'use server'

import { db } from '@/lib/db'
import { user, userProfile, subscription, suggestion, quizResult, ticket, ticketMessage, asset, course, article, enrollment, articleCategory, signal, acapRevenue, referral, userEvent, siteComment, account, session } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, desc, and, sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { toJalaali } from 'jalaali-js'

const DEFAULT_BASE_INVESTMENT = 50_000_000 // 50M تومان assumed base per signal

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const users = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  if (users[0]?.role !== 'admin') throw new Error('Forbidden')
  return session.user
}

export async function getUsers() {
  await requireAdmin()
  const users = await db.select().from(user).orderBy(desc(user.createdAt))
  const profiles = await db.select().from(userProfile)
  const subs = await db.select().from(subscription)
  const profileMap = Object.fromEntries(profiles.map(p => [p.userId, p]))
  const subMap = Object.fromEntries(subs.map(s => [s.userId, s]))
  return users.map(u => ({
    ...u,
    profile: profileMap[u.id] ?? null,
    subscription: subMap[u.id] ?? null,
  }))
}

export async function toggleAcapPlus(userId: string, enabled: boolean) {
  await requireAdmin()
  const existing = await db.select().from(subscription).where(eq(subscription.userId, userId))
  if (existing.length === 0) {
    await db.insert(subscription).values({
      id: randomUUID(),
      userId,
      acapPlus: enabled,
      acapPlusSince: enabled ? new Date() : null,
      acapPlusUntil: enabled ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
    })
  } else {
    await db.update(subscription).set({
      acapPlus: enabled,
      acapPlusSince: enabled ? existing[0].acapPlusSince ?? new Date() : null,
      acapPlusUntil: enabled ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
      updatedAt: new Date(),
    }).where(eq(subscription.userId, userId))
  }
}

function sanitize(str: string, maxLen = 2000) {
  return str.replace(/[<>]/g, '').trim().slice(0, maxLen)
}

export async function sendSuggestion(userId: string, title: string, content: string, profitPercent?: number, profitMessage?: string, expiresAt?: string, imageUrl?: string, audioUrl?: string) {
  const admin = await requireAdmin()
  if (!userId || !title || !content) throw new Error('All fields required')
  await db.insert(suggestion).values({
    id: randomUUID(),
    userId,
    adminId: admin.id,
    title: sanitize(title, 200),
    content: sanitize(content),
    profitPercent: profitPercent && profitPercent > 0 ? profitPercent : null,
    profitMessage: profitMessage ? sanitize(profitMessage, 500) : null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    imageUrl: imageUrl || null,
    audioUrl: audioUrl || null,
  })
}

export async function getUserSuggestions() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return db.select().from(suggestion).where(eq(suggestion.userId, session.user.id)).orderBy(desc(suggestion.createdAt))
}

export async function getUnreadSuggestionCount() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return 0
  const rows = await db.select().from(suggestion).where(eq(suggestion.userId, session.user.id))
  return rows.filter(s => !s.isRead).length
}

export async function markSuggestionRead(suggestionId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  await db.update(suggestion).set({ isRead: true, readAt: new Date() }).where(eq(suggestion.id, suggestionId))
}

export async function deleteSuggestion(suggestionId: string) {
  const admin = await requireAdmin()
  await db.delete(suggestion).where(eq(suggestion.id, suggestionId))
}

export async function getSentSuggestions(userId: string) {
  const admin = await requireAdmin()
  const rows = await db.select().from(suggestion).where(eq(suggestion.userId, userId)).orderBy(desc(suggestion.createdAt))
  return rows.map(s => ({
    ...s,
    isRead: s.isRead ?? false,
  }))
}

export async function getUserAssets(userId: string) {
  await requireAdmin()
  return db.select().from(asset).where(eq(asset.userId, userId)).orderBy(desc(asset.createdAt))
}

export async function toggleScanner(userId: string, active: boolean) {
  await requireAdmin()
  const existing = await db.select().from(subscription).where(eq(subscription.userId, userId))
  if (existing.length === 0) {
    await db.insert(subscription).values({
      id: randomUUID(),
      userId,
      scannerActive: active,
    })
  } else {
    await db.update(subscription).set({ scannerActive: active, updatedAt: new Date() }).where(eq(subscription.userId, userId))
  }
}

// --- A|CAP+ Request System ---

export async function requestAcapPlus(userId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  if (session.user.id !== userId) throw new Error('Forbidden')
  const existing = await db.select().from(subscription).where(eq(subscription.userId, userId))
  if (existing.length === 0) {
    await db.insert(subscription).values({
      id: randomUUID(),
      userId,
      requestedAt: new Date(),
    })
  } else {
    await db.update(subscription).set({ requestedAt: new Date(), updatedAt: new Date() }).where(eq(subscription.userId, userId))
  }
}

export async function approveAcapPlusRequest(userId: string, enabled: boolean, trialDays?: number) {
  await requireAdmin()
  const existing = await db.select().from(subscription).where(eq(subscription.userId, userId))
  if (existing.length === 0) {
    await db.insert(subscription).values({
      id: randomUUID(),
      userId,
      acapPlus: enabled,
      acapPlusSince: enabled ? new Date() : null,
      acapPlusUntil: enabled ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
      trialEndsAt: trialDays ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000) : null,
      requestedAt: null,
    })
  } else {
    await db.update(subscription).set({
      acapPlus: enabled,
      acapPlusSince: enabled ? existing[0].acapPlusSince ?? new Date() : null,
      acapPlusUntil: enabled ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
      trialEndsAt: trialDays ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000) : null,
      requestedAt: null,
      updatedAt: new Date(),
    }).where(eq(subscription.userId, userId))
  }
}

export async function getPendingAcapPlusRequests() {
  await requireAdmin()
  const users = await db.select().from(user).orderBy(desc(user.createdAt))
  const subs = await db.select().from(subscription)
  const subMap = Object.fromEntries(subs.map(s => [s.userId, s]))
  const profiles = await db.select().from(userProfile)
  const profileMap = Object.fromEntries(profiles.map(p => [p.userId, p]))
  return users
    .filter(u => {
      const s = subMap[u.id]
      return s?.requestedAt && !s.acapPlus
    })
    .map(u => ({
      ...u,
      profile: profileMap[u.id] ?? null,
      subscription: subMap[u.id] ?? null,
    }))
}

// Broadcast signal to all A|CAP+ users
export async function broadcastSuggestion(title: string, content: string, profitPercent?: number, profitMessage?: string, expiresAt?: string, imageUrl?: string, audioUrl?: string) {
  const admin = await requireAdmin()
  if (!title || !content) throw new Error('All fields required')
  const subs = await db.select().from(subscription).where(eq(subscription.acapPlus, true))
  for (const sub of subs) {
    await db.insert(suggestion).values({
      id: randomUUID(),
      userId: sub.userId,
      adminId: admin.id,
      title: sanitize(title, 200),
      content: sanitize(content),
      profitPercent: profitPercent && profitPercent > 0 ? profitPercent : null,
      profitMessage: profitMessage ? sanitize(profitMessage, 500) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      imageUrl: imageUrl || null,
      audioUrl: audioUrl || null,
    })
  }
  return subs.length
}

export async function getUserQuizResults(userId: string) {
  await requireAdmin()
  return db.select().from(quizResult).where(eq(quizResult.userId, userId)).orderBy(desc(quizResult.createdAt))
}

export async function getTickets() {
  await requireAdmin()
  return db.select().from(ticket).orderBy(desc(ticket.createdAt))
}

export async function getTicketMessages(ticketId: string) {
  await requireAdmin()
  return db.select().from(ticketMessage).where(eq(ticketMessage.ticketId, ticketId)).orderBy(ticketMessage.createdAt)
}

export async function replyToTicket(ticketId: string, message: string) {
  const admin = await requireAdmin()
  if (!ticketId || !message) throw new Error('All fields required')
  await db.insert(ticketMessage).values({
    id: randomUUID(),
    ticketId,
    userId: admin.id,
    message: sanitize(message),
  })
  await db.update(ticket).set({ updatedAt: new Date() }).where(eq(ticket.id, ticketId))
}

export async function closeTicket(ticketId: string) {
  await requireAdmin()
  await db.update(ticket).set({ status: 'closed', updatedAt: new Date() }).where(eq(ticket.id, ticketId))
}

export async function getAdminCourses() {
  await requireAdmin()
  const courses = await db.select().from(course).orderBy(desc(course.createdAt))
  const enrollCounts = await db.execute(sql`
    SELECT "courseId", COUNT(*)::int as count FROM enrollment GROUP BY "courseId"
  `)
  const enrollMap: Record<string, number> = {}
  for (const row of enrollCounts.rows as any[]) {
    enrollMap[row.courseId] = row.count
  }
  return courses.map(c => ({
    ...c,
    enrollmentCount: enrollMap[c.id] ?? 0,
  }))
}

export async function getAdminArticles() {
  await requireAdmin()
  const articles = await db.select().from(article).orderBy(desc(article.publishedAt))
  const cats = await db.select().from(articleCategory)
  const catMap = Object.fromEntries(cats.map(c => [c.id, c.name]))
  return articles.map(a => ({
    ...a,
    categoryName: a.categoryId ? (catMap[a.categoryId] ?? null) : null,
  }))
}

export async function getAdminEnrollments() {
  await requireAdmin()
  const enrollments = await db.select().from(enrollment).orderBy(desc(enrollment.startedAt))
  const users = await db.select({ id: user.id, name: user.name, email: user.email }).from(user)
  const courses = await db.select({ id: course.id, title: course.title }).from(course)
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))
  const courseMap = Object.fromEntries(courses.map(c => [c.id, c]))
  return enrollments.map(e => ({
    ...e,
    user: userMap[e.userId] ?? null,
    course: courseMap[e.courseId] ?? null,
  }))
}

// -------- Delete Ticket --------

export async function deleteTicket(ticketId: string) {
  await requireAdmin()
  await db.delete(ticketMessage).where(eq(ticketMessage.ticketId, ticketId))
  await db.delete(ticket).where(eq(ticket.id, ticketId))
}

// -------- Delete User (cascade all related data) --------

export async function deleteUser(userId: string) {
  await requireAdmin()
  await db.delete(session).where(eq(session.userId, userId))
  await db.delete(account).where(eq(account.userId, userId))

  const userTickets = await db.select({ id: ticket.id }).from(ticket).where(eq(ticket.userId, userId))
  for (const t of userTickets) {
    await db.delete(ticketMessage).where(eq(ticketMessage.ticketId, t.id))
  }
  await db.delete(ticket).where(eq(ticket.userId, userId))
  await db.delete(suggestion).where(eq(suggestion.userId, userId))
  await db.delete(asset).where(eq(asset.userId, userId))
  await db.delete(enrollment).where(eq(enrollment.userId, userId))
  await db.delete(userEvent).where(eq(userEvent.userId, userId))
  await db.delete(siteComment).where(eq(siteComment.userId, userId))
  await db.delete(quizResult).where(eq(quizResult.userId, userId))
  await db.delete(subscription).where(eq(subscription.userId, userId))
  await db.delete(userProfile).where(eq(userProfile.userId, userId))
  await db.delete(referral).where(eq(referral.referrerId, userId))
  await db.delete(referral).where(eq(referral.referredId, userId))
  await db.delete(user).where(eq(user.id, userId))
}

// -------- Signals CRUD --------

export async function getSignals() {
  await requireAdmin()
  return db.select().from(signal).orderBy(desc(signal.publishedAt))
}

export async function createSignal(data: {
  type: string; symbol: string; title: string; description?: string
  action: string; investorType?: string; expectedProfit?: number
  actualReturn?: number; priceAtPublish: number; priceNow?: number
  imageUrl?: string; audioUrl?: string
  expiresAt?: string; publishedAt?: string
}) {
  await requireAdmin()
  await db.insert(signal).values({
    id: randomUUID(),
    type: data.type,
    symbol: data.symbol,
    title: data.title,
    description: data.description || null,
    action: data.action,
    investorType: data.investorType || null,
    expectedProfit: data.expectedProfit || null,
    actualReturn: data.actualReturn || null,
    priceAtPublish: data.priceAtPublish,
    priceNow: data.priceNow || null,
    imageUrl: data.imageUrl || null,
    audioUrl: data.audioUrl || null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
  })
}

export async function updateSignal(id: string, data: {
  type?: string; symbol?: string; title?: string; description?: string
  action?: string; investorType?: string; expectedProfit?: number
  actualReturn?: number; priceAtPublish?: number; priceNow?: number
  imageUrl?: string | null; audioUrl?: string | null
  expiresAt?: string | null; publishedAt?: string | null
}) {
  await requireAdmin()
  const updateData: any = {}
  if (data.type !== undefined) updateData.type = data.type
  if (data.symbol !== undefined) updateData.symbol = data.symbol
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.action !== undefined) updateData.action = data.action
  if (data.investorType !== undefined) updateData.investorType = data.investorType
  if (data.expectedProfit !== undefined) updateData.expectedProfit = data.expectedProfit
  if (data.actualReturn !== undefined) updateData.actualReturn = data.actualReturn
  if (data.priceAtPublish !== undefined) updateData.priceAtPublish = data.priceAtPublish
  if (data.priceNow !== undefined) updateData.priceNow = data.priceNow
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl
  if (data.audioUrl !== undefined) updateData.audioUrl = data.audioUrl
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null
  if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null
  await db.update(signal).set(updateData).where(eq(signal.id, id))
}

export async function recalculateSignalReturn(id: string) {
  await requireAdmin()
  const sigs = await db.select().from(signal).where(eq(signal.id, id)).limit(1)
  const s = sigs[0]
  if (!s || !s.priceAtPublish) throw new Error('Signal not found or no price')

  let currentPrice = s.priceNow || s.priceAtPublish
  try {
    if (s.type === 'crypto') {
      const coinMap: Record<string, string> = { 'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple', 'ADA': 'cardano', 'DOGE': 'dogecoin', 'TRX': 'tron', 'BNB': 'bnb', 'USDT': 'tether', 'USDC': 'usd-coin' }
      const geckoId = coinMap[s.symbol.toUpperCase()]
      if (geckoId) {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`)
        const json = await res.json()
        if (json[geckoId]?.usd) currentPrice = json[geckoId].usd
      }
    }
  } catch {}

  const actualReturn = currentPrice > 0 && s.priceAtPublish > 0
    ? Math.round(((currentPrice - s.priceAtPublish) / s.priceAtPublish) * 10000) / 100
    : null

  await db.update(signal).set({ actualReturn, priceNow: currentPrice }).where(eq(signal.id, id))
  return { actualReturn, priceNow: currentPrice }
}

export async function recalculateAllSignals() {
  await requireAdmin()
  const { fetchAllPrices } = await import('@/lib/prices')
  const allPrices = await fetchAllPrices()
  const prices = allPrices.prices
  const stockPrices = allPrices.stockPrices

  const allSignals = await db.select().from(signal)
  let updated = 0

  for (const s of allSignals) {
    let currentPrice: number | null = null
    const sym = s.symbol.toUpperCase()

    // Try to get current price based on type
    if (s.type === 'crypto') {
      // Try IRR price first (more useful for Persian users), then USD
      const irrKey = `${sym}-IRR`
      if (prices[irrKey]?.price) currentPrice = prices[irrKey].price
      else if (prices[sym]?.price) currentPrice = prices[sym].price
      // Also check CoinGecko as fallback
      if (!currentPrice) {
        try {
          const coinMap: Record<string, string> = { 'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple', 'ADA': 'cardano', 'DOGE': 'dogecoin', 'TRX': 'tron', 'BNB': 'bnb' }
          const geckoId = coinMap[sym]
          if (geckoId) {
            const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`)
            const json = await res.json()
            if (json[geckoId]?.usd) currentPrice = json[geckoId].usd
          }
        } catch {}
      }
    } else if (s.type === 'stock') {
      if (stockPrices?.[s.symbol]?.price) currentPrice = stockPrices[s.symbol].price
      else if (prices[s.symbol]?.price) currentPrice = prices[s.symbol].price
    } else if (s.type === 'gold') {
      if (prices[s.symbol]?.price) currentPrice = prices[s.symbol].price
      else if (prices['GOLD18']?.price) currentPrice = prices['GOLD18'].price
    } else if (s.type === 'dollar') {
      if (prices['USD-IRR']?.price) currentPrice = prices['USD-IRR'].price
    } else if (s.type === 'forex') {
      if (prices[s.symbol]?.price) currentPrice = prices[s.symbol].price
      else if (prices['EUR-IRR']?.price) currentPrice = prices['EUR-IRR'].price
    }

    if (currentPrice && currentPrice > 0 && s.priceAtPublish > 0) {
      const actualReturn = Math.round(((currentPrice - s.priceAtPublish) / s.priceAtPublish) * 10000) / 100
      await db.update(signal).set({ actualReturn, priceNow: currentPrice }).where(eq(signal.id, s.id))
      updated++
    }
  }

  return { updated, total: allSignals.length }
}

export async function deleteSignal(id: string) {
  await requireAdmin()
  await db.delete(signal).where(eq(signal.id, id))
}

// -------- ACAP Revenue CRUD --------

export async function getAcapRevenue() {
  await requireAdmin()
  return db.select().from(acapRevenue).orderBy(desc(acapRevenue.year), desc(acapRevenue.month))
}

export async function addAcapRevenue(amount: number, month: number, year: number, description?: string) {
  await requireAdmin()
  await db.insert(acapRevenue).values({
    id: randomUUID(),
    amount,
    month,
    year,
    description: description || null,
  })
}

export async function updateAcapRevenue(id: string, amount: number, description?: string, month?: number, year?: number) {
  await requireAdmin()
  const updateData: any = {}
  if (amount !== undefined) updateData.amount = amount
  if (description !== undefined) updateData.description = description
  if (month !== undefined) updateData.month = month
  if (year !== undefined) updateData.year = year
  await db.update(acapRevenue).set(updateData).where(eq(acapRevenue.id, id))
}

export async function deleteAcapRevenue(id: string) {
  await requireAdmin()
  await db.delete(acapRevenue).where(eq(acapRevenue.id, id))
}

// -------- Populate revenue from signals --------

export async function populateRevenueFromSignals() {
  await requireAdmin()
  const signalData = await db.select().from(signal)
  const monthlyRevenue: Record<string, { amount: number; count: number }> = {}

  for (const s of signalData) {
    const profit = s.actualReturn
    if (!profit || profit <= 0) continue
    const d = s.publishedAt ? new Date(s.publishedAt) : new Date()
    const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
    const key = `${j.jy}-${String(j.jm).padStart(2, '0')}`
    if (!monthlyRevenue[key]) monthlyRevenue[key] = { amount: 0, count: 0 }
    monthlyRevenue[key].amount += profit
    monthlyRevenue[key].count++
  }

  let inserted = 0
  for (const [key, data] of Object.entries(monthlyRevenue)) {
    const [year, month] = key.split('-').map(Number)
    const existing = await db.select().from(acapRevenue)
      .where(and(eq(acapRevenue.year, year), eq(acapRevenue.month, month)))
      .limit(1)

    const avgReturn = Math.round((data.amount / data.count) * 10) / 10 // average return %
    if (existing.length > 0) {
      await db.update(acapRevenue).set({ amount: avgReturn }).where(eq(acapRevenue.id, existing[0].id))
    } else {
      await db.insert(acapRevenue).values({
        id: randomUUID(),
        amount: avgReturn,
        month,
        year,
        description: `میانگین بازده ${data.count} سیگنال موفق`,
      })
    }
    inserted++
  }
  return { months: inserted, totalSignals: Object.keys(monthlyRevenue).length }
}

// -------- Populate signals with realistic data --------

const SIGNAL_TEMPLATES = [
  { type: 'crypto', symbol: 'BTC', baseTitle: 'بیت‌کوین', desc: 'خرید در محدوده حمایتی پس از اصلاح قیمت. سطح Fib 0.618 با حجم خرید خوب همراه شده. تارگت‌های بعدی به ترتیب:\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n🎯 هدف سوم: {target3}\n\n🛑 حد ضرر: {stoploss}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}\n⏳ افق سرمایه‌گذاری: {horizon}', action: 'buy' },
  { type: 'crypto', symbol: 'ETH', baseTitle: 'اتریوم', desc: 'اتریوم در کانال صعودی قرار دارد. خرید در محدوده حمایت با نسبت ریسک به بازده مناسب.\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n🛑 حد ضرر: {stoploss}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}', action: 'buy' },
  { type: 'gold', symbol: 'GOLD18', baseTitle: 'طلای ۱۸ عیار', desc: 'قیمت طلا پس از اصلاح به محدوده حمایتی رسیده. خرید در قیمت‌های فعلی با دید میان‌مدت.\n\n💰 محدوده ورود: {entry}\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان ACAP: {confidence}/10\n⚠️ ریسک: {risk}\n⏳ افق سرمایه‌گذاری: {horizon}', action: 'buy' },
  { type: 'gold', symbol: 'COIN', baseTitle: 'سکه امامی', desc: 'سکه پس از برخورد به حمایت اصلی، برگشته. خرید پله‌ای توصیه می‌شود.\n\n💰 محدوده ورود: {entry}\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n🎯 هدف سوم: {target3}\n\n📊 درجه اطمینان ACAP: {confidence}/10\n⚠️ ریسک: {risk}', action: 'buy' },
  { type: 'dollar', symbol: 'USD-IRR', baseTitle: 'دلار آمریکا', desc: 'دلار در محدوده حمایتی قرار گرفته. با توجه به تورم و نوسانات ارزی، خرید در این محدوده منطقی است.\n\n💰 محدوده ورود: {entry}\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n🛑 حد ضرر: {stoploss}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}', action: 'buy' },
  { type: 'forex', symbol: 'EUR-IRR', baseTitle: 'یورو', desc: 'یورو در برابر دلار در کف کانال قرار دارد. خرید با توجه به اختلاف نرخ بهره.\n\n💰 محدوده ورود: {entry}\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}' , action: 'buy' },
  { type: 'stock', symbol: 'فولاد', baseTitle: 'فولاد مبارکه', desc: 'فولاد با گزارش‌های مثبت فصلی همراه شده. نسبت P/E جذاب و رشد سودآوری.\n\n💰 محدوده ورود: {entry}\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n🎯 هدف سوم: {target3}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}\n⏳ افق سرمایه‌گذاری: {horizon}', action: 'buy' },
  { type: 'stock', symbol: 'فملی', baseTitle: 'ملی صنایع مس ایران', desc: 'فملی با رشد قیمت مس در بازار جهانی و افزایش فروش، پتانسیل صعود دارد.\n\n💰 محدوده ورود: {entry}\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}', action: 'buy' },
  { type: 'stock', symbol: 'خودرو', baseTitle: 'ایران خودرو', desc: 'خودرو با رشد تولید و گزارش مثبت همراه شده.\n\n💰 محدوده ورود: {entry}\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}', action: 'buy' },
  { type: 'stock', symbol: 'شپنا', baseTitle: 'پالایش نفت اصفهان', desc: 'شپنا با حاشیه سود مناسب در محدوده جذاب ارزشگذاری شده.\n\n💰 محدوده ورود: {entry}\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}', action: 'buy' },
  { type: 'crypto', symbol: 'BNB', baseTitle: 'بایننس کوین', desc: 'BNB با رشد اکوسیستم بایننس و سوزاندن سکه‌ها، پتانسیل صعود دارد.\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n🛑 حد ضرر: {stoploss}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}', action: 'buy' },
  { type: 'crypto', symbol: 'SOL', baseTitle: 'سولانا', desc: 'سولانا با رشد اکوسیستم دیفای و افزایش فعالیت شبکه، آماده صعود.\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}', action: 'buy' },
  { type: 'stock', symbol: 'وبملت', baseTitle: 'بانک ملت', desc: 'وبملت با رشد سودآوری و P/E پایین، گزینه مناسبی برای سرمایه‌گذاری.\n\n💰 محدوده ورود: {entry}\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}', action: 'buy' },
]

const RISKS = ['کم', 'متوسط', 'متوسط', 'متوسط', 'زیاد']
const HORIZONS = ['1 تا 3 ماه', '3 تا 6 ماه', '6 تا 12 ماه']

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function fillTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '—')
}

function priceWithCommas(n: number): string {
  return n.toLocaleString('fa-IR')
}

export async function populateSignals() {
  await requireAdmin()
  // Delete existing signals & revenue
  await db.delete(acapRevenue)
  await db.delete(signal)

  const created: string[] = []
  const now = new Date()

  for (const tpl of SIGNAL_TEMPLATES) {
    // Use realistic dummy prices (no API calls)
    const basePrices: Record<string, number> = {
      BTC: 7200000000, ETH: 480000000, SOL: 52000000, BNB: 240000000,
      GOLD18: 48000000, COIN: 620000000,
      'USD-IRR': 1850000, 'EUR-IRR': 2050000,
      فولاد: 45000, فملی: 32000, خودرو: 18000, شپنا: 25000, وبملت: 15000,
    }
    const currentPrice = basePrices[tpl.symbol] || 100000

    const entryPrice = currentPrice * (1 - randomBetween(0.02, 0.12))
    const actualReturn = Math.round(((currentPrice - entryPrice) / entryPrice) * 10000) / 100

    const target1 = currentPrice * (1 + randomBetween(0.03, 0.08))
    const target2 = target1 * (1 + randomBetween(0.03, 0.07))
    const target3 = target2 * (1 + randomBetween(0.02, 0.05))
    const stoploss = entryPrice * (1 - randomBetween(0.03, 0.08))

    const confidence = Math.floor(randomBetween(6.5, 9.5) * 10) / 10
    const risk = randomItem(RISKS)
    const horizon = randomItem(HORIZONS)

    const daysAgo = Math.floor(Math.random() * 90)
    const publishedAt = new Date(now.getTime() - daysAgo * 86400000 - Math.random() * 86400000)

    const description = fillTemplate(tpl.desc, {
      entry: priceWithCommas(entryPrice),
      target1: priceWithCommas(target1),
      target2: priceWithCommas(target2),
      target3: priceWithCommas(target3),
      stoploss: priceWithCommas(stoploss),
      confidence: confidence.toString(),
      risk,
      horizon,
    })

    await db.insert(signal).values({
      id: randomUUID(),
      type: tpl.type,
      symbol: tpl.symbol,
      title: `🟢 ${tpl.baseTitle}`,
      description,
      action: tpl.action,
      investorType: randomItem(['conservative', 'balanced', 'growth']),
      expectedProfit: Math.round(actualReturn * 1.3 * 10) / 10,
      actualReturn,
      priceAtPublish: Math.round(entryPrice),
      priceNow: Math.round(currentPrice),
      imageUrl: null,
      audioUrl: null,
      expiresAt: new Date(publishedAt.getTime() + 90 * 86400000),
      publishedAt,
    })

    created.push(tpl.symbol)
  }

  let revResult = { months: 0 }
  try {
    revResult = await populateRevenueFromSignals()
  } catch {}

  return { signals: created.length, revenueMonths: revResult.months }
}

export async function getPublicAcapRevenue(months?: number) {
  let query = db.select().from(acapRevenue).orderBy(desc(acapRevenue.year), desc(acapRevenue.month))
  return query
}
