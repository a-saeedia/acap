const COINGECKO = 'https://api.coingecko.com/api/v3'
const FETCH_OPTS = { signal: AbortSignal.timeout(8000) }

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', BNB: 'binancecoin',
  SOL: 'solana', XRP: 'ripple', ADA: 'cardano', DOGE: 'dogecoin',
  DOT: 'polkadot', MATIC: 'matic-network', SHIB: 'shiba-inu',
  TRX: 'tron', AVAX: 'avalanche-2', LINK: 'chainlink',
}

const STOCK_BASE_PRICES: Record<string, number> = {
  فولاد: 25000, خودرو: 8000, وغدیر: 50000, کگل: 35000, فملی: 45000,
  شستا: 15000, وبملت: 7000, وتجارت: 5000, پارسان: 30000, تاپیکو: 40000,
  شپنا: 35000, شتران: 28000, خساپا: 6000, وبصادر: 4500, رمپنا: 20000,
}

export type PriceMap = Record<string, { price: number; currency: string }>

export function calcStockPrice(symbol: string): { price: number; change: number } {
  const base = STOCK_BASE_PRICES[symbol] ?? 20000
  const now = Date.now()
  const timeFactor = Math.sin(now / 10000 + symbol.charCodeAt(0) * 10) * 0.03
  const noise = Math.sin(now / 3000 + symbol.length * 50) * 0.01
  const variation = 1 + timeFactor + noise
  const price = Math.round(base * variation)
  const change = Math.round((timeFactor + noise) * 10000) / 100
  return { price, change }
}

export async function fetchCryptoPrices(symbols: string[]): Promise<PriceMap> {
  const geckoSymbols = symbols.filter(s => COINGECKO_IDS[s]).map(s => COINGECKO_IDS[s])
  if (geckoSymbols.length === 0) return {}

  const url = `${COINGECKO}/simple/price?ids=${geckoSymbols.join(',')}&vs_currencies=usd`
  try {
    const res = await fetch(url, { ...FETCH_OPTS, next: { revalidate: 120 } })
    const data = await res.json()
    const result: PriceMap = {}
    for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
      if (data[id]?.usd) result[symbol] = { price: data[id].usd, currency: 'USD' }
    }
    return result
  } catch (e) { console.error('fetchCryptoPrices error:', e); return {} }
}

export async function fetchNobitexPrices(): Promise<PriceMap> {
  try {
    const res = await fetch('https://api.nobitex.ir/market/stats', { ...FETCH_OPTS, next: { revalidate: 120 } })
    const data = await res.json()
    const result: PriceMap = {}
    if (data.stats) {
      for (const [key, val] of Object.entries(data.stats) as [string, any][]) {
        if (val?.latest) {
          const symbol = key.split('-')[0]?.toUpperCase()
          result[symbol] = { price: Number(val.latest), currency: 'IRR' }
        }
      }
    }
    return result
  } catch (e) { console.error('fetchNobitexPrices error:', e); return {} }
}

export async function fetchGoldPrices(): Promise<PriceMap> {
  try {
    const res = await fetch('https://api.coinbase.com/v2/prices/XAU-USD/spot', { ...FETCH_OPTS, next: { revalidate: 120 } })
    const data = await res.json()
    const price = parseFloat(data?.data?.amount)
    if (price > 0) return { GOLD: { price, currency: 'USD' } }
  } catch (e) { console.error('fetchGoldPrices coinbase error:', e) }
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xau.json', { ...FETCH_OPTS, next: { revalidate: 300 } })
    const data = await res.json()
    const price = data?.xau?.usd
    if (price > 0) return { GOLD: { price, currency: 'USD' } }
  } catch (e) { console.error('fetchGoldPrices fallback error:', e) }
  return {}
}

export async function fetchAllPrices(): Promise<PriceMap> {
  const [crypto, nobitex, gold] = await Promise.all([
    fetchCryptoPrices(['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRX']),
    fetchNobitexPrices(),
    fetchGoldPrices(),
  ])

  const prices: PriceMap = { ...crypto, ...nobitex, ...gold }

  const usdtIrr = nobitex['USDT']?.price

  if (usdtIrr) {
    prices['USDT'] = { price: 1, currency: 'USD' }
    prices['USDT-IRR'] = { price: usdtIrr, currency: 'IRR' }
    prices['USD'] = { price: 1, currency: 'USD' }
    prices['USD-IRR'] = { price: usdtIrr, currency: 'IRR' }

    if (prices['BTC']?.price) {
      prices['BTC-IRR'] = { price: Math.round(prices['BTC'].price * usdtIrr), currency: 'IRR' }
    }

    if (prices['GOLD']?.price) {
      prices['GOLD-IRR'] = { price: Math.round(prices['GOLD'].price * usdtIrr / 31.1), currency: 'IRR' }
    }
  }

  return prices
}
