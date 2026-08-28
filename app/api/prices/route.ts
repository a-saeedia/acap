import { pool } from '@/lib/db'
import { fetchAllPrices, DEFAULT_STOCKS, fetchTsetmcSearch, FALLBACK_USD_RATE } from '@/lib/prices'
import { randomUUID } from 'node:crypto'

let cache: { body: any; expiry: number } | null = null
let refreshPromise: Promise<any> | null = null

const DEFAULT_RESPONSE = {
  prices: {
    'USD-IRR': { price: 1870050, currency: 'IRR', change: 0 },
    'EUR-IRR': { price: 2160500, currency: 'IRR', change: 0 },
    'AED-IRR': { price: 509330, currency: 'IRR', change: 0 },
    'GOLD18': { price: 190794000, currency: 'IRR', change: 0 },
    'GOLD24': { price: 254388990, currency: 'IRR', change: 0 },
    'COIN': { price: 1890050000, currency: 'IRR', change: 0 },
    'BTC': { price: 65942, currency: 'USD', change: 0 },
    'ETH': { price: 1936.15, currency: 'USD', change: 0 },
    'USDT': { price: 0.999426, currency: 'USD', change: 0 },
    'BNB': { price: 571.48, currency: 'USD', change: 0 },
    'SOL': { price: 78.04, currency: 'USD', change: 0 },
    'XRP': { price: 0.6, currency: 'USD', change: 0 },
    'ADA': { price: 0.4, currency: 'USD', change: 0 },
    'DOGE': { price: 0.07312, currency: 'USD', change: 0 },
    'TRX': { price: 0.328444, currency: 'USD', change: 0 },
    'TRY-IRR': { price: 39700, currency: 'IRR', change: 0 },
    'GBP-IRR': { price: 2531000, currency: 'IRR', change: 0 },
  },
  irrRate: 1870050,
  stockPrices: {},
}

async function fetchFromDb() {
  try {
    const r = await pool.query(`
      WITH ranked AS (
        SELECT symbol, price, currency, "updatedAt",
               ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY "updatedAt" DESC, id DESC) AS rn
        FROM asset_price WHERE price > 0
      )
      SELECT curr.symbol, curr.price, curr.currency, curr."updatedAt",
             prev.price AS prev_price
      FROM ranked curr LEFT JOIN ranked prev ON prev.symbol = curr.symbol AND prev.rn = 2
      WHERE curr.rn = 1
    `)
    if (r.rows.length === 0) return null
    const prices: Record<string, { price: number; currency: string; change: number }> = {}
    let irrRate: number | null = null
    for (const row of r.rows) {
      if (row.price > 0) {
        const price = Number(row.price)
        const prev = row.prev_price != null ? Number(row.prev_price) : null
        prices[row.symbol] = {
          price,
          currency: row.currency ?? 'IRR',
          change: prev && prev > 0 ? Math.round(((price - prev) / prev) * 1000) / 10 : 0,
        }
        if (irrRate == null && (row.symbol === 'USD-IRR' || row.symbol === 'USDT-IRR')) {
          irrRate = price
        }
      }
    }
    if (Object.keys(prices).length === 0) return null
    return { prices, irrRate: irrRate ?? FALLBACK_USD_RATE, stockPrices: {} }
  } catch { return null }
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
    if (allSymbols.length === 0) return null

    let existing = new Set<string>()
    try {
      const r = await pool.query('SELECT DISTINCT symbol FROM asset_price')
      existing = new Set(r.rows.map((row: any) => row.symbol))
    } catch {}

    const insertSymbols = allSymbols.filter(s => !existing.has(s))
    if (insertSymbols.length > 0) {
      const placeholders = insertSymbols.map((_, i) => `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`).join(',')
      // Type normalization: TSETMC symbols are 'iran-stock'; forex pairs are 'forex'; else 'crypto'
      const classify = (sym: string): string =>
        sym in stockPrices ? 'iran-stock' : /^(USD|EUR|GBP|AED|TRY|CHF|CAD|AUD|INR|KWD|SAR|SGD|MYR|CNY|RUB|AZN)-IRR$/.test(sym) ? 'forex' : 'crypto'
      const params = insertSymbols.flatMap(sym => {
        const d = prices[sym] ?? stockPrices[sym]
        if (!d) return []
        const currency = 'currency' in d ? (d as any).currency ?? 'IRR' : 'IRR'
        return [randomUUID(), classify(sym), sym, d.price, currency, 'api', now]
      })
      if (params.length > 0) await pool.query(`INSERT INTO asset_price (id, type, symbol, price, currency, source, "updatedAt") VALUES ${placeholders} ON CONFLICT DO NOTHING`, params)
    }

    const updateSymbols = allSymbols.filter(s => existing.has(s))
    for (const sym of updateSymbols) {
      const d = prices[sym] ?? stockPrices[sym]
      if (d) await pool.query(
        `UPDATE asset_price SET price = $1, "updatedAt" = NOW()
         WHERE symbol = $2 AND id = (
           SELECT id FROM asset_price WHERE symbol = $2 ORDER BY "updatedAt" DESC, id DESC LIMIT 1
         )`,
        [d.price, sym]
      )
    }

    // Refresh cache with real change values: prefer the change reported by the
    // live feeds (TSETMC stocks / CoinGecko crypto), then fall back to change
    // computed from DB history for everything else (gold/forex).
    const freshPrices: Record<string, { price: number; currency: string; change: number }> = {}
    for (const [sym, d] of Object.entries(prices)) {
      if (d.price > 0) freshPrices[sym] = { price: d.price, currency: d.currency ?? 'IRR', change: d.change ?? 0 }
    }
    for (const [sym, d] of Object.entries(stockPrices)) {
      if (d.price > 0) freshPrices[sym] = { price: d.price, currency: 'IRR', change: d.change ?? 0 }
    }
    const liveRate = irrRate > 0 ? irrRate : null
    // Fill zero-change symbols from DB history
    const dbSnapshot = await fetchFromDb()
    if (dbSnapshot) {
      for (const [sym, d] of Object.entries(dbSnapshot.prices)) {
        if (!freshPrices[sym]) freshPrices[sym] = d
        else if (freshPrices[sym].change === 0 && d.change !== 0) freshPrices[sym].change = d.change
      }
      cache = { body: { prices: freshPrices, irrRate: liveRate ?? dbSnapshot.irrRate, stockPrices, source: 'db' }, expiry: Date.now() + 60000 }
    }
  } catch (e) { console.error('backgroundRefresh error:', e) }
}

export async function GET() {
  const now = Date.now()

  // Serve fresh cache
  if (cache && now < cache.expiry) {
    return Response.json({ ...cache.body, source: cache.body.source ?? 'db' }, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60' },
    })
  }

  // Trigger background refresh if needed (never blocks)
  if (!refreshPromise) {
    refreshPromise = backgroundRefresh()
      .catch(e => console.error('backgroundRefresh failed:', e))
      .finally(() => { refreshPromise = null })
  }

  // Serve stale cache
  if (cache) {
    return Response.json({ ...cache.body, source: cache.body.source ?? 'db' }, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60' },
    })
  }

  // No cache — load from DB (fast query, no external APIs)
  const dbData = await fetchFromDb()
  if (dbData) {
    cache = { body: { ...dbData, source: 'db' }, expiry: now + 30000 }
    return Response.json({ ...dbData, source: 'db' }, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60' },
    })
  }

  // Last resort — return default prices (flagged so the UI can warn users)
  cache = { body: { ...DEFAULT_RESPONSE, source: 'default' }, expiry: now + 30000 }
  return Response.json({ ...DEFAULT_RESPONSE, source: 'default' }, {
    headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60' },
  })
}
