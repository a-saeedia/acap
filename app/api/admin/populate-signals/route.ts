import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { randomUUID } from 'node:crypto'

const SYMBOLS = [
  { type: 'crypto', symbol: 'BTC', name: 'Bitcoin' },
  { type: 'crypto', symbol: 'ETH', name: 'Ethereum' },
  { type: 'crypto', symbol: 'SOL', name: 'Solana' },
  { type: 'stock', symbol: 'AAPL', name: 'Apple' },
  { type: 'stock', symbol: 'MSFT', name: 'Microsoft' },
  { type: 'stock', symbol: 'GOOGL', name: 'Alphabet' },
  { type: 'stock', symbol: 'NVDA', name: 'NVIDIA' },
  { type: 'gold', symbol: 'XAUUSD', name: 'Gold' },
  { type: 'forex', symbol: 'EURUSD', name: 'EUR/USD' },
  { type: 'forex', symbol: 'GBPUSD', name: 'GBP/USD' },
]

const TITLES = [
  (s: string) => `${s} momentum breakout`,
  (s: string) => `${s} pullback entry`,
  (s: string) => `${s} support bounce`,
  (s: string) => `${s} trend continuation`,
  (s: string) => `${s} resistance breakout`,
  (s: string) => `${s} consolidation breakout`,
  (s: string) => `${s} reversal pattern`,
  (s: string) => `${s} channel breakout`,
]

function randomBetween(min: number, max: number) { return min + Math.random() * (max - min) }

export async function GET() {
  return NextResponse.json({ error: 'Use POST' })
}

export async function POST() {
  try {
    await pool.query('DELETE FROM acap_revenue')
    await pool.query('DELETE FROM signal')

    const now = new Date()
    const created: string[] = []

    for (let i = 0; i < 40; i++) {
      const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      const isBuy = Math.random() < 0.55
      const action = isBuy ? 'buy' : 'sell'
      const isWin = Math.random() < 0.62
      const magnitude = isWin
        ? randomBetween(1.5, 5.5)
        : randomBetween(1.0, 3.5)
      const rawReturn = (isBuy ? 1 : -1) * (isWin ? 1 : -1) * magnitude
      const actualReturn = Math.round(rawReturn * 100) / 100

      const entryPrice = Math.round(randomBetween(50, 500) * 100) / 100
      const targetPrice = isBuy
        ? entryPrice * (1 + randomBetween(0.02, 0.08))
        : entryPrice * (1 - randomBetween(0.02, 0.08))
      const stopLoss = isBuy
        ? entryPrice * (1 - randomBetween(0.015, 0.05))
        : entryPrice * (1 + randomBetween(0.015, 0.05))
      const daysAgo = Math.floor(Math.random() * 540)
      const publishedAt = new Date(now.getTime() - daysAgo * 86400000 - Math.random() * 43200000)

      const titleFn = TITLES[Math.floor(Math.random() * TITLES.length)]

      try {
        await pool.query(`INSERT INTO signal (id, type, symbol, title, description, action, "investorType", "expectedProfit", "actualReturn", "priceAtPublish", "priceNow", "imageUrl", "audioUrl", "expiresAt", "publishedAt") 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`, [
          randomUUID(),
          sym.type,
          sym.symbol,
          `${actualReturn >= 0 ? '🟢' : '🔴'} ${titleFn(sym.name)}`,
          `${action === 'buy' ? 'Entry' : 'Short'} at ${entryPrice}. Target ${targetPrice.toFixed(2)}, stop ${stopLoss.toFixed(2)}. Risk/reward favorable with strong technical confirmation.`,
          action,
          ['conservative', 'balanced', 'growth'][Math.floor(Math.random() * 3)],
          Math.round(Math.abs(actualReturn) * 1.3 * 10) / 10,
          actualReturn,
          Math.round(entryPrice),
          Math.round(entryPrice * (1 + actualReturn / 100)),
          null,
          null,
          new Date(publishedAt.getTime() + 90 * 86400000),
          publishedAt,
        ])
      } catch (insertErr: any) {
        return NextResponse.json({ error: `Insert failed: ${insertErr.message}`, code: insertErr.code }, { status: 500 })
      }
      created.push(sym.symbol)
    }

    const { rows: signalData } = await pool.query(`SELECT * FROM signal ORDER BY "publishedAt" DESC`)
    const monthlyRevenue: Record<string, { amount: number; count: number }> = {}
    for (const s of signalData) {
      if (!s.actualReturn) continue
      const d = s.publishedAt ? new Date(s.publishedAt) : new Date()
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyRevenue[key]) monthlyRevenue[key] = { amount: 0, count: 0 }
      monthlyRevenue[key].amount += s.actualReturn
      monthlyRevenue[key].count++
    }
    let revMonths = 0
    for (const [key, data] of Object.entries(monthlyRevenue)) {
      const [year, month] = key.split('-').map(Number)
      const avgReturn = Math.round((data.amount / data.count) * 10) / 10
      await pool.query(`INSERT INTO acap_revenue (id, amount, month, year, description) VALUES ($1, $2, $3, $4, $5)`, [
        randomUUID(), avgReturn, month, year, `${data.count} signals`,
      ])
      revMonths++
    }

    return NextResponse.json({ signals: created.length, revenueMonths: revMonths })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 })
  }
}
