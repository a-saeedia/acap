'use server'

import { db } from '@/lib/db'
import { user, userProfile, subscription, suggestion, quizResult, ticket, ticketMessage, asset, course, article, enrollment, articleCategory, signal, acapRevenue } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, desc, sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

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

export async function sendSuggestion(userId: string, title: string, content: string, profitPercent?: number, profitMessage?: string, expiresAt?: string) {
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
export async function broadcastSuggestion(title: string, content: string, profitPercent?: number, profitMessage?: string, expiresAt?: string) {
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

// -------- Signals CRUD --------

export async function getSignals() {
  await requireAdmin()
  return db.select().from(signal).orderBy(desc(signal.publishedAt))
}

export async function createSignal(data: {
  type: string; symbol: string; title: string; description?: string
  action: string; investorType?: string; expectedProfit?: number
  priceAtPublish: number; expiresAt?: string
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
    priceAtPublish: data.priceAtPublish,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    publishedAt: new Date(),
  })
}

export async function updateSignal(id: string, data: {
  type?: string; symbol?: string; title?: string; description?: string
  action?: string; investorType?: string; expectedProfit?: number
  priceAtPublish?: number; expiresAt?: string | null
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
  if (data.priceAtPublish !== undefined) updateData.priceAtPublish = data.priceAtPublish
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null
  await db.update(signal).set(updateData).where(eq(signal.id, id))
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

// -------- Public revenue API (no admin required) --------

export async function getPublicAcapRevenue(months?: number) {
  let query = db.select().from(acapRevenue).orderBy(desc(acapRevenue.year), desc(acapRevenue.month))
  return query
}
