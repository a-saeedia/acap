const BASE_PRICES: Record<string, number> = {
  فولاد: 25000, خودرو: 8000, وغدیر: 50000, کگل: 35000, فملی: 45000,
  شستا: 15000, وبملت: 7000, وتجارت: 5000, پارسان: 30000, تاپیکو: 40000,
  شپنا: 35000, شتران: 28000, خساپا: 6000, وبصادر: 4500, رمپنا: 20000,
}

function hashSymbol(symbol: string): number {
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    const char = symbol.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  if (!symbol) {
    return Response.json({ error: 'symbol query param is required' }, { status: 400 })
  }

  const base = BASE_PRICES[symbol] ?? 20000
  const h = hashSymbol(symbol)
  const variation = 1 + ((h % 1001) - 500) / 10000
  const price = Math.round(base * variation)
  const change = Math.round(((h % 301) - 150) * 100) / 10000

  return Response.json({ symbol, price, currency: 'IRR', change })
}
