import { pool } from '@/lib/db'
import { fetchAllPrices, DEFAULT_STOCKS, fetchTsetmcSearch } from '@/lib/prices'
import { detectAnomalies } from '@/lib/ml'
import { randomUUID } from 'node:crypto'

export const revalidate = 10

export async function GET() {
  try {
    const result = await Promise.race([
      fetchPrices(),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
    ])
    return result
  } catch (e) {
    console.error('prices timeout/fetch error:', e)
    return Response.json({ prices: {}, irrRate: 0, stockPrices: {} })
  }
}

async function fetchPrices() {
  let insCodeMap: Record<string, string> = {}
  let stocks: any[] = []

  try {
    const r = await pool.query('SELECT symbol, name, sector, "tsetmc_code" FROM iran_stock')
    stocks = r.rows
    for (const s of stocks) {
      if (s.tsetmc_code) insCodeMap[s.symbol] = s.tsetmc_code
    }
  } catch (e) { console.error('fetch stocks error:', e) }

  if (stocks.length === 0) {
    try {
      for (const s of DEFAULT_STOCKS) {
        await pool.query(
          'INSERT INTO iran_stock (id, symbol, name, sector) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [randomUUID(), s.symbol, s.name, s.sector]
        )
      }
      stocks = DEFAULT_STOCKS
    } catch (e) { console.error('seed stocks error:', e) }
  }

  const stocksWithoutCode = stocks.filter((s: any) => !s.tsetmc_code)
  if (stocksWithoutCode.length > 0) {
    const searches = stocksWithoutCode.map(async (s: any) => {
      const code = await fetchTsetmcSearch(s.symbol)
      if (code) {
        try {
          await pool.query('UPDATE iran_stock SET "tsetmc_code" = $1 WHERE symbol = $2', [code, s.symbol])
        } catch (e) { console.error('update tsetmc_code error:', e) }
        insCodeMap[s.symbol] = code
      }
    })
    // Timebox code search at 3s — remaining stocks get codes on next visit
    await Promise.race([Promise.allSettled(searches), new Promise(r => setTimeout(r, 3000))])
  }

  const { prices, irrRate, stockPrices } = await fetchAllPrices(insCodeMap)

  // Batch fetch all existing asset_price symbols (1 query instead of N)
  let existingAssetPrices = new Set<string>()
  try {
    const r = await pool.query('SELECT DISTINCT symbol FROM asset_price')
    existingAssetPrices = new Set(r.rows.map((row: any) => row.symbol))
    } catch (e) { console.error('fetch existing asset_prices error:', e) }

  // Merge live prices with DB fallback — use batch DB query
  const allSymbols = [...new Set([...Object.keys(prices), ...Object.keys(stockPrices)])]
  let dbFallbackPrices: Record<string, { price: number; currency: string }> = {}
  if (allSymbols.some(s => !prices[s] && !stockPrices[s])) {
    try {
      const symbolsNeedingFallback = allSymbols.filter(s => !prices[s] && !stockPrices[s])
      if (symbolsNeedingFallback.length > 0) {
        const placeholders = symbolsNeedingFallback.map((_, i) => `$${i + 1}`).join(',')
        const r = await pool.query(
          `SELECT DISTINCT ON (symbol) symbol, price, currency FROM asset_price WHERE symbol IN (${placeholders}) ORDER BY symbol, "updatedAt" DESC`,
          symbolsNeedingFallback
        )
        for (const row of r.rows) {
          if (row.price > 0) dbFallbackPrices[row.symbol] = { price: row.price, currency: row.currency ?? 'IRR' }
        }
      }
    } catch (e) { console.error('batch fetch fallback prices error:', e) }
  }

  const finalPrices: Record<string, { price: number; currency: string; change: number }> = {}
  for (const symbol of allSymbols) {
    const live = prices[symbol] ?? stockPrices[symbol]
    if (live) {
      const change = 'change' in live ? Number((live as any).change ?? 0) : 0
      finalPrices[symbol] = { price: live.price, currency: live.currency ?? 'IRR', change }
    } else if (dbFallbackPrices[symbol]) {
      finalPrices[symbol] = { price: dbFallbackPrices[symbol].price, currency: dbFallbackPrices[symbol].currency ?? 'IRR', change: 0 }
    }
  }

  // Batch upsert asset_prices — 2 bulk queries instead of N individual ones
  const now = new Date().toISOString()
  const cryptoEntries = Object.entries(prices).filter(([, d]) => d.price > 0)
  if (cryptoEntries.length > 0) {
    const values = cryptoEntries.map(([sym, d]) => {
      const id = existingAssetPrices.has(sym) ? null : randomUUID()
      return { id, sym, price: d.price, currency: d.currency, source: 'api', now }
    })
    const inserts = values.filter(v => v.id)
    const updates = values.filter(v => !v.id)
    if (inserts.length > 0) {
      const placeholders = inserts.map((_, i) =>
        `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6}, $${i * 6 + 7})`
      ).join(',')
      const params = inserts.flatMap(v => [v.id, 'crypto', v.sym, v.price, v.currency, v.source, v.now])
      try { await pool.query(`INSERT INTO asset_price (id, type, symbol, price, currency, source, "updatedAt") VALUES ${placeholders} ON CONFLICT DO NOTHING`, params) } catch (e) { console.error('batch insert prices error:', e) }
    }
    if (updates.length > 0) {
      for (const u of updates) {
        try { await pool.query('UPDATE asset_price SET price = $1, "updatedAt" = NOW() WHERE symbol = $2', [u.price, u.sym]) } catch (e) { console.error('update price error:', e) }
      }
    }
  }

  const stockSymbols = Object.keys(stockPrices).filter(s => stockPrices[s].price > 0)
  if (stockSymbols.length > 0) {
    const stockInserts = stockSymbols.filter(s => !existingAssetPrices.has(s))
    const stockUpdates = stockSymbols.filter(s => existingAssetPrices.has(s))
    if (stockInserts.length > 0) {
      const placeholders = stockInserts.map((_, i) =>
        `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6}, $${i * 6 + 7})`
      ).join(',')
      const params = stockInserts.flatMap(sym => [randomUUID(), 'iran-stock', sym, stockPrices[sym].price, 'IRR', 'api', now])
      try { await pool.query(`INSERT INTO asset_price (id, type, symbol, price, currency, source, "updatedAt") VALUES ${placeholders} ON CONFLICT DO NOTHING`, params) } catch (e) { console.error('batch insert stock prices error:', e) }
    }
    for (const sym of stockUpdates) {
      try { await pool.query('UPDATE asset_price SET price = $1, "updatedAt" = NOW() WHERE symbol = $2', [stockPrices[sym].price, sym]) } catch (e) { console.error('update stock price error:', e) }
    }
  }

  // Batch fetch stock prices from DB (1 query instead of N)
  const stockSymbolsList = stocks.map((s: any) => s.symbol)
  let dbStockPrices: Record<string, number> = {}
  if (stockSymbolsList.length > 0) {
    try {
      const missingSymbols = stockSymbolsList.filter(s => !stockPrices[s])
      if (missingSymbols.length > 0) {
        const placeholders = missingSymbols.map((_, i) => `$${i + 1}`).join(',')
        const r = await pool.query(
          `SELECT DISTINCT ON (symbol) symbol, price FROM asset_price WHERE symbol IN (${placeholders}) ORDER BY symbol, "updatedAt" DESC`,
          missingSymbols
        )
        for (const row of r.rows) {
          if (row.price > 0) dbStockPrices[row.symbol] = row.price
        }
      }
          } catch (e) { console.error('batch fetch db stock prices error:', e) }
  }

  const fallbackStockPrices: Record<string, { price: number; change: number }> = {}
  for (const s of stocks) {
    const sp = stockPrices[s.symbol]
    if (sp) {
      fallbackStockPrices[s.symbol] = { price: sp.price, change: sp.change }
    } else if (dbStockPrices[s.symbol]) {
      fallbackStockPrices[s.symbol] = { price: dbStockPrices[s.symbol], change: 0 }
    } else {
      fallbackStockPrices[s.symbol] = { price: 0, change: 0 }
    }
  }

  const mlPrices: Record<string, number> = {}
  for (const [sym, d] of Object.entries(prices)) mlPrices[sym] = d.price
  for (const [sym, d] of Object.entries(stockPrices)) mlPrices[sym] = d.price
  detectAnomalies(mlPrices).catch((e) => { console.error('detectAnomalies error:', e) })

  return Response.json(
    { prices: finalPrices, irrRate, stockPrices: fallbackStockPrices },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    }
  )
}
