import { db } from '@/lib/db'
import { assetPrice } from '@/lib/db/schema'
import { fetchAllPrices } from '@/lib/prices'
import { eq } from 'drizzle-orm'

export async function GET() {
  const prices = await fetchAllPrices()
  for (const [symbol, data] of Object.entries(prices)) {
    const type = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRX'].includes(symbol) ? 'crypto' : 'other'
    const existing = await db.select().from(assetPrice).where(eq(assetPrice.symbol, symbol)).limit(1)
    if (existing.length === 0) {
      await db.insert(assetPrice).values({
        id: crypto.randomUUID(),
        type,
        symbol,
        price: data.price,
        currency: data.currency,
        source: 'api',
      })
    } else {
      await db.update(assetPrice).set({ price: data.price, updatedAt: new Date() }).where(eq(assetPrice.symbol, symbol))
    }
  }
  return Response.json(prices)
}
