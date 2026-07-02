'use client'

import { useEffect, useState, useMemo } from 'react'
import { Crown, Clock, X, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getUserSuggestions } from '@/app/actions/admin'

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
  const isExpired = item.expiresAt ? new Date(item.expiresAt) < new Date() : false

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-transparent px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold">شخصی</span>
              <h2 className="text-xl font-black text-foreground leading-tight mt-2">{item.title}</h2>
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
            <p className="text-sm text-foreground/90 leading-relaxed">{item.content}</p>
          </div>
          {item.profitPercent && (
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-3.5 text-center">
              <div className="text-[10px] text-muted-foreground mb-1">سود پیشنهادی</div>
              <div className="text-lg font-black text-emerald-400">+{Number(item.profitPercent).toFixed(1)}%</div>
            </div>
          )}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span>تاریخ ارسال</span>
              <span className="font-medium text-foreground/70">{formatPersianDate(item.createdAt)}</span>
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
            {item.isRead ? (
              <div className="flex items-center justify-between py-1.5">
                <span>وضعیت</span>
                <span className="font-medium text-emerald-400">خوانده شده</span>
              </div>
            ) : (
              <div className="flex items-center justify-between py-1.5">
                <span>وضعیت</span>
                <span className="font-medium text-amber-400">جدید</span>
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

export default function PersonalPage() {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    getUserSuggestions()
      .then(setSuggestions)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const grouped = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    for (const s of suggestions) {
      const monthKey = new Date(s.createdAt).toISOString().slice(0, 7)
      if (!grouped[monthKey]) grouped[monthKey] = []
      grouped[monthKey].push(s)
    }
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a))
  }, [suggestions])

  return (
    <div dir="rtl" className="space-y-5">
      {/* Back to dashboard */}
      <button onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        بازگشت به داشبورد
      </button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <Crown className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-lg font-black text-foreground">سیگنال‌های شخصی</h1>
          <p className="text-xs text-muted-foreground mt-0.5">پیشنهادات اختصاصی سرمایه‌گذاری برای شما</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : suggestions.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
            <Crown className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">هنوز پیشنهادی برای شما ثبت نشده</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([monthKey, monthItems]) => (
            <div key={monthKey}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-bold text-muted-foreground px-2">
                  {formatPersianMonth(monthItems[0].createdAt)}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {monthItems.map((item: any) => (
                  <button key={item.id} onClick={() => setSelected(item)}
                    className="group bg-card border border-border rounded-2xl p-3 text-right hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Crown className={`w-4 h-4 ${item.isRead ? 'text-muted-foreground/30' : 'text-amber-400'}`} />
                      {item.profitPercent && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">+{item.profitPercent}%</span>
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-foreground leading-tight mb-2 line-clamp-2" style={{ minHeight: '2em' }}>
                      {item.title}
                    </div>
                    <div className="text-[9px] text-muted-foreground line-clamp-2">{item.content}</div>
                    {item.expiresAt && (
                      <div className={`text-[8px] mt-1.5 ${new Date(item.expiresAt) < new Date() ? 'text-red-400/60' : 'text-muted-foreground/50'}`}>
                        {new Date(item.expiresAt) < new Date() ? 'منقضی شده' : formatPersianDate(item.expiresAt)}
                      </div>
                    )}
                  </button>
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
