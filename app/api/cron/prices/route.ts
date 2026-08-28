import { pool } from '@/lib/db'
import { fetchAllPrices, DEFAULT_STOCKS, fetchTsetmcSearch } from '@/lib/prices'
import { detectAnomalies } from '@/lib/ml'
import { randomUUID, timingSafeEqual, createHash } from 'node:crypto'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!CRON_SECRET || !token) {
    return new Response('Unauthorized', { status: 401 })
  }
  const a = createHash('sha256').update(String(token)).digest()
  const b = createHash('sha256').update(CRON_SECRET).digest()
  if (!timingSafeEqual(a, b)) {
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

    // Batch upsert: update existing rows, insert new ones
    // Type normalization: a symbol found via TSETMC is always 'iran-stock';
    // forex pairs are 'forex'; everything else (crypto, gold, coins) is 'crypto'.
    const classify = (sym: string): string =>
      sym in stockPrices ? 'iran-stock' : /^[A-Z]{3}-IRR$/.test(sym) || /^(USD|EUR|GBP|AED|TRY|CHF|CAD|AUD|INR|KWD|SAR|SGD|MYR|CNY|RUB|AZN)-IRR$/.test(sym) ? 'forex' : 'crypto'
    const allEntries = [
      ...Object.entries(prices).filter(([, d]) => d.price > 0).map(([sym, d]) => ({ sym, price: d.price, currency: d.currency, type: classify(sym) })),
      ...Object.entries(stockPrices).filter(([, d]) => d.price > 0).map(([sym, d]) => ({ sym, price: d.price, currency: 'IRR', type: 'iran-stock' })),
    ]

    if (allEntries.length > 0) {
      const existing = await pool.query('SELECT DISTINCT symbol FROM asset_price')
      const existingSet = new Set(existing.rows.map((r: any) => r.symbol))

      const toInsert = allEntries.filter(e => !existingSet.has(e.sym))
      const toUpdate = allEntries.filter(e => existingSet.has(e.sym))

      if (toInsert.length > 0) {
        const placeholders = toInsert.map((_, i) =>
          `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6}, NOW())`
        ).join(',')
        const params = toInsert.flatMap(e => [randomUUID(), e.type, e.sym, e.price, e.currency, 'cron'])
        try { await pool.query(`INSERT INTO asset_price (id, type, symbol, price, currency, source, "updatedAt") VALUES ${placeholders}`, params) } catch (e2) { console.error('cron insert error:', e2) }
      }

      for (const e of toUpdate) {
        try { await pool.query(
          `UPDATE asset_price SET price = $1, "updatedAt" = NOW()
           WHERE symbol = $2 AND id = (
             SELECT id FROM asset_price WHERE symbol = $2 ORDER BY "updatedAt" DESC, id DESC LIMIT 1
           )`,
          [e.price, e.sym]
        ) } catch (e2) { console.error('cron update error:', e2) }
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
