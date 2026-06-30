'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

const PERSIAN_LABELS: Record<string, string> = {
  'BTC': 'بیت‌کوین', 'ETH': 'اتریوم', 'USDT': 'تتر', 'BNB': 'بایننس کوین',
  'SOL': 'سولانا', 'XRP': 'ریپل', 'ADA': 'کاردانو', 'DOGE': 'دوج کوین',
  'TRX': 'ترون', 'USD-IRR': 'دلار', 'EUR-IRR': 'یورو', 'AED-IRR': 'درهم',
  'TRY-IRR': 'لیر', 'GBP-IRR': 'پوند', 'GOLD18': 'طلای ۱۸', 'GOLD24': 'طلای ۲۴',
  'COIN': 'سکه امامی', 'HALF_COIN': 'نیم سکه', 'QUARTER_COIN': 'ربع سکه',
  'XAU': 'انس طلا', 'BTC-IRR': 'بیت‌کوین', 'ETH-IRR': 'اتریوم', 'USDT-IRR': 'تتر',
  'GOLD': 'طلای ۱۸',
}

const CURRENCY_LABELS: Record<string, string> = {
  USD: 'دلار', IRR: 'تومان',
}

export default function PricesPage() {
  const [prices, setPrices] = useState<Record<string, { price: number; currency: string }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/prices').then(r => r.json()).then(d => {
      const m: Record<string, { price: number; currency: string }> = {}
      for (const [k, v] of Object.entries(d.prices ?? {}) as [string, any][]) m[k] = v
      setPrices(m)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() =>
    Object.entries(prices).filter(([, v]) => v.price > 0),
  [prices])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl md:text-3xl font-black mb-8">قیمت‌های به‌روز</h1>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(([symbol, data]) => {
            const isUsd = data.currency === 'USD'
            const displayPrice = isUsd ? data.price : data.price / 10
            return (
              <motion.div key={symbol} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="font-bold text-base text-foreground">{PERSIAN_LABELS[symbol] || symbol}</div>
                <div className="text-xl font-black text-blue-400 mt-1 font-mono">
                  {isUsd
                    ? `$${displayPrice.toLocaleString()}`
                    : `${displayPrice.toLocaleString('fa-IR')}`
                  }
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {CURRENCY_LABELS[data.currency] || data.currency}
                  {isUsd && symbol.endsWith('-IRR') ? ' / تومان' : ''}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
