'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, BarChart3, Target, Droplets, Building2, Activity, ChevronDown, Play, Pause, ImageIcon, Volume2, X } from 'lucide-react'

const TC: Record<string, string> = {
  btc: '#F7931A', eth: '#627EEA', gold: '#FFD700', gold18: '#DAA520',
  stock: '#10B981', forex: '#3B82F6', oil: '#8B5CF6', silver: '#94A8B8', fund: '#EC4899',
}

const TI: Record<string, any> = {
  crypto: TrendingUp, stock: Building2, gold: Target, forex: Activity, dollar: Activity,
}

function pDate(d: Date) {
  const g = new Date(d.getTime() + 3.5 * 3600000)
  const y = g.getFullYear()
  const m20 = new Date(y, 2, 20)
  const diff = Math.floor((g.getTime() - m20.getTime()) / 86400000)
  let py = y - 621, pm = diff < 0 ? 11 : Math.min(Math.floor(diff / 31), 11)
  if (diff < 0) { py--; pm += 12 }
  return { year: py, month: pm + 1 }
}

export function RevenueWidget() {
  const [range, setRange] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [signals, setSignals] = useState<any[]>([])
  const [revenue, setRevenue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/signals${range > 0 ? `?months=${range}` : ''}`)
      .then(r => r.json())
      .then(d => { setSignals(d.signals || []); setRevenue(d.revenue || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [range])

  useEffect(() => {
    if (playingAudio && audioRef.current) {
      audioRef.current.play().catch(() => setPlayingAudio(null))
    }
  }, [playingAudio])

  const stats = useMemo(() => {
    const total = signals.length
    const wins = signals.filter(s => s.actualProfit > 0).length
    const withReturn = signals.filter(s => s.actualProfit !== null && s.actualProfit !== undefined)
    const avgWin = withReturn.filter(s => s.actualProfit > 0).reduce((s, o) => s + o.actualProfit, 0) / (wins || 1)
    const avgLoss = withReturn.filter(s => s.actualProfit < 0).reduce((s, o) => s + o.actualProfit, 0) / ((total - wins) || 1)
    return { total, wins, losses: total - wins, winRate: total > 0 ? (wins / total * 100).toFixed(0) : '0', avgWin, avgLoss }
  }, [signals])

  const typeLabel = (t: string) => {
    const m: Record<string, string> = { crypto: 'ارز دیجیتال', stock: 'سهام', gold: 'طلا', forex: 'فارکس', dollar: 'دلار' }
    return m[t] || t
  }

  const totalRevenue = revenue.reduce((s, r) => s + Number(r.amount), 0)
  const persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

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
          ].map(s => (
            <div key={s.label} className="glass border border-border rounded-xl px-4 py-2 text-center min-w-[70px]">
              <div className="text-[9px] text-muted-foreground">{s.label}</div>
              <div className="text-sm font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </motion.div>

        {revenue.length > 0 && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-6"
          >
            <div className="inline-block glass border border-border rounded-2xl px-6 py-3">
              <div className="text-[10px] text-muted-foreground mb-1">مجموع درآمد A|CAP</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">{totalRevenue.toLocaleString()} تومان</div>
            </div>
          </motion.div>
        )}

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
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">هنوز سیگنالی ثبت نشده است</p>
          </div>
        ) : (
          <>
            {/* Mobile: horizontal scroll */}
            <div ref={scrollRef} className="flex lg:hidden gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none -mx-4 px-4">
              <AnimatePresence>
                {signals.map((s) => {
                  const Icon = TI[s.type] || TrendingUp
                  const color = TC[s.type] || '#666'
                  const isWin = s.actualProfit > 0
                  const isExpanded = expandedId === s.id
                  const signalDate = s.publishedAt ? new Date(s.publishedAt) : new Date()
                  const pd = pDate(signalDate)

                  return (
                    <motion.div key={s.id} layout
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      className="glass border border-border rounded-2xl overflow-hidden shrink-0 w-[85vw] snap-center transition-all duration-300"
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    >
                      {s.imageUrl && (
                        <div className="relative h-32 overflow-hidden" onClick={e => { e.stopPropagation(); setPreviewImage(s.imageUrl) }}>
                          <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                              <Icon className="w-4.5 h-4.5" style={{ color }} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-foreground leading-tight truncate">{s.title}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] text-muted-foreground">{s.symbol}</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${s.action === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{s.action === 'buy' ? 'خرید' : 'فروش'}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>

                        <div className="flex items-center gap-3 mt-1">
                          <div className={`text-base font-black tabular-nums ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                            {s.actualProfit !== null && s.actualProfit !== undefined ? `${isWin ? '+' : ''}${s.actualProfit.toFixed(1)}%` : '—'}
                          </div>
                          <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isWin ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                            {isWin ? 'سود' : 'ضرر'}
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-2 border-t border-border pt-2 space-y-1.5">
                              {s.description && <p className="text-[11px] text-muted-foreground">{s.description}</p>}
                              <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">نوع</span><span className="font-semibold">{typeLabel(s.type)}</span></div>
                              <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">قیمت انتشار</span><span className="font-semibold">{Number(s.priceAtPublish).toLocaleString()}</span></div>
                              <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">سود هدف</span><span className="font-semibold">{s.expectedProfit ? `+${s.expectedProfit}%` : '—'}</span></div>
                              <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">تاریخ</span><span className="font-semibold">{pd.year}/{pd.month}</span></div>
                              {s.audioUrl && (
                                <div className="mt-2" onClick={e => e.stopPropagation()}>
                                  <button onClick={() => setPlayingAudio(playingAudio === s.audioUrl ? null : s.audioUrl)}
                                    className="flex items-center gap-2 text-[11px] text-primary hover:text-primary/80"
                                  >
                                    {playingAudio === s.audioUrl ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                    {playingAudio === s.audioUrl ? 'توقف' : 'پخش ویس'}
                                  </button>
                                </div>
                              )}
                              {s.imageUrl && (
                                <div className="mt-2" onClick={e => e.stopPropagation()}>
                                  <button onClick={() => setPreviewImage(s.imageUrl)} className="flex items-center gap-2 text-[11px] text-primary hover:text-primary/80">
                                    <ImageIcon className="w-3.5 h-3.5" /> مشاهده تصویر
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Desktop: grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-w-6xl mx-auto"
            >
              <AnimatePresence>
                {signals.map((s, i) => {
                  const Icon = TI[s.type] || TrendingUp
                  const color = TC[s.type] || '#666'
                  const isWin = s.actualProfit > 0
                  const isExpanded = expandedId === s.id
                  const signalDate = s.publishedAt ? new Date(s.publishedAt) : new Date()
                  const pd = pDate(signalDate)

                  return (
                    <motion.div key={s.id} layout
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
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                              <Icon className="w-4.5 h-4.5" style={{ color }} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-foreground leading-tight truncate">{s.title}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] text-muted-foreground">{s.symbol}</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${s.action === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{s.action === 'buy' ? 'خرید' : 'فروش'}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        {s.description && <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{s.description}</p>}
                      </div>

                      <div className="px-4 pb-3 flex items-center justify-between">
                        <div className={`text-lg font-black tabular-nums ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                          {s.actualProfit !== null && s.actualProfit !== undefined ? `${isWin ? '+' : ''}${s.actualProfit.toFixed(1)}%` : '—'}
                        </div>
                        <div className="flex items-center gap-2">
                          {s.audioUrl && (
                            <button onClick={e => { e.stopPropagation(); setPlayingAudio(playingAudio === s.audioUrl ? null : s.audioUrl) }}
                              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              {playingAudio === s.audioUrl ? <Pause className="w-3.5 h-3.5 text-primary" /> : <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />}
                            </button>
                          )}
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isWin ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                            {isWin ? 'سود' : 'ضرر'}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border mx-4 overflow-hidden"
                          >
                            <div className="py-3 space-y-2">
                              <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">نوع دارایی</span><span className="font-semibold">{typeLabel(s.type)}</span></div>
                              <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">قیمت انتشار</span><span className="font-semibold">{Number(s.priceAtPublish).toLocaleString()}</span></div>
                              <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">سود هدف</span><span className="font-semibold">{s.expectedProfit ? `+${s.expectedProfit}%` : '—'}</span></div>
                              <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">تاریخ</span><span className="font-semibold">{pd.year}/{pd.month}</span></div>
                              {s.audioUrl && (
                                <div className="pt-2 border-t border-border">
                                  <button onClick={e => { e.stopPropagation(); setPlayingAudio(playingAudio === s.audioUrl ? null : s.audioUrl) }}
                                    className="flex items-center gap-2 text-[11px] text-primary hover:text-primary/80 w-full"
                                  >
                                    {playingAudio === s.audioUrl ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                    {playingAudio === s.audioUrl ? 'در حال پخش...' : 'پخش ویس'}
                                  </button>
                                </div>
                              )}
                              {s.imageUrl && (
                                <div className="pt-2 border-t border-border">
                                  <button onClick={e => { e.stopPropagation(); setPreviewImage(s.imageUrl) }} className="flex items-center gap-2 text-[11px] text-primary hover:text-primary/80 w-full">
                                    <ImageIcon className="w-3.5 h-3.5" /> مشاهده تصویر
                                  </button>
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
            </motion.div>
          </>
        )}
      </div>

      {playingAudio && <audio ref={audioRef} src={playingAudio} onEnded={() => setPlayingAudio(null)} className="hidden" />}

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
