import { pool } from '@/lib/db'
import { toJalaali } from 'jalaali-js'

const SIGNAL_DESCRIPTIONS: Record<string, { title: string; desc: string; personality: string }> = {
  BTC: { title: 'خرید بیت‌کوین', desc: 'بیت‌کوین در محدوده حمایت قوی قرار دارد. خرید در این ناحیه ریسک کمی دارد.', personality: 'conservative' },
  ETH: { title: 'خرید اتریوم', desc: 'اتریوم پس از اصلاح به حمایت رسیده و آماده صعود است.', personality: 'balanced' },
  GOLD18: { title: 'خرید طلای ۱۸', desc: 'قیمت طلا در کف کانال صعودی قرار گرفته. ریسک پایین.', personality: 'conservative' },
  GOLD24: { title: 'خرید طلای ۲۴', desc: 'طلای ۲۴ به سطح حمایت کلیدی برخورد کرده.', personality: 'conservative' },
  COIN: { title: 'خرید سکه امامی', desc: 'سکه امامی به کانال صعودی بازگشته است.', personality: 'balanced' },
  'USD-IRR': { title: 'خرید دلار', desc: 'دلار با شکست مقاومت می‌تواند تا کانال جدید حرکت کند.', personality: 'conservative' },
  'EUR-IRR': { title: 'خرید یورو', desc: 'یورو نسبت به دلار در کف قرار دارد و آماده رشد.', personality: 'balanced' },
  'فولاد': { title: 'خرید فولاد مبارکه', desc: 'فولاد با حمایت خط روند صعودی به کف رسیده.', personality: 'balanced' },
  'خودرو': { title: 'خرید ایران خودرو', desc: 'خودرو با رشد تولید و گزارش مثبت همراه است.', personality: 'growth' },
  'شپنا': { title: 'خرید پالایش نفت اصفهان', desc: 'شپنا با حاشیه سود مناسب در محدوده جذاب ارزشگذاری شده.', personality: 'balanced' },
  'وبملت': { title: 'خرید بانک ملت', desc: 'وبملت با رشد سودآوری و P/E پایین، گزینه مناسبی است.', personality: 'growth' },
  'فملی': { title: 'خرید ملی صنایع مس', desc: 'فملی با رشد قیمت مس در بازار جهانی، پتانسیل صعود دارد.', personality: 'growth' },
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const timeMonths = parseInt(url.searchParams.get('months') || '0')
    const userId = url.searchParams.get('userId') || ''

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
      'فولاد': 26200, 'خودرو': 19800, 'شپنا': 48500, 'وبملت': 7150, 'فملی': 34500,
    }
    const prices: Record<string, number> = { ...FALLBACK, ...dbPrices }

    let signals
    const params: any[] = []
    let queryStr: string
    if (timeMonths > 0) {
      const cutoff = new Date(Date.now() - timeMonths * 30 * 24 * 60 * 60 * 1000)
      params.push(cutoff)
      if (userId) {
        queryStr = `SELECT * FROM signal WHERE "publishedAt" >= $1 AND ("visibility" IS NULL OR "visibility" = 'public' OR ("visibility" = 'private' AND "targetUserIds" @> $2::jsonb)) ORDER BY "publishedAt" DESC`
        params.push(JSON.stringify([userId]))
      } else {
        queryStr = `SELECT * FROM signal WHERE "publishedAt" >= $1 AND ("visibility" IS NULL OR "visibility" = 'public') ORDER BY "publishedAt" DESC`
      }
    } else {
      if (userId) {
        queryStr = `SELECT * FROM signal WHERE ("visibility" IS NULL OR "visibility" = 'public' OR ("visibility" = 'private' AND "targetUserIds" @> $1::jsonb)) ORDER BY "publishedAt" DESC`
        params.push(JSON.stringify([userId]))
      } else {
        queryStr = `SELECT * FROM signal WHERE ("visibility" IS NULL OR "visibility" = 'public') ORDER BY "publishedAt" DESC`
      }
    }
    const { rows } = await pool.query(queryStr, params)
    signals = rows

    const enriched = signals.map((s: any) => {
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

    // Fetch revenue data filtered by same time range
    let revenueRows
    if (timeMonths > 0) {
      const cutoff = new Date(Date.now() - timeMonths * 30 * 24 * 60 * 60 * 1000)
      const j = toJalaali(cutoff.getFullYear(), cutoff.getMonth() + 1, cutoff.getDate())
      const cutoffYear = j.jy
      const cutoffMonth = j.jm
      const { rows } = await pool.query(
        'SELECT * FROM acap_revenue WHERE (year > $1 OR (year = $1 AND month >= $2)) ORDER BY year DESC, month DESC',
        [cutoffYear, cutoffMonth]
      )
      revenueRows = rows
    } else {
      const { rows } = await pool.query('SELECT * FROM acap_revenue ORDER BY year DESC, month DESC')
      revenueRows = rows
    }

    return Response.json({ signals: enriched, revenue: revenueRows || [] })
  } catch (e) {
    console.error('signals error:', e)
    return Response.json({ signals: [], revenue: [] })
  }
}
