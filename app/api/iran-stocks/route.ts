import { db } from '@/lib/db'
import { iranStock } from '@/lib/db/schema'
import { DEFAULT_STOCKS } from '@/lib/prices'
import { ilike, or } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim()

  // Fast path: search local DB
  try {
    const stocks = search
      ? await db.select({ symbol: iranStock.symbol, name: iranStock.name, sector: iranStock.sector })
          .from(iranStock)
          .where(or(ilike(iranStock.symbol, `%${search}%`), ilike(iranStock.name, `%${search}%`)))
          .limit(50)
      : await db.select({ symbol: iranStock.symbol, name: iranStock.name, sector: iranStock.sector })
          .from(iranStock).limit(50)
    if (stocks.length) return Response.json(stocks)
  } catch {}

  // Fallback: filter hardcoded list (always fast, always works)
  if (search) {
    const q = search
    return Response.json(DEFAULT_STOCKS.filter(s => s.symbol.includes(q) || s.name.includes(q)))
  }
  return Response.json(DEFAULT_STOCKS.map(s => ({ symbol: s.symbol, name: s.name, sector: s.sector })))
}
