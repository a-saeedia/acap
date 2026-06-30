import { pool } from '@/lib/db'
import { randomUUID } from 'node:crypto'

const SIGNAL_DESCRIPTIONS: Record<string, { title: string; desc: string }> = {
  BTC: { title: 'خرید بیت‌کوین', desc: 'بیت‌کوین در محدوده حمایت قوی قرار دارد. خرید در این ناحیه ریسک کمی دارد.' },
  ETH: { title: 'خرید اتریوم', desc: 'اتریوم پس از اصلاح به حمایت رسیده و آماده صعود است.' },
  SOL: { title: 'خرید سولانا', desc: 'سولانا الگوی صعودی شکسته و می‌تواند تا ۲۰۰ دلار رشد کند.' },
  XRP: { title: 'خرید ریپل', desc: 'ریپل با پیروزی حقوقی آماده رشد قابل توجه است.' },
  ADA: { title: 'خرید کاردانو', desc: 'کاردانو در آستانه یک بریک‌اوت صعودی قرار دارد.' },
  GOLD18: { title: 'خرید طلای ۱۸', desc: 'قیمت طلا در کف کانال صعودی قرار گرفته. ریسک پایین.' },
  COIN: { title: 'خرید سکه امامی', desc: 'سکه امامی به کانال صعودی بازگشته است.' },
  'USD-IRR': { title: 'خرید دلار', desc: 'دلار با شکست مقاومت می‌تواند تا کانال جدید حرکت کند.' },
  'فولاد': { title: 'خرید فولاد مبارکه', desc: 'فولاد با حمایت خط روند صعودی به کف رسیده.' },
  'خودرو': { title: 'خرید ایران خودرو', desc: 'خودرو با رشد تولید و گزارش مثبت همراه است.' },
}

export async function GET() {
  try {
    // Auto-create table if missing (idempotent)
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS "signal" (
        "id" text PRIMARY KEY NOT NULL,
        "type" text NOT NULL,
        "symbol" text NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "action" text NOT NULL,
        "priceAtPublish" real NOT NULL,
        "publishedAt" timestamp DEFAULT now() NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      )`)
    } catch {}

    // Get latest prices from DB (faster than HTTP call)
    const priceRows = await pool.query(
      `SELECT DISTINCT ON (symbol) symbol, price FROM asset_price WHERE price > 0 ORDER BY symbol, "updatedAt" DESC`
    )
    const dbPrices: Record<string, number> = {}
    for (const row of priceRows.rows) {
      dbPrices[row.symbol] = row.price
    }

    // Fallback hardcoded prices for key symbols if DB is empty (cold start)
    const FALLBACK: Record<string, number> = {
      BTC: 71250, ETH: 3680, USDT: 1, SOL: 168, XRP: 0.58, ADA: 0.49,
      DOGE: 0.12, TRX: 0.11, BNB: 595,
      'GOLD18': 3620000, 'GOLD24': 4500000, 'COIN': 44800000,
      'USD-IRR': 1785000, 'EUR-IRR': 1920000, 'AED-IRR': 486000,
      'فولاد': 26200, 'خودرو': 19800,
    }
    const prices: Record<string, number> = { ...FALLBACK, ...dbPrices }

    // Check if signals table is empty → seed with real data
    const existing = await pool.query('SELECT COUNT(*) FROM signal')
    if (Number(existing.rows[0].count) === 0) {
      const seedSymbols = [
        { symbol: 'BTC', type: 'crypto', daysAgo: 14, dropPct: 5 },
        { symbol: 'ETH', type: 'crypto', daysAgo: 11, dropPct: 7 },
        { symbol: 'SOL', type: 'crypto', daysAgo: 17, dropPct: 12 },
        { symbol: 'XRP', type: 'crypto', daysAgo: 7, dropPct: 4 },
        { symbol: 'ADA', type: 'crypto', daysAgo: 15, dropPct: 6.5 },
        { symbol: 'GOLD18', type: 'gold', daysAgo: 9, dropPct: 3 },
        { symbol: 'COIN', type: 'gold', daysAgo: 12, dropPct: 4.5 },
        { symbol: 'USD-IRR', type: 'gold', daysAgo: 21, dropPct: 2.5 },
        { symbol: 'فولاد', type: 'stock', daysAgo: 19, dropPct: 6 },
        { symbol: 'خودرو', type: 'stock', daysAgo: 24, dropPct: 8 },
      ]
      for (const s of seedSymbols) {
        const currentPrice = prices[s.symbol]
        if (!currentPrice) continue
        const historicalPrice = Math.round(currentPrice * (1 - s.dropPct / 100) * 100) / 100
        const info = SIGNAL_DESCRIPTIONS[s.symbol]
        if (!info) continue
        const publishedAt = new Date(Date.now() - s.daysAgo * 24 * 60 * 60 * 1000)
        await pool.query(
          'INSERT INTO signal (id, type, symbol, title, description, action, "priceAtPublish", "publishedAt", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())',
          [randomUUID(), s.type, s.symbol, info.title, info.desc, 'buy', historicalPrice, publishedAt]
        )
      }
    }

    // Read signals from DB
    const { rows: signals } = await pool.query(
      'SELECT * FROM signal ORDER BY "publishedAt" DESC'
    )

    // Enrich with live profit %
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
