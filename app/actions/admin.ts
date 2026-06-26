'use server'

import { db } from '@/lib/db'
import { user, userProfile, subscription, suggestion, quizResult, ticket, ticketMessage } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, desc } from 'drizzle-orm'

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
      id: crypto.randomUUID(),
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

export async function sendSuggestion(userId: string, title: string, content: string) {
  await requireAdmin()
  await db.insert(suggestion).values({
    id: crypto.randomUUID(),
    userId,
    title,
    content,
  })
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
  await db.insert(ticketMessage).values({
    id: crypto.randomUUID(),
    ticketId,
    userId: admin.id,
    message,
  })
  await db.update(ticket).set({ updatedAt: new Date() }).where(eq(ticket.id, ticketId))
}

export async function closeTicket(ticketId: string) {
  await requireAdmin()
  await db.update(ticket).set({ status: 'closed', updatedAt: new Date() }).where(eq(ticket.id, ticketId))
}

export async function getSuggestions(userId: string) {
  return db.select().from(suggestion).where(eq(suggestion.userId, userId)).orderBy(desc(suggestion.createdAt))
}
