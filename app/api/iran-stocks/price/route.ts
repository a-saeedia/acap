import { pool } from '@/lib/db'
import { fetchTsetmcSearch, fetchTsetmcPriceInfo } from '@/lib/prices'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  if (!symbol) {
    return Response.json({ error: 'symbol query param is required' }, { status: 400 })
  }

  try {
    let insCode: string | null = null
    const r = await pool.query('SELECT "tsetmc_code" FROM iran_stock WHERE symbol = $1 LIMIT 1', [symbol])
    if (r.rows.length > 0 && r.rows[0].tsetmc_code) {
      insCode = r.rows[0].tsetmc_code
    } else {
      insCode = await fetchTsetmcSearch(symbol)
      if (insCode) {
        await pool.query('UPDATE iran_stock SET "tsetmc_code" = $1 WHERE symbol = $2', [insCode, symbol])
      }
    }

    if (!insCode) {
      const last = await pool.query(`SELECT price FROM asset_price WHERE symbol = $1 ORDER BY "updatedAt" DESC LIMIT 1`, [symbol])
      const price = last.rows.length > 0 ? last.rows[0].price : 0
      return Response.json({ symbol, price, currency: 'IRR', change: 0, source: 'db-fallback' })
    }

    const info = await fetchTsetmcPriceInfo(insCode)
    if (!info) {
      const last = await pool.query(`SELECT price FROM asset_price WHERE symbol = $1 ORDER BY "updatedAt" DESC LIMIT 1`, [symbol])
      const price = last.rows.length > 0 ? last.rows[0].price : 0
      return Response.json({ symbol, price, currency: 'IRR', change: 0, source: 'db-fallback' })
    }

    const change = info.yesterday > 0
      ? Math.round(((info.lastPrice - info.yesterday) / info.yesterday) * 10000) / 100
      : 0

    return Response.json({
      symbol,
      price: info.lastPrice,
      closePrice: info.closePrice,
      high: info.high,
      low: info.low,
      volume: info.volume,
      yesterday: info.yesterday,
      currency: 'IRR',
      change,
      source: 'tsetmc',
    })
  } catch (e) {
    console.error('stock price error:', e)
    return Response.json({ symbol, price: 0, currency: 'IRR', change: 0, source: 'error' })
  }
}
