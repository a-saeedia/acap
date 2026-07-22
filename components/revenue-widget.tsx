'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Target, Building2, Activity, ChevronDown, Play, Pause, Volume2, X } from 'lucide-react'

const TC: Record<string, string> = {
  crypto: '#F7931A', stock: '#10B981', gold: '#FFD700', forex: '#3B82F6', dollar: '#34D399',
}

const TI: Record<string, any> = {
  crypto: TrendingUp, stock: Building2, gold: Target, forex: Activity, dollar: TrendingUp,
}

const PM = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

function pDate(d: Date) {
  const g = new Date(d.getTime() + 3.5 * 3600000)
  const y = g.getFullYear()
  const m20 = new Date(y, 2, 20)
  const diff = Math.floor((g.getTime() - m20.getTime()) / 86400000)
  let py = y - 621, pm = diff < 0 ? 11 : Math.min(Math.floor(diff / 31), 11)
  const pd = diff < 0 ? 30 + diff : diff - (pm > 6 ? 186 + 30 * (pm - 6) : 31 * pm) + 1
  if (diff < 0) { py--; pm += 12 }
  return { year: py, month: pm + 1, day: pd }
}

export function RevenueWidget() {
  const [range, setRange] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [signals, setSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/signals${range > 0 ? `?months=${range}` : ''}`)
      .then(r => r.json())
      .then(d => setSignals(d.signals || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [range])

  const stats = useMemo(() => {
    const total = signals.length
    const wins = signals.filter(s => s.actualProfit > 0).length
    const withReturn = signals.filter(s => s.actualProfit !== null && s.actualProfit !== undefined)
    const avgWin = wins > 0 ? withReturn.filter(s => s.actualProfit > 0).reduce((s, o) => s + o.actualProfit, 0) / wins : 0
    const avgLoss = total - wins > 0 ? withReturn.filter(s => s.actualProfit < 0).reduce((s, o) => s + o.actualProfit, 0) / (total - wins) : 0
    return { total, wins, losses: total - wins, winRate: total > 0 ? (wins / total * 100).toFixed(0) : '0', avgWin, avgLoss }
  }, [signals])

  const maxAbsProfit = Math.max(...signals.map(s => Math.abs(s.actualProfit || 0)), 1)
  const filtered = range === 0 ? signals : signals
  const display = filtered

  const typeLabel = (t: string) => {
    const m: Record<string, string> = { crypto: 'ارز دیجیتال', stock: 'سهام', gold: 'طلا', forex: 'فارکس', dollar: 'دلار' }
    return m[t] || t
  }

  return (
    <section className="relative py-16 lg:py-20">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-emerald-500/5 blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '30px 30px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-1.5 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-muted-foreground font-semibold">سیگنال‌ها</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black">
            عملکرد <span className="bg-gradient-to-r from-emerald-400 to-primary bg-clip-text text-transparent">A|CAP</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">سیگنال‌های معاملاتی ثبت‌شده — شفافیت کامل در عملکرد</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
          className="flex flex-wrap gap-2 justify-center mb-8"
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

        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
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

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : display.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">هنوز سیگنالی ثبت نشده است. از پنل ادمین سیگنال جدید اضافه کنید.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              <AnimatePresence>
                {display.map((s, i) => {
                  const Icon = TI[s.type] || TrendingUp
                  const color = TC[s.type] || '#666'
                  const isWin = s.actualProfit > 0
                  const pct = Math.abs(s.actualProfit || 0) / maxAbsProfit * 100
                  const isExpanded = expandedId === s.id
                  const sd = s.publishedAt ? new Date(s.publishedAt) : new Date()
                  const pd = pDate(sd)

                  return (
                    <motion.div key={s.id}
                      layout
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                      className="glass border border-border hover:border-emerald-500/20 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group"
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    >
                      {s.imageUrl && (
                        <div className="relative h-40 overflow-hidden" onClick={e => { e.stopPropagation(); setPreviewImage(s.imageUrl) }}>
                          <img src={s.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                        </div>
                      )}
                      <div className="p-4 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                              <Icon className="w-4.5 h-4.5" style={{ color }} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-foreground leading-tight">{s.title}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] text-muted-foreground">{s.symbol}</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${s.action === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{s.action === 'buy' ? 'خرید' : 'فروش'}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-accent/50 rounded-lg px-2.5 py-1.5">
                          <span className="font-semibold text-foreground">{pd.year}/{pd.month}/{pd.day}</span>
                        </div>
                      </div>

                      <div className="px-4">
                        <div className="h-1.5 rounded-full bg-accent/50 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: isWin ? '#10B981' : '#EF4444' }} />
                        </div>
                      </div>

                      <div className="p-4 pt-3 flex items-center justify-between">
                        <div className={`text-lg font-black tabular-nums ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                          {s.actualProfit !== null && s.actualProfit !== undefined ? `${isWin ? '+' : ''}${s.actualProfit.toFixed(1)}%` : '—'}
                        </div>
                        <div className="flex items-center gap-2">
                          {s.audioUrl && (
                            <button onClick={e => { e.stopPropagation(); setPlayingAudio(playingAudio === s.audioUrl ? null : s.audioUrl) }}
                              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              {playingAudio === s.audioUrl ? <Pause className="w-3.5 h-3.5 text-primary" /> : <Play className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />}
                            </button>
                          )}
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isWin ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                            {isWin ? 'سود' : 'ضرر'}
                          </div>
                        </div>
                      </div>

                      {s.description && (
                        <div className="px-4 pb-2">
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{s.description}</p>
                        </div>
                      )}

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border mx-4 overflow-hidden"
                          >
                            <div className="py-3 space-y-2">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-muted-foreground">نوع دارایی</span>
                                <span className="text-foreground font-semibold">{typeLabel(s.type)}</span>
                              </div>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-muted-foreground">قیمت انتشار</span>
                                <span className="text-foreground font-semibold">{Number(s.priceAtPublish).toLocaleString()}</span>
                              </div>
                              {s.expectedProfit && <div className="flex justify-between text-[11px]">
                                <span className="text-muted-foreground">سود هدف</span>
                                <span className="text-emerald-400 font-bold">+{s.expectedProfit}%</span>
                              </div>}
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
        )}
      </div>

      {playingAudio && <audio src={playingAudio} onEnded={() => setPlayingAudio(null)} className="hidden" />}

      <AnimatePresence>
        {previewImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={previewImage} alt="" className="max-w-full max-h-[90vh] rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
