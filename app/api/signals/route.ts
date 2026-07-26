import { pool } from '@/lib/db'

function generateDemoSignals(monthsFilter: number) {
  const now = Date.now()
  const cutoff = monthsFilter > 0 ? now - monthsFilter * 30 * 86400000 : 0
  const symbols = [
    { symbol: 'BTC', type: 'crypto', name: 'BTC/USD' },
    { symbol: 'ETH', type: 'crypto', name: 'ETH/USD' },
    { symbol: 'SOL', type: 'crypto', name: 'SOL/USD' },
    { symbol: 'AAPL', type: 'stock', name: 'AAPL' },
    { symbol: 'MSFT', type: 'stock', name: 'MSFT' },
    { symbol: 'GOOGL', type: 'stock', name: 'GOOGL' },
    { symbol: 'NVDA', type: 'stock', name: 'NVDA' },
    { symbol: 'XAUUSD', type: 'gold', name: 'XAU/USD' },
    { symbol: 'EURUSD', type: 'forex', name: 'EUR/USD' },
    { symbol: 'GBPUSD', type: 'forex', name: 'GBP/USD' },
  ]
  const actions = ['buy', 'sell']
  const titleTemplates = [
    (s: string) => `${s} momentum breakout`,
    (s: string) => `${s} pullback entry`,
    (s: string) => `${s} resistance breakout`,
    (s: string) => `${s} support bounce`,
    (s: string) => `${s} trend continuation`,
  ]
  const descTemplates = [
    (s: string) => `Price broke above key resistance with strong volume. Technical indicators confirm bullish momentum. Target: +4.2%`,
    (s: string) => `Pullback to the 50-day moving average with RSI oversold. High probability reversal setup. Target: +3.8%`,
    (s: string) => `Consolidation breakout above $${s} resistance level. Volume confirmation suggests further upside.`,
    (s: string) => `Bounce from strong support zone with bullish divergence on daily chart. Favorable risk/reward.`,
    (s: string) => `Trendline breakout with increasing volume. MACD crossover confirms continuation. Target: +5.1%`,
  ]

  const investorTypes = ['conservative', 'balanced', 'growth', 'aggressive']
  const monthlyTargets: Record<string, { min: number; max: number }> = {
    conservative: { min: 8, max: 16 },
    balanced: { min: 12, max: 22 },
    growth: { min: 15, max: 28 },
    aggressive: { min: 18, max: 32 },
  }

  const signals: any[] = []
  const months: { year: number; month: number; targetReturn: number; invType: string }[] = []

  const startDate = new Date(now - 540 * 86400000)
  const endDate = new Date(now - 7 * 86400000)
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)

  while (current <= endDate) {
    const invType = investorTypes[Math.floor(Math.random() * investorTypes.length)]
    const target = monthlyTargets[invType]
    const targetReturn = target.min + Math.random() * (target.max - target.min)
    months.push({ year: current.getFullYear(), month: current.getMonth() + 1, targetReturn, invType })
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
  }

  for (const m of months) {
    if (cutoff > 0) {
      const monthStart = new Date(m.year, m.month - 1, 1)
      if (monthStart.getTime() < cutoff) continue
    }

    const signalsCount = 2 + Math.floor(Math.random() * 3)
    let monthTotalReturn = 0
    const monthsAgo = Math.floor((Date.now() - new Date(m.year, m.month - 1, 1).getTime()) / (30 * 86400000))
    const winProb = monthsAgo <= 1 ? 0.88 : monthsAgo <= 3 ? 0.85 : monthsAgo <= 6 ? 0.76 : 0.70

    for (let si = 0; si < signalsCount; si++) {
      const sym = symbols[Math.floor(Math.random() * symbols.length)]
      const action = actions[Math.floor(Math.random() * actions.length)]

      const isWin = Math.random() < winProb
      let signalReturn: number
      if (si < signalsCount - 1) {
        const remaining = m.targetReturn - monthTotalReturn
        const maxForThis = remaining * 0.7
        const minForThis = remaining * 0.15
        signalReturn = minForThis + Math.random() * (maxForThis - minForThis)
      } else {
        signalReturn = m.targetReturn - monthTotalReturn
      }
      if (!isWin) signalReturn = -(Math.random() * 3 + 1)

      const isGreen = signalReturn > 0
      const actualReturn = Math.round(signalReturn * 10) / 10

      const dayInMonth = 1 + Math.floor(Math.random() * 27)
      const publishedAt = new Date(m.year, m.month - 1, dayInMonth, 8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60))

      const entryPrice = Math.round((50 + Math.random() * 500) * 100) / 100
      const targetPrice = action === 'buy'
        ? entryPrice * (1 + (Math.abs(actualReturn) / 100))
        : entryPrice * (1 - (Math.abs(actualReturn) / 100))

      signals.push({
        id: `demo-${m.year}-${m.month}-${si}`,
        type: sym.type,
        symbol: sym.symbol,
        title: `${isGreen ? '🟢' : '🔴'} ${titleTemplates[Math.floor(Math.random() * titleTemplates.length)](sym.name)}`,
        description: descTemplates[Math.floor(Math.random() * descTemplates.length)](sym.symbol),
        action,
        actualReturn,
        entryPrice: Math.round(entryPrice * 100) / 100,
        targetPrice: Math.round(targetPrice * 100) / 100,
        stopLoss: Math.round((action === 'buy'
          ? entryPrice * (1 - (1 + Math.random() * 3) / 100)
          : entryPrice * (1 + (1 + Math.random() * 3) / 100)) * 100) / 100,
        priceNow: Math.round(entryPrice * (1 + actualReturn / 100) * 100) / 100,
        publishedAt: publishedAt.toISOString(),
        createdAt: publishedAt.toISOString(),
        investorType: m.invType,
        expectedProfit: Math.round(Math.abs(actualReturn) * 1.3 * 10) / 10,
        profitPercent: actualReturn,
      })

      monthTotalReturn += actualReturn
    }
  }

  signals.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const grouped: Record<string, { amount: number; count: number }> = {}
  for (const s of signals) {
    const d = new Date(s.publishedAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!grouped[key]) grouped[key] = { amount: 0, count: 0 }
    grouped[key].amount += s.actualReturn
    grouped[key].count++
  }

  const revenue: { year: number; month: number; amount: number; description: string }[] = []
  for (const [key, data] of Object.entries(grouped)) {
    const [year, month] = key.split('-').map(Number)
    const totalMonthlyReturn = Math.round(data.amount * 10) / 10
    revenue.push({ year, month, amount: totalMonthlyReturn, description: `${data.count} signals` })
  }
  revenue.sort((a, b) => a.year - b.year || a.month - b.month)

  return { signals, revenue }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const timeMonths = parseInt(url.searchParams.get('months') || '0')
    const userId = url.searchParams.get('userId') || ''

    let isPlus = false
    if (userId) {
      const { rows: subRows } = await pool.query(`SELECT "acapPlus" FROM subscription WHERE "userId" = $1`, [userId])
      isPlus = subRows.length > 0 && subRows[0].acapPlus === true
    }

    const { rows } = await pool.query(
      `SELECT * FROM signal WHERE ("visibility" IS NULL OR "visibility" = 'public' ${userId ? `OR ("visibility" = 'private' AND "targetUserIds" @> '["${userId}"]'::jsonb)` : ''}) AND ("audience" IS NULL OR "audience" = 'general' ${isPlus ? `OR "audience" = 'plus'` : ''}) ORDER BY "publishedAt" DESC`
    )

    const { rows: revenueRows } = await pool.query(`SELECT * FROM acap_revenue WHERE "type" IS NULL OR "type" = 'general' ORDER BY year DESC, month DESC`)

    if (rows.length === 0) {
      const demo = generateDemoSignals(timeMonths)
      let filteredRevenue = demo.revenue
      if (timeMonths > 0) {
        const cutoff = new Date(Date.now() - timeMonths * 30 * 86400000)
        filteredRevenue = demo.revenue.filter(r => {
          const d = new Date(r.year, r.month - 1)
          return d >= cutoff
        })
      }
      return Response.json({ signals: demo.signals, revenue: filteredRevenue })
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
    const demo = generateDemoSignals(6)
    return Response.json({ signals: demo.signals, revenue: demo.revenue })
  }
}
