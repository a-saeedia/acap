'use client'

import { useEffect, useState, useMemo } from 'react'
import { Zap, Clock, X, ArrowLeft, DollarSign, Filter, TrendingUp, Target, Droplets, Building2, Activity, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPersianDate, formatPersianMonth, persianMonthKey, PERSIAN_MONTHS } from '@/lib/persian-date'
import { ContentRenderer } from '@/components/content-renderer'

const SUB_TABS = [
  { key: 'signals', label: 'سیگنال‌ها' },
  { key: 'revenue', label: 'درآمد A|CAP' },
]

const TIME_RANGES = [
  { label: '۱ ماهه', months: 1 },
  { label: '۳ ماهه', months: 3 },
  { label: '۶ ماهه', months: 6 },
]

const INVESTOR_STYLES: Record<string, { label: string; color: string }> = {
  conservative: { label: 'محافظه‌کار', color: '#10B981' },
  balanced: { label: 'متعادل', color: '#3B82F6' },
  growth: { label: 'رشدگرا', color: '#F97316' },
  aggressive: { label: 'تهاجمی', color: '#EF4444' },
}

const INVESTOR_TYPES = [
  { key: 'all', label: 'همه' },
  { key: 'conservative', label: 'محافظه‌کار', color: '#10B981' },
  { key: 'balanced', label: 'متعادل', color: '#3B82F6' },
  { key: 'growth', label: 'رشدگرا', color: '#F97316' },
  { key: 'aggressive', label: 'تهاجمی', color: '#EF4444' },
]

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  crypto: { label: 'C', color: '#F7931A' },
  stock: { label: 'S', color: '#2979FF' },
  gold: { label: 'G', color: '#F59E0B' },
  forex: { label: 'F', color: '#8B5CF6' },
  dollar: { label: 'D', color: '#22C55E' },
}

const TYPE_CFG: Record<string, { color: string; icon: any; label: string }> = {
  crypto: { color: '#F7931A', icon: TrendingUp, label: 'رمز ارز' },
  stock: { color: '#2979FF', icon: Building2, label: 'بورس ایران' },
  gold: { color: '#F59E0B', icon: Target, label: 'طلا' },
  forex: { color: '#8B5CF6', icon: Activity, label: 'فارکس' },
  dollar: { color: '#22C55E', icon: Droplets, label: 'دلار' },
}

function DetailModal({ item, onClose }: { item: any; onClose: () => void }) {
  const isUp = (item.actualProfit ?? 0) >= 0
  const isExpired = item.expiresAt ? new Date(item.expiresAt) < new Date() : false

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-l from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">سیگنال A|CAP</span>
              </div>
              <h2 className="text-xl font-black text-foreground leading-tight">{item.title}</h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/20 hover:bg-black/30 text-muted-foreground hover:text-foreground transition-all shrink-0">
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
            <ContentRenderer text={item.description} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-3.5 text-center">
              <div className="text-[10px] text-muted-foreground mb-1">سود مورد انتظار</div>
              <div className="text-lg font-black text-blue-400">+{(item.expectedProfit ?? 0).toFixed(1)}%</div>
            </div>
            <div className={`${isUp ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-red-500/8 border-red-500/20'} rounded-2xl p-3.5 text-center border`}>
              <div className="text-[10px] text-muted-foreground mb-1">سود واقعی</div>
              <div className={`text-lg font-black ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? '+' : ''}{(item.actualProfit ?? 0).toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span>تاریخ انتشار</span>
              <span className="font-medium text-foreground/70">{formatPersianDate(item.publishedAt)}</span>
            </div>
            {item.expiresAt && (
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span>تاریخ انقضا</span>
                <span className={`font-medium flex items-center gap-1 ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                  <Clock className="w-3 h-3" />
                  {formatPersianDate(item.expiresAt)}
                  {isExpired ? ' (منقضی شده)' : ''}
                </span>
              </div>
            )}
            {item.type && (
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

function SignalCard({ item, onClick }: { item: any; onClick: () => void }) {
  const isUp = (item.actualProfit ?? 0) >= 0
  const tb = TYPE_BADGES[item.type] ?? { label: 'S', color: '#666' }
  const inv = INVESTOR_STYLES[item.investorType] ?? INVESTOR_STYLES.balanced
  const daysAgo = item.daysSince ?? Math.floor((Date.now() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <button key={item.id} onClick={onClick}
      className="group bg-card border border-border rounded-2xl p-3 text-right hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all text-right"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[7px] font-black text-white"
          style={{ background: tb.color }}>{tb.label}</span>
        <span className="w-2 h-2 rounded-full" style={{ background: inv.color }} title={inv.label} />
      </div>
      <div className="text-[11px] font-bold text-foreground leading-tight mb-2 line-clamp-2" style={{ minHeight: '2em' }}>
        {item.title}
      </div>
      <div className={`text-base font-black ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {isUp ? '+' : ''}{(item.actualProfit ?? 0).toFixed(1)}%
      </div>
      <div className="text-[9px] text-muted-foreground mt-1">{daysAgo} روز</div>
      {item.description && (
        <div className="text-[9px] text-muted-foreground/0 group-hover:text-muted-foreground/70 transition-colors mt-1 leading-tight line-clamp-2 whitespace-pre-wrap">
          {item.description}
        </div>
      )}
    </button>
  )
}

function RevenueView({ signals, revenue, range, onRangeChange }: { signals: any[]; revenue: any[]; range: number; onRangeChange: (r: number) => void }) {
  const [activeMonth, setActiveMonth] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const months = useMemo(() => {
    const m = new Map<string, { year: number; month: string }>()
    for (const sig of signals) {
      const pd = formatPersianDate(sig.publishedAt)
      const parts = pd.split(' ')
      if (parts.length >= 3) {
        const key = `${parts[2]}__${parts[1]}`
        if (!m.has(key)) m.set(key, { year: +parts[2], month: parts[1] })
      }
    }
    return [...m.values()].sort((a, b) => (a.year * 12 + (+a.month)) - (b.year * 12 + (+b.month)))
  }, [signals])

  const monthKeyF = (sig: any) => {
    const pd = formatPersianDate(sig.publishedAt)
    const parts = pd.split(' ')
    return parts.length >= 3 ? `${parts[2]}__${parts[1]}` : ''
  }

  const filtered = useMemo(() => {
    if (!activeMonth) return signals
    return signals.filter(sig => monthKeyF(sig) === activeMonth)
  }, [signals, activeMonth])

  const stats = useMemo(() => {
    const total = filtered.length
    const wins = filtered.filter(s => (s.actualProfit ?? 0) >= 0).length
    const avgWin = wins > 0 ? filtered.filter(s => (s.actualProfit ?? 0) >= 0).reduce((s, sig) => s + (sig.actualProfit ?? 0), 0) / wins : 0
    const avgLoss = total - wins > 0 ? filtered.filter(s => (s.actualProfit ?? 0) < 0).reduce((s, sig) => s + (sig.actualProfit ?? 0), 0) / (total - wins) : 0
    return { total, wins, losses: total - wins, winRate: total > 0 ? (wins / total * 100).toFixed(0) : '0', avgWin, avgLoss }
  }, [filtered])

  const maxAbsProfit = Math.max(...filtered.map(s => Math.abs(s.actualProfit ?? 0)), 1)

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-emerald-500/5 blur-[80px] animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '6s' }} />

      <div className="relative space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-1.5 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-muted-foreground font-semibold">اعتبارسنجی</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            عملکرد <span className="bg-gradient-to-r from-emerald-400 to-primary bg-clip-text text-transparent">A|CAP</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">پیشنهادات معاملاتی ثبت‌شده — شفافیت کامل در عملکرد</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {[
            { label: 'کل', value: stats.total, color: '#fff' },
            { label: 'برد', value: stats.wins, color: '#10B981' },
            { label: 'باخت', value: stats.losses, color: '#EF4444' },
            { label: 'نرخ برد', value: `${stats.winRate}%`, color: '#10B981' },
            { label: 'سود متوسط', value: `%${stats.avgWin.toFixed(1)}`, color: '#10B981' },
            { label: 'ضرر متوسط', value: `%${Math.abs(stats.avgLoss).toFixed(1)}`, color: '#EF4444' },
          ].map(s => (
            <div key={s.label} className="glass border border-border rounded-xl px-4 py-2 text-center min-w-[70px]">
              <div className="text-[9px] text-muted-foreground">{s.label}</div>
              <div className="text-sm font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </motion.div>

        {months.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex gap-2 justify-center flex-wrap"
          >
            <button onClick={() => setActiveMonth(null)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                !activeMonth ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'glass border-border text-muted-foreground hover:border-white/20 hover:text-foreground'
              }`}
            >همه</button>
            {[...months].reverse().map(m => (
              <button key={`${m.year}__${m.month}`} onClick={() => setActiveMonth(`${m.year}__${m.month}`)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activeMonth === `${m.year}__${m.month}` ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'glass border-border text-muted-foreground hover:border-white/20 hover:text-foreground'
                }`}
              >{m.month} {m.year}</button>
            ))}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            <AnimatePresence>
              {filtered.map((sig, i) => {
                const cfg = TYPE_CFG[sig.type] || { color: '#666', icon: Activity, label: 'سایر' }
                const Icon = cfg.icon
                const isWin = (sig.actualProfit ?? 0) >= 0
                const pct = Math.abs(sig.actualProfit ?? 0) / maxAbsProfit * 100
                const isExpanded = expandedId === sig.id
                const invStyle = sig.investorType ? INVESTOR_STYLES[sig.investorType] : null
                const pd = formatPersianDate(sig.publishedAt)
                const parts = pd.split(' ')
                const yearLabel = parts.length >= 3 ? parts[2] : ''
                const monLabel = parts.length >= 3 ? parts[1] : ''

                return (
                  <motion.div key={sig.id} layout
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                    className="glass border border-border hover:border-emerald-500/20 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group"
                    onClick={() => setExpandedId(isExpanded ? null : sig.id)}
                  >
                    <div className="p-4 pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cfg.color}20` }}>
                            <Icon className="w-4.5 h-4.5" style={{ color: cfg.color }} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground leading-tight">{sig.symbol || cfg.label}</div>
                            <div className="text-[9px] text-muted-foreground">{yearLabel} | {monLabel}</div>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-accent/50 rounded-lg px-2.5 py-1.5">
                        <span className="font-semibold text-foreground">{formatPersianDate(sig.publishedAt)}</span>
                        {sig.expiresAt && (
                          <><span>→</span><span className="font-semibold text-foreground">{formatPersianDate(sig.expiresAt)}</span></>
                        )}
                      </div>
                    </div>

                    <div className="px-4">
                      <div className="h-1.5 rounded-full bg-accent/50 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: isWin ? '#10B981' : '#EF4444' }} />
                      </div>
                    </div>

                    <div className="p-4 pt-3 flex items-center justify-between">
                      <div className={`text-lg font-black tabular-nums ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isWin ? '+' : ''}{(sig.actualProfit ?? 0).toFixed(1)}%
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isWin ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {isWin ? 'سود' : 'ضرر'}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border mx-4 overflow-hidden"
                        >
                          <div className="py-3 space-y-2">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">نوع دارایی</span>
                              <span className="text-foreground font-semibold">{cfg.label}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">مدت معامله</span>
                              <span className="text-foreground font-semibold">{sig.expiresAt ? Math.ceil((new Date(sig.expiresAt).getTime() - new Date(sig.publishedAt).getTime()) / 86400000) : '—'} روز</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">سود مورد انتظار</span>
                              <span className="text-blue-400 font-semibold">+{(sig.expectedProfit ?? 0).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">مناسب برای</span>
                              <span className="text-foreground font-semibold">{invStyle?.label || '—'}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<any[]>([])
  const [revenue, setRevenue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState(6)
  const [investorFilter, setInvestorFilter] = useState('all')
  const [selected, setSelected] = useState<any | null>(null)
  const [subTab, setSubTab] = useState<'signals' | 'revenue'>('signals')

  function loadData(months: number) {
    setLoading(true)
    setError('')
    fetch(`/api/signals${months > 0 ? `?months=${months}` : ''}`)
      .then(r => { if (!r.ok) throw new Error('خطا در دریافت اطلاعات'); return r.json() })
      .then(d => {
        if (Array.isArray(d.signals)) setSignals(d.signals)
        if (Array.isArray(d.revenue)) setRevenue(d.revenue)
      })
      .catch(e => { setError(e.message); setSignals([]); setRevenue([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const months = range > 0 ? range : 0
    loadData(months)
  }, [range])

  const filteredSignals = useMemo(() => {
    if (investorFilter === 'all') return signals
    return signals.filter(s => s.investorType === investorFilter)
  }, [signals, investorFilter])

  const { successRate, signalCount, grouped } = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    let successCount = 0
    for (const s of filteredSignals) {
      const monthKey = persianMonthKey(s.publishedAt)
      if (!grouped[monthKey]) grouped[monthKey] = []
      grouped[monthKey].push(s)
      if ((s.actualProfit ?? 0) >= 0) successCount++
    }
    return {
      successRate: filteredSignals.length > 0 ? (successCount / filteredSignals.length) * 100 : 0,
      signalCount: filteredSignals.length,
      grouped: Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)),
    }
  }, [filteredSignals])

  return (
    <div dir="rtl" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-black text-foreground">سیگنال‌های A|CAP</h1>
          <p className="text-xs text-muted-foreground mt-0.5">تقویم عملکرد سیگنال‌های A|CAP</p>
        </div>
      </div>

      <div className="flex gap-1">
        {SUB_TABS.map(tab => (
          <button key={tab.key} onClick={() => setSubTab(tab.key as 'signals' | 'revenue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === tab.key
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-white/[0.04] text-muted-foreground border border-transparent hover:bg-white/[0.08]'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {subTab === 'revenue' ? (
        loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="glass border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button onClick={() => loadData(range)}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
            >تلاش مجدد</button>
          </div>
        ) : (
          <RevenueView signals={signals} revenue={revenue} range={range} onRangeChange={setRange} />
        )
      ) : (
        <>
          <div className="flex gap-1.5 flex-wrap">
            {TIME_RANGES.map(tr => (
              <button key={tr.months} onClick={() => setRange(tr.months)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  range === tr.months
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-white/[0.04] text-muted-foreground border border-transparent hover:bg-white/[0.08]'
                }`}
              >
                {tr.label}
              </button>
            ))}
          </div>

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>درآمد A|CAP</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">{revenue.reduce((sum: number, r: any) => sum + r.amount, 0).toLocaleString()} <span className="text-[10px] font-medium">تومان</span></div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 text-center">
                <div className="text-xs text-muted-foreground">نرخ موفقیت</div>
                <div className="text-lg sm:text-xl font-black text-blue-400 mt-0.5">{successRate.toFixed(0)}%</div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 text-center">
                <div className="text-xs text-muted-foreground">تعداد سیگنال‌ها</div>
                <div className="text-lg sm:text-xl font-black text-foreground mt-0.5">{signalCount}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {INVESTOR_TYPES.map(it => (
              <button key={it.key} onClick={() => setInvestorFilter(it.key)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  investorFilter === it.key
                    ? it.key === 'all'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-white border'
                    : 'bg-white/[0.04] text-muted-foreground border border-transparent hover:bg-white/[0.08]'
                }`}
                style={investorFilter === it.key && it.key !== 'all' ? { background: `${it.color}20`, borderColor: `${it.color}50`, color: it.color } : {}}
              >
                {it.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-card border border-red-500/20 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <button onClick={() => loadData(range > 0 ? range : 0)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
              >تلاش مجدد</button>
            </div>
          ) : filteredSignals.length === 0 && revenue.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">هیچ داده‌ای در این بازه وجود ندارد</p>
            </div>
          ) : filteredSignals.length > 0 && (
            <div className="space-y-6">
              {grouped.map(([monthKey, monthItems]) => (
                <div key={monthKey}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-bold text-muted-foreground px-2">
                      {formatPersianMonth(monthItems[0].publishedAt)}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {monthItems.map((item: any) => (
                      <SignalCard key={item.id} item={item} onClick={() => setSelected(item)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredSignals.length === 0 && revenue.length > 0 && null}

          {!loading && revenue.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-bold text-muted-foreground px-2">درآمد ماهانه A|CAP</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-2">
                {[...revenue].sort((a, b) => (b.year - a.year) || (b.month - a.month)).map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground">{PERSIAN_MONTHS[r.month - 1] || r.month} {r.year}</span>
                    <div className="text-left">
                      <span className="text-sm font-bold text-emerald-400">{Number(r.amount).toLocaleString()} تومان</span>
                      {r.description && <p className="text-[10px] text-muted-foreground mt-0.5">{r.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected && (
            <DetailModal item={selected} onClose={() => setSelected(null)} />
          )}
        </>
      )}
    </div>
  )
}
