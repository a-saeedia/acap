const COINGECKO = 'https://api.coingecko.com/api/v3'
const NOBITEX = 'https://api.nobitex.ir'

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
    const res = await fetch(`${NOBITEX}/market/stats`, { next: { revalidate: 120 } })
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
    const res = await fetch('https://api.currencyapi.com/v3/latest?apikey=cur_live_demo&base_currency=XAU', {
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    if (data.data?.USD) return { GOLD: { price: Math.round(1 / data.data.USD.value * 100) / 100, currency: 'USD' } }
  } catch {}
  return {}
}

export async function fetchAllPrices(): Promise<PriceMap> {
  const [crypto, nobitex, gold] = await Promise.all([
    fetchCryptoPrices(['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRX']),
    fetchNobitexPrices(),
    fetchGoldPrices(),
  ])
  return { ...crypto, ...nobitex, ...gold }
}
