const BASE_PRICES: Record<string, number> = {
  فولاد: 25000, خودرو: 8000, وغدیر: 50000, کگل: 35000, فملی: 45000,
  شستا: 15000, وبملت: 7000, وتجارت: 5000, پارسان: 30000, تاپیکو: 40000,
  شپنا: 35000, شتران: 28000, خساپا: 6000, وبصادر: 4500, رمپنا: 20000,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  if (!symbol) {
    return Response.json({ error: 'symbol query param is required' }, { status: 400 })
  }

  const base = BASE_PRICES[symbol] ?? 20000
  const now = Date.now()
  const timeFactor = Math.sin(now / 10000 + symbol.charCodeAt(0) * 10) * 0.03
  const noise = Math.sin(now / 3000 + symbol.length * 50) * 0.01
  const variation = 1 + timeFactor + noise
  const price = Math.round(base * variation)
  const change = Math.round((timeFactor + noise) * 10000) / 100

  return Response.json({ symbol, price, currency: 'IRR', change })
}
