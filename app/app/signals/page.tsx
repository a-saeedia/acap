'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PERSIAN_MONTHS } from '@/lib/persian-date'

function RevenueView({ revenue }: { revenue: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const maxAmount = Math.max(...revenue.map(r => r.amount), 1)
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0)
  const monthCount = revenue.length

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
            درآمد <span className="bg-gradient-to-r from-emerald-400 to-primary bg-clip-text text-transparent">A|CAP</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">درآمد ماهانه A|CAP — شفافیت کامل در عملکرد مالی</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {[
            { label: 'درآمد کل', value: `${totalRevenue.toLocaleString()} تومان`, color: '#10B981' },
            { label: 'تعداد ماه', value: monthCount, color: '#fff' },
            { label: 'میانگین ماهانه', value: `${(totalRevenue / (monthCount || 1)).toLocaleString()} تومان`, color: '#818CF8' },
            { label: 'بیشترین', value: `${Math.max(...revenue.map(r => r.amount)).toLocaleString()} تومان`, color: '#F59E0B' },
            { label: 'کمترین', value: `${Math.min(...revenue.map(r => r.amount)).toLocaleString()} تومان`, color: '#94A3B8' },
          ].map(s => (
            <div key={s.label} className="glass border border-border rounded-xl px-4 py-2 text-center min-w-[70px]">
              <div className="text-[9px] text-muted-foreground">{s.label}</div>
              <div className="text-sm font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            <AnimatePresence>
              {revenue.map((r, i) => {
                const pct = (r.amount / maxAmount) * 100
                const isExpanded = expandedId === r.id
                const monthName = PERSIAN_MONTHS[r.month - 1] || r.month

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
        </motion.div>
      </div>
    </div>
  )
}

export default function SignalsPage() {
  const [revenue, setRevenue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch('/api/signals')
      .then(r => { if (!r.ok) throw new Error('خطا در دریافت اطلاعات'); return r.json() })
      .then(d => {
        if (Array.isArray(d.revenue)) setRevenue(d.revenue)
      })
      .catch(e => { setError(e.message); setRevenue([]) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div dir="rtl" className="space-y-5">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="glass border border-red-500/20 rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
          >تلاش مجدد</button>
        </div>
      ) : (
        <RevenueView revenue={revenue} />
      )}
    </div>
  )
}
