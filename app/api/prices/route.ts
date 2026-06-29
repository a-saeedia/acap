import { db } from '@/lib/db'
import { assetPrice, iranStock } from '@/lib/db/schema'
import { fetchAllPrices, calcStockPrice } from '@/lib/prices'
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
    } catch (e) { console.error(`price store error for ${symbol}:`, e) }
  }

  let stocks: { symbol: string; name: string; sector: string | null }[] = []
  try {
    stocks = await db.select({ symbol: iranStock.symbol, name: iranStock.name, sector: iranStock.sector }).from(iranStock)
  } catch (e) { console.error('fetch stocks error:', e) }

  const stockPrices: Record<string, { price: number; change: number }> = {}
  for (const stock of stocks) {
    const sp = calcStockPrice(stock.symbol)
    stockPrices[stock.symbol] = sp

    try {
      const existing = await db.select().from(assetPrice).where(eq(assetPrice.symbol, stock.symbol)).limit(1)
      if (existing.length === 0) {
        await db.insert(assetPrice).values({
          id: randomUUID(),
          type: 'iran-stock',
          symbol: stock.symbol,
          price: sp.price,
          currency: 'IRR',
          source: 'api',
        })
      } else {
        await db.update(assetPrice).set({ price: sp.price, updatedAt: new Date() }).where(eq(assetPrice.symbol, stock.symbol))
      }
    } catch (e) { console.error(`stock price store error for ${stock.symbol}:`, e) }
  }

  return Response.json({ prices, stockPrices })
}
