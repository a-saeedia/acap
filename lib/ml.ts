import { pool } from './db'
import { randomUUID } from 'node:crypto'

const WINDOW_SIZE = 30
const ANOMALY_THRESHOLD = 2.5

interface PriceSnapshot {
  symbol: string
  price: number
  timestamp: Date
}

export async function detectAnomalies(prices: Record<string, number>): Promise<{
  symbol: string
  zScore: number
  direction: 'spike' | 'drop' | 'normal'
}[]> {
  const results: {
    symbol: string
    zScore: number
    direction: 'spike' | 'drop' | 'normal'
  }[] = []

  for (const [symbol, currentPrice] of Object.entries(prices)) {
    try {
      const r = await pool.query(
        `SELECT price FROM asset_price WHERE symbol = $1 ORDER BY "updatedAt" DESC LIMIT $2`,
        [symbol, WINDOW_SIZE]
      )

      if (r.rows.length < 5) continue

      const prices = r.rows.map((row: any) => row.price)
      const mean = prices.reduce((a: number, b: number) => a + b, 0) / prices.length
      const variance = prices.reduce((a: number, b: number) => a + (b - mean) ** 2, 0) / prices.length
      const std = Math.sqrt(variance)

      if (std === 0) continue

      const zScore = (currentPrice - mean) / std
      const absZ = Math.abs(zScore)

      let direction: 'spike' | 'drop' | 'normal' = 'normal'
      if (absZ > ANOMALY_THRESHOLD) {
        direction = zScore > 0 ? 'spike' : 'drop'
      }

      if (direction !== 'normal') {
        await pool.query(
          `INSERT INTO ml_anomaly (id, symbol, "zScore", "currentPrice", "meanPrice", "stdPrice", direction, "detectedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [randomUUID(), symbol, zScore, currentPrice, mean, std, direction]
        )
      }

      results.push({ symbol, zScore, direction })
    } catch {}
  }

  return results
}

export function scorePortfolioDiversity(assets: {
  type: string
  value: number
}[]): { score: number; feedback: string[] } {
  const feedback: string[] = []
  if (assets.length === 0) return { score: 0, feedback: ['هیچ دارایی ثبت نشده است'] }

  const totalValue = assets.reduce((s, a) => s + a.value, 0)
  if (totalValue === 0) return { score: 0, feedback: ['ارزش کل صفر است'] }

  const typeConcentration: Record<string, number> = {}
  for (const a of assets) {
    typeConcentration[a.type] = (typeConcentration[a.type] || 0) + a.value / totalValue
  }

  const types = Object.keys(typeConcentration)

  let typeScore = 0
  if (types.length >= 4) typeScore = 100
  else if (types.length === 3) typeScore = 75
  else if (types.length === 2) typeScore = 50
  else typeScore = 25

  const maxConcentration = Math.max(...Object.values(typeConcentration))
  let concentrationScore = 0
  if (maxConcentration < 0.4) concentrationScore = 100
  else if (maxConcentration < 0.6) concentrationScore = 70
  else if (maxConcentration < 0.8) concentrationScore = 40
  else concentrationScore = 20

  const score = Math.round((typeScore + concentrationScore) / 2)

  if (types.length < 3) {
    feedback.push('سبد شما به اندازه کافی متنوع نیست. حداقل ۳ نوع دارایی مختلف اضافه کنید.')
  }
  if (maxConcentration > 0.6) {
    const dominantType = Object.entries(typeConcentration).sort((a, b) => b[1] - a[1])[0][0]
    const typeNames: Record<string, string> = {
      crypto: 'ارز دیجیتال', currency: 'ارز', gold: 'طلا', 'iran-stock': 'سهام بورس',
    }
    feedback.push(`توجه زیادی روی ${typeNames[dominantType] || dominantType} متمرکز شده است.`)
  }
  if (assets.length < 3) {
    feedback.push('تعداد دارایی‌های شما کم است. اضافه کردن دارایی‌های جدید می‌تواند ریسک را کاهش دهد.')
  }

  return { score, feedback }
}

export async function getRecentAnomalies(limit = 20): Promise<{
  symbol: string
  zScore: number
  direction: string
  currentPrice: number
  meanPrice: number
  detectedAt: Date
}[]> {
  try {
    const r = await pool.query(
      `SELECT symbol, "zScore", direction, "currentPrice", "meanPrice", "detectedAt"
       FROM ml_anomaly ORDER BY "detectedAt" DESC LIMIT $1`,
      [limit]
    )
    return r.rows
  } catch { return [] }
}
