const COINGECKO = 'https://api.coingecko.com/api/v3'
const TGJU_AJAX = 'https://call2.tgju.org/ajax.json'
const TGJU_HTML = 'https://www.tgju.org/'
const TSETMC_API = 'https://cdn.tsetmc.com/api'
const NOBITEX = 'https://api.nobitex.ir'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const FETCH_OPTS = { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': UA } }
const TGJU_FETCH_OPTS = { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': UA, Accept: 'text/html,application/json,*/*' } }
const FALLBACK_USD_RATE = 9230000

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', BNB: 'binancecoin',
  SOL: 'solana', XRP: 'ripple', ADA: 'cardano', DOGE: 'dogecoin',
  DOT: 'polkadot', MATIC: 'matic-network', SHIB: 'shiba-inu',
  TRX: 'tron', AVAX: 'avalanche-2', LINK: 'chainlink',
}

export const DEFAULT_STOCKS = [
  { symbol: 'فولاد', name: 'فولاد مبارکه اصفهان', sector: 'فلزات اساسی', tsetmcSearch: 'فولاد' },
  { symbol: 'کگل', name: 'گل گهر', sector: 'فلزات اساسی', tsetmcSearch: 'کگل' },
  { symbol: 'فملی', name: 'ملی صنایع مس ایران', sector: 'فلزات اساسی', tsetmcSearch: 'فملی' },
  { symbol: 'ذوب', name: 'ذوب آهن اصفهان', sector: 'فلزات اساسی', tsetmcSearch: 'ذوب' },
  { symbol: 'فسپا', name: 'سپاهان', sector: 'فلزات اساسی', tsetmcSearch: 'فسپا' },
  { symbol: 'فخوز', name: 'فولاد خوزستان', sector: 'فلزات اساسی', tsetmcSearch: 'فخوز' },
  { symbol: 'فایرا', name: 'آلومینیوم ایران', sector: 'فلزات اساسی', tsetmcSearch: 'فایرا' },
  { symbol: 'فیروز', name: 'آلومراد', sector: 'فلزات اساسی', tsetmcSearch: 'فیروز' },
  { symbol: 'فاسمین', name: 'آلومینای ایران', sector: 'فلزات اساسی', tsetmcSearch: 'فاسمین' },
  { symbol: 'محیر', name: 'کالسیمین', sector: 'فلزات اساسی', tsetmcSearch: 'محیر' },
  { symbol: 'خودرو', name: 'ایران خودرو', sector: 'خودرو', tsetmcSearch: 'خودرو' },
  { symbol: 'خساپا', name: 'سایپا', sector: 'خودرو', tsetmcSearch: 'خساپا' },
  { symbol: 'خگستر', name: 'گسترش سرمایه گذاری ایران خودرو', sector: 'خودرو', tsetmcSearch: 'خگستر' },
  { symbol: 'خزمست', name: 'زمستا', sector: 'خودرو', tsetmcSearch: 'خزمست' },
  { symbol: 'خبهمن', name: 'بهمن', sector: 'خودرو', tsetmcSearch: 'خبهمن' },
  { symbol: 'خمحور', name: 'محور خودرو', sector: 'خودرو', tsetmcSearch: 'خمحور' },
  { symbol: 'خاذین', name: 'آذین خودرو', sector: 'خودرو', tsetmcSearch: 'خاذین' },
  { symbol: 'ختور', name: 'تویو', sector: 'خودرو', tsetmcSearch: 'ختور' },
  { symbol: 'وبملت', name: 'بانک ملت', sector: 'بانک', tsetmcSearch: 'وبملت' },
  { symbol: 'وتجارت', name: 'بانک تجارت', sector: 'بانک', tsetmcSearch: 'وتجارت' },
  { symbol: 'وبصادر', name: 'بانک صادرات', sector: 'بانک', tsetmcSearch: 'وبصادر' },
  { symbol: 'وبشهر', name: 'بانک شهر', sector: 'بانک', tsetmcSearch: 'وبشهر' },
  { symbol: 'وبانک', name: 'بانک اقتصاد نوین', sector: 'بانک', tsetmcSearch: 'وبانک' },
  { symbol: 'وبوعلی', name: 'بانک سرمایه', sector: 'بانک', tsetmcSearch: 'وبوعلی' },
  { symbol: 'وسینا', name: 'بانک سینا', sector: 'بانک', tsetmcSearch: 'وسینا' },
  { symbol: 'وپارس', name: 'بانک پارسیان', sector: 'بانک', tsetmcSearch: 'وپارس' },
  { symbol: 'وبیمه', name: 'بانک ایران زمین', sector: 'بانک', tsetmcSearch: 'وبیمه' },
  { symbol: 'وگردش', name: 'بانک گردشگری', sector: 'بانک', tsetmcSearch: 'وگردش' },
  { symbol: 'ودانا', name: 'بانک دی', sector: 'بانک', tsetmcSearch: 'ودانا' },
  { symbol: 'پارسان', name: 'پتروشیمی پارس', sector: 'پتروشیمی', tsetmcSearch: 'پارسان' },
  { symbol: 'جم', name: 'پتروشیمی جم', sector: 'پتروشیمی', tsetmcSearch: 'جم' },
  { symbol: 'خارک', name: 'پتروشیمی نفت خارک', sector: 'پتروشیمی', tsetmcSearch: 'خارک' },
  { symbol: 'شجم', name: 'پتروشیمی شهید تندگویان', sector: 'پتروشیمی', tsetmcSearch: 'شجم' },
  { symbol: 'زاگرس', name: 'پتروشیمی زاگرس', sector: 'پتروشیمی', tsetmcSearch: 'زاگرس' },
  { symbol: 'پکرمان', name: 'پتروشیمی کرمان', sector: 'پتروشیمی', tsetmcSearch: 'پکرمان' },
  { symbol: 'پترول', name: 'پتروشیمی بوعلی سینا', sector: 'پتروشیمی', tsetmcSearch: 'پترول' },
  { symbol: 'شفن', name: 'پتروشیمی فن آوران', sector: 'پتروشیمی', tsetmcSearch: 'شفن' },
  { symbol: 'شاراک', name: 'پتروشیمی اراک', sector: 'پتروشیمی', tsetmcSearch: 'شاراک' },
  { symbol: 'پیروز', name: 'پتروشیمی تبریز', sector: 'پتروشیمی', tsetmcSearch: 'پیروز' },
  { symbol: 'شصفها', name: 'پتروشیمی اصفهان', sector: 'پتروشیمی', tsetmcSearch: 'شصفها' },
  { symbol: 'شپنا', name: 'پالایش نفت بندرعباس', sector: 'پالایشی', tsetmcSearch: 'شپنا' },
  { symbol: 'شتران', name: 'پالایش نفت تهران', sector: 'پالایشی', tsetmcSearch: 'شتران' },
  { symbol: 'تبرک', name: 'پالایش نفت تبریز', sector: 'پالایشی', tsetmcSearch: 'تبرک' },
  { symbol: 'شبریز', name: 'پالایش نفت شیراز', sector: 'پالایشی', tsetmcSearch: 'شبریز' },
  { symbol: 'شاهن', name: 'پالایش نفت اصفهان', sector: 'پالایشی', tsetmcSearch: 'شاهن' },
  { symbol: 'شلاکه', name: 'پالایش نفت لاوان', sector: 'پالایشی', tsetmcSearch: 'شلاکه' },
  { symbol: 'وغدیر', name: 'سرمایه گذاری غدیر', sector: 'سرمایه گذاری', tsetmcSearch: 'وغدیر' },
  { symbol: 'شستا', name: 'شستا', sector: 'سرمایه گذاری', tsetmcSearch: 'شستا' },
  { symbol: 'تاپیکو', name: 'سرمایه گذاری نفت و گاز', sector: 'سرمایه گذاری', tsetmcSearch: 'تاپیکو' },
  { symbol: 'وساپا', name: 'سرمایه گذاری سایپا', sector: 'سرمایه گذاری', tsetmcSearch: 'وساپا' },
  { symbol: 'وهنر', name: 'سرمایه گذاری هنر', sector: 'سرمایه گذاری', tsetmcSearch: 'وهنر' },
  { symbol: 'وصندوق', name: 'سرمایه گذاری صندوق بازنشستگی', sector: 'سرمایه گذاری', tsetmcSearch: 'وصندوق' },
  { symbol: 'سهام', name: 'سرمایه گذاری سهام عدالت', sector: 'سرمایه گذاری', tsetmcSearch: 'سهام' },
  { symbol: 'رمپنا', name: 'گروه مپنا', sector: 'انرژی', tsetmcSearch: 'رمپنا' },
  { symbol: 'حفاری', name: 'حفاری شمال', sector: 'انرژی', tsetmcSearch: 'حفاری' },
  { symbol: 'حفا', name: 'حفاری آریا', sector: 'انرژی', tsetmcSearch: 'حفا' },
  { symbol: 'نیشکر', name: 'نیشکر هفت تپه', sector: 'انرژی', tsetmcSearch: 'نیشکر' },
  { symbol: 'مپنا', name: 'مپنا', sector: 'انرژی', tsetmcSearch: 'مپنا' },
  { symbol: 'دالبر', name: 'البرز دارو', sector: 'داروسازی', tsetmcSearch: 'دالبر' },
  { symbol: 'درخشان', name: 'داروسازی رخشان', sector: 'داروسازی', tsetmcSearch: 'درخشان' },
  { symbol: 'ددام', name: 'داروسازی ابوریحان', sector: 'داروسازی', tsetmcSearch: 'ددام' },
  { symbol: 'دپارس', name: 'داروسازی پارس', sector: 'داروسازی', tsetmcSearch: 'دپارس' },
  { symbol: 'دتولید', name: 'داروسازی تولید دارو', sector: 'داروسازی', tsetmcSearch: 'دتولید' },
  { symbol: 'دشیمی', name: 'داروسازی شیمی', sector: 'داروسازی', tsetmcSearch: 'دشیمی' },
  { symbol: 'دعبیدی', name: 'عبیدی', sector: 'داروسازی', tsetmcSearch: 'دعبیدی' },
  { symbol: 'دزهراوی', name: 'زهراوی', sector: 'داروسازی', tsetmcSearch: 'دزهراوی' },
  { symbol: 'غمارگ', name: 'مارگارین', sector: 'غذایی', tsetmcSearch: 'غمارگ' },
  { symbol: 'غپونه', name: 'پونه', sector: 'غذایی', tsetmcSearch: 'غپونه' },
  { symbol: 'غشهد', name: 'شهد', sector: 'غذایی', tsetmcSearch: 'غشهد' },
  { symbol: 'غاذین', name: 'آذراب', sector: 'غذایی', tsetmcSearch: 'غاذین' },
  { symbol: 'غصین', name: 'صنعتی بهشهر', sector: 'غذایی', tsetmcSearch: 'غصین' },
  { symbol: 'غگل', name: 'گلستان', sector: 'غذایی', tsetmcSearch: 'غگل' },
  { symbol: 'غفام', name: 'فامیلی', sector: 'غذایی', tsetmcSearch: 'غفام' },
  { symbol: 'غزر', name: 'زر ماکارون', sector: 'غذایی', tsetmcSearch: 'غزر' },
  { symbol: 'اخابر', name: 'مخابرات ایران', sector: 'مخابرات', tsetmcSearch: 'اخابر' },
  { symbol: 'همراه', name: 'همراه اول', sector: 'مخابرات', tsetmcSearch: 'همراه' },
  { symbol: 'آسیاتک', name: 'آسیاتک', sector: 'فناوری اطلاعات', tsetmcSearch: 'آسیاتک' },
  { symbol: 'فناور', name: 'فناوری اطلاعات', sector: 'فناوری اطلاعات', tsetmcSearch: 'فناور' },
  { symbol: 'سیدکو', name: 'سیمان کردستان', sector: 'سیمان', tsetmcSearch: 'سیدکو' },
  { symbol: 'سفاس', name: 'سیمان فارس', sector: 'سیمان', tsetmcSearch: 'سفاس' },
  { symbol: 'ساهور', name: 'سیمان هورامان', sector: 'سیمان', tsetmcSearch: 'ساهور' },
  { symbol: 'ساروم', name: 'سیمان ارومیه', sector: 'سیمان', tsetmcSearch: 'ساروم' },
  { symbol: 'سخوز', name: 'سیمان خوزستان', sector: 'سیمان', tsetmcSearch: 'سخوز' },
  { symbol: 'ثباغ', name: 'باغمیشه', sector: 'ساختمانی', tsetmcSearch: 'ثباغ' },
  { symbol: 'ثامان', name: 'ساختمانی امید', sector: 'ساختمانی', tsetmcSearch: 'ثامان' },
  { symbol: 'ثفارس', name: 'عمران فارس', sector: 'ساختمانی', tsetmcSearch: 'ثفارس' },
  { symbol: 'ثشرق', name: 'عمران شرق', sector: 'ساختمانی', tsetmcSearch: 'ثشرق' },
  { symbol: 'بیمه', name: 'بیمه ایران', sector: 'بیمه', tsetmcSearch: 'بیمه' },
  { symbol: 'وبیمه', name: 'بیمه البرز', sector: 'بیمه', tsetmcSearch: 'وبیمه' },
  { symbol: 'حمل', name: 'حمل و نقل', sector: 'حمل و نقل', tsetmcSearch: 'حمل' },
  { symbol: 'رحوان', name: 'هواپیمایی آسمان', sector: 'حمل و نقل', tsetmcSearch: 'رحوان' },
  { symbol: 'رخواند', name: 'هواپیمایی ماهان', sector: 'حمل و نقل', tsetmcSearch: 'رخواند' },
  { symbol: 'ریبیر', name: 'بیمه ری', sector: 'حمل و نقل', tsetmcSearch: 'ریبیر' },
  { symbol: 'شخارک', name: 'صنایع شیمیایی خارک', sector: 'شیمیایی', tsetmcSearch: 'شخارک' },
  { symbol: 'شیران', name: 'صنایع شیمیایی ایران', sector: 'شیمیایی', tsetmcSearch: 'شیران' },
  { symbol: 'شسم', name: 'صنایع شیمیایی سمند', sector: 'شیمیایی', tsetmcSearch: 'شسم' },
  { symbol: 'شکبیر', name: 'صنایع شیمیایی کبیر', sector: 'شیمیایی', tsetmcSearch: 'شکبیر' },
  { symbol: 'پکویر', name: 'پلیمر کرمانشاه', sector: 'پلیمر', tsetmcSearch: 'پکویر' },
  { symbol: 'پلاس', name: 'پلاستیک', sector: 'پلیمر', tsetmcSearch: 'پلاس' },
  { symbol: 'کگهر', name: 'گهرزمین', sector: 'معدنی', tsetmcSearch: 'کگهر' },
  { symbol: 'کچاد', name: 'چادرملو', sector: 'معدنی', tsetmcSearch: 'کچاد' },
  { symbol: 'کالسیمین', name: 'سیمین', sector: 'معدنی', tsetmcSearch: 'کالسیمین' },
  { symbol: 'کاو', name: 'کاوه', sector: 'معدنی', tsetmcSearch: 'کاو' },
  { symbol: 'هتل', name: 'هتل پارسیان', sector: 'گردشگری', tsetmcSearch: 'هتل' },
  { symbol: 'وآوا', name: 'آوا', sector: 'گردشگری', tsetmcSearch: 'وآوا' },
  { symbol: 'ونیکی', name: 'نیکی', sector: 'سایر', tsetmcSearch: 'ونیکی' },
]

export type PriceMap = Record<string, { price: number; currency: string; change?: number }>

function parseTgjuPrice(val: string): number {
  return Number(val.replace(/,/g, ''))
}

// ---- Nobitex: PRIMARY for USD/IRR rate ----
export async function fetchNobitexUsdRate(): Promise<number> {
  try {
    const res = await fetch(`${NOBITEX}/market/stats?srcCurrency=usdt&dstCurrency=irt`, { ...FETCH_OPTS })
    const data = await res.json()
    if (data?.status === 'ok' && data.stats?.['usdt-irt']?.latest) {
      return parseFloat(data.stats['usdt-irt'].latest) * 10
    }
  } catch { console.error('[prices] Nobitex USDT rate failed') }
  return 0
}

// ---- Nobitex: PRIMARY for crypto in USD ----
export async function fetchNobitexCrypto(symbols: string[]): Promise<PriceMap> {
  const result: PriceMap = {}
  try {
    const res = await fetch(`${NOBITEX}/market/stats?srcCurrency=${symbols.map(s => s.toLowerCase()).join(',')}&dstCurrency=usdt`, { ...FETCH_OPTS })
    const data = await res.json()
    if (data?.status !== 'ok') return result
    for (const marketKey of Object.keys(data.stats ?? {})) {
      const [base, quote] = marketKey.split('-')
      if (quote !== 'usdt') continue
      const latest = parseFloat(data.stats[marketKey]?.latest ?? '0')
      if (latest > 0) {
        result[base.toUpperCase()] = { price: latest, currency: 'USD', change: parseFloat(data.stats[marketKey]?.['24h_ch'] ?? '0') }
      }
    }
  } catch { console.error('[prices] Nobitex crypto failed') }
  return result
}

// ---- TGJU: gold, coins, forex in IRR ----
async function fetchTgjuHTML(): Promise<{ prices: PriceMap; irrRate: number; timestamp: string }> {
  try {
    const res = await fetch(TGJU_HTML, { cache: 'no-store', next: { revalidate: 0 }, ...TGJU_FETCH_OPTS })
    if (!res.ok) return { prices: {}, irrRate: 0, timestamp: '' }
    const html = await res.text()

    const prices: PriceMap = {}
    let irrRate = 0

    const extractRowData = (selector: string): { price: number; change: number | null } | null => {
      const p1 = new RegExp(`<tr[^>]*data-market-row="${selector}"[^>]*>[\\s\\S]*?<td[^>]*>([\\d,]+)</td>[\\s\\S]*?<td[^>]*class="([^"]*)"[^>]*>([\\s\\S]*?)</td>`)
      const m1 = html.match(p1)
      if (m1) {
        const price = parseTgjuPrice(m1[1])
        const changeMatch = m1[3].match(/\(([\d.-]+)%\)/)
        return { price, change: changeMatch ? parseFloat(changeMatch[1]) : null }
      }
      const p2 = new RegExp(`data-market-row="${selector}"[^>]*data-price="([\\d,]+)"`)
      const m2 = html.match(p2)
      if (m2) return { price: parseTgjuPrice(m2[1]), change: null }
      const p3 = new RegExp(`data-market-row="${selector}"[^>]*>.*?<td[^>]*class="[^"]*nf[^"]*"[^>]*>([\\d,]+)</td>`, 's')
      const m3 = html.match(p3)
      if (m3) return { price: parseTgjuPrice(m3[1]), change: null }
      const p4 = new RegExp(`<tr[^>]*>[\\s\\S]*?<td[^>]*data-price="([\\d,]+)"[^>]*>[\\s\\S]*?${selector === 'geram18' ? 'طلا' : selector === 'price_dollar_rl' ? 'دلار' : ''}[\\s\\S]*?</tr>`)
      const m4 = html.match(p4)
      if (m4) return { price: parseTgjuPrice(m4[1]), change: null }
      const p5 = new RegExp(`<span[^>]*class="[^"]*nf[^"]*"[^>]*data-price="([\\d,]+)"`)
      const m5 = html.match(p5)
      if (m5) return { price: parseTgjuPrice(m5[1]), change: null }
      return null
    }
    const extractPrice = (selector: string): number | null => {
      const row = extractRowData(selector)
      return row ? row.price : null
    }
    const setWithChange = (sym: string, price: number, currency: string, slug: string) => {
      const row = extractRowData(slug)
      prices[sym] = { price, currency, ...(row?.change !== null && row?.change !== undefined ? { change: row.change } : {}) }
    }

    const usdRow = extractRowData('price_dollar_rl')
    if (usdRow) {
      if (usdRow.price < 5000000) {
        console.warn('[prices] Rejecting TGJU HTML USD rate (too low):', usdRow.price)
      } else {
        irrRate = usdRow.price
        prices['USD'] = { price: 1, currency: 'USD' }
        prices['USD-IRR'] = { price: usdRow.price, currency: 'IRR', ...(usdRow.change !== null ? { change: usdRow.change } : {}) }
        prices['USDT-IRR'] = { price: usdRow.price, currency: 'IRR', change: prices['USD-IRR']?.change }
      }
    }

    const forexPairs: Record<string, string> = {
      price_eur: 'EUR', price_aed: 'AED', price_gbp: 'GBP',
      price_try: 'TRY', price_chf: 'CHF', price_cny: 'CNY',
      price_cad: 'CAD', price_aud: 'AUD', price_sgd: 'SGD',
      price_inr: 'INR', price_sar: 'SAR', price_kwd: 'KWD',
      price_myr: 'MYR', price_rub: 'RUB', price_azn: 'AZN',
    }
    for (const [slug, sym] of Object.entries(forexPairs)) {
      const row = extractRowData(slug)
      if (row) {
        prices[sym] = { price: 1, currency: 'USD' }
        prices[`${sym}-IRR`] = { price: row.price, currency: 'IRR', ...(row.change !== null ? { change: row.change } : {}) }
      }
    }

    const goldSlugs: Record<string, string> = {
      geram18: 'GOLD18', geram24: 'GOLD24', sekee: 'COIN',
      nim: 'HALF_COIN', rob: 'QUARTER_COIN',
      mesghal: 'MESGHAL',
    }
    for (const [slug, sym] of Object.entries(goldSlugs)) {
      const row = extractRowData(slug)
      if (row) prices[sym] = { price: row.price, currency: 'IRR', ...(row.change !== null ? { change: row.change } : {}) }
    }

    // GOLD24 = GOLD18 × 4/3
    if (!prices['GOLD24'] && prices['GOLD18']) {
      prices['GOLD24'] = {
        price: Math.round(prices['GOLD18'].price * 4 / 3),
        currency: 'IRR',
        ...(prices['GOLD18'].change !== undefined ? { change: prices['GOLD18'].change } : {}),
      }
    }
    if (!prices['HALF_COIN'] && prices['COIN']) {
      prices['HALF_COIN'] = {
        price: Math.round(prices['COIN'].price * 0.52),
        currency: 'IRR',
      }
    }
    if (!prices['QUARTER_COIN'] && prices['COIN']) {
      prices['QUARTER_COIN'] = {
        price: Math.round(prices['COIN'].price * 0.30),
        currency: 'IRR',
      }
    }

    // TGJU AJAX tolerance arrays fill what's still missing
    if (irrRate > 0) {
      try {
        const rev = Math.random().toString(36).substring(2, 12)
        const ajaxRes = await fetch(`${TGJU_AJAX}?rev=${rev}`, { cache: 'no-store', ...TGJU_FETCH_OPTS })
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
              if (sym && !prices[sym] && item.p) {
                const p = parseTgjuPrice(item.p)
                if (p > 0) prices[sym] = { price: p, currency: 'IRR', ...(item.dp ? { change: parseFloat(item.dp) } : {}) }
              }
            }
          }
        }
      } catch {}

      for (const [slug, sym] of Object.entries({ nim: 'HALF_COIN', rob: 'QUARTER_COIN' })) {
        if (prices[sym]) continue
        try {
          const coinRes = await fetch('https://www.tgju.org/coin', { cache: 'no-store', ...TGJU_FETCH_OPTS })
          if (coinRes.ok) {
            const coinHtml = await coinRes.text()
            const sectionMatch = coinHtml.match(new RegExp(`<tr data-market-row="${slug}".*?<td[^>]*class="[^"]*nf[^"]*"[^>]*data-price="([\\d,]+)"`, 's'))
            if (sectionMatch) {
              setWithChange(sym, parseTgjuPrice(sectionMatch[1]), 'IRR', slug)
            }
          }
        } catch {}
      }
    }

    return { prices, irrRate, timestamp: '' }
  } catch (e) { console.error('[prices] fetchTgjuHTML error:', e); return { prices: {}, irrRate: 0, timestamp: '' } }
}

export async function fetchTgjuData(): Promise<{
  prices: PriceMap
  irrRate: number
  timestamp: string
}> {
  // AJAX first (works better from cloud IPs like Vercel)
  const rev = Math.random().toString(36).substring(2, 12)
  try {
    const ajaxRes = await fetch(`${TGJU_AJAX}?rev=${rev}`, { cache: 'no-store', next: { revalidate: 0 }, ...TGJU_FETCH_OPTS })
    if (ajaxRes.ok) {
      const ajaxData = await ajaxRes.json()
      if (ajaxData?.current) {
        return parseTgjuAjax(ajaxData)
      }
    }
  } catch {}

  // HTML fallback (works from some IPs)
  const htmlResult = await fetchTgjuHTML()
  if (htmlResult.prices && Object.keys(htmlResult.prices).length > 0 && htmlResult.irrRate > 0) {
    return htmlResult
  }

  // Second AJAX attempt with longer timeout
  try {
    const ajaxRes2 = await fetch(`${TGJU_AJAX}?rev=${Math.random().toString(36).substring(2, 12)}`, {
      cache: 'no-store', ...FETCH_OPTS, signal: AbortSignal.timeout(10000),
    })
    if (ajaxRes2.ok) {
      const ajaxData2 = await ajaxRes2.json()
      if (ajaxData2?.current) {
        return parseTgjuAjax(ajaxData2)
      }
    }
  } catch {}

  return { prices: {}, irrRate: 0, timestamp: '' }
}

function parseTgjuAjax(data: any): { prices: PriceMap; irrRate: number; timestamp: string } {
  const c = data.current
  const prices: PriceMap = {}
  const timestamp = c.price_dollar_rl?.ts || ''

  const rawUsd = c.price_dollar_rl?.p
  if (!rawUsd) return { prices: {}, irrRate: 0, timestamp: '' }
  const irrRate = parseTgjuPrice(rawUsd)
  if (irrRate < 5000000) {
    console.warn('[prices] Rejecting TGJU AJAX USD rate (too low, likely official rate):', irrRate)
    return { prices: {}, irrRate: 0, timestamp: '' }
  }

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

  if (!prices['GOLD24'] && prices['GOLD18']) {
    prices['GOLD24'] = { price: Math.round(prices['GOLD18'].price * 4 / 3), currency: 'IRR' }
  }
  if (!prices['HALF_COIN'] && prices['COIN']) {
    prices['HALF_COIN'] = { price: Math.round(prices['COIN'].price * 0.52), currency: 'IRR' }
  }
  if (!prices['QUARTER_COIN'] && prices['COIN']) {
    prices['QUARTER_COIN'] = { price: Math.round(prices['COIN'].price * 0.30), currency: 'IRR' }
  }

  const toleranceNameMap: Record<string, string> = {
    geram18: 'GOLD18', geram24: 'GOLD24',
    sekee: 'COIN', sekeb: 'COIN',
    nim: 'HALF_COIN', rob: 'QUARTER_COIN',
    mesghal: 'MESGHAL',
  }
  for (const arr of [data.tolerance_high ?? [], data.tolerance_low ?? []]) {
    for (const item of arr) {
      const sym = toleranceNameMap[item.name]
      if (sym && !prices[sym] && item.p) {
        const p = parseTgjuPrice(item.p)
        if (p > 0) prices[sym] = { price: p, currency: 'IRR' }
      }
    }
  }

  return { prices, irrRate, timestamp }
}

// ---- CoinGecko: fallback for crypto ----
export async function fetchCryptoPrices(symbols: string[]): Promise<PriceMap> {
  // Try Nobitex FIRST
  const nobitexResult = await fetchNobitexCrypto(['USDT', 'BTC', 'ETH', 'TRX', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'SHIB', 'MATIC', 'LINK', 'AVAX'])
  if (Object.keys(nobitexResult).length > 0) return nobitexResult

  // Fallback: CoinGecko
  const geckoSymbols = symbols.filter(s => COINGECKO_IDS[s]).map(s => COINGECKO_IDS[s])
  if (geckoSymbols.length > 0) {
    const url = `${COINGECKO}/simple/price?ids=${geckoSymbols.join(',')}&vs_currencies=usd&include_24hr_change=true`
    try {
      const res = await fetch(url, { ...FETCH_OPTS })
      const data = await res.json()
      const result: PriceMap = {}
      for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
        if (data[id]?.usd) result[symbol] = { price: data[id].usd, currency: 'USD', change: data[id].usd_24h_change ?? 0 }
      }
      if (Object.keys(result).length > 0) return result
    } catch (e) { console.error('fetchCryptoPrices CoinGecko error:', e) }
  }

  return {}
}

export function convertUsdToIrr(usdPrice: number, irrRate: number): number {
  return Math.round(usdPrice * irrRate)
}

export async function fetchAllPrices(insCodeMap?: Record<string, string>): Promise<{
  prices: PriceMap
  irrRate: number
  stockPrices: Record<string, { price: number; change: number; closePrice: number }>
}> {
  const stockFetch = insCodeMap
    ? Promise.allSettled(
        Object.entries(insCodeMap).map(([symbol, code]) =>
          fetchTsetmcPriceInfo(code).then(info => ({ symbol, info }))
        )
      )
    : Promise.resolve([] as PromiseSettledResult<{ symbol: string; info: any }>[])

  // Only need nobitex for rate + TGJU for commodities
  const [nobitexRate, tgju, stockResults] = await Promise.all([
    fetchNobitexUsdRate(),
    fetchTgjuData(),
    stockFetch,
  ])

  let irrRate = nobitexRate > 0 ? nobitexRate : tgju.irrRate
  const prices: PriceMap = { ...tgju.prices }

  // Get crypto - Nobitex first
  const crypto = await fetchCryptoPrices(['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRX'])
  for (const [sym, d] of Object.entries(crypto)) {
    prices[sym] = d
  }

  // Set IRR rate from nobitex (preferred)
  if (nobitexRate > 0) {
    prices['USD-IRR'] = { price: nobitexRate, currency: 'IRR' }
    prices['USDT-IRR'] = { price: nobitexRate, currency: 'IRR' }
  }

  // Compute crypto-IRR
  if (irrRate > 0) {
    for (const sym of Object.keys(crypto)) {
      const usdPrice = crypto[sym]?.price
      if (usdPrice) {
        prices[`${sym}-IRR`] = { price: convertUsdToIrr(usdPrice, irrRate), currency: 'IRR' }
      }
    }
  }

  // DB fallback
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
        const dbRate = Number(usdRow.price)
        if (dbRate < 5000000) {
          console.warn('[prices] Rejecting DB USD rate (too low):', dbRate)
        } else {
          irrRate = dbRate
          prices['USD-IRR'] = { price: irrRate, currency: 'IRR' }
          prices['USDT-IRR'] = { price: irrRate, currency: 'IRR' }
          for (const sym of Object.keys(crypto)) {
            const usdPrice = crypto[sym]?.price
            if (usdPrice) {
              prices[`${sym}-IRR`] = { price: convertUsdToIrr(usdPrice, irrRate), currency: 'IRR' }
            }
          }
        }
      }
    } catch (e) { console.error('[prices] DB fallback error:', e) }
  }

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

// ---- TSETMC stock functions ----
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
      const exactMatch = data.instrumentSearch.find((i: any) => i.lVal18AFC === symbol)
      if (exactMatch) return exactMatch.insCode
      const nameMatch = data.instrumentSearch.find((i: any) => i.lVal30 === symbol)
      if (nameMatch) return nameMatch.insCode
      const mainBoard = data.instrumentSearch.find((i: any) => i.flow === 1 && i.cgrValCot?.startsWith('N'))
      if (mainBoard) return mainBoard.insCode
      return data.instrumentSearch[0]?.insCode || null
    }
    return null
  } catch (e) { console.error('[prices] fetchTsetmcSearch error:', e); return null }
}

export async function fetchTsetmcSearchAll(query: string): Promise<Array<{ symbol: string; name: string; sector: string; insCode: string }>> {
  try {
    const encoded = encodeURIComponent(query)
    const res = await fetch(`${TSETMC_API}/Instrument/GetInstrumentSearch/${encoded}`, { ...FETCH_OPTS })
    if (!res.ok) return []
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) return []
    const data = await res.json()
    if (!data?.instrumentSearch?.length) return []
    return data.instrumentSearch
      .filter((i: any) => String(i.flow) === '1' || !i.flow)
      .map((i: any) => ({
        symbol: i.lVal18AFC || '',
        name: i.lVal30 || '',
        sector: i.cgrValCot?.replace(/^[NAB]/, '').trim() || i.market || '',
        insCode: i.insCode || '',
      }))
      .filter((i: any) => i.symbol && i.name && i.insCode)
  } catch (e) { console.error('[prices] fetchTsetmcSearchAll error:', e); return [] }
}

export async function fetchTsetmcFullList(): Promise<Array<{ symbol: string; name: string; sector: string }>> {
  try {
    const res = await fetch(`${TSETMC_API}/Instrument/GetInstrumentList/0/0/0`, { ...FETCH_OPTS })
    if (!res.ok) return []
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) return []
    const data = await res.json()
    if (!data?.instrument?.length) return []
    return data.instrument
      .filter((i: any) => String(i.flow) === '1')
      .map((i: any) => ({
        symbol: i.lVal18AFC || '',
        name: i.lVal30 || '',
        sector: i.cgrValCot?.replace(/^[NAB]/, '').trim() || '',
      }))
      .filter((i: any) => i.symbol && i.name)
  } catch (e) { console.error('[prices] fetchTsetmcFullList error:', e); return [] }
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
  } catch (e) { console.error('[prices] fetchTsetmcPriceInfo error:', e); return null }
}
