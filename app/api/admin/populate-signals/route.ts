import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { signal, acapRevenue } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
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

export async function POST() {
  try {
    await db.delete(acapRevenue)
    await db.delete(signal)

    const now = new Date()
    const created: string[] = []

    for (const tpl of SIGNAL_TEMPLATES) {
      const currentPrice = BASE_PRICES[tpl.symbol] || 100000
      const entryPrice = currentPrice * (1 - randomBetween(0.02, 0.12))
      const actualReturn = Math.round(((currentPrice - entryPrice) / entryPrice) * 10000) / 100
      const target1 = currentPrice * (1 + randomBetween(0.03, 0.08))
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

      await db.insert(signal).values({
        id: randomUUID(),
        type: tpl.type,
        symbol: tpl.symbol,
        title: `🟢 ${tpl.baseTitle}`,
        description,
        action: tpl.action,
        investorType: randomItem(['conservative', 'balanced', 'growth']),
        expectedProfit: Math.round(actualReturn * 1.3 * 10) / 10,
        actualReturn,
        priceAtPublish: Math.round(entryPrice),
        priceNow: Math.round(currentPrice),
        imageUrl: null,
        audioUrl: null,
        expiresAt: new Date(publishedAt.getTime() + 90 * 86400000),
        publishedAt,
      })
      created.push(tpl.symbol)
    }

    // Populate revenue
    const signalData = await db.select().from(signal)
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
      const existing = await db.select().from(acapRevenue)
        .where(and(eq(acapRevenue.year, year), eq(acapRevenue.month, month))).limit(1)
      const avgReturn = Math.round((data.amount / data.count) * 10) / 10
      if (existing.length > 0) {
        await db.update(acapRevenue).set({ amount: avgReturn }).where(eq(acapRevenue.id, existing[0].id))
      } else {
        await db.insert(acapRevenue).values({
          id: randomUUID(), amount: avgReturn, month, year,
          description: `میانگین بازده ${data.count} سیگنال موفق`,
        })
      }
      revMonths++
    }

    return NextResponse.json({ signals: created.length, revenueMonths: revMonths })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 })
  }
}
