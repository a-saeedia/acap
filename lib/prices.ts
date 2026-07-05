const COINGECKO = 'https://api.coingecko.com/api/v3'
const TGJU_AJAX = 'https://call2.tgju.org/ajax.json'
const TGJU_HTML = 'https://www.tgju.org/'
const TSETMC_API = 'https://cdn.tsetmc.com/api'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const FETCH_OPTS = { signal: AbortSignal.timeout(4000), headers: { 'User-Agent': UA } }
const TGJU_FETCH_OPTS = { signal: AbortSignal.timeout(4000), headers: { 'User-Agent': UA, Accept: 'text/html,application/json,*/*' } }
// Last-resort fallback rate (1709000 Rial ≈ 170900 Toman per USD, from TGJU live data)
const FALLBACK_USD_RATE = 1709000

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', BNB: 'binancecoin',
  SOL: 'solana', XRP: 'ripple', ADA: 'cardano', DOGE: 'dogecoin',
  DOT: 'polkadot', MATIC: 'matic-network', SHIB: 'shiba-inu',
  TRX: 'tron', AVAX: 'avalanche-2', LINK: 'chainlink',
}

export const DEFAULT_STOCKS = [
  { symbol: 'فولاد', name: 'فولاد مبارکه اصفهان', sector: 'فلزات اساسی', tsetmcSearch: 'فولاد' },
  { symbol: 'خودرو', name: 'ایران خودرو', sector: 'خودرو', tsetmcSearch: 'خودرو' },
  { symbol: 'وغدیر', name: 'سرمایه گذاری غدیر', sector: 'سرمایه گذاری', tsetmcSearch: 'وغدیر' },
  { symbol: 'کگل', name: 'گل گهر', sector: 'فلزات اساسی', tsetmcSearch: 'کگل' },
  { symbol: 'فملی', name: 'ملی صنایع مس ایران', sector: 'فلزات اساسی', tsetmcSearch: 'فملی' },
  { symbol: 'شستا', name: 'شستا', sector: 'سرمایه گذاری', tsetmcSearch: 'شستا' },
  { symbol: 'وبملت', name: 'بانک ملت', sector: 'بانک', tsetmcSearch: 'وبملت' },
  { symbol: 'وتجارت', name: 'بانک تجارت', sector: 'بانک', tsetmcSearch: 'وتجارت' },
  { symbol: 'پارسان', name: 'پتروشیمی پارس', sector: 'پتروشیمی', tsetmcSearch: 'پارسان' },
  { symbol: 'تاپیکو', name: 'سرمایه گذاری نفت و گاز', sector: 'سرمایه گذاری', tsetmcSearch: 'تاپیکو' },
  { symbol: 'شپنا', name: 'پالایش نفت بندرعباس', sector: 'پالایشی', tsetmcSearch: 'شپنا' },
  { symbol: 'شتران', name: 'پالایش نفت تهران', sector: 'پالایشی', tsetmcSearch: 'شتران' },
  { symbol: 'خساپا', name: 'سایپا', sector: 'خودرو', tsetmcSearch: 'خساپا' },
  { symbol: 'وبصادر', name: 'بانک صادرات', sector: 'بانک', tsetmcSearch: 'وبصادر' },
  { symbol: 'رمپنا', name: 'گروه مپنا', sector: 'انرژی', tsetmcSearch: 'رمپنا' },
]

export type PriceMap = Record<string, { price: number; currency: string; change?: number }>

function parseTgjuPrice(val: string): number {
  return Number(val.replace(/,/g, ''))
}

async function fetchTgjuHTML(): Promise<{ prices: PriceMap; irrRate: number; timestamp: string }> {
  try {
    const res = await fetch(TGJU_HTML, { cache: 'no-store', next: { revalidate: 0 }, ...TGJU_FETCH_OPTS })
    if (!res.ok) return { prices: {}, irrRate: 0, timestamp: '' }
    const html = await res.text()
    
    const prices: PriceMap = {}
    let irrRate = 0
    
    const extractPrice = (selector: string): number | null => {
      const regex = new RegExp(`data-market-row="${selector}"[^>]*data-price="([\\d,]+)"`)
      const match = html.match(regex)
      if (match) return parseTgjuPrice(match[1])
      const regex2 = new RegExp(`data-market-row="${selector}"[^>]*>.*?<td[^>]*class="[^"]*nf[^"]*"[^>]*>([\\d,]+)</td>`, 's')
      const match2 = html.match(regex2)
      if (match2) return parseTgjuPrice(match2[1])
      return null
    }
    const extractChange = (selector: string): number | null => {
      const regex = new RegExp(`data-market-row="${selector}"[^>]*data-change-percent="([\\d.-]+)"`)
      const match = html.match(regex)
      if (match) return parseFloat(match[1])
      return null
    }
    
    const setWithChange = (sym: string, price: number, currency: string, slug: string) => {
      const change = extractChange(slug)
      prices[sym] = { price, currency, ...(change !== null ? { change } : {}) }
    }
    
    const usdPrice = extractPrice('price_dollar_rl')
    if (usdPrice) {
      irrRate = usdPrice
      prices['USD'] = { price: 1, currency: 'USD' }
      setWithChange('USD-IRR', irrRate, 'IRR', 'price_dollar_rl')
      prices['USDT-IRR'] = { price: irrRate, currency: 'IRR', change: prices['USD-IRR']?.change }
    }
    
    const forexPairs: Record<string, string> = {
      price_eur: 'EUR', price_aed: 'AED', price_gbp: 'GBP',
      price_try: 'TRY', price_chf: 'CHF', price_cny: 'CNY',
      price_cad: 'CAD', price_aud: 'AUD', price_sgd: 'SGD',
      price_inr: 'INR', price_sar: 'SAR', price_kwd: 'KWD',
      price_myr: 'MYR', price_rub: 'RUB', price_azn: 'AZN',
    }
    for (const [slug, sym] of Object.entries(forexPairs)) {
      const p = extractPrice(slug)
      if (p) {
        prices[sym] = { price: 1, currency: 'USD' }
        setWithChange(`${sym}-IRR`, p, 'IRR', slug)
      }
    }
    
    const goldSlugs: Record<string, string> = {
      geram18: 'GOLD18', geram24: 'GOLD24', sekee: 'COIN',
      nim: 'HALF_COIN', rob: 'QUARTER_COIN',
      mesghal: 'MESGHAL',
    }
    for (const [slug, sym] of Object.entries(goldSlugs)) {
      const p = extractPrice(slug)
      if (p) setWithChange(sym, p, 'IRR', slug)
    }
    
    const cryptoIrSlugs: Record<string, string> = {
      'crypto-bitcoin-irr': 'BTC-IRR',
      'crypto-ethereum-irr': 'ETH-IRR',
      'crypto-tether-irr': 'USDT-IRR',
      'crypto-dash-irr': 'DASH-IRR',
      'crypto-ripple-irr': 'XRP-IRR',
      'crypto-litecoin-irr': 'LTC-IRR',
    }
    for (const [slug, sym] of Object.entries(cryptoIrSlugs)) {
      const p = extractPrice(slug)
      if (p) setWithChange(sym, p, 'IRR', slug)
    }
    
    const timestampMatch = html.match(/data-last-update="([^"]+)"/)
    const timestamp = timestampMatch ? timestampMatch[1] : ''
    
    // Fill missing gold/coin items from the TGJU AJAX tolerance arrays (always accurate)
    if (irrRate > 0) {
      try {
        const rev = Math.random().toString(36).substring(2, 12)
        const ajaxRes = await fetch(`${TGJU_AJAX}?rev=${rev}`, {
          cache: 'no-store', ...TGJU_FETCH_OPTS,
        })
        if (ajaxRes.ok) {
          const ajaxData = await ajaxRes.json()
          const toleranceNameMap: Record<string, string> = {
            geram18: 'GOLD18', geram24: 'GOLD24',
            sekee: 'COIN', sekeb: 'COIN',
            nim: 'HALF_COIN', rob: 'QUARTER_COIN',
            mesghal: 'MESGHAL',
          }
          for (const arr of [ajaxData.tolerance_high ?? [], ajaxData.tolerance_low ?? []]) {
            for (const item of arr) {
              const sym = toleranceNameMap[item.name]
              if (sym && item.p) {
                const p = parseTgjuPrice(item.p)
                if (p > 0) prices[sym] = { price: p, currency: 'IRR', ...(item.dp ? { change: parseFloat(item.dp) } : {}) }
              }
            }
          }
        }
      } catch {}
      // Also fetch coin page for nim/rob if still missing from AJAX tolerances
      for (const [slug, sym] of Object.entries({ nim: 'HALF_COIN', rob: 'QUARTER_COIN' })) {
        if (prices[sym]) continue
        try {
          const coinRes = await fetch('https://www.tgju.org/coin', {
            cache: 'no-store', ...TGJU_FETCH_OPTS,
          })
          if (coinRes.ok) {
            const coinHtml = await coinRes.text()
            // Only match the FIRST row in the "قیمت نقدی" section (before the next <thead>)
            const sectionMatch = coinHtml.match(new RegExp(`<tr data-market-row="${slug}".*?<td[^>]*class="[^"]*nf[^"]*"[^>]*data-price="([\\d,]+)"`, 's'))
            if (sectionMatch) setWithChange(sym, parseTgjuPrice(sectionMatch[1]), 'IRR', slug)
          }
        } catch {}
      }
    }
    
    return { prices, irrRate, timestamp }
  } catch { return { prices: {}, irrRate: 0, timestamp: '' } }
}

export async function fetchTgjuData(): Promise<{
  prices: PriceMap
  irrRate: number
  timestamp: string
}> {
  // Try HTML scrape first (works reliably from any IP)
  const htmlResult = await fetchTgjuHTML()
  if (htmlResult.prices && Object.keys(htmlResult.prices).length > 0 && htmlResult.irrRate > 0) {
    return htmlResult
  }
  
  // Fallback: single AJAX endpoint (try once)
  const rev = Math.random().toString(36).substring(2, 12)
  const ajaxUrls = [`${TGJU_AJAX}?rev=${rev}`]
  
  for (const url of ajaxUrls) {
    try {
      const res = await fetch(url, { 
        cache: 'no-store',
        next: { revalidate: 0 },
        ...TGJU_FETCH_OPTS,
      })
      if (!res.ok) continue
      const data = await res.json()
      if (!data?.current) continue

      const c = data.current
      const prices: PriceMap = {}
      const timestamp = c.price_dollar_rl?.ts || ''

      const rawUsd = c.price_dollar_rl?.p
      if (!rawUsd) continue
      const irrRate = parseTgjuPrice(rawUsd)

      prices['USD'] = { price: 1, currency: 'USD' }
      prices['USD-IRR'] = { price: irrRate, currency: 'IRR' }
      prices['USDT-IRR'] = { price: irrRate, currency: 'IRR' }

      const forexPairs: Record<string, string> = {
        price_eur: 'EUR', price_aed: 'AED', price_gbp: 'GBP',
        price_try: 'TRY', price_chf: 'CHF', price_cny: 'CNY',
        price_cad: 'CAD', price_aud: 'AUD', price_sgd: 'SGD',
        price_inr: 'INR', price_sar: 'SAR', price_kwd: 'KWD',
        price_myr: 'MYR', price_rub: 'RUB', price_azn: 'AZN',
      }
      for (const [slug, sym] of Object.entries(forexPairs)) {
        if (c[slug]?.p) {
          prices[sym] = { price: 1, currency: 'USD' }
          prices[`${sym}-IRR`] = { price: parseTgjuPrice(c[slug].p), currency: 'IRR' }
        }
      }

      // Gold/coin from current object directly
      const goldSlugs: Record<string, string> = {
        geram18: 'GOLD18', geram24: 'GOLD24', sekee: 'COIN',
        nim: 'HALF_COIN', rob: 'QUARTER_COIN',
        mesghal: 'MESGHAL',
      }
      for (const [slug, sym] of Object.entries(goldSlugs)) {
        if (c[slug]?.p) {
          prices[sym] = { price: parseTgjuPrice(c[slug].p), currency: 'IRR' }
        }
      }

      // TGJU stores some gold/coin items in tolerance_high/tolerance_low arrays
      const toleranceNameMap: Record<string, string> = {
        geram18: 'GOLD18', geram24: 'GOLD24',
        sekee: 'COIN', sekeb: 'COIN',
        nim: 'HALF_COIN', rob: 'QUARTER_COIN',
        mesghal: 'MESGHAL',
      }
      for (const arr of [data.tolerance_high ?? [], data.tolerance_low ?? []]) {
        for (const item of arr) {
          const sym = toleranceNameMap[item.name]
          if (sym && item.p) {
            const p = parseTgjuPrice(item.p)
            if (p > 0) prices[sym] = { price: p, currency: 'IRR' }
          }
        }
      }

      const cryptoIrSlugs: Record<string, string> = {
        'crypto-bitcoin-irr': 'BTC-IRR',
        'crypto-ethereum-irr': 'ETH-IRR',
        'crypto-tether-irr': 'USDT-IRR',
        'crypto-dash-irr': 'DASH-IRR',
        'crypto-ripple-irr': 'XRP-IRR',
        'crypto-litecoin-irr': 'LTC-IRR',
      }
      for (const [slug, sym] of Object.entries(cryptoIrSlugs)) {
        if (c[slug]?.p) {
          prices[sym] = { price: parseTgjuPrice(c[slug].p), currency: 'IRR' }
        }
      }

      return { prices, irrRate, timestamp }
    } catch {
      continue
    }
  }
  
  return { prices: {}, irrRate: 0, timestamp: '' }
}

export async function fetchTsetmcSearch(symbol: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(symbol)
    const res = await fetch(`${TSETMC_API}/Instrument/GetInstrumentSearch/${encoded}`, { ...FETCH_OPTS })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      console.warn('TSETMC search returned non-JSON (likely blocked):', contentType)
      return null
    }
    const data = await res.json()
    if (data?.instrumentSearch?.length > 0) {
      // Exact match on lVal18AFC (short symbol) first
      const exactMatch = data.instrumentSearch.find(
        (i: any) => i.lVal18AFC === symbol
      )
      if (exactMatch) return exactMatch.insCode
      
      // Then try exact match on lVal30 (full name)
      const nameMatch = data.instrumentSearch.find(
        (i: any) => i.lVal30 === symbol
      )
      if (nameMatch) return nameMatch.insCode
      
      // Fallback: first result only if it's a main board stock (flow=1, cgrValCot starts with N)
      const mainBoard = data.instrumentSearch.find(
        (i: any) => i.flow === 1 && i.cgrValCot?.startsWith('N')
      )
      if (mainBoard) return mainBoard.insCode
      
      return data.instrumentSearch[0]?.insCode || null
    }
    return null
  } catch { return null }
}

export async function fetchTsetmcPriceInfo(insCode: string): Promise<{
  lastPrice: number
  closePrice: number
  change: number
  high: number
  low: number
  volume: number
  yesterday: number
} | null> {
  try {
    const res = await fetch(`${TSETMC_API}/ClosingPrice/GetClosingPriceInfo/${insCode}`, { ...FETCH_OPTS })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      console.warn('TSETMC returned non-JSON (likely blocked):', contentType)
      return null
    }
    const data = await res.json()
    const info = data?.closingPriceInfo
    if (!info) return null
    return {
      lastPrice: info.pDrCotVal ?? info.pClosing ?? 0,
      closePrice: info.pClosing ?? 0,
      change: info.priceChange ?? 0,
      high: info.priceMax ?? 0,
      low: info.priceMin ?? 0,
      volume: info.qTotTran5J ?? 0,
      yesterday: info.priceYesterday ?? 0,
    }
  } catch { return null }
}

export async function fetchCryptoPrices(symbols: string[]): Promise<PriceMap> {
  const geckoSymbols = symbols.filter(s => COINGECKO_IDS[s]).map(s => COINGECKO_IDS[s])
  if (geckoSymbols.length === 0) return {}
  const url = `${COINGECKO}/simple/price?ids=${geckoSymbols.join(',')}&vs_currencies=usd&include_24hr_change=true`
  try {
    const res = await fetch(url, { ...FETCH_OPTS })
    const data = await res.json()
    const result: PriceMap = {}
    for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
      if (data[id]?.usd) result[symbol] = { price: data[id].usd, currency: 'USD', change: data[id].usd_24h_change ?? 0 }
    }
    return result
  } catch (e) { console.error('fetchCryptoPrices error:', e); return {} }
}

export function convertUsdToIrr(usdPrice: number, irrRate: number): number {
  return Math.round(usdPrice * irrRate)
}

export async function fetchAllPrices(insCodeMap?: Record<string, string>): Promise<{
  prices: PriceMap
  irrRate: number
  stockPrices: Record<string, { price: number; change: number; closePrice: number }>
}> {
  // Run crypto, TGJU, AND stock price fetches in parallel — total time ~4s instead of 8s
  const stockFetch = insCodeMap
    ? Promise.allSettled(
        Object.entries(insCodeMap).map(([symbol, code]) =>
          fetchTsetmcPriceInfo(code).then(info => ({ symbol, info }))
        )
      )
    : Promise.resolve([] as PromiseSettledResult<{ symbol: string; info: any }>[])

  const [crypto, tgju, stockResults] = await Promise.all([
    fetchCryptoPrices(['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRX']),
    fetchTgjuData(),
    stockFetch,
  ])

  let irrRate = tgju.irrRate
  const prices: PriceMap = { ...tgju.prices, ...crypto }

  if (irrRate > 0) {
    for (const sym of Object.keys(crypto)) {
      const usdPrice = crypto[sym]?.price
      if (usdPrice) {
        prices[`${sym}-IRR`] = { price: convertUsdToIrr(usdPrice, irrRate), currency: 'IRR' }
      }
    }
  }

  // DB fallback for irrRate when TGJU fails (Vercel IP blocked)
  if (irrRate === 0) {
    try {
      const { pool } = await import('@/lib/db')
      const r = await pool.query(`SELECT symbol, price, currency FROM asset_price WHERE price > 0 ORDER BY "updatedAt" DESC`)
      for (const row of r.rows) {
        if (!prices[row.symbol]) {
          prices[row.symbol] = { price: Number(row.price), currency: row.currency ?? 'IRR' }
        }
      }
      const usdRow = r.rows.find(r => r.symbol === 'USD-IRR' || r.symbol === 'USDT-IRR')
      if (usdRow) {
        irrRate = Number(usdRow.price)
        prices['USD-IRR'] = { price: irrRate, currency: 'IRR' }
        prices['USDT-IRR'] = { price: irrRate, currency: 'IRR' }
        for (const sym of Object.keys(crypto)) {
          const usdPrice = crypto[sym]?.price
          if (usdPrice) {
            prices[`${sym}-IRR`] = { price: convertUsdToIrr(usdPrice, irrRate), currency: 'IRR' }
          }
        }
      }
    } catch {}
  }

  // Hardcoded fallback when everything fails
  if (irrRate === 0) {
    irrRate = FALLBACK_USD_RATE
    prices['USD-IRR'] = { price: irrRate, currency: 'IRR' }
    prices['USDT-IRR'] = { price: irrRate, currency: 'IRR' }
    for (const sym of Object.keys(crypto)) {
      const usdPrice = crypto[sym]?.price
      if (usdPrice) {
        prices[`${sym}-IRR`] = { price: convertUsdToIrr(usdPrice, irrRate), currency: 'IRR' }
      }
    }
  }

  const stockPrices: Record<string, { price: number; change: number; closePrice: number }> = {}
  for (const r of stockResults) {
    if (r.status === 'fulfilled' && r.value.info) {
      const { symbol, info } = r.value
      const change = info.yesterday > 0
        ? Math.round(((info.lastPrice - info.yesterday) / info.yesterday) * 10000) / 100
        : 0
      stockPrices[symbol] = {
        price: info.lastPrice,
        change,
        closePrice: info.closePrice,
      }
    }
  }

  return { prices, irrRate, stockPrices }
}
