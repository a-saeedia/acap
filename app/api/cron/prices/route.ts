import { pool } from '@/lib/db'
import { fetchAllPrices, DEFAULT_STOCKS, fetchTsetmcSearch } from '@/lib/prices'
import { detectAnomalies } from '@/lib/ml'
import { randomUUID } from 'node:crypto'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: Request) {
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!isVercelCron && (!CRON_SECRET || token !== CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    let insCodeMap: Record<string, string> = {}
    let stocks: any[] = []

    try {
      const r = await pool.query('SELECT symbol, "tsetmc_code" FROM iran_stock')
      stocks = r.rows
      for (const s of stocks) {
        if (s.tsetmc_code) insCodeMap[s.symbol] = s.tsetmc_code
      }
    } catch { /* ignore */ }

    if (stocks.length === 0) {
      for (const s of DEFAULT_STOCKS) {
        await pool.query(
          'INSERT INTO iran_stock (id, symbol, name, sector) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [randomUUID(), s.symbol, s.name, s.sector]
        )
      }
      stocks = DEFAULT_STOCKS
    }

    const stocksWithoutCode = stocks.filter((s: any) => !s.tsetmc_code)
    if (stocksWithoutCode.length > 0) {
      const searches = stocksWithoutCode.map(async (s: any) => {
        const code = await fetchTsetmcSearch(s.symbol)
        if (code) {
          try { await pool.query('UPDATE iran_stock SET "tsetmc_code" = $1 WHERE symbol = $2', [code, s.symbol]) } catch {}
          insCodeMap[s.symbol] = code
        }
      })
      await Promise.race([Promise.allSettled(searches), new Promise(r => setTimeout(r, 3000))])
    }

    const { prices, irrRate, stockPrices } = await fetchAllPrices(insCodeMap)

    for (const [sym, d] of Object.entries(prices)) {
      if (d.price > 0) {
        await pool.query(
          'INSERT INTO asset_price (id, type, symbol, price, currency, source, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW()) ON CONFLICT (symbol) DO UPDATE SET price = $4, "updatedAt" = NOW()',
          [randomUUID(), 'crypto', sym, d.price, d.currency, 'cron']
        )
      }
    }

    for (const [sym, d] of Object.entries(stockPrices)) {
      if (d.price > 0) {
        await pool.query(
          'INSERT INTO asset_price (id, type, symbol, price, currency, source, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW()) ON CONFLICT (symbol) DO UPDATE SET price = $4, "updatedAt" = NOW()',
          [randomUUID(), 'iran-stock', sym, d.price, 'IRR', 'cron']
        )
      }
    }

    const mlPrices: Record<string, number> = {}
    for (const [sym, d] of Object.entries(prices)) mlPrices[sym] = d.price
    for (const [sym, d] of Object.entries(stockPrices)) mlPrices[sym] = d.price
    detectAnomalies(mlPrices).catch(() => {})

    return Response.json({ ok: true, updatedAt: new Date().toISOString() })
  } catch (e) {
    console.error('cron prices error:', e)
    return Response.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
