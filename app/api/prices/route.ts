import { pool } from '@/lib/db'
import { fetchAllPrices, DEFAULT_STOCKS, fetchTsetmcSearch } from '@/lib/prices'
import { randomUUID } from 'node:crypto'

let cache: { body: any; expiry: number } | null = null
let refreshPromise: Promise<void> | null = null

const DEFAULT_RESPONSE = {
  prices: {
    'USD-IRR': { price: 1850000, currency: 'IRR', change: 0 },
    'EUR-IRR': { price: 2000000, currency: 'IRR', change: 0 },
    'AED-IRR': { price: 504000, currency: 'IRR', change: 0 },
    'GOLD18': { price: 3500000, currency: 'IRR', change: 0 },
    'BTC': { price: 65000, currency: 'USD', change: 0 },
    'ETH': { price: 3400, currency: 'USD', change: 0 },
    'USDT': { price: 1, currency: 'USD', change: 0 },
  },
  irrRate: 1850000,
  stockPrices: {},
}

async function backgroundRefresh() {
  try {
    let insCodeMap: Record<string, string> = {}
    try {
      const r = await pool.query('SELECT symbol, "tsetmc_code" FROM iran_stock WHERE "tsetmc_code" IS NOT NULL')
      for (const row of r.rows) insCodeMap[row.symbol] = row.tsetmc_code
    } catch {}

    const { prices, irrRate, stockPrices } = await fetchAllPrices(insCodeMap)

    const now = new Date().toISOString()
    const allSymbols = [...new Set([...Object.keys(prices), ...Object.keys(stockPrices)])]

    let existing = new Set<string>()
    try {
      const r = await pool.query('SELECT DISTINCT symbol FROM asset_price')
      existing = new Set(r.rows.map((row: any) => row.symbol))
    } catch {}

    const insertSymbols = allSymbols.filter(s => !existing.has(s))
    if (insertSymbols.length > 0) {
      const placeholders = insertSymbols.map((_, i) => `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`).join(',')
      const params = insertSymbols.flatMap(sym => {
        const d = prices[sym] ?? stockPrices[sym]
        if (!d) return []
        const currency = 'currency' in d ? (d as any).currency ?? 'IRR' : 'IRR'
        return [randomUUID(), sym.startsWith('USD') || sym.startsWith('EUR') ? 'forex' : sym in prices ? 'crypto' : 'iran-stock', sym, d.price, currency, 'api', now]
      })
      if (params.length > 0) await pool.query(`INSERT INTO asset_price (id, type, symbol, price, currency, source, "updatedAt") VALUES ${placeholders} ON CONFLICT DO NOTHING`, params)
    }

    const updateSymbols = allSymbols.filter(s => existing.has(s))
    for (const sym of updateSymbols) {
      const d = prices[sym] ?? stockPrices[sym]
      if (d) await pool.query('UPDATE asset_price SET price = $1, "updatedAt" = NOW() WHERE symbol = $2', [d.price, sym])
    }

    const finalPrices: Record<string, { price: number; currency: string; change: number }> = {}
    for (const [sym, d] of Object.entries(prices)) {
      finalPrices[sym] = { price: d.price, currency: d.currency ?? 'IRR', change: (d as any).change ?? 0 }
    }
    for (const [sym, d] of Object.entries(stockPrices)) {
      finalPrices[sym] = { price: d.price, currency: 'IRR', change: (d as any).change ?? 0 }
    }
    if (Object.keys(finalPrices).length > 0) {
      cache = { body: { prices: finalPrices, irrRate, stockPrices }, expiry: Date.now() + 25000 }
    }
  } catch (e) { console.error('backgroundRefresh error:', e) }
}

async function fetchFromDb() {
  try {
    const r = await pool.query('SELECT DISTINCT ON (symbol) symbol, price, currency FROM asset_price ORDER BY symbol, "updatedAt" DESC')
    if (r.rows.length === 0) return null
    const prices: Record<string, { price: number; currency: string; change: number }> = {}
    for (const row of r.rows) {
      if (row.price > 0) prices[row.symbol] = { price: Number(row.price), currency: row.currency ?? 'IRR', change: 0 }
    }
    if (Object.keys(prices).length === 0) return null
    return { prices, irrRate: 620000, stockPrices: {} }
  } catch { return null }
}

export async function GET() {
  const now = Date.now()

  // Serve cache if fresh
  if (cache && now < cache.expiry) {
    return Response.json(cache.body, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60' },
    })
  }

  // Serve cache if stale + trigger background refresh
  if (cache) {
    if (!refreshPromise) {
      refreshPromise = backgroundRefresh().finally(() => { refreshPromise = null })
    }
    return Response.json(cache.body, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60' },
    })
  }

  // No cache - try DB then default, never block on external APIs
  const dbData = await fetchFromDb()
  if (dbData) {
    cache = { body: dbData, expiry: now + 25000 }
    if (!refreshPromise) {
      refreshPromise = backgroundRefresh().finally(() => { refreshPromise = null })
    }
    return Response.json(dbData, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60' },
    })
  }

  // Last resort - return defaults and refresh in background
  cache = { body: DEFAULT_RESPONSE, expiry: now + 15000 }
  if (!refreshPromise) {
    refreshPromise = backgroundRefresh().finally(() => { refreshPromise = null })
  }
  return Response.json(DEFAULT_RESPONSE, {
    headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60' },
  })
}
