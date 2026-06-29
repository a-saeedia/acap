'use server'

import { db } from '@/lib/db'
import { user, userProfile, subscription, suggestion, quizResult, ticket, ticketMessage, asset } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, desc } from 'drizzle-orm'
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

export async function sendSuggestion(userId: string, title: string, content: string, profitPercent?: number, profitMessage?: string) {
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
