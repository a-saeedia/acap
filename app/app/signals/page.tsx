'use client'

import { useEffect, useState, useMemo } from 'react'
import { Zap, TrendingUp, TrendingDown, Crown, Clock, X, ArrowLeft } from 'lucide-react'
import { getUserSuggestions } from '@/app/actions/admin'
import { useSession } from '@/lib/auth-client'

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

function DetailModal({ item, type, onClose }: { item: any; type: 'revenue' | 'personal'; onClose: () => void }) {
  const isUp = (item.actualProfit ?? item.profitPercent ?? 0) >= 0
  const isExpired = item.expiresAt ? new Date(item.expiresAt) < new Date() : false

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
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
          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] text-muted-foreground font-medium">توضیحات</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{item.description || item.content}</p>
          </div>

          {/* Profit comparison */}
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

          {/* Metadata */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span>تاریخ انتشار</span>
              <span className="font-medium text-foreground/70">{formatPersianDate(item.publishedAt || item.createdAt)}</span>
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

      {item.description && (
        <div className="text-[9px] text-muted-foreground/0 group-hover:text-muted-foreground/70 transition-colors mt-1 leading-tight line-clamp-2">
          {item.description}
        </div>
      )}
      {!item.description && item.content && (
        <div className="text-[9px] text-muted-foreground/0 group-hover:text-muted-foreground/70 transition-colors mt-1 leading-tight line-clamp-2">
          {item.content}
        </div>
      )}
    </button>
  )
}

export default function SignalsPage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<'revenue' | 'personal'>('revenue')
  const [signals, setSignals] = useState<any[]>([])
  const [personalSignals, setPersonalSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(3)
  const [selected, setSelected] = useState<{ item: any; type: 'revenue' | 'personal' } | null>(null)

  // Fetch A|CAP Revenue signals
  useEffect(() => {
    setLoading(true)
    const months = range > 0 ? range : 0
    fetch(`/api/signals${months > 0 ? `?months=${months}` : ''}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setSignals(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [range])

  // Fetch personal suggestions
  useEffect(() => {
    if (!session?.user) return
    getUserSuggestions().then(setPersonalSignals).catch(() => {})
  }, [session])

  const { avgReturn, successRate, signalCount, grouped } = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    let totalReturn = 0
    let successCount = 0

    const items = tab === 'revenue' ? signals : personalSignals
    for (const s of items) {
      const monthKey = new Date(s.publishedAt || s.createdAt).toISOString().slice(0, 7)
      if (!grouped[monthKey]) grouped[monthKey] = []
      grouped[monthKey].push(s)
      totalReturn += (s.actualProfit ?? s.profitPercent ?? 0)
      if ((s.actualProfit ?? s.profitPercent ?? 0) >= 0) successCount++
    }

    return {
      avgReturn: items.length > 0 ? totalReturn / items.length : 0,
      successRate: items.length > 0 ? (successCount / items.length) * 100 : 0,
      signalCount: items.length,
      grouped: Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)),
    }
  }, [signals, personalSignals, tab])

  const items = tab === 'revenue' ? signals : personalSignals

  return (
    <div dir="rtl" className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          {tab === 'revenue' ? <Zap className="w-5 h-5 text-primary" /> : <Crown className="w-5 h-5 text-amber-400" />}
        </div>
        <div>
          <h1 className="text-lg font-black text-foreground">
            {tab === 'revenue' ? 'سیگنال‌های A|CAP' : 'سیگنال‌های شخصی'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tab === 'revenue' ? 'تقویم عملکرد سیگنال‌های A|CAP' : 'پیشنهادات اختصاصی سرمایه‌گذاری برای شما'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        <button onClick={() => setTab('revenue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'revenue'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-white/[0.04] text-muted-foreground border border-transparent hover:bg-white/[0.08]'
          }`}
        >
          <Zap className="w-3 h-3 inline-block ml-1" />سیگنال‌های A|CAP
        </button>
        <button onClick={() => setTab('personal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'personal'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-white/[0.04] text-muted-foreground border border-transparent hover:bg-white/[0.08]'
          }`}
        >
          <Crown className="w-3 h-3 inline-block ml-1" />شخصی
          {personalSignals.length > 0 && (
            <span className="mr-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15">
              {personalSignals.length}
            </span>
          )}
        </button>
      </div>

      {/* A|CAP Revenue: time range */}
      {tab === 'revenue' && (
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
      )}

      {/* Stats */}
      {!loading && items.length > 0 && (
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
            <div className="text-[10px] text-muted-foreground">تعداد</div>
            <div className="text-lg font-black text-foreground mt-0.5">{signalCount}</div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
            {tab === 'revenue' ? <Zap className="w-6 h-6 text-muted-foreground" /> : <Crown className="w-6 h-6 text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground">
            {tab === 'revenue' ? 'هیچ سیگنالی در این بازه وجود ندارد' : 'هنوز پیشنهادی برای شما ثبت نشده'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([monthKey, monthItems]) => (
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
                  <SignalCard key={item.id} item={item} type={tab} onClick={() => setSelected({ item, type: tab })} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <DetailModal item={selected.item} type={selected.type} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
