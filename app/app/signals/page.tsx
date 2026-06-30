'use client'

import { useEffect, useState, useMemo } from 'react'
import { Zap, TrendingUp, TrendingDown } from 'lucide-react'

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

function formatPersianMonth(iso: string): string {
  const d = new Date(iso)
  return `${PERSIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(3)

  useEffect(() => {
    setLoading(true)
    const months = range > 0 ? range : 0
    fetch(`/api/signals${months > 0 ? `?months=${months}` : ''}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setSignals(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [range])

  const { avgReturn, successRate, signalCount, grouped } = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    let totalReturn = 0
    let successCount = 0

    for (const s of signals) {
      const monthKey = new Date(s.publishedAt).toISOString().slice(0, 7)
      if (!grouped[monthKey]) grouped[monthKey] = []
      grouped[monthKey].push(s)
      totalReturn += s.profitPercent ?? 0
      if (s.profitPercent >= 0) successCount++
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-black text-foreground">سیگنال‌های A|CAP+</h1>
          <p className="text-xs text-muted-foreground mt-0.5">تقویم عملکرد سیگنال‌ها</p>
        </div>
      </div>

      {/* Time range */}
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

      {/* Stats banner */}
      {!loading && signals.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <div className="text-[10px] text-muted-foreground">میانگین بازدهی</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">+{avgReturn.toFixed(1)}%</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <div className="text-[10px] text-muted-foreground">نرخ موفقیت</div>
            <div className="text-lg font-black text-blue-400 mt-0.5">{successRate.toFixed(0)}%</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <div className="text-[10px] text-muted-foreground">تعداد سیگنال‌ها</div>
            <div className="text-lg font-black text-foreground mt-0.5">{signalCount}</div>
          </div>
        </div>
      )}

      {/* Grid of squares */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
          {grouped.map(([monthKey, monthSignals]) => (
            <div key={monthKey}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-bold text-muted-foreground px-2">{formatPersianMonth(monthSignals[0].publishedAt)}</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {monthSignals.map((s: any) => {
                  const isUp = s.profitPercent >= 0
                  const tb = TYPE_BADGES[s.type] ?? { label: '?', color: '#666' }
                  const inv = INVESTOR_STYLES[s.investorType] ?? INVESTOR_STYLES.balanced

                  return (
                    <button key={s.id}
                      className="group bg-card border border-border rounded-2xl p-3 text-right hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-default text-right"
                    >
                      {/* Top: type + investor dots */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[7px] font-black text-white"
                          style={{ background: tb.color }}>{tb.label}</span>
                        <span className="w-2 h-2 rounded-full" style={{ background: inv.color }}
                          title={inv.label} />
                      </div>

                      {/* Name */}
                      <div className="text-[11px] font-bold text-foreground leading-tight mb-2 line-clamp-2" style={{ minHeight: '2em' }}>
                        {s.title}
                      </div>

                      {/* Profit % */}
                      <div className={`text-base font-black ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? '+' : ''}{s.profitPercent.toFixed(1)}%
                      </div>

                      {/* Days ago */}
                      <div className="text-[9px] text-muted-foreground mt-1">
                        {s.daysSince} روز
                      </div>

                      {/* Hover detail */}
                      <div className="text-[9px] text-muted-foreground/0 group-hover:text-muted-foreground/70 transition-colors mt-1 leading-tight line-clamp-2">
                        {s.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
