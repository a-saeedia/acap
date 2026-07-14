import { pool } from '@/lib/db'

const TSETMC_API = 'https://cdn.tsetmc.com/api'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  if (!symbol) {
    return Response.json({ error: 'symbol query param is required' }, { status: 400 })
  }

  try {
    // 1) Get cached TSETMC code from DB
    const r = await pool.query('SELECT tsetmc_code FROM iran_stock WHERE symbol = $1 LIMIT 1', [symbol])
    const insCode: string | null = r.rows.length > 0 ? r.rows[0].tsetmc_code : null

    // 2) Try TSETMC CDN with 10s timeout
    if (insCode) {
      try {
        const res = await fetch(`${TSETMC_API}/ClosingPrice/GetClosingPriceInfo/${insCode}`, {
          signal: AbortSignal.timeout(8000),
          headers: { 'User-Agent': UA },
        })
        if (res.ok) {
          const data: any = await res.json()
          const info = data?.closingPriceInfo
          if (info?.pClosing != null) {
            const lastPrice = info.pDrCotVal ?? info.pClosing ?? 0
            const yesterday = info.priceYesterday ?? info.yClose ?? 0
            const change = yesterday > 0
              ? Math.round(((info.pDrCotVal - yesterday) / yesterday) * 10000) / 100
              : (info.priceChange ?? 0)
            return Response.json({
              symbol, price: lastPrice, closePrice: info.pClosing ?? 0,
              high: info.priceMax ?? 0, low: info.priceMin ?? 0,
              volume: info.qTotTran5J ?? 0, yesterday,
              currency: 'IRR', change, source: 'tsetmc',
            })
          }
        }
      } catch { /* TSETMC failed, try fallback */ }
    }

    // 3) BrsApi fallback — try from user's cached prices
    const last = await pool.query(
      `SELECT price FROM asset_price WHERE symbol = $1 ORDER BY "updatedAt" DESC LIMIT 1`, [symbol]
    )
    const price = last.rows.length > 0 ? last.rows[0].price : 0

    return Response.json({ symbol, price, currency: 'IRR', change: 0, source: 'db-fallback' })
  } catch (e) {
    console.error('stock price error:', e)
    return Response.json({ symbol, price: 0, currency: 'IRR', change: 0, source: 'error' })
  }
}
