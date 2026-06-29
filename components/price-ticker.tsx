'use client'

import { useState, useEffect } from 'react'

type PriceMap = Record<string, { price: number; currency: string }>

const TICKER_SYMBOLS = [
  { key: 'BTC', label: 'BTC', format: (p: number) => `$${p.toLocaleString()}` },
  { key: 'ETH', label: 'ETH', format: (p: number) => `$${p.toLocaleString()}` },
  { key: 'USDT', label: 'USDT', format: (p: number) => `$${p.toFixed(2)}` },
  { key: 'USD-IRR', label: 'دلار', format: (p: number) => `${(p / 10).toLocaleString('fa-IR')} تومان` },
  { key: 'EUR-IRR', label: 'یورو', format: (p: number) => `${(p / 10).toLocaleString('fa-IR')} تومان` },
  { key: 'GOLD18', label: 'طلای ۱۸', format: (p: number) => `${(p / 10).toLocaleString('fa-IR')} تومان` },
  { key: 'GOLD', label: 'انس', format: (p: number) => `$${p.toLocaleString()}` },
]

export function PriceTicker() {
  const [prices, setPrices] = useState<PriceMap>({})

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch('/api/prices')
        const data = await res.json()
        if (data?.prices) setPrices(data.prices)
      } catch {}
    }
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  const items = TICKER_SYMBOLS
    .map(s => {
      const p = prices[s.key]?.price
      if (!p) return null
      return { ...s, display: s.format(p) }
    })
    .filter(Boolean)

  if (items.length === 0) return null

  return (
    <div className="h-7 bg-gradient-to-r from-blue-950/80 via-blue-900/60 to-blue-950/80 border-b border-blue-500/10 overflow-hidden">
      <div className="relative h-full flex items-center overflow-hidden">
        <div className="flex animate-ticker gap-10 whitespace-nowrap px-4" style={{ direction: 'ltr' }}>
          {[...items, ...items, ...items, ...items, ...items].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] text-blue-200/80 font-medium">
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
