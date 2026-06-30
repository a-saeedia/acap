'use client'

import { useEffect, useState, useMemo } from 'react'
import { Zap, Clock, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'

const TIME_RANGES = [
  { label: '۱ ماهه', months: 1 },
  { label: '۳ ماهه', months: 3 },
  { label: '۶ ماهه', months: 6 },
  { label: '۱ ساله', months: 12 },
  { label: 'همه', months: 0 },
]

const INVESTOR_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  conservative: { label: 'محافظه‌کار', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  balanced: { label: 'متعادل', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  growth: { label: 'رشدگرا', color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
  aggressive: { label: 'تهاجمی', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
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
  const day = d.getDate()
  const month = PERSIAN_MONTHS[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

function formatPersianMonth(iso: string): string {
  const d = new Date(iso)
  return `${PERSIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function toPersianNumber(n: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return Math.abs(n).toLocaleString('fa-IR').replace(/[0-9]/g, d => persianDigits[parseInt(d)] ?? d)
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

  const { totalProfit, totalInvestment, signalCount, grouped } = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    let totalProfit = 0
    let totalInvestment = 0

    for (const s of signals) {
      const monthKey = new Date(s.publishedAt).toISOString().slice(0, 7)
      if (!grouped[monthKey]) grouped[monthKey] = []
      grouped[monthKey].push(s)

      const investAmount = 1000000
      const currentValue = s.priceAtPublish > 0
        ? (investAmount / s.priceAtPublish) * s.currentPrice
        : investAmount
      totalProfit += currentValue - investAmount
      totalInvestment += investAmount
    }

    return {
      totalProfit,
      totalInvestment,
      signalCount: signals.length,
      grouped: Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)),
    }
  }, [signals])

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-black text-foreground">سیگنال‌های A|CAP+</h1>
          <p className="text-xs text-muted-foreground mt-0.5">سیگنال‌های هوشمند بر اساس تحلیل بازار</p>
        </div>
      </div>

      {/* Time range selector */}
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

      {/* Summary card */}
      {!loading && signals.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 p-4"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(217,119,6,0.10) 100%)' }}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">سود فرضی (سرمایه {toPersianNumber(1000000)} تومان در هر سیگنال)</div>
              <div className={`text-2xl font-black ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalProfit >= 0 ? '+' : ''}{toPersianNumber(Math.round(totalProfit))} تومان
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5">
                مجموع {toPersianNumber(signalCount)} سیگنال در {toPersianNumber(Object.keys(grouped).length)} ماه
              </div>
            </div>
            <div className="text-left">
              <div className="text-[10px] text-muted-foreground">بازدهی کل</div>
              <div className={`text-lg font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalProfit >= 0 ? '+' : ''}{(totalProfit / totalInvestment * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signals timeline */}
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
              {/* Month header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-bold text-muted-foreground px-2">{formatPersianMonth(monthSignals[0].publishedAt)}</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Signals */}
              <div className="space-y-3">
                {monthSignals.map((s: any) => {
                  const isUp = s.profitPercent >= 0
                  const typeBadge = TYPE_BADGES[s.type] ?? { label: '?', color: '#666' }
                  const inv = INVESTOR_STYLES[s.investorType] ?? INVESTOR_STYLES.balanced

                  return (
                    <div key={s.id}
                      className="bg-card border border-border rounded-2xl p-4 hover:border-primary/20 transition-all"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="w-7 h-7 rounded-xl flex items-center justify-center text-[9px] font-black text-white"
                              style={{ background: typeBadge.color }}>{typeBadge.label}</span>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: inv.color }} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">{s.title}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: inv.bg, color: inv.color }}>
                                {inv.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {formatPersianDate(s.publishedAt)}</span>
                              <span>·</span>
                              <span>{s.daysSince > 0 ? `${s.daysSince} روز قبل` : 'امروز'}</span>
                            </div>
                          </div>
                        </div>

                        <div className={`flex items-center gap-0.5 px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 ${
                          isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                        }`}>
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isUp ? '+' : ''}{s.profitPercent.toFixed(1)}%
                        </div>
                      </div>

                      {/* Price row */}
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          قیمت سیگنال: <span className="text-foreground font-bold">{toPersianNumber(Math.round(s.priceAtPublish))}</span>
                        </span>
                        <ChevronLeft className="w-3 h-3" />
                        <span className="flex items-center gap-1">
                          قیمت فعلی: <span className="text-foreground font-bold">{toPersianNumber(Math.round(s.currentPrice))}</span>
                        </span>
                      </div>

                      {/* Hypothetical profit row */}
                      {s.priceAtPublish > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-2 text-[10px]">
                          <span className="text-muted-foreground">سود فرضی (۱M تومان):</span>
                          <span className={`font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isUp ? '+' : ''}{toPersianNumber(Math.round(1000000 * (s.currentPrice - s.priceAtPublish) / s.priceAtPublish))} تومان
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      {s.description && (
                        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{s.description}</p>
                      )}
                    </div>
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
