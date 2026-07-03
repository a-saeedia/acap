'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Clock, X, ArrowLeft } from 'lucide-react'

const TIME_RANGES = [
  { label: '۱ ماهه', months: 1 },
  { label: '۳ ماهه', months: 3 },
  { label: '۶ ماهه', months: 6 },
  { label: '۱ ساله', months: 12 },
  { label: 'همه', months: 0 },
]

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
            <p className="text-sm text-foreground/90 leading-relaxed">{item.description}</p>
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
        <div className="text-[9px] text-muted-foreground/0 group-hover:text-muted-foreground/70 transition-colors mt-1 leading-tight line-clamp-2">
          {item.description}
        </div>
      )}
    </button>
  )
}

export default function SignalsPage() {
  const router = useRouter()
  const [signals, setSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState(3)
  const [selected, setSelected] = useState<any | null>(null)

  function loadSignals(months: number) {
    setLoading(true)
    setError('')
    fetch(`/api/signals${months > 0 ? `?months=${months}` : ''}`)
      .then(r => { if (!r.ok) throw new Error('خطا در دریافت سیگنال‌ها'); return r.json() })
      .then(d => { if (Array.isArray(d)) setSignals(d) })
      .catch(e => { setError(e.message); setSignals([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const months = range > 0 ? range : 0
    loadSignals(months)
  }, [range])

  const { avgReturn, successRate, signalCount, grouped } = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    let totalReturn = 0
    let successCount = 0
    for (const s of signals) {
      const monthKey = new Date(s.publishedAt).toISOString().slice(0, 7)
      if (!grouped[monthKey]) grouped[monthKey] = []
      grouped[monthKey].push(s)
      totalReturn += s.actualProfit ?? 0
      if ((s.actualProfit ?? 0) >= 0) successCount++
    }
    return {
      avgReturn: signals.length > 0 ? totalReturn / signals.length : 0,
      successRate: signals.length > 0 ? (successCount / signals.length) * 100 : 0,
      signalCount: signals.length,
      grouped: Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)),
    }
  }, [signals])

  return (
    <div dir="rtl" className="space-y-5">
      {/* Back to dashboard */}
      <button onClick={() => router.push('/app')}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        بازگشت
      </button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-black text-foreground">سیگنال‌های A|CAP</h1>
          <p className="text-xs text-muted-foreground mt-0.5">تقویم عملکرد سیگنال‌های A|CAP</p>
        </div>
      </div>

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

      {!loading && signals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 text-center">
            <div className="text-xs text-muted-foreground">میانگین بازدهی</div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">+{avgReturn.toFixed(1)}%</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 text-center">
            <div className="text-xs text-muted-foreground">نرخ موفقیت</div>
            <div className="text-lg sm:text-xl font-black text-blue-400 mt-0.5">{successRate.toFixed(0)}%</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 text-center">
            <div className="text-xs text-muted-foreground">تعداد</div>
            <div className="text-lg sm:text-xl font-black text-foreground mt-0.5">{signalCount}</div>
          </div>
        </div>
      )}

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
          <button onClick={() => loadSignals(range > 0 ? range : 0)}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
          >تلاش مجدد</button>
        </div>
      ) : signals.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">هیچ سیگنالی در این بازه وجود ندارد</p>
        </div>
      ) : (
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

      {selected && (
        <DetailModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
