const COINGECKO = 'https://api.coingecko.com/api/v3'
const METALS = 'https://api.metals.live/v1/spot/gold'

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', BNB: 'binancecoin',
  SOL: 'solana', XRP: 'ripple', ADA: 'cardano', DOGE: 'dogecoin',
  DOT: 'polkadot', MATIC: 'matic-network', SHIB: 'shiba-inu',
  TRX: 'tron', AVAX: 'avalanche-2', LINK: 'chainlink',
}

export type PriceMap = Record<string, { price: number; currency: string }>

export async function fetchCryptoPrices(symbols: string[]): Promise<PriceMap> {
  const geckoSymbols = symbols.filter(s => COINGECKO_IDS[s]).map(s => COINGECKO_IDS[s])
  if (geckoSymbols.length === 0) return {}

  const url = `${COINGECKO}/simple/price?ids=${geckoSymbols.join(',')}&vs_currencies=usd`
  try {
    const res = await fetch(url, { next: { revalidate: 120 } })
    const data = await res.json()
    const result: PriceMap = {}
    for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
      if (data[id]?.usd) result[symbol] = { price: data[id].usd, currency: 'USD' }
    }
    return result
  } catch { return {} }
}

export async function fetchNobitexPrices(): Promise<PriceMap> {
  try {
    const res = await fetch('https://api.nobitex.ir/market/stats', { next: { revalidate: 120 } })
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
  } catch { return {} }
}

export async function fetchGoldPrices(): Promise<PriceMap> {
  try {
    const res = await fetch(METALS, { next: { revalidate: 300 } })
    const data = await res.json()
    if (data?.gold?.price) {
      return { GOLD: { price: data.gold.price, currency: 'USD' } }
    }
  } catch {}
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
