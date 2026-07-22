import pg from 'pg'
import { randomUUID } from 'node:crypto'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
const FETCH = { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': UA } }

// ---- Helpers ----
function parseNum(v) { const n = Number(String(v).replace(/,/g, '')); return isNaN(n) ? 0 : n }

async function upsertPrices(client, entries) {
  const existing = await client.query('SELECT DISTINCT symbol FROM asset_price')
  const existingSet = new Set(existing.rows.map(r => r.symbol))
  let up = 0, ins = 0
  for (const [sym, d] of Object.entries(entries)) {
    if (!d.price || d.price <= 0) continue
    if (existingSet.has(sym)) {
      await client.query('UPDATE asset_price SET price = $1, "updatedAt" = NOW() WHERE symbol = $2', [d.price, sym])
      up++
    } else {
      await client.query(
        'INSERT INTO asset_price (id, type, symbol, price, currency, source, "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,NOW()) ON CONFLICT DO NOTHING',
        [randomUUID(), 'cron', sym, d.price, d.currency || 'IRR', 'cron']
      )
      existingSet.add(sym)
      ins++
    }
  }
  return { up, ins }
}

// ---- Source 1: TGJU HTML scrape ----
async function fetchTgju() {
  const prices = {}
  let irrRate = 0
  try {
    const res = await fetch('https://www.tgju.org/', { ...FETCH })
    const html = await res.text()
    // Extract all data-market-row entries
    const re = /data-market-row="([^"]+)"[^>]*>[\s\S]*?<td[^>]*class="[^"]*nf[^"]*"[^>]*data-price="([\d,]+)"/g
    let m
    while ((m = re.exec(html)) !== null) {
      const val = parseNum(m[2])
      if (val > 0) prices[m[1]] = val
    }
    // USD rate
    const usdMatch = html.match(/data-market-row="price_dollar_rl"[^>]*>[\s\S]*?data-price="([\d,]+)"/)
    if (usdMatch) irrRate = parseNum(usdMatch[1])
    // Also try pattern 2 (alternative TGJU layout)
    if (irrRate === 0) {
      const altMatch = html.match(/price_dollar_rl[\s\S]*?<td[^>]*>([\d,]+)<\/td>/)
      if (altMatch) irrRate = parseNum(altMatch[1])
    }
  } catch { console.error('TGJU failed') }

  const symMap = {
    price_dollar_rl: 'USD-IRR', price_eur: 'EUR-IRR', price_aed: 'AED-IRR',
    price_gbp: 'GBP-IRR', price_try: 'TRY-IRR', price_chf: 'CHF-IRR',
    price_cny: 'CNY-IRR', price_cad: 'CAD-IRR', price_aud: 'AUD-IRR',
    geram18: 'GOLD18', geram24: 'GOLD24', sekee: 'COIN',
    nim: 'HALF_COIN', rob: 'QUARTER_COIN', mesghal: 'MESGHAL',
    'crypto-bitcoin-irr': 'BTC-IRR', 'crypto-ethereum-irr': 'ETH-IRR',
    'crypto-tether-irr': 'USDT-IRR',
  }

  const result = {}
  for (const [slug, sym] of Object.entries(symMap)) {
    if (prices[slug]) result[sym] = { price: prices[slug], currency: 'IRR' }
  }

  // Computed fallbacks
  if (!result['GOLD24'] && result['GOLD18']) result['GOLD24'] = { price: Math.round(result['GOLD18'].price * 4 / 3), currency: 'IRR' }
  if (!result['HALF_COIN'] && result['COIN']) result['HALF_COIN'] = { price: Math.round(result['COIN'].price * 0.52), currency: 'IRR' }
  if (!result['QUARTER_COIN'] && result['COIN']) result['QUARTER_COIN'] = { price: Math.round(result['COIN'].price * 0.30), currency: 'IRR' }

  return { prices: result, irrRate }
}

// ---- Source 2: Nobitex (always works) ----
async function fetchNobitex() {
  const prices = {}
  let irrRate = 0
  try {
    // USDT/IRT rate
    const usdtRes = await fetch('https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=irt', { ...FETCH })
    const usdtData = await usdtRes.json()
    if (usdtData?.status === 'ok' && usdtData.stats?.['usdt-irt']?.latest) {
      irrRate = parseFloat(usdtData.stats['usdt-irt'].latest) * 10
      prices['USD-IRR'] = { price: irrRate, currency: 'IRR' }
      prices['USDT-IRR'] = { price: irrRate, currency: 'IRR' }
    }

    // Crypto in USD
    const allSymbols = ['btc', 'eth', 'usdt', 'bnb', 'sol', 'xrp', 'ada', 'doge', 'trx', 'dot', 'matic', 'link', 'avax', 'shib']
    const cryptoRes = await fetch(`https://api.nobitex.ir/market/stats?srcCurrency=${allSymbols.join(',')}&dstCurrency=usdt`, { ...FETCH })
    const cryptoData = await cryptoRes.json()
    if (cryptoData?.status === 'ok') {
      for (const [mk, stats] of Object.entries(cryptoData.stats)) {
        const [base, quote] = mk.split('-')
        if (quote !== 'usdt') continue
        const latest = parseFloat(stats.latest)
        if (latest > 0) {
          prices[base.toUpperCase()] = { price: latest, currency: 'USD' }
        }
      }
    }
  } catch { console.error('Nobitex failed') }
  return { prices, irrRate }
}

// ---- Source 3: CoinGecko (global crypto) ----
async function fetchCoinGecko() {
  const prices = {}
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,cardano,dogecoin,tron,polkadot,avalanche-2,chainlink,matic-network&vs_currencies=usd',
      { ...FETCH }
    )
    const data = await res.json()
    const map = { BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', BNB: 'binancecoin', SOL: 'solana', XRP: 'ripple', ADA: 'cardano', DOGE: 'dogecoin', TRX: 'tron', DOT: 'polkadot', AVAX: 'avalanche-2', LINK: 'chainlink', MATIC: 'matic-network' }
    for (const [sym, id] of Object.entries(map)) {
      if (data[id]?.usd) prices[sym] = { price: data[id].usd, currency: 'USD' }
    }
  } catch { console.error('CoinGecko failed') }
  return prices
}

// ---- Source 4: TSETMC (Iranian stocks) ----
const TSETMC = 'https://cdn.tsetmc.com/api'
const STOCK_SYMBOLS = [
  'فولاد', 'فملی', 'کگل', 'خودرو', 'خساپا', 'وبملت', 'وتجارت',
  'وبصادر', 'پارسان', 'جم', 'شپنا', 'شتران', 'وغدیر', 'شستا',
  'رمپنا', 'حفاری', 'اخابر', 'همراه', 'بیمه', 'وبانک', 'ذوب',
  'فسپا', 'فخوز', 'فایرا', 'خگستر', 'خبهمن', 'وپارس', 'وبیمه',
  'ودانا', 'وگردش', 'خارک', 'زاگرس', 'شصفها', 'پکرمان', 'پترول',
  'تبرک', 'شبریز', 'شاهن', 'شلاکه', 'تاپیکو', 'وساپا', 'وهنر',
  'دالبر', 'درخشان', 'دپارس', 'غمارگ', 'غشهد', 'غگل', 'سیدکو',
  'کچاد', 'کگهر', 'کاو', 'ثباغ', 'ثامان', 'نیشکر', 'دعبیدی',
  'غپونه', 'غفام', 'غزر', 'غصین', 'خمحور', 'ختور', 'خاذین',
  'وبوعلی', 'وسینا', 'وشهر', 'حفا', 'مپنا', 'سفاس', 'ساهور',
  'ساروم', 'سخوز', 'ثفارس', 'ثشرق', 'حمل', 'رحوان', 'هتل',
  'وآوا', 'ونیکی', 'شاراک', 'پیروز', 'پکویر', 'پلاس', 'کالسیمین',
  'شخارک', 'شیران', 'شسم', 'شکبیر', 'شجم',
]

async function fetchStocks() {
  const stocks = {}
  for (const sym of STOCK_SYMBOLS) {
    try {
      const searchRes = await fetch(`${TSETMC}/Instrument/GetInstrumentSearch/${encodeURIComponent(sym)}`, { ...FETCH })
      if (!searchRes.ok) continue
      const searchData = await searchRes.json()
      const match = searchData?.instrumentSearch?.find(i => i.lVal18AFC === sym)
      if (!match?.insCode) continue
      const priceRes = await fetch(`${TSETMC}/ClosingPrice/GetClosingPriceInfo/${match.insCode}`, { ...FETCH })
      if (!priceRes.ok) continue
      const priceData = await priceRes.json()
      const info = priceData?.closingPriceInfo
      if (info?.pDrCotVal > 0) {
        stocks[sym] = { price: info.pDrCotVal, currency: 'IRR' }
      }
    } catch { /* skip failed stock */ }
  }
  return stocks
}

// ---- Main ----
async function main() {
  console.log('Price sync started...')
  const start = Date.now()

  // Fetch all sources in parallel
  const [tgju, nobitex, gecko, stocks] = await Promise.all([
    fetchTgju(),
    fetchNobitex(),
    fetchCoinGecko(),
    fetchStocks(),
  ])

  // Merge: TGJU prices + Nobitex USDT rate + CoinGecko crypto + stocks
  const allPrices = { ...tgju.prices }
  let irrRate = tgju.irrRate

  // Use Nobitex rate if TGJU failed
  if (irrRate === 0 && nobitex.irrRate > 0) {
    irrRate = nobitex.irrRate
    allPrices['USD-IRR'] = { price: irrRate, currency: 'IRR' }
    allPrices['USDT-IRR'] = { price: irrRate, currency: 'IRR' }
  }

  // Merge Nobitex crypto (if not covered by TGJU)
  for (const [sym, d] of Object.entries(nobitex.prices)) {
    if (!allPrices[sym] && !sym.endsWith('-IRR') && sym !== 'USD-IRR' && sym !== 'USDT-IRR') {
      allPrices[sym] = d
    }
  }

  // Merge CoinGecko (preferred over Nobitex for USD prices)
  for (const [sym, d] of Object.entries(gecko)) {
    allPrices[sym] = d
  }

  // Compute crypto-IRR prices if we have irrRate
  if (irrRate > 0) {
    const cryptoUSD = { ...nobitex.prices, ...gecko }
    for (const [sym, d] of Object.entries(cryptoUSD)) {
      if (d.currency === 'USD' && d.price > 0 && !allPrices[`${sym}-IRR`]) {
        allPrices[`${sym}-IRR`] = { price: Math.round(d.price * irrRate), currency: 'IRR' }
      }
    }
  }

  // Add all forex-IRR from Nobitex USD rate
  if (irrRate > 0) {
    // Nobitex doesn't provide EUR/IRR etc directly, so compute from TGJU or fall back
    // TGJU forex-IRR pairs are already merged from tgju.prices
    // For any missing, the live API will compute them
  }

  // Merge stock prices
  for (const [sym, d] of Object.entries(stocks)) {
    allPrices[sym] = d
  }

  // Write to DB
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { up, ins } = await upsertPrices(client, allPrices)
    await client.query('COMMIT')
    console.log(`DB updated: ${up} updated, ${ins} inserted | Sources: TGJU=${Object.keys(tgju.prices).length}, Nobitex=${Object.keys(nobitex.prices).length}, Gecko=${Object.keys(gecko).length}, Stocks=${Object.keys(stocks).length} | irrRate=${irrRate} | ${Date.now() - start}ms`)
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('DB write failed:', e)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })