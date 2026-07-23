import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { randomUUID } from 'node:crypto'
import { toJalaali } from 'jalaali-js'

const RISKS = ['کم', 'متوسط', 'متوسط', 'متوسط', 'زیاد']
const HORIZONS = ['1 تا 3 ماه', '3 تا 6 ماه', '6 تا 12 ماه']

function randomItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randomBetween(min: number, max: number): number { return min + Math.random() * (max - min) }
function priceWithCommas(n: number): string { return n.toLocaleString('fa-IR') }

const SIGNAL_TEMPLATES = [
  { type: 'crypto', symbol: 'BTC', baseTitle: 'بیت‌کوین', action: 'buy',
    desc: 'خرید در محدوده حمایتی پس از اصلاح قیمت.\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n🎯 هدف سوم: {target3}\n\n🛑 حد ضرر: {stoploss}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}\n⏳ افق سرمایه‌گذاری: {horizon}' },
  { type: 'crypto', symbol: 'ETH', baseTitle: 'اتریوم', action: 'buy',
    desc: 'اتریوم در کانال صعودی قرار دارد.\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n🛑 حد ضرر: {stoploss}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}' },
  { type: 'crypto', symbol: 'SOL', baseTitle: 'سولانا', action: 'buy',
    desc: 'سولانا با رشد اکوسیستم دیفای، آماده صعود.\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}' },
  { type: 'crypto', symbol: 'BNB', baseTitle: 'بایننس کوین', action: 'buy',
    desc: 'BNB با رشد اکوسیستم و سوزاندن سکه‌ها.\n\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n🛑 حد ضرر: {stoploss}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}' },
  { type: 'gold', symbol: 'GOLD18', baseTitle: 'طلای ۱۸ عیار', action: 'buy',
    desc: 'قیمت طلا به محدوده حمایتی رسیده.\n\n💰 محدوده ورود: {entry}\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}\n⏳ افق سرمایه‌گذاری: {horizon}' },
  { type: 'gold', symbol: 'COIN', baseTitle: 'سکه امامی', action: 'buy',
    desc: 'سکه پس از برخورد به حمایت اصلی برگشته.\n\n💰 محدوده ورود: {entry}\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}' },
  { type: 'dollar', symbol: 'USD-IRR', baseTitle: 'دلار آمریکا', action: 'buy',
    desc: 'دلار در محدوده حمایتی قرار گرفته.\n\n💰 محدوده ورود: {entry}\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}' },
  { type: 'forex', symbol: 'EUR-IRR', baseTitle: 'یورو', action: 'buy',
    desc: 'یورو در کف کانال قرار دارد.\n\n💰 محدوده ورود: {entry}\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}' },
  { type: 'stock', symbol: 'فولاد', baseTitle: 'فولاد مبارکه', action: 'buy',
    desc: 'فولاد با گزارش‌های مثبت فصلی.\n\n💰 محدوده ورود: {entry}\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n🎯 هدف سوم: {target3}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}\n⏳ افق سرمایه‌گذاری: {horizon}' },
  { type: 'stock', symbol: 'فملی', baseTitle: 'ملی مس ایران', action: 'buy',
    desc: 'فملی با رشد قیمت مس جهانی.\n\n💰 محدوده ورود: {entry}\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}' },
  { type: 'stock', symbol: 'خودرو', baseTitle: 'ایران خودرو', action: 'buy',
    desc: 'خودرو با رشد تولید.\n\n💰 محدوده ورود: {entry}\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}' },
  { type: 'stock', symbol: 'شپنا', baseTitle: 'پالایش نفت اصفهان', action: 'buy',
    desc: 'شپنا با حاشیه سود مناسب.\n\n💰 محدوده ورود: {entry}\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}' },
  { type: 'stock', symbol: 'وبملت', baseTitle: 'بانک ملت', action: 'buy',
    desc: 'وبملت با رشد سودآوری.\n\n💰 محدوده ورود: {entry}\n🎯 هدف اول: {target1}\n🎯 هدف دوم: {target2}\n\n📊 درجه اطمینان: {confidence}/10\n⚠️ ریسک: {risk}' },
]

const BASE_PRICES: Record<string, number> = {
  BTC: 7200000000, ETH: 480000000, SOL: 52000000, BNB: 240000000,
  GOLD18: 48000000, COIN: 620000000,
  'USD-IRR': 1850000, 'EUR-IRR': 2050000,
  فولاد: 45000, فملی: 32000, خودرو: 18000, شپنا: 25000, وبملت: 15000,
}

function fillTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '—')
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('debug')) {
    const { rows } = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'signal' ORDER BY ordinal_position`)
    return NextResponse.json({ columns: rows })
  }
  return NextResponse.json({ error: 'Use POST' })
}

export async function POST(req: Request) {
  try {
    await pool.query('DELETE FROM acap_revenue')
    await pool.query('DELETE FROM signal')

    const now = new Date()
    const created: string[] = []

    for (const tpl of SIGNAL_TEMPLATES) {
      const currentPrice = BASE_PRICES[tpl.symbol] || 100000
      const entryPrice = currentPrice * (1 - randomBetween(0.02, 0.12))
      const actualReturn = Math.round(((currentPrice - entryPrice) / entryPrice) * 10000) / 100
      const target1 = entryPrice * (1 + randomBetween(0.03, 0.08))
      const target2 = target1 * (1 + randomBetween(0.03, 0.07))
      const target3 = target2 * (1 + randomBetween(0.02, 0.05))
      const stoploss = entryPrice * (1 - randomBetween(0.03, 0.08))
      const confidence = Math.floor(randomBetween(6.5, 9.5) * 10) / 10
      const daysAgo = Math.floor(Math.random() * 90)
      const publishedAt = new Date(now.getTime() - daysAgo * 86400000 - Math.random() * 86400000)

      const description = fillTemplate(tpl.desc, {
        entry: priceWithCommas(entryPrice),
        target1: priceWithCommas(target1),
        target2: priceWithCommas(target2),
        target3: priceWithCommas(target3),
        stoploss: priceWithCommas(stoploss),
        confidence: confidence.toString(),
        risk: randomItem(RISKS),
        horizon: randomItem(HORIZONS),
      })

      try {
        await pool.query(`INSERT INTO signal (id, type, symbol, title, description, action, "investorType", "expectedProfit", "actualReturn", "priceAtPublish", "priceNow", "imageUrl", "audioUrl", "expiresAt", "publishedAt") 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`, [
          randomUUID(),
          tpl.type,
          tpl.symbol,
          `🟢 ${tpl.baseTitle}`,
          description,
          tpl.action,
          randomItem(['conservative', 'balanced', 'growth']),
          Math.round(actualReturn * 1.3 * 10) / 10,
          actualReturn,
          Math.round(entryPrice),
          Math.round(currentPrice),
          null,
          null,
          new Date(publishedAt.getTime() + 90 * 86400000),
          publishedAt,
        ])
      } catch (insertErr: any) {
        return NextResponse.json({ error: `Insert failed for ${tpl.symbol}: ${insertErr.message}`, code: insertErr.code, detail: insertErr.detail, hint: insertErr.hint, position: insertErr.position }, { status: 500 })
      }
      created.push(tpl.symbol)
    }

    // Populate revenue
    const { rows: signalData } = await pool.query(`SELECT * FROM signal ORDER BY "publishedAt" DESC`)
    const monthlyRevenue: Record<string, { amount: number; count: number }> = {}
    for (const s of signalData) {
      if (!s.actualReturn || s.actualReturn <= 0) continue
      const d = s.publishedAt ? new Date(s.publishedAt) : new Date()
      const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
      const key = `${j.jy}-${String(j.jm).padStart(2, '0')}`
      if (!monthlyRevenue[key]) monthlyRevenue[key] = { amount: 0, count: 0 }
      monthlyRevenue[key].amount += s.actualReturn
      monthlyRevenue[key].count++
    }
    let revMonths = 0
    for (const [key, data] of Object.entries(monthlyRevenue)) {
      const [year, month] = key.split('-').map(Number)
      const { rows: existing } = await pool.query(`SELECT id FROM acap_revenue WHERE year = $1 AND month = $2 LIMIT 1`, [year, month])
      const avgReturn = Math.round((data.amount / data.count) * 10) / 10
      if (existing.length > 0) {
        await pool.query(`UPDATE acap_revenue SET amount = $1 WHERE id = $2`, [avgReturn, existing[0].id])
      } else {
        await pool.query(`INSERT INTO acap_revenue (id, amount, month, year, description) VALUES ($1, $2, $3, $4, $5)`, [
          randomUUID(), avgReturn, month, year, `میانگین بازده ${data.count} سیگنال موفق`,
        ])
      }
      revMonths++
    }

    return NextResponse.json({ signals: created.length, revenueMonths: revMonths })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error', stack: e.stack?.substring(0, 500) }, { status: 500 })
  }
}
