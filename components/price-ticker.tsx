'use client'

import { useState, useEffect } from 'react'

type PriceMap = Record<string, { price: number; currency: string }>

function parseTgjuPrice(val: string): number {
  return Number(val.replace(/,/g, ''))
}

async function fetchTgjuPrices(): Promise<PriceMap> {
  const rev = Math.random().toString(36).substring(2, 12)
  const urls = [`https://call2.tgju.org/ajax.json?rev=${rev}`]
  for (const url of urls) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const data = await res.json()
      if (!data?.current?.price_dollar_rl?.p) continue
      const c = data.current
      const p: PriceMap = {}
      const irrRate = parseTgjuPrice(c.price_dollar_rl.p)
      if (irrRate < 5000000) continue
      p['USD-IRR'] = { price: irrRate, currency: 'IRR' }
      p['USDT-IRR'] = { price: irrRate, currency: 'IRR' }
      if (c.price_eur?.p) p['EUR-IRR'] = { price: parseTgjuPrice(c.price_eur.p), currency: 'IRR' }
      if (c.geram18?.p) p['GOLD18'] = { price: parseTgjuPrice(c.geram18.p), currency: 'IRR' }
      if (c.sekee?.p) p['COIN'] = { price: parseTgjuPrice(c.sekee.p), currency: 'IRR' }
      return p
    } catch { continue }
  }
  return {}
}

const TICKER_SYMBOLS = [
  { key: 'BTC', label: 'BTC', format: (p: number) => `$${p.toLocaleString()}` },
  { key: 'ETH', label: 'ETH', format: (p: number) => `$${p.toLocaleString()}` },
  { key: 'USDT', label: 'USDT', format: (p: number) => `$${p.toFixed(2)}` },
  { key: 'USD-IRR', label: 'دلار', format: (p: number) => `${(p / 10).toLocaleString('fa-IR')} تومان` },
  { key: 'EUR-IRR', label: 'یورو', format: (p: number) => `${(p / 10).toLocaleString('fa-IR')} تومان` },
  { key: 'GOLD18', label: 'طلای ۱۸', format: (p: number) => `${(p / 10).toLocaleString('fa-IR')} تومان /گرم` },

]

export function PriceTicker() {
  const [prices, setPrices] = useState<PriceMap>({})

  useEffect(() => {
    fetchTgjuPrices().then(tgjuP => {
      if (Object.keys(tgjuP).length > 0) setPrices(tgjuP)
    })
  }, [])

  const items = TICKER_SYMBOLS
    .map(s => {
      const p = prices[s.key]?.price
      if (!p) return null
      return { ...s, display: s.format(p) }
    })
    .filter(Boolean)

  if (items.length === 0) return <div className="h-7 bg-gradient-to-r from-blue-950/80 via-blue-900/60 to-blue-950/80 border-b border-blue-500/10" />

  return (
    <div className="h-7 bg-gradient-to-r from-blue-950/80 via-blue-900/60 to-blue-950/80 border-b border-blue-500/10 overflow-hidden">
      <div className="relative h-full flex items-center overflow-hidden">
        <div className="flex animate-ticker gap-10 whitespace-nowrap px-4" style={{ direction: 'ltr' }}>
          {[...items, ...items].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] text-blue-200/80 font-medium">
              <span className="text-blue-400 font-bold">{item!.label}</span>
              <span>{item!.display}</span>
              <span className="text-blue-500/30">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
