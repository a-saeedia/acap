import { db } from '@/lib/db'
import { iranStock } from '@/lib/db/schema'
import { ilike, or } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

const DEFAULT_STOCKS = [
  { symbol: 'فولاد', name: 'فولاد مبارکه اصفهان', sector: 'فلزات اساسی' },
  { symbol: 'خودرو', name: 'ایران خودرو', sector: 'خودرو' },
  { symbol: 'وغدیر', name: 'سرمایه گذاری غدیر', sector: 'سرمایه گذاری' },
  { symbol: 'کگل', name: 'گل گهر', sector: 'فلزات اساسی' },
  { symbol: 'فملی', name: 'ملی صنایع مس ایران', sector: 'فلزات اساسی' },
  { symbol: 'شستا', name: 'شستا', sector: 'سرمایه گذاری' },
  { symbol: 'وبملت', name: 'بانک ملت', sector: 'بانک' },
  { symbol: 'وتجارت', name: 'بانک تجارت', sector: 'بانک' },
  { symbol: 'پارسان', name: 'پتروشیمی پارس', sector: 'پتروشیمی' },
  { symbol: 'تاپیکو', name: 'سرمایه گذاری نفت و گاز', sector: 'سرمایه گذاری' },
  { symbol: 'شپنا', name: 'پالایش نفت بندرعباس', sector: 'پالایشی' },
  { symbol: 'شتران', name: 'پالایش نفت تهران', sector: 'پالایشی' },
  { symbol: 'خساپا', name: 'سایپا', sector: 'خودرو' },
  { symbol: 'وبصادر', name: 'بانک صادرات', sector: 'بانک' },
  { symbol: 'رمپنا', name: 'گروه مپنا', sector: 'انرژی' },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  try {
    const existing = await db.select().from(iranStock).limit(1)
    if (existing.length === 0) {
      await db.insert(iranStock).values(
        DEFAULT_STOCKS.map(s => ({ id: randomUUID(), ...s }))
      ).onConflictDoNothing()
    }
  } catch {}

  try {
    let stocks
    if (search) {
      stocks = await db.select()
        .from(iranStock)
        .where(or(ilike(iranStock.symbol, `%${search}%`), ilike(iranStock.name, `%${search}%`)))
    } else {
      stocks = await db.select().from(iranStock)
    }
    return Response.json(stocks.length ? stocks : DEFAULT_STOCKS)
  } catch {
    if (search) {
      const q = search
      return Response.json(DEFAULT_STOCKS.filter(s => s.symbol.includes(q) || s.name.includes(q)))
    }
    return Response.json(DEFAULT_STOCKS)
  }
}
