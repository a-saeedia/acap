import { pool } from '@/lib/db'
import { fetchAllPrices, calcStockPrice, DEFAULT_STOCKS, fetchIrrRate } from '@/lib/prices'
import { randomUUID } from 'node:crypto'

export async function GET() {
  const prices = await fetchAllPrices()

  for (const [symbol, data] of Object.entries(prices)) {
    try {
      const exists = await pool.query('SELECT id FROM asset_price WHERE symbol = $1 LIMIT 1', [symbol])
      if (exists.rows.length === 0) {
        await pool.query(
          'INSERT INTO asset_price (id, type, symbol, price, currency, source, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
          [randomUUID(), 'crypto', symbol, data.price, data.currency, 'api']
        )
      } else {
        await pool.query('UPDATE asset_price SET price = $1, "updatedAt" = NOW() WHERE symbol = $2', [data.price, symbol])
      }
    } catch (e) { console.error(`price store error for ${symbol}:`, e) }
  }

  if (!prices['USDT-IRR']) {
    let rate = 0
    try {
      const r = await pool.query(`SELECT price FROM asset_price WHERE symbol = 'USDT-IRR' ORDER BY "updatedAt" DESC LIMIT 1`)
      if (r.rows.length > 0 && r.rows[0].price > 0) rate = r.rows[0].price
    } catch (e) { console.error('USDT-IRR DB fallback error:', e) }
    if (!rate) {
      try { rate = (await fetchIrrRate()).rate } catch {}
    }
    if (rate > 0) {
      prices['USDT-IRR'] = { price: rate, currency: 'IRR' }
      prices['USD-IRR'] = { price: rate, currency: 'IRR' }
      if (prices['BTC']?.price) {
        prices['BTC-IRR'] = { price: Math.round(prices['BTC'].price * rate), currency: 'IRR' }
      }
      if (prices['GOLD']?.price) {
        prices['GOLD-IRR'] = { price: Math.round(prices['GOLD'].price * rate / 31.1), currency: 'IRR' }
      }
    }
  }

  let stocks: any[] = []
  try {
    const r = await pool.query('SELECT symbol, name, sector FROM iran_stock')
    stocks = r.rows
  } catch (e) { console.error('fetch stocks error:', e) }

  if (stocks.length === 0) {
    try {
      for (const s of DEFAULT_STOCKS) {
        await pool.query(
          'INSERT INTO iran_stock (id, symbol, name, sector) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [randomUUID(), s.symbol, s.name, s.sector]
        )
      }
      stocks = DEFAULT_STOCKS
    } catch (e) { console.error('seed stocks error:', e) }
  }

  const stockPrices: Record<string, { price: number; change: number }> = {}
  for (const stock of stocks) {
    const sp = calcStockPrice(stock.symbol)
    stockPrices[stock.symbol] = sp
    try {
      const exists = await pool.query('SELECT id FROM asset_price WHERE symbol = $1 LIMIT 1', [stock.symbol])
      if (exists.rows.length === 0) {
        await pool.query(
          'INSERT INTO asset_price (id, type, symbol, price, currency, source, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
          [randomUUID(), 'iran-stock', stock.symbol, sp.price, 'IRR', 'api']
        )
      } else {
        await pool.query('UPDATE asset_price SET price = $1, "updatedAt" = NOW() WHERE symbol = $2', [sp.price, stock.symbol])
      }
    } catch (e) { console.error(`stock price store error for ${stock.symbol}:`, e) }
  }

  return Response.json({ prices, stockPrices })
}
