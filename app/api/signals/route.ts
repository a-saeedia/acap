import { pool } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const timeMonths = parseInt(url.searchParams.get('months') || '0')
    const userId = url.searchParams.get('userId') || ''

    const { rows } = userId
      ? await pool.query(`SELECT * FROM signal WHERE visibility = 'public' OR "targetUserIds" @> $1::jsonb ORDER BY "publishedAt" DESC`, [JSON.stringify([userId])])
      : await pool.query(`SELECT * FROM signal WHERE visibility = 'public' AND ("targetUserIds" IS NULL OR jsonb_array_length("targetUserIds") = 0) ORDER BY "publishedAt" DESC`)

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
      BTC: 65942, ETH: 1936.15, USDT: 0.999426,
      'GOLD18': 190794000, 'GOLD24': 254388990, 'COIN': 1890050000,
      'USD-IRR': 1870050, 'EUR-IRR': 2160500, 'AED-IRR': 509330,
    }
    const prices: Record<string, number> = { ...FALLBACK, ...dbPrices }

    const enriched = rows.map((s: any) => {
      // Prefer live DB price when it's sane relative to the admin-set priceNow;
      // otherwise fall back to priceNow, then priceAtPublish (stale DB rows for
      // some Iranian stocks are off by orders of magnitude)
      const dbPrice = prices[s.symbol] && prices[s.symbol] > 0 ? prices[s.symbol] : null
      const adminPrice = s.priceNow && s.priceNow > 0 ? s.priceNow : null
      let currentPrice: number
      if (dbPrice && adminPrice) {
        const deviation = Math.abs(dbPrice - adminPrice) / Math.max(adminPrice, 1)
        currentPrice = deviation <= 0.3 ? dbPrice : adminPrice
      } else {
        currentPrice = dbPrice ?? adminPrice ?? s.priceAtPublish
      }
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
