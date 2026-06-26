import { db } from '@/lib/db'
import { verification } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function createResetToken(email: string) {
  const token = crypto.randomUUID()
  await db.insert(verification).values({
    id: crypto.randomUUID(),
    identifier: email,
    value: token,
    expiresAt: new Date(Date.now() + 3600 * 1000),
  })
  return token
}

export async function consumeResetToken(token: string) {
  const [entry] = await db.select().from(verification).where(eq(verification.value, token)).limit(1)
  if (!entry || entry.expiresAt < new Date()) return null
  const email = entry.identifier
  await db.delete(verification).where(eq(verification.value, token))
  return email
}
