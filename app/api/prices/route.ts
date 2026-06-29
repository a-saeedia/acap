import { pool } from '@/lib/db'
import { fetchAllPrices, DEFAULT_STOCKS, fetchTsetmcSearch } from '@/lib/prices'
import { detectAnomalies } from '@/lib/ml'
import { randomUUID } from 'node:crypto'

export async function GET() {
  let insCodeMap: Record<string, string> = {}
  let stocks: any[] = []

  try {
      const r = await pool.query('SELECT symbol, name, sector, "tsetmcCode" FROM iran_stock')
    stocks = r.rows
    for (const s of stocks) {
      if (s.tsetmcCode) insCodeMap[s.symbol] = s.tsetmcCode
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

  const stocksWithoutCode = stocks.filter((s: any) => !s.tsetmcCode)
  if (stocksWithoutCode.length > 0) {
    const searches = stocksWithoutCode.map(async (s: any) => {
      const code = await fetchTsetmcSearch(s.symbol)
      if (code) {
        try {
          await pool.query('UPDATE iran_stock SET "tsetmcCode" = $1 WHERE symbol = $2', [code, s.symbol])
        } catch {}
        insCodeMap[s.symbol] = code
      }
    })
    await Promise.allSettled(searches)
  }

  const { prices, irrRate, stockPrices } = await fetchAllPrices(insCodeMap)

  for (const [symbol, data] of Object.entries(prices)) {
    try {
      const exists = await pool.query('SELECT id FROM asset_price WHERE symbol = $1 LIMIT 1', [symbol])
      if (exists.rows.length === 0) {
        await pool.query(
          'INSERT INTO asset_price (id, type, symbol, price, currency, source, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
          [randomUUID(), 'crypto', symbol, data.price, data.currency, 'api']
        )
      } else {
        await pool.query('UPDATE asset_price SET price = $1, "updatedAt" = NOW() WHERE symbol = $2', [data.price, symbol])
      }
    } catch (e) { console.error(`price store error for ${symbol}:`, e) }
  }

  for (const [symbol, data] of Object.entries(stockPrices)) {
    try {
      const exists = await pool.query('SELECT id FROM asset_price WHERE symbol = $1 LIMIT 1', [symbol])
      if (exists.rows.length === 0) {
        await pool.query(
          'INSERT INTO asset_price (id, type, symbol, price, currency, source, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
          [randomUUID(), 'iran-stock', symbol, data.price, 'IRR', 'api']
        )
      } else {
        await pool.query('UPDATE asset_price SET price = $1, "updatedAt" = NOW() WHERE symbol = $2', [data.price, symbol])
      }
    } catch (e) { console.error(`stock price store error for ${symbol}:`, e) }
  }

  const fallbackStockPrices: Record<string, { price: number; change: number }> = {}
  for (const s of stocks) {
    const sp = stockPrices[s.symbol]
    if (sp) {
      fallbackStockPrices[s.symbol] = { price: sp.price, change: sp.change }
    } else {
      try {
        const r = await pool.query(`SELECT price FROM asset_price WHERE symbol = $1 ORDER BY "updatedAt" DESC LIMIT 1`, [s.symbol])
        if (r.rows.length > 0 && r.rows[0].price > 0) {
          fallbackStockPrices[s.symbol] = { price: r.rows[0].price, change: 0 }
        } else {
          fallbackStockPrices[s.symbol] = { price: 0, change: 0 }
        }
      } catch {
        fallbackStockPrices[s.symbol] = { price: 0, change: 0 }
      }
    }
  }

  const mlPrices: Record<string, number> = {}
  for (const [sym, d] of Object.entries(prices)) mlPrices[sym] = d.price
  for (const [sym, d] of Object.entries(stockPrices)) mlPrices[sym] = d.price
  detectAnomalies(mlPrices).catch(() => {})

  return Response.json({ prices, irrRate, stockPrices: fallbackStockPrices })
}
