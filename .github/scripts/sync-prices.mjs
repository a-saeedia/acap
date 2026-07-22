import pg from 'pg'
import { randomUUID } from 'node:crypto'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
const FETCH_OPTS = { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': UA } }

// ---------- TGJU ----------
async function fetchTgju() {
  const prices = {}
  let irrRate = 0
  try {
    const res = await fetch('https://www.tgju.org/', { ...FETCH_OPTS })
    const html = await res.text()
    const re = /data-market-row="([^"]+)"[^>]*>[\s\S]*?<td[^>]*class="[^"]*nf[^"]*"[^>]*data-price="([\d,]+)"/g
    let m
    while ((m = re.exec(html)) !== null) {
      const slug = m[1], val = Number(m[2].replace(/,/g, ''))
      if (val > 0) prices[slug] = val
    }
    const usdRe = /data-market-row="price_dollar_rl"[^>]*>[\s\S]*?data-price="([\d,]+)"/
    const um = html.match(usdRe)
    if (um) irrRate = Number(um[1].replace(/,/g, ''))
  } catch { console.error('TGJU scrape failed') }

  const slugToSym = {
    price_dollar_rl: 'USD-IRR', price_eur: 'EUR-IRR', price_aed: 'AED-IRR',
    price_gbp: 'GBP-IRR', price_try: 'TRY-IRR', geram18: 'GOLD18',
    geram24: 'GOLD24', sekee: 'COIN', nim: 'HALF_COIN', rob: 'QUARTER_COIN',
    mesghal: 'MESGHAL',
    'crypto-bitcoin-irr': 'BTC-IRR', 'crypto-ethereum-irr': 'ETH-IRR',
    'crypto-tether-irr': 'USDT-IRR', 'crypto-ripple-irr': 'XRP-IRR',
  }

  const result = {}
  for (const [slug, sym] of Object.entries(slugToSym)) {
    if (prices[slug]) result[sym] = { price: prices[slug], currency: 'IRR' }
  }

  return { prices: result, irrRate }
}

// ---------- TSETMC ----------
const TSETMC_API = 'https://cdn.tsetmc.com/api'

async function fetchTsetmcStocks() {
  const stockSymbols = [
    'فولاد', 'فملی', 'کگل', 'خودرو', 'خساپا', 'وبملت', 'وتجارت',
    'وبصادر', 'پارسان', 'جم', 'شپنا', 'شتران', 'وغدیر', 'شستا',
    'رمپنا', 'حفاری', 'اخابر', 'همراه', 'بیمه', 'وبانک', 'ذوب',
    'فسپا', 'فخوز', 'فایرا', 'خگستر', 'خبهمن', 'وپارس', 'وبیمه',
    'ودانا', 'وگردش', 'خارک', 'زاگرس', 'شصفها', 'پکرمان', 'پترول',
    'تبرک', 'شبریز', 'شاهن', 'شلاکه', 'تاپیکو', 'وساپا', 'وهنر',
    'دالبر', 'درخشان', 'دپارس', 'غمارگ', 'غشهد', 'غگل', 'سیدکو',
    'کچاد', 'کگهر', 'کاو', 'ثباغ', 'ثامان', 'نیشکر',
  ]

  const stockPrices = {}
  for (const sym of stockSymbols) {
    try {
      const encoded = encodeURIComponent(sym)
      const searchRes = await fetch(`${TSETMC_API}/Instrument/GetInstrumentSearch/${encoded}`, { ...FETCH_OPTS })
      if (!searchRes.ok) continue
      const searchData = await searchRes.json()
      const match = searchData?.instrumentSearch?.find(i => i.lVal18AFC === sym)
      if (!match?.insCode) continue
      const priceRes = await fetch(`${TSETMC_API}/ClosingPrice/GetClosingPriceInfo/${match.insCode}`, { ...FETCH_OPTS })
      if (!priceRes.ok) continue
      const priceData = await priceRes.json()
      const info = priceData?.closingPriceInfo
      if (info?.pDrCotVal > 0) {
        const change = info.priceYesterday > 0
          ? Math.round(((info.pDrCotVal - info.priceYesterday) / info.priceYesterday) * 10000) / 100
          : 0
        stockPrices[sym] = { price: info.pDrCotVal, change, closePrice: info.pClosing || info.pDrCotVal }
      }
    } catch { continue }
  }
  return stockPrices
}

// ---------- Nobitex ----------
async function fetchNobitex() {
  const result = {}
  try {
    const res = await fetch('https://api.nobitex.ir/market/stats?srcCurrency=usdt,btc,eth&dstCurrency=irt', { ...FETCH_OPTS })
    const data = await res.json()
    if (data?.status !== 'ok') return result
    for (const [mk, stats] of Object.entries(data.stats)) {
      const [base] = mk.split('-')
      const latest = parseFloat(stats.latest)
      if (latest > 0) {
        result[`${base.toUpperCase()}-NOBITEX`] = { price: latest * 10, currency: 'IRR' }
      }
    }
  } catch { console.error('Nobitex fetch failed') }
  return result
}

async function main() {
  console.log('Starting price sync from GitHub runner...')
  const start = Date.now()

  const [tgju, stocks, nobitex] = await Promise.all([
    fetchTgju(),
    fetchTsetmcStocks(),
    fetchNobitex(),
  ])

  const allPrices = { ...tgju.prices }
  let irrRate = tgju.irrRate

  // Merge Nobitex
  if (nobitex['USDT-NOBITEX'] && !allPrices['USDT-IRR']) {
    allPrices['USDT-IRR'] = nobitex['USDT-NOBITEX']
    allPrices['USD-IRR'] = nobitex['USDT-NOBITEX']
    irrRate = nobitex['USDT-NOBITEX'].price
  }

  // Compute crypto-IRR from irrRate
  if (irrRate > 0) {
    for (const key of Object.keys(allPrices)) {
      if (key.endsWith('-IRR') && !['USD-IRR', 'USDT-IRR'].includes(key)) continue
    }
    try {
      const geckoRes = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,solana,ripple,cardano,dogecoin,binancecoin,tron,polkadot,avalanche-2,chainlink&vs_currencies=usd',
        { ...FETCH_OPTS }
      )
      const geckoData = await geckoRes.json()
      const geckoMap = {
        BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', SOL: 'solana',
        XRP: 'ripple', ADA: 'cardano', DOGE: 'dogecoin', BNB: 'binancecoin',
        TRX: 'tron', DOT: 'polkadot', AVAX: 'avalanche-2', LINK: 'chainlink',
      }
      for (const [sym, id] of Object.entries(geckoMap)) {
        if (geckoData[id]?.usd) {
          const usdPrice = geckoData[id].usd
          allPrices[sym] = { price: usdPrice, currency: 'USD' }
          allPrices[`${sym}-IRR`] = { price: Math.round(usdPrice * irrRate), currency: 'IRR' }
        }
      }
    } catch { console.error('CoinGecko sync failed') }
  }

  // Merge stock prices
  for (const [sym, sp] of Object.entries(stocks)) {
    allPrices[sym] = { price: sp.price, currency: 'IRR' }
  }

  // Write to DB
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const existing = await client.query('SELECT DISTINCT symbol FROM asset_price')
    const existingSet = new Set(existing.rows.map(r => r.symbol))

    let insertCount = 0, updateCount = 0
    for (const [sym, d] of Object.entries(allPrices)) {
      if (!d.price || d.price <= 0) continue
      if (existingSet.has(sym)) {
        await client.query('UPDATE asset_price SET price = $1, "updatedAt" = NOW() WHERE symbol = $2', [d.price, sym])
        updateCount++
      } else {
        await client.query(
          'INSERT INTO asset_price (id, type, symbol, price, currency, source, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW()) ON CONFLICT DO NOTHING',
          [randomUUID(), 'cron', sym, d.price, d.currency || 'IRR', 'cron']
        )
        insertCount++
      }
    }
    await client.query('COMMIT')
    console.log(`Updated ${updateCount} rows, inserted ${insertCount} new in ${Date.now() - start}ms`)
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('DB write failed:', e)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })