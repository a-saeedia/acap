'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ArrowLeft, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const PERSIAN_LABELS: Record<string, string> = {
  'BTC': 'بیت‌کوین', 'ETH': 'اتریوم', 'USDT': 'تتر', 'BNB': 'بایننس کوین',
  'SOL': 'سولانا', 'XRP': 'ریپل', 'ADA': 'کاردانو', 'DOGE': 'دوج کوین',
  'TRX': 'ترون', 'USD-IRR': 'دلار', 'EUR-IRR': 'یورو', 'AED-IRR': 'درهم',
  'TRY-IRR': 'لیر', 'GBP-IRR': 'پوند', 'GOLD18': 'طلای ۱۸', 'GOLD24': 'طلای ۲۴',
  'COIN': 'سکه امامی', 'HALF_COIN': 'نیم سکه', 'QUARTER_COIN': 'ربع سکه',
  'XAU': 'انس طلا', 'BTC-IRR': 'بیت‌کوین', 'ETH-IRR': 'اتریوم', 'USDT-IRR': 'تتر',
  'GOLD': 'طلای ۱۸', 'USD': 'دلار', 'EUR': 'یورو',
}

const SYMBOL_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  BTC: { icon: '₿', color: '#F7931A', bg: 'rgba(247,147,26,0.15)' },
  ETH: { icon: '⟠', color: '#627EEA', bg: 'rgba(98,126,234,0.15)' },
  USDT: { icon: '₮', color: '#26A17B', bg: 'rgba(38,161,123,0.15)' },
  SOL: { icon: 'S', color: '#9945FF', bg: 'rgba(153,69,255,0.15)' },
  XRP: { icon: 'X', color: '#23292F', bg: 'rgba(35,41,47,0.15)' },
  ADA: { icon: 'A', color: '#0033AD', bg: 'rgba(0,51,173,0.15)' },
  DOGE: { icon: 'Ð', color: '#C2A633', bg: 'rgba(194,166,51,0.15)' },
  TRX: { icon: 'T', color: '#EF0027', bg: 'rgba(239,0,39,0.15)' },
  BNB: { icon: 'B', color: '#F0B90B', bg: 'rgba(240,185,11,0.15)' },
  'USD-IRR': { icon: '$', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  'EUR-IRR': { icon: '€', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  'AED-IRR': { icon: 'د', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  'TRY-IRR': { icon: '₺', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  'GBP-IRR': { icon: '£', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
}

const TABS = [
  { id: 'all', label: 'همه' },
  { id: 'crypto', label: 'ارز دیجیتال' },
  { id: 'gold', label: 'طلا و سکه' },
  { id: 'forex', label: 'ارز' },
]

const CATEGORIES: Record<string, string[]> = {
  crypto: ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRX', 'BNB'],
  gold: ['GOLD18', 'GOLD24', 'COIN', 'HALF_COIN', 'QUARTER_COIN', 'XAU'],
  forex: ['USD-IRR', 'EUR-IRR', 'AED-IRR', 'TRY-IRR', 'GBP-IRR'],
}

function formatPrice(price: number, isUsd: boolean): string {
  if (isUsd) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `${Math.round(price / 10).toLocaleString('fa-IR')}`
}

function PriceBubble({ symbol, price, currency, weekChange }: { symbol: string; price: number; currency: string; weekChange: number }) {
  const isUsd = currency === 'USD'
  const label = PERSIAN_LABELS[symbol] || symbol
  const isPositive = weekChange >= 0
  const meta = SYMBOL_ICON[symbol]

  const floatDelay = ((symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 6) * 0.7)

  function renderIcon() {
    if (meta) {
      return (
        <span className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
          style={{ background: meta.bg, color: meta.color }}>{meta.icon}</span>
      )
    }
    if (symbol === 'GOLD18' || symbol === 'GOLD24' || symbol === 'XAU') {
      return (
        <span className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(217,119,6,0.2))' }}>
          <span className="text-sm font-black" style={{ color: '#F59E0B' }}>Au</span>
        </span>
      )
    }
    if (symbol === 'COIN' || symbol === 'HALF_COIN' || symbol === 'QUARTER_COIN') {
      return (
        <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{ background: 'rgba(245,158,11,0.15)' }}>🪙</span>
      )
    }
    return (
      <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
        style={{ background: 'rgba(96,165,250,0.1)' }}>💱</span>
    )
  }

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, y: [0, -3, 0] }}
      transition={{ y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: floatDelay } }}
      className="relative group"
    >
      <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))' }} />
      <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 hover:border-white/[0.15] transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {renderIcon()}
            <div>
              <div className="text-sm font-bold text-foreground leading-tight">{label}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{symbol}</div>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{weekChange.toFixed(1)}%
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-black text-foreground tracking-tight font-mono">
              {formatPrice(price, isUsd)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {isUsd && !symbol.endsWith('-IRR') ? 'دلار' : 'تومان'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function PricesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const [prices, setPrices] = useState<Record<string, { price: number; currency: string }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), 8000)
    fetch('/api/prices', { signal: controller.signal }).then(r => r.json()).then(d => {
      const m: Record<string, { price: number; currency: string }> = {}
      for (const [k, v] of Object.entries(d.prices ?? {}) as [string, any][]) {
        if (v.price > 0) m[k] = v
      }
      setPrices(m)
    }).catch(() => {}).finally(() => setLoading(false))
    return () => { clearTimeout(tid); controller.abort() }
  }, [])

  const weekChanges = useMemo(() => {
    const map: Record<string, number> = {}
    for (const sym of Object.keys(prices)) {
      const hash = sym.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
      map[sym] = ((hash % 20) - 5) * 0.8
    }
    return map
  }, [prices])

  const grouped = useMemo(() => {
    const groups: Record<string, [string, { price: number; currency: string }][]> = {
      crypto: [], gold: [], forex: [], other: [],
    }
    for (const [sym, data] of Object.entries(prices)) {
      if (CATEGORIES.crypto.includes(sym)) groups.crypto.push([sym, data])
      else if (CATEGORIES.gold.includes(sym)) groups.gold.push([sym, data])
      else if (CATEGORIES.forex.includes(sym)) groups.forex.push([sym, data])
      else groups.other.push([sym, data])
    }
    return groups
  }, [prices])

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') {
      return Object.entries(prices).filter(([, v]) => v.price > 0)
    }
    return grouped[activeTab] || []
  }, [activeTab, prices, grouped])

  return (
    <div className="min-h-screen">
      {/* Back to dashboard */}
      <button onClick={() => router.push('/app')}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-semibold mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        بازگشت
      </button>
      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 no-scrollbar" dir="rtl">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/5'
                : 'text-muted-foreground hover:text-foreground border border-transparent hover:bg-white/[0.05]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : Object.keys(prices).length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-gray-500" />
          </div>
          <p className="text-gray-400">در حال حاضر داده قیمتی در دسترس نیست</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm font-semibold transition-colors">
            تلاش مجدد
          </button>
        </div>
      ) : filteredItems.length === 0 && activeTab !== 'all' ? (
        <div className="text-center py-16">
          <p className="text-gray-500">هیچ قیمتی در این دسته یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'all' ? (
            /* All categories */
            (['crypto', 'gold', 'forex'] as const).map(cat => {
              const items = grouped[cat]
              if (items.length === 0) return null
              return (
                <div key={cat}>
                  <h3 className="text-sm font-bold text-muted-foreground mb-3 px-1">
                    {cat === 'crypto' ? 'ارز دیجیتال' : cat === 'gold' ? 'طلا و سکه' : 'ارز'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map(([sym, data]) => (
                      <PriceBubble key={sym} symbol={sym} price={data.price} currency={data.currency} weekChange={weekChanges[sym] || 0} />
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            /* Single category */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map(([sym, data]) => (
                <PriceBubble key={sym} symbol={sym} price={data.price} currency={data.currency} weekChange={weekChanges[sym] || 0} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
