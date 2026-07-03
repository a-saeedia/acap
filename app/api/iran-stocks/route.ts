import { db } from '@/lib/db'
import { iranStock } from '@/lib/db/schema'
import { DEFAULT_STOCKS } from '@/lib/prices'
import { ilike, or } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  try {
    const existing = await db.select().from(iranStock).limit(1)
    if (existing.length === 0) {
      await db.insert(iranStock).values(
        DEFAULT_STOCKS.map(s => ({ id: randomUUID(), ...s }))
      ).onConflictDoNothing()
    }
  } catch {}

  try {
    let stocks
    if (search) {
      stocks = await db.select()
        .from(iranStock)
        .where(or(ilike(iranStock.symbol, `%${search}%`), ilike(iranStock.name, `%${search}%`)))
    } else {
      stocks = await db.select().from(iranStock)
    }
    return Response.json(stocks.length ? stocks : DEFAULT_STOCKS)
  } catch (e) {
    console.error('search iran_stocks error:', e)
    if (search) {
      const q = search
      return Response.json(DEFAULT_STOCKS.filter(s => s.symbol.includes(q) || s.name.includes(q)))
    }
    return Response.json(DEFAULT_STOCKS)
  }
}
