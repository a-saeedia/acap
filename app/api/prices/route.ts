import { db } from '@/lib/db'
import { assetPrice, iranStock } from '@/lib/db/schema'
import { fetchAllPrices } from '@/lib/prices'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

const ALL_CRYPTO = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRX']

export async function GET() {
  const prices = await fetchAllPrices()

  for (const [symbol, data] of Object.entries(prices)) {
    const type = ALL_CRYPTO.includes(symbol)
      ? 'crypto'
      : symbol.endsWith('-IRR') ? 'crypto' : 'other'

    try {
      const existing = await db.select().from(assetPrice).where(eq(assetPrice.symbol, symbol)).limit(1)
      if (existing.length === 0) {
        await db.insert(assetPrice).values({
          id: randomUUID(),
          type,
          symbol,
          price: data.price,
          currency: data.currency,
          source: 'api',
        })
      } else {
        await db.update(assetPrice).set({ price: data.price, updatedAt: new Date() }).where(eq(assetPrice.symbol, symbol))
      }
    } catch {}
  }

  try {
    const stocks = await db.select().from(iranStock)
    for (const stock of stocks) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/iran-stocks/price?symbol=${encodeURIComponent(stock.symbol)}`, { next: { revalidate: 120 } })
        if (res.ok) {
          const data = await res.json()
          const existing = await db.select().from(assetPrice).where(eq(assetPrice.symbol, stock.symbol)).limit(1)
          if (existing.length === 0) {
            await db.insert(assetPrice).values({
              id: randomUUID(),
              type: 'iran-stock',
              symbol: stock.symbol,
              price: data.price,
              currency: 'IRR',
              source: 'api',
            })
          } else {
            await db.update(assetPrice).set({ price: data.price, updatedAt: new Date() }).where(eq(assetPrice.symbol, stock.symbol))
          }
        }
      } catch {}
    }
  } catch {}

  return Response.json(prices)
}
