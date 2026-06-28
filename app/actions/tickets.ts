'use server'

import { db } from '@/lib/db'
import { ticket, ticketMessage } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, desc } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

export async function createTicket(subject: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const id = randomUUID()
  await db.insert(ticket).values({ id, userId: session.user.id, subject })
  return id
}

export async function getUserTickets() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return []
  return db.select().from(ticket).where(eq(ticket.userId, session.user.id)).orderBy(desc(ticket.createdAt))
}

export async function getTicketMessages(ticketId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const t = await db.select().from(ticket).where(eq(ticket.id, ticketId)).limit(1)
  if (t[0]?.userId !== session.user.id) throw new Error('Forbidden')
  return db.select().from(ticketMessage).where(eq(ticketMessage.ticketId, ticketId)).orderBy(ticketMessage.createdAt)
}

export async function addMessage(ticketId: string, message: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const t = await db.select().from(ticket).where(eq(ticket.id, ticketId)).limit(1)
  if (t[0]?.userId !== session.user.id) throw new Error('Forbidden')
  await db.insert(ticketMessage).values({
    id: randomUUID(),
    ticketId,
    userId: session.user.id,
    message,
  })
}
