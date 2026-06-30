'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Zap, Crown, Clock, X, ArrowLeft } from 'lucide-react'
import { getUserSuggestions } from '@/app/actions/admin'
import { useSession } from '@/lib/auth-client'

const PERSIAN_LABELS: Record<string, string> = {
  'BTC': 'بیت‌کوین', 'ETH': 'اتریوم', 'USDT': 'تتر', 'BNB': 'بایننس کوین',
  'SOL': 'سولانا', 'XRP': 'ریپل', 'ADA': 'کاردانو', 'DOGE': 'دوج کوین',
  'TRX': 'ترون', 'USD-IRR': 'دلار', 'EUR-IRR': 'یورو', 'AED-IRR': 'درهم',
  'TRY-IRR': 'لیر', 'GBP-IRR': 'پوند', 'GOLD18': 'طلای ۱۸', 'GOLD24': 'طلای ۲۴',
  'COIN': 'سکه امامی', 'HALF_COIN': 'نیم سکه', 'QUARTER_COIN': 'ربع سکه',
  'XAU': 'انس طلا', 'BTC-IRR': 'بیت‌کوین', 'ETH-IRR': 'اتریوم', 'USDT-IRR': 'تتر',
  'GOLD': 'طلای ۱۸', 'USD': 'دلار', 'EUR': 'یورو',
}

const CRYPTO_EMOJI: Record<string, string> = {
  BTC: '₿', ETH: '⟠', USDT: '₮', SOL: '◎', XRP: '✕', ADA: '₳', DOGE: 'Ð', TRX: '↗', BNB: '◆',
}

const TABS = [
  { id: 'all', label: 'همه' },
  { id: 'crypto', label: 'ارز دیجیتال' },
  { id: 'gold', label: 'طلا و سکه' },
  { id: 'forex', label: 'ارز' },
  { id: 'revenue', label: 'سیگنال‌های A|CAP' },
  { id: 'personal', label: 'شخصی' },
]

const CATEGORIES: Record<string, string[]> = {
  crypto: ['BTC', 'ETH', 'USDT', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRX', 'BNB'],
  gold: ['GOLD18', 'GOLD24', 'COIN', 'HALF_COIN', 'QUARTER_COIN', 'XAU'],
  forex: ['USD-IRR', 'EUR-IRR', 'AED-IRR', 'TRY-IRR', 'GBP-IRR'],
}

const INVESTOR_STYLES: Record<string, { label: string; color: string }> = {
  conservative: { label: 'محافظه‌کار', color: '#10B981' },
  balanced: { label: 'متعادل', color: '#3B82F6' },
  growth: { label: 'رشدگرا', color: '#F97316' },
  aggressive: { label: 'تهاجمی', color: '#EF4444' },
}

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  crypto: { label: 'C', color: '#F7931A' },
  stock: { label: 'S', color: '#2979FF' },
  gold: { label: 'G', color: '#F59E0B' },
  forex: { label: 'F', color: '#8B5CF6' },
}

const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

function formatPersianDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${PERSIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function formatPersianMonth(iso: string): string {
  const d = new Date(iso)
  return `${PERSIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function SignalDetailModal({ item, type, onClose }: { item: any; type: 'revenue' | 'personal'; onClose: () => void }) {
  const isUp = (item.actualProfit ?? item.profitPercent ?? 0) >= 0

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-l from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {type === 'revenue' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">سیگنال A|CAP</span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold">شخصی</span>
                )}
              </div>
              <h2 className="text-xl font-black text-foreground leading-tight">{item.title}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/20 hover:bg-black/30 text-muted-foreground hover:text-foreground transition-all shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] text-muted-foreground font-medium">توضیحات</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{item.description || item.content}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-3.5 text-center">
              <div className="text-[10px] text-muted-foreground mb-1">سود مورد انتظار</div>
              <div className="text-lg font-black text-blue-400">
                +{((item.expectedProfit ?? item.profitPercent ?? 0)).toFixed(1)}%
              </div>
            </div>
            <div className={`${isUp ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-red-500/8 border-red-500/20'} rounded-2xl p-3.5 text-center border`}>
              <div className="text-[10px] text-muted-foreground mb-1">سود واقعی</div>
              <div className={`text-lg font-black ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? '+' : ''}{(item.actualProfit ?? item.profitPercent ?? 0).toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span>تاریخ انتشار</span>
              <span className="font-medium text-foreground/70">{formatPersianDate(item.publishedAt || item.createdAt)}</span>
            </div>
            {item.expiresAt && (
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span>تاریخ انقضا</span>
                <span className={`font-medium flex items-center gap-1 ${new Date(item.expiresAt) < new Date() ? 'text-red-400' : 'text-emerald-400'}`}>
                  <Clock className="w-3 h-3" />
                  {formatPersianDate(item.expiresAt)}
                  {new Date(item.expiresAt) < new Date() ? ' (منقضی شده)' : ''}
                </span>
              </div>
            )}
            {item.profitMessage && (
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span>پیام سود</span>
                <span className="font-medium text-emerald-400/80">{item.profitMessage}</span>
              </div>
            )}
            {type === 'revenue' && item.type && (
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span>نوع</span>
                <span className="font-medium text-foreground/70">
                  {TYPE_BADGES[item.type]?.label || ''} {item.symbol}
                </span>
              </div>
            )}
            {item.investorType && (
              <div className="flex items-center justify-between py-1.5">
                <span>مناسب برای</span>
                <span className="font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: INVESTOR_STYLES[item.investorType]?.color || '#666' }} />
                  {INVESTOR_STYLES[item.investorType]?.label || item.investorType}
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose}
            className="w-full py-3 rounded-xl bg-white/[0.04] border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 inline-block ml-2" /> بازگشت
          </button>
        </div>
      </div>
    </div>
  )
}

function SignalCard({ item, type, onClick }: { item: any; type: 'revenue' | 'personal'; onClick: () => void }) {
  const isUp = (item.actualProfit ?? item.profitPercent ?? 0) >= 0
  const tb = TYPE_BADGES[item.type] ?? { label: 'S', color: '#666' }
  const inv = INVESTOR_STYLES[item.investorType] ?? INVESTOR_STYLES.balanced
  const daysAgo = item.daysSince ?? Math.floor((Date.now() - new Date(item.publishedAt || item.createdAt).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <button key={item.id} onClick={onClick}
      className="group bg-card border border-border rounded-2xl p-3 text-right hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all text-right"
    >
      <div className="flex items-center justify-between mb-2">
        {type === 'revenue' ? (
          <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[7px] font-black text-white"
            style={{ background: tb.color }}>{tb.label}</span>
        ) : (
          <Crown className="w-4 h-4 text-amber-400" />
        )}
        <span className="w-2 h-2 rounded-full" style={{ background: inv.color }} title={inv.label} />
      </div>
      <div className="text-[11px] font-bold text-foreground leading-tight mb-2 line-clamp-2" style={{ minHeight: '2em' }}>
        {item.title}
      </div>
      <div className={`text-base font-black ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {isUp ? '+' : ''}{(item.actualProfit ?? item.profitPercent ?? 0).toFixed(1)}%
      </div>
      <div className="text-[9px] text-muted-foreground mt-1">{daysAgo} روز</div>
      {(item.description || item.content) && (
        <div className="text-[9px] text-muted-foreground/0 group-hover:text-muted-foreground/70 transition-colors mt-1 leading-tight line-clamp-2">
          {item.description || item.content}
        </div>
      )}
    </button>
  )
}

function formatPrice(price: number, isUsd: boolean): string {
  if (isUsd) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `${Math.round(price / 10).toLocaleString('fa-IR')}`
}

function PriceBubble({ symbol, price, currency, weekChange }: { symbol: string; price: number; currency: string; weekChange: number }) {
  const isUsd = currency === 'USD'
  const label = PERSIAN_LABELS[symbol] || symbol
  const isPositive = weekChange >= 0
  const emoji = CRYPTO_EMOJI[symbol]
  const colorKey = symbol.startsWith('BTC') ? '#F7931A' : symbol.startsWith('ETH') ? '#627EEA' : symbol.startsWith('SOL') ? '#9945FF' : symbol.startsWith('USDT') ? '#26A17B' : symbol.startsWith('XRP') ? '#23292F' : ''

  const floatDelay = ((symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 6) * 0.7)

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
            {emoji ? (
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                style={{ background: `${colorKey}20`, color: colorKey || '#60A5FA' }}>{emoji}</span>
            ) : symbol === 'GOLD18' || symbol === 'GOLD24' ? (
              <span className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(217,119,6,0.2))' }}>
                <span className="text-sm font-black" style={{ color: '#F59E0B' }}>Au</span>
              </span>
            ) : symbol === 'COIN' ? (
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'rgba(245,158,11,0.15)' }}>🪙</span>
            ) : (
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                style={{ background: 'rgba(96,165,250,0.1)' }}>💱</span>
            )}
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
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('all')
  const [prices, setPrices] = useState<Record<string, { price: number; currency: string }>>({})
  const [loading, setLoading] = useState(true)
  const [signals, setSignals] = useState<any[]>([])
  const [personalSignals, setPersonalSignals] = useState<any[]>([])
  const [signalsLoading, setSignalsLoading] = useState(false)
  const [personalLoading, setPersonalLoading] = useState(false)
  const [selectedSignal, setSelectedSignal] = useState<{ item: any; type: 'revenue' | 'personal' } | null>(null)

  useEffect(() => {
    fetch('/api/prices').then(r => r.json()).then(d => {
      const m: Record<string, { price: number; currency: string }> = {}
      for (const [k, v] of Object.entries(d.prices ?? {}) as [string, any][]) {
        if (v.price > 0) m[k] = v
      }
      setPrices(m)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  // Fetch A|CAP Revenue signals
  useEffect(() => {
    if (activeTab !== 'revenue') return
    setSignalsLoading(true)
    fetch('/api/signals').then(r => r.json()).then(d => { if (Array.isArray(d)) setSignals(d) }).catch(() => {}).finally(() => setSignalsLoading(false))
  }, [activeTab])

  // Fetch personal suggestions
  useEffect(() => {
    if (activeTab !== 'personal' || !session?.user) return
    setPersonalLoading(true)
    getUserSuggestions().then(setPersonalSignals).catch(() => {}).finally(() => setPersonalLoading(false))
  }, [activeTab, session])

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

      {activeTab === 'revenue' || activeTab === 'personal' ? (
        <div className="space-y-5">
          {(() => {
            const isRevenue = activeTab === 'revenue'
            const items = isRevenue ? signals : personalSignals
            const isLoading = isRevenue ? signalsLoading : personalLoading
            if (isLoading) return (
              <div className="flex items-center justify-center py-16">
                <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )
            if (items.length === 0) return (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                  {isRevenue ? <Zap className="w-6 h-6 text-muted-foreground" /> : <Crown className="w-6 h-6 text-muted-foreground" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isRevenue ? 'هیچ سیگنالی وجود ندارد' : 'هنوز پیشنهادی برای شما ثبت نشده'}
                </p>
              </div>
            )
            const grouped: Record<string, any[]> = {}
            for (const s of items) {
              const monthKey = new Date(s.publishedAt || s.createdAt).toISOString().slice(0, 7)
              if (!grouped[monthKey]) grouped[monthKey] = []
              grouped[monthKey].push(s)
            }
            const sorted = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a))
            return (
              <div className="space-y-6">
                {sorted.map(([monthKey, monthItems]) => (
                  <div key={monthKey}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs font-bold text-muted-foreground px-2">
                        {formatPersianMonth(monthItems[0].publishedAt || monthItems[0].createdAt)}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {monthItems.map((item: any) => (
                        <SignalCard key={item.id} item={item} type={isRevenue ? 'revenue' : 'personal'} onClick={() => setSelectedSignal({ item, type: isRevenue ? 'revenue' : 'personal' })} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
          {selectedSignal && (
            <SignalDetailModal item={selectedSignal.item} type={selectedSignal.type} onClose={() => setSelectedSignal(null)} />
          )}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
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
