'use client'

import { useEffect, useState, useMemo } from 'react'
import { TrendingUp, ChevronDown, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PERSIAN_MONTHS } from '@/lib/persian-date'

const PM = PERSIAN_MONTHS

function PriceSync() {
  useEffect(() => {
    const sync = async () => {
      try { await fetch('/api/prices') } catch {}
    }
    sync()
    const id = setInterval(sync, 2 * 60 * 60 * 1000)
    return () => clearInterval(id)
  }, [])
  return null
}

export default function SignalsPage() {
  const [revenue, setRevenue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch('/api/signals')
      .then(r => { if (!r.ok) throw new Error('خطا'); return r.json() })
      .then(d => { if (Array.isArray(d.revenue)) setRevenue(d.revenue) })
      .catch(e => { setError(e.message); setRevenue([]) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (range === 0) return revenue
    const now = new Date()
    const cutoff = new Date(now.getTime() - range * 30 * 24 * 60 * 60 * 1000)
    const cutoffMs = cutoff.getTime()
    return revenue.filter(r => {
      const j = new Date()
      const monthMs = r.year * 365.25 * 24 * 60 * 60 * 1000 / 12 + r.month * 30.44 * 24 * 60 * 60 * 1000
      const nowMs = new Date().getTime()
      const diffMonths = (nowMs - monthMs) / (30.44 * 24 * 60 * 60 * 1000)
      return diffMonths <= range
    })
  }, [revenue, range])

  const totalRevenue = filtered.reduce((s, r) => s + r.amount, 0)
  const maxAmount = Math.max(...filtered.map(r => r.amount), 1)
  const showLimit = range === 0 && filtered.length > 6
  const display = showLimit ? filtered.slice(0, 6) : filtered

  if (loading) {
    return (
      <div dir="rtl" className="flex items-center justify-center py-16">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div dir="rtl" className="glass border border-red-500/20 rounded-2xl p-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors">تلاش مجدد</button>
      </div>
    )
  }

  return (
    <div dir="rtl">
      <PriceSync />
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-emerald-500/5 blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '30px 30px' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-1.5 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-muted-foreground font-semibold">اعتبارسنجی</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black">
              درآمد <span className="bg-gradient-to-r from-emerald-400 to-primary bg-clip-text text-transparent">A|CAP</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">درآمد ماهانه A|CAP — شفافیت کامل در عملکرد مالی</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="flex flex-wrap gap-2 justify-center mb-8"
          >
            {[
              { label: 'درآمد کل', value: `${totalRevenue.toLocaleString()} تومان`, color: '#10B981' },
              { label: 'تعداد ماه', value: filtered.length, color: '#fff' },
              { label: 'میانگین', value: `${(totalRevenue / (filtered.length || 1)).toLocaleString()} تومان`, color: '#818CF8' },
              { label: 'بیشترین', value: `${filtered.length > 0 ? Math.max(...filtered.map(r => r.amount)).toLocaleString() : 0} تومان`, color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} className="glass border border-border rounded-xl px-4 py-2 text-center min-w-[70px]">
                <div className="text-[9px] text-muted-foreground">{s.label}</div>
                <div className="text-sm font-black" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex gap-2 justify-center flex-wrap mb-8"
          >
            {[
              { label: 'همه', value: 0 },
              { label: '۱ ماهه', value: 1 },
              { label: '۳ ماهه', value: 3 },
              { label: '۶ ماهه', value: 6 },
              { label: '۱۲ ماهه', value: 12 },
            ].map(r => (
              <button key={r.value} onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  range === r.value
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'glass border-border text-muted-foreground hover:border-white/20 hover:text-foreground'
                }`}
              >{r.label}</button>
            ))}
          </motion.div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">هیچ داده درآمدی ثبت نشده است</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                <AnimatePresence>
                  {display.map((r, i) => {
                    const pct = (r.amount / maxAmount) * 100
                    const isExpanded = expandedId === r.id
                    const monthName = PM[r.month - 1] || r.month

                    return (
                      <motion.div key={r.id} layout
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                        className="glass border border-border hover:border-emerald-500/20 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group"
                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      >
                        <div className="p-4 pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/15">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-foreground leading-tight">{r.year}</div>
                                <div className="text-[9px] text-muted-foreground">{monthName}</div>
                              </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-accent/50 rounded-lg px-2.5 py-1.5">
                            <span className="font-bold text-emerald-400">{r.amount.toLocaleString()} تومان</span>
                          </div>
                        </div>

                        <div className="px-4">
                          <div className="h-1.5 rounded-full bg-accent/50 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10B981, #059669)' }} />
                          </div>
                        </div>

                        <div className="p-4 pt-2">
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-black tabular-nums text-emerald-400">
                              {r.amount.toLocaleString()} <span className="text-[10px] font-medium text-muted-foreground">تومان</span>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && r.description && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="border-t border-border mx-4 overflow-hidden"
                            >
                              <div className="py-3">
                                <p className="text-[11px] text-muted-foreground leading-relaxed">{r.description}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
              {showLimit && (
                <div className="text-center mt-6">
                  <p className="text-xs text-muted-foreground">نمایش ۶ مورد از {filtered.length}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
