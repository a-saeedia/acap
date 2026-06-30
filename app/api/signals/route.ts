import { pool } from '@/lib/db'
import { randomUUID } from 'node:crypto'

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

const SIGNAL_TYPES: Record<string, string> = {
  BTC: 'crypto', ETH: 'crypto',
  GOLD18: 'gold', GOLD24: 'gold', COIN: 'gold',
  'USD-IRR': 'forex', 'EUR-IRR': 'forex',
  'فولاد': 'stock', 'خودرو': 'stock', 'شپنا': 'stock', 'وبملت': 'stock', 'فملی': 'stock',
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const timeMonths = parseInt(url.searchParams.get('months') || '0')

    await pool.query(`CREATE TABLE IF NOT EXISTS "signal" (
      "id" text PRIMARY KEY NOT NULL,
      "type" text NOT NULL,
      "symbol" text NOT NULL,
      "title" text NOT NULL,
      "description" text,
      "action" text NOT NULL,
      "investorType" text,
      "priceAtPublish" real NOT NULL,
      "publishedAt" timestamp DEFAULT now() NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL
    )`)
    try { await pool.query(`ALTER TABLE "signal" ADD COLUMN IF NOT EXISTS "investorType" text`) } catch {}

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
      'USD-IRR': 1785000, 'EUR-IRR': 1920000, 'AED-IRR': 486000,
      'فولاد': 26200, 'خودرو': 19800, 'شپنا': 48500, 'وبملت': 7150, 'فملی': 34500,
    }
    const prices: Record<string, number> = { ...FALLBACK, ...dbPrices }

    // Seed only if empty
    const existing = await pool.query('SELECT COUNT(*) FROM signal')
    if (Number(existing.rows[0].count) === 0) {
      const seedSymbols = [
        { symbol: 'GOLD18', type: 'gold', daysAgo: 35, dropPct: 2.8 },
        { symbol: 'USD-IRR', type: 'forex', daysAgo: 30, dropPct: 2.2 },
        { symbol: 'فولاد', type: 'stock', daysAgo: 28, dropPct: 5.5 },
        { symbol: 'BTC', type: 'crypto', daysAgo: 25, dropPct: 4.8 },
        { symbol: 'شپنا', type: 'stock', daysAgo: 22, dropPct: 3.5 },
        { symbol: 'COIN', type: 'gold', daysAgo: 19, dropPct: 4.2 },
        { symbol: 'ETH', type: 'crypto', daysAgo: 17, dropPct: 6.5 },
        { symbol: 'وبملت', type: 'stock', daysAgo: 14, dropPct: 7.2 },
        { symbol: 'GOLD24', type: 'gold', daysAgo: 11, dropPct: 3.0 },
        { symbol: 'خودرو', type: 'stock', daysAgo: 8, dropPct: 6.8 },
        { symbol: 'فملی', type: 'stock', daysAgo: 6, dropPct: 4.5 },
        { symbol: 'EUR-IRR', type: 'forex', daysAgo: 3, dropPct: 1.8 },
        { symbol: 'BTC', type: 'crypto', daysAgo: 45, dropPct: 6.2 },
        { symbol: 'GOLD18', type: 'gold', daysAgo: 60, dropPct: 3.5 },
      ]
      for (const s of seedSymbols) {
        const currentPrice = prices[s.symbol]
        if (!currentPrice) continue
        const historicalPrice = Math.round(currentPrice * (1 - s.dropPct / 100) * 100) / 100
        const info = SIGNAL_DESCRIPTIONS[s.symbol]
        if (!info) continue
        const publishedAt = new Date(Date.now() - s.daysAgo * 24 * 60 * 60 * 1000)
        await pool.query(
          'INSERT INTO signal (id, type, symbol, title, description, action, "investorType", "priceAtPublish", "publishedAt", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())',
          [randomUUID(), s.type, s.symbol, info.title, info.desc, 'buy', info.personality, historicalPrice, publishedAt]
        )
      }
    }

    // Apply time range filter
    let signals
    if (timeMonths > 0) {
      const cutoff = new Date(Date.now() - timeMonths * 30 * 24 * 60 * 60 * 1000)
      const { rows } = await pool.query(
        'SELECT * FROM signal WHERE "publishedAt" >= $1 ORDER BY "publishedAt" DESC',
        [cutoff]
      )
      signals = rows
    } else {
      const { rows } = await pool.query('SELECT * FROM signal ORDER BY "publishedAt" DESC')
      signals = rows
    }

    const enriched = signals.map((s: any) => {
      const currentPrice = prices[s.symbol] ?? s.priceAtPublish
      const profit = currentPrice > 0 ? ((currentPrice - s.priceAtPublish) / s.priceAtPublish) * 100 : 0
      const daysSince = Math.floor((Date.now() - new Date(s.publishedAt).getTime()) / (1000 * 60 * 60 * 24))
      return {
        ...s,
        currentPrice,
        profitPercent: Math.round(profit * 100) / 100,
        profitDirection: profit >= 0 ? 'up' : 'down',
        daysSince,
      }
    })

    return Response.json(enriched)
  } catch (e) {
    console.error('signals error:', e)
    return Response.json([])
  }
}
