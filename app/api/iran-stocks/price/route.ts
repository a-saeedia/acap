import { calcStockPrice } from '@/lib/prices'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  if (!symbol) {
    return Response.json({ error: 'symbol query param is required' }, { status: 400 })
  }

  const { price, change } = calcStockPrice(symbol)

  return Response.json({ symbol, price, currency: 'IRR', change })
}
