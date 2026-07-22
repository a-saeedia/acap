'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Target, Building2, Activity, Play, Pause, X, ChevronDown, MessageSquare, Bot } from 'lucide-react'

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

function formatTelegramTime(d: Date) {
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function dateKey(sd: Date) {
  const pd = pDate(sd)
  return `${pd.year}/${pd.month}/${pd.day}`
}

const PERSIAN_DAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']

function persianDay(d: Date) {
  return PERSIAN_DAYS[d.getDay()]
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

  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {}
    for (const s of signals) {
      const sd = s.publishedAt ? new Date(s.publishedAt) : new Date()
      const k = dateKey(sd)
      if (!groups[k]) groups[k] = []
      groups[k].push(s)
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [signals])

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

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-1.5 mb-4">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-muted-foreground font-semibold">کانال سیگنال</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black">
            <span className="bg-gradient-to-r from-emerald-400 to-primary bg-clip-text text-transparent">A|CAP</span> Signals
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">سیگنال‌های معاملاتی مثل پیام‌های تلگرام — شفاف و مرتب</p>
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
        ) : signals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">هنوز سیگنالی ارسال نشده. از پنل ادمین سیگنال جدید اضافه کنید.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="space-y-6"
          >
            {grouped.map(([date, daySignals]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] text-muted-foreground font-semibold px-3 py-1 rounded-full glass border border-border">
                    {persianDay(new Date(daySignals[0].publishedAt))} {date}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-3">
                  {daySignals.map((s, i) => {
                    const Icon = TI[s.type] || TrendingUp
                    const color = TC[s.type] || '#666'
                    const isWin = s.actualProfit > 0
                    const isExpanded = expandedId === s.id
                    const sd = s.publishedAt ? new Date(s.publishedAt) : new Date()
                    const pd = pDate(sd)

                    return (
                      <motion.div key={s.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-3 group"
                      >
                        <div className="shrink-0 mt-1">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg" style={{ background: `${color}20` }}>
                            <Bot className="w-5 h-5" style={{ color }} />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div
                            className="relative rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200 border hover:brightness-110"
                            style={{
                              backgroundColor: `${color}08`,
                              borderColor: isExpanded ? `${color}30` : 'transparent',
                              borderRight: `3px solid ${color}`,
                            }}
                            onClick={() => setExpandedId(isExpanded ? null : s.id)}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">{s.title}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                  s.action === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                }`}>{s.action === 'buy' ? 'BUY' : 'SELL'}</span>
                              </div>
                              <div className={`text-xs font-black tabular-nums ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                                {s.actualProfit !== null && s.actualProfit !== undefined ? `${isWin ? '+' : ''}${s.actualProfit.toFixed(1)}%` : '—'}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                              <span className="font-semibold">{s.symbol}</span>
                              <span>{typeLabel(s.type)}</span>
                              <span className="bg-accent/50 px-1.5 py-0.5 rounded">{formatTelegramTime(sd)}</span>
                            </div>

                            {s.description && (
                              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">{s.description}</p>
                            )}

                            <div className="mt-2 h-1 rounded-full bg-accent/50 overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{
                                width: `${Math.abs(s.actualProfit || 0) / Math.max(...signals.map(x => Math.abs(x.actualProfit || 0)), 1) * 100}%`,
                                background: isWin ? '#10B981' : '#EF4444'
                              }} />
                            </div>

                            {s.imageUrl && (
                              <div className="mt-2 rounded-xl overflow-hidden cursor-pointer" onClick={e => { e.stopPropagation(); setPreviewImage(s.imageUrl) }}>
                                <img src={s.imageUrl} alt="" className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
                              </div>
                            )}

                            {s.audioUrl && (
                              <div className="mt-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setPlayingAudio(playingAudio === s.audioUrl ? null : s.audioUrl)}
                                  className="p-2 rounded-xl transition-colors" style={{ backgroundColor: `${color}15` }}
                                >
                                  {playingAudio === s.audioUrl ? <Pause className="w-4 h-4" style={{ color }} /> : <Play className="w-4 h-4" style={{ color }} />}
                                </button>
                                <span className="text-[10px] text-muted-foreground">ویس تحلیل</span>
                              </div>
                            )}

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                  className="mt-3 pt-3 border-t border-border space-y-1.5 overflow-hidden"
                                >
                                  <div className="flex justify-between text-[10px]">
                                    <span className="text-muted-foreground">قیمت انتشار</span>
                                    <span className="text-foreground font-semibold">{Number(s.priceAtPublish).toLocaleString()}</span>
                                  </div>
                                  {s.expectedProfit && <div className="flex justify-between text-[10px]">
                                    <span className="text-muted-foreground">هدف سود</span>
                                    <span className="text-emerald-400 font-bold">+{s.expectedProfit}%</span>
                                  </div>}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <ChevronDown className={`absolute left-3 bottom-3 w-3 h-3 text-muted-foreground/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>

                          <div className="flex items-center gap-2 mt-1 mr-12">
                            <span className="text-[9px] text-muted-foreground/60">{formatTelegramTime(sd)}</span>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.actualProfit !== null && s.actualProfit !== undefined ? (isWin ? 'bg-emerald-400' : 'bg-red-400') : 'bg-gray-500'}`} />
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="text-center pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-muted-foreground">A|CAP Bot</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
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
