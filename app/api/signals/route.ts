import { pool } from '@/lib/db'
import { randomUUID } from 'node:crypto'

type PriceMap = Record<string, { price: number }>

const SEED_SIGNALS = [
  { type: 'crypto', symbol: 'BTC', title: 'خرید بیت‌کوین', description: 'بیت‌کوین در محدوده حمایت قوی قرار دارد. خرید در این ناحیه ریسک کمی دارد.', action: 'buy', priceAtPublish: 67420, publishedAt: '2026-06-15' },
  { type: 'crypto', symbol: 'ETH', title: 'خرید اتریوم', description: 'اتریوم پس از اصلاح به حمایت رسیده و آماده صعود است.', action: 'buy', priceAtPublish: 3450, publishedAt: '2026-06-18' },
  { type: 'gold', symbol: 'GOLD18', title: 'خرید طلای ۱۸', description: 'قیمت طلا در کف کانال صعودی قرار گرفته.', action: 'buy', priceAtPublish: 3458000, publishedAt: '2026-06-20', isRial: true },
  { type: 'stock', symbol: 'فولاد', title: 'خرید فولاد مبارکه', description: 'فولاد با حمایت خط روند صعودی به کف رسیده.', action: 'buy', priceAtPublish: 24500, publishedAt: '2026-06-10', isRial: true },
  { type: 'crypto', symbol: 'SOL', title: 'خرید سولانا', description: 'سولانا الگوی صعودی شکسته و می‌تواند تا ۲۰۰ دلار رشد کند.', action: 'buy', priceAtPublish: 142, publishedAt: '2026-06-12' },
  { type: 'stock', symbol: 'خودرو', title: 'خرید ایران خودرو', description: 'خودرو با رشد تولید و گزارش مثبت ماهانه همراه است.', action: 'buy', priceAtPublish: 18200, publishedAt: '2026-06-05', isRial: true },
  { type: 'gold', symbol: 'USD-IRR', title: 'خرید دلار', description: 'دلار با شکست مقاومت می‌تواند تا ۲۰۰ هزار تومان رشد کند.', action: 'buy', priceAtPublish: 1709000, publishedAt: '2026-06-08', isRial: true },
  { type: 'crypto', symbol: 'XRP', title: 'خرید ریپل', description: 'ریپل در پی پیروزی حقوقی صعودی شده.', action: 'buy', priceAtPublish: 0.52, publishedAt: '2026-06-22' },
  { type: 'crypto', symbol: 'ADA', title: 'خرید کاردانو', description: 'کاردانو در آستانه یک بریک‌اوت صعودی قرار دارد.', action: 'buy', priceAtPublish: 0.45, publishedAt: '2026-06-14' },
  { type: 'gold', symbol: 'COIN', title: 'خرید سکه امامی', description: 'سکه امامی به کانال صعودی بازگشته است.', action: 'buy', priceAtPublish: 42500000, publishedAt: '2026-06-17', isRial: true },
]

export async function GET() {
  try {
    const existing = await pool.query('SELECT COUNT(*) FROM signal')
    if (Number(existing.rows[0].count) === 0) {
      for (const s of SEED_SIGNALS) {
        await pool.query(
          'INSERT INTO signal (id, type, symbol, title, description, action, "priceAtPublish", "publishedAt", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())',
          [randomUUID(), s.type, s.symbol, s.title, s.description, s.action, s.priceAtPublish, new Date(s.publishedAt)]
        )
      }
    }

    const { rows: signals } = await pool.query(
      'SELECT * FROM signal ORDER BY "publishedAt" DESC'
    )

    // Fetch current prices
    let currentPrices: PriceMap = {}
    try {
      const res = await fetch(`${process.env.BETTER_AUTH_URL || 'https://a-cap.xyz'}/api/prices`, { signal: AbortSignal.timeout(5000) })
      const data = await res.json()
      if (data.prices) {
        for (const [k, v] of Object.entries(data.prices)) {
          currentPrices[k] = v as { price: number }
        }
      }
      if (data.stockPrices) {
        for (const [k, v] of Object.entries(data.stockPrices)) {
          currentPrices[k.toUpperCase()] = v as { price: number }
        }
      }
    } catch {}

    // Fallback prices for common symbols if missing
    const FALLBACK: Record<string, number> = {
      BTC: 71250, ETH: 3680, SOL: 168, XRP: 0.58, ADA: 0.49,
      'GOLD18': 3620000, 'COIN': 44800000, 'USD-IRR': 1785000,
      'فولاد': 26200, 'خودرو': 19800,
    }

    const enriched = signals.map((s: any) => {
      const currentPrice = currentPrices[s.symbol]?.price ?? FALLBACK[s.symbol] ?? s.priceAtPublish
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
