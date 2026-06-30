'use server'

import { db } from '@/lib/db'
import { asset, assetPrice } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, desc, and } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createAsset(data: {
  type: string
  symbol: string
  label: string
  quantity: number
  purchasePrice?: number
  purchaseDate?: string
  notes?: string
}) {
  const userId = await getUserId()
  const sym = data.symbol.toUpperCase()
  const [existing] = await db.select().from(asset).where(and(eq(asset.userId, userId), eq(asset.type, data.type), eq(asset.symbol, sym))).limit(1)
  if (existing) {
    await db.update(asset).set({
      quantity: existing.quantity + data.quantity,
      purchasePrice: data.purchasePrice ?? existing.purchasePrice,
      updatedAt: new Date(),
    }).where(eq(asset.id, existing.id))
    return existing.id
  }
  const id = randomUUID()
  await db.insert(asset).values({
    id,
    userId,
    type: data.type,
    symbol: sym,
    label: data.label,
    quantity: data.quantity,
    purchasePrice: data.purchasePrice ?? null,
    purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
    notes: data.notes,
  })
  return id
}

export async function updateAsset(id: string, data: {
  type?: string
  symbol?: string
  label?: string
  quantity?: number
  purchasePrice?: number
  purchaseDate?: string
  notes?: string
}) {
  const userId = await getUserId()
  const [existing] = await db.select().from(asset).where(and(eq(asset.id, id), eq(asset.userId, userId))).limit(1)
  if (!existing) throw new Error('Not found')

  await db.update(asset).set({
    ...(data.type && { type: data.type }),
    ...(data.symbol && { symbol: data.symbol.toUpperCase() }),
    ...(data.label && { label: data.label }),
    ...(data.quantity !== undefined && { quantity: data.quantity }),
    ...(data.purchasePrice !== undefined && { purchasePrice: data.purchasePrice }),
    ...(data.purchaseDate && { purchaseDate: new Date(data.purchaseDate) }),
    ...(data.notes !== undefined && { notes: data.notes }),
    updatedAt: new Date(),
  }).where(eq(asset.id, id))
}

export async function deleteAsset(id: string) {
  const userId = await getUserId()
  await db.delete(asset).where(and(eq(asset.id, id), eq(asset.userId, userId)))
}

export async function getMyAssets() {
  const userId = await getUserId()
  return db.select().from(asset).where(eq(asset.userId, userId)).orderBy(desc(asset.createdAt))
}

export async function getAssetPrices() {
  const prices = await db.select().from(assetPrice).orderBy(desc(assetPrice.updatedAt))
  const map: Record<string, { price: number; currency: string }> = {}
  for (const p of prices) {
    const key = `${p.type}:${p.symbol}`
    if (!map[key]) map[key] = { price: p.price, currency: p.currency }
  }
  return map
}
