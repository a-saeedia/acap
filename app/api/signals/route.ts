import { pool } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const timeMonths = parseInt(url.searchParams.get('months') || '0')
    const userId = url.searchParams.get('userId') || ''

    const { rows } = await pool.query(`SELECT * FROM signal ORDER BY "publishedAt" DESC`)

    const { rows: revenueRows } = await pool.query(`SELECT * FROM acap_revenue ORDER BY year DESC, month DESC`)

    if (rows.length === 0) {
      return Response.json({ signals: [], revenue: [] })
    }

    const priceRows = await pool.query(
      `SELECT DISTINCT ON (symbol) symbol, price FROM asset_price WHERE price > 0 ORDER BY symbol, "updatedAt" DESC`
    )
    const dbPrices: Record<string, number> = {}
    for (const row of priceRows.rows) {
      dbPrices[row.symbol] = row.price
    }
    const FALLBACK: Record<string, number> = {
      BTC: 71250, ETH: 3680, USDT: 1,
      'GOLD18': 3620000, 'GOLD24': 4500000, 'COIN': 44800000,
      'USD-IRR': 1850000, 'EUR-IRR': 2030000, 'AED-IRR': 504000,
    }
    const prices: Record<string, number> = { ...FALLBACK, ...dbPrices }

    const enriched = rows.map((s: any) => {
      const currentPrice = prices[s.symbol] ?? s.priceAtPublish
      const expected = s.expectedProfit ?? 0
      const actual = s.actualReturn ?? expected
      const daysSince = Math.floor((Date.now() - new Date(s.publishedAt).getTime()) / (1000 * 60 * 60 * 24))
      return {
        ...s,
        currentPrice,
        expectedProfit: Math.round(expected * 100) / 100,
        actualProfit: actual,
        profitPercent: actual,
        profitDirection: actual >= 0 ? 'up' : 'down',
        daysSince,
      }
    })

    let filteredRevenue = revenueRows
    if (timeMonths > 0) {
      const cutoff = new Date(Date.now() - timeMonths * 30 * 24 * 60 * 60 * 1000)
      filteredRevenue = revenueRows.filter((r: any) => {
        const d = new Date(r.year, r.month - 1)
        return d >= cutoff
      })
    }

    return Response.json({ signals: enriched, revenue: filteredRevenue || [] })
  } catch (e) {
    console.error('signals error:', e)
    return Response.json({ signals: [], revenue: [], error: 'failed to load signals' }, { status: 500 })
  }
}
