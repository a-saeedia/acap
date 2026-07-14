'use client'

import { useEffect, useState, useMemo } from 'react'
import { Zap, TrendingUp, Target, Droplets, Building2, Activity, ChevronDown, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPersianDate, PERSIAN_MONTHS } from '@/lib/persian-date'

const TYPE_CFG: Record<string, { color: string; icon: any; label: string }> = {
  crypto: { color: '#F7931A', icon: TrendingUp, label: 'رمز ارز' },
  stock: { color: '#2979FF', icon: Building2, label: 'بورس ایران' },
  gold: { color: '#F59E0B', icon: Target, label: 'طلا' },
  forex: { color: '#8B5CF6', icon: Activity, label: 'فارکس' },
  dollar: { color: '#22C55E', icon: Droplets, label: 'دلار' },
}

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

const TIME_RANGES = [
  { label: '۱ ماهه', months: 1 },
  { label: '۳ ماهه', months: 3 },
  { label: '۶ ماهه', months: 6 },
]

export default function SignalsPage() {
  const [signals, setSignals] = useState<any[]>([])
  const [revenue, setRevenue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState(6)
  const [investorFilter, setInvestorFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)

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

  useEffect(() => { loadData(range) }, [range])

  const filteredSignals = useMemo(() => {
    if (investorFilter === 'all') return signals
    return signals.filter(s => s.investorType === investorFilter)
  }, [signals, investorFilter])

  const stats = useMemo(() => {
    const total = filteredSignals.length
    const wins = filteredSignals.filter(s => (s.actualProfit ?? 0) >= 0).length
    const netProfit = filteredSignals.reduce((s, sig) => s + (sig.actualProfit ?? 0), 0) / Math.max(1, total)
    const avgWin = wins > 0 ? filteredSignals.filter(s => (s.actualProfit ?? 0) >= 0).reduce((s, sig) => s + (sig.actualProfit ?? 0), 0) / wins : 0
    const avgLoss = total - wins > 0 ? filteredSignals.filter(s => (s.actualProfit ?? 0) < 0).reduce((s, sig) => s + (sig.actualProfit ?? 0), 0) / (total - wins) : 0
    return { total, wins, losses: total - wins, winRate: total > 0 ? (wins / total * 100).toFixed(0) : '0', avgWin, avgLoss, netProfit }
  }, [filteredSignals])

  const maxAbsProfit = Math.max(...filteredSignals.map(s => Math.abs(s.actualProfit ?? 0)), 1)

  const sortedRevenue = useMemo(() => {
    return [...revenue].sort((a, b) => (b.year - a.year) || (b.month - a.month))
  }, [revenue])

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

      <div className="flex gap-1.5">
        {TIME_RANGES.map(tr => (
          <button key={tr.months} onClick={() => setRange(tr.months)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              range === tr.months
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'glass border-border text-muted-foreground hover:border-white/20 hover:text-foreground'
            }`}
          >{tr.label}</button>
        ))}
      </div>

      {!loading && (
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'کل', value: stats.total, color: '#fff' },
            { label: 'برد', value: stats.wins, color: '#10B981' },
            { label: 'باخت', value: stats.losses, color: '#EF4444' },
            { label: 'نرخ برد', value: `${stats.winRate}%`, color: '#10B981' },
            { label: 'سود خالص', value: `%${stats.netProfit >= 0 ? '+' : ''}${stats.netProfit.toFixed(1)}`, color: stats.netProfit >= 0 ? '#10B981' : '#EF4444' },
            { label: 'سود متوسط', value: `%${stats.avgWin.toFixed(1)}`, color: '#10B981' },
            { label: 'ضرر متوسط', value: `%${Math.abs(stats.avgLoss).toFixed(1)}`, color: '#EF4444' },
          ].map(s => (
            <div key={s.label} className="glass border border-border rounded-xl px-3 py-2 text-center min-w-[65px]">
              <div className="text-[9px] text-muted-foreground">{s.label}</div>
              <div className="text-xs sm:text-sm font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        {INVESTOR_TYPES.map(it => (
          <button key={it.key} onClick={() => setInvestorFilter(it.key)}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              investorFilter === it.key
                ? it.key === 'all'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'border'
                : 'bg-white/[0.04] text-muted-foreground border-transparent hover:bg-white/[0.08]'
            }`}
            style={investorFilter === it.key && it.key !== 'all' ? { background: `${it.color}20`, borderColor: `${it.color}50`, color: it.color } : {}}
          >{it.label}</button>
        ))}
      </div>

      {loading ? (
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
      ) : filteredSignals.length === 0 && revenue.length === 0 ? (
        <div className="glass border border-border rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">هیچ داده‌ای در این بازه وجود ندارد</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {filteredSignals.map((sig, i) => {
                const cfg = TYPE_CFG[sig.type] || { color: '#666', icon: Activity, label: 'سایر' }
                const Icon = cfg.icon
                const isWin = (sig.actualProfit ?? 0) >= 0
                const pct = Math.abs(sig.actualProfit ?? 0) / maxAbsProfit * 100
                const isExpanded = expandedId === sig.id
                const daysAgo = Math.floor((Date.now() - new Date(sig.publishedAt).getTime()) / (1000 * 60 * 60 * 24))

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
                            <div className="text-sm font-bold text-foreground leading-tight line-clamp-1">{sig.title}</div>
                            <div className="text-[9px] text-muted-foreground flex items-center gap-1">
                              <span style={{ color: sig.investorType ? INVESTOR_STYLES[sig.investorType]?.color : '#666' }} className="w-1.5 h-1.5 rounded-full inline-block" />
                              {sig.investorType ? INVESTOR_STYLES[sig.investorType]?.label : ''} · {daysAgo} روز
                            </div>
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
                              <span className="text-muted-foreground">سود مورد انتظار</span>
                              <span className="text-blue-400 font-semibold">+{(sig.expectedProfit ?? 0).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">مناسب برای</span>
                              <span className="text-foreground font-semibold">{sig.investorType ? INVESTOR_STYLES[sig.investorType]?.label : '—'}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">تاریخ انتشار</span>
                              <span className="text-foreground font-semibold">{formatPersianDate(sig.publishedAt)}</span>
                            </div>
                            {sig.expiresAt && (
                              <div className="flex justify-between text-[11px]">
                                <span className="text-muted-foreground">تاریخ انقضا</span>
                                <span className="text-foreground font-semibold">{formatPersianDate(sig.expiresAt)}</span>
                              </div>
                            )}
                            {sig.description && (
                              <div className="flex justify-between text-[11px]">
                                <span className="text-muted-foreground">توضیحات</span>
                                <span className="text-foreground text-left max-w-[60%]">{sig.description}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {sortedRevenue.length > 0 && (
            <div className="glass border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-muted-foreground">درآمد ماهانه A|CAP</span>
              </div>
              <div className="space-y-2">
                {sortedRevenue.map((r: any) => (
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
        </>
      )}
    </div>
  )
}
