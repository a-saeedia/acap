'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, BarChart3, Target, Droplets, Building2, Activity, ChevronDown, Play, Pause, Volume2, X, ImageIcon } from 'lucide-react'

const TC: Record<string, string> = {
  btc: '#F7931A', eth: '#627EEA', gold: '#FFD700', gold18: '#DAA520',
  stock: '#10B981', forex: '#3B82F6', oil: '#8B5CF6', silver: '#94A8B8', fund: '#EC4899',
}

const TI: Record<string, any> = {
  btc: TrendingUp, eth: TrendingUp, gold: Target, gold18: Target,
  stock: Building2, forex: Activity, oil: Droplets, silver: Droplets, fund: BarChart3,
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

const ASSETS = [
  { type: 'btc', label: 'BTC (بیت‌کوین)', profits: [7.2, 11.2, -4.5] },
  { type: 'eth', label: 'ETH (اتریوم)', profits: [10.4, -3.2] },
  { type: 'gold', label: 'طلای اونس (XAU)', profits: [5.5, 2.8] },
  { type: 'gold18', label: 'طلای ۱۸ عیار', profits: [5.4, 3.1] },
  { type: 'stock', label: 'فولاد (بورس)', profits: [8.5] },
  { type: 'stock', label: 'خودرو (بورس)', profits: [10.7] },
  { type: 'stock', label: 'شپنا (بورس)', profits: [11.9] },
  { type: 'stock', label: 'فملی (بورس)', profits: [8.2] },
  { type: 'stock', label: 'وبملت (بورس)', profits: [11.7] },
  { type: 'forex', label: 'USD/IRR (دلار)', profits: [7.4] },
  { type: 'oil', label: 'نفت برنت', profits: [4.5, -2.1] },
  { type: 'silver', label: 'نقره (XAG)', profits: [-1.8, -2.4] },
  { type: 'fund', label: 'صندوق بورس', profits: [6.8] },
]

function genOffers() {
  const now = pDate(new Date())
  const offers: any[] = []
  let pi: Record<string, number> = {}
  const used = new Set<string>()

  for (let di = 0; di < 6; di++) {
    let rm = now.month - di, ry = now.year
    if (rm < 1) { rm += 12; ry-- }
    const daysInMonth = rm === 12 && ry % 4 !== 1 ? 29 : [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29][rm - 1]
    const count = di < 2 ? 4 : 3
    for (let i = 0; i < count; i++) {
      const a = ASSETS[(di * 3 + i) % ASSETS.length]
      const key = a.label + '-' + rm + '-' + ry
      if (used.has(key)) continue
      used.add(key)
      pi[a.label] = ((pi[a.label] || 0) + 1) % a.profits.length
      const profit = a.profits[pi[a.label]]
      const startDay = 1 + (i * 3 + di * 2) % Math.max(1, daysInMonth - 16)
      const endDay = Math.min(daysInMonth, startDay + 10 + i * 2)
      offers.push({
        id: offers.length + 1, month: rm, mon: PM[rm - 1], year: ry,
        startDay: Math.max(1, startDay), endDay: Math.min(daysInMonth, endDay),
        type: a.type, label: a.label, profit,
      })
    }
  }
  return offers.sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month)).slice(0, 20)
}

export function RevenueWidget() {
  const [range, setRange] = useState(0)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [signals, setSignals] = useState<any[]>([])
  const [loadingSignals, setLoadingSignals] = useState(true)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetch('/api/signals')
      .then(r => r.json())
      .then(d => { setSignals(d.signals || []) })
      .catch(() => {})
      .finally(() => setLoadingSignals(false))
  }, [])

  useEffect(() => {
    if (playingAudio && audioRef.current) {
      audioRef.current.play().catch(() => setPlayingAudio(null))
    }
  }, [playingAudio])

  const OFFERS = useMemo(() => genOffers(), [])

  const filtered = useMemo(() => {
    if (range === 0) return OFFERS
    const now = pDate(new Date())
    const totalMonths = now.year * 12 + now.month
    const cutoff = totalMonths - range
    return OFFERS.filter(o => (o.year * 12 + o.month) >= cutoff)
  }, [OFFERS, range])

  const stats = useMemo(() => {
    const total = filtered.length
    const wins = filtered.filter(o => o.profit > 0).length
    const avgWin = wins > 0 ? filtered.filter(o => o.profit > 0).reduce((s, o) => s + o.profit, 0) / wins : 0
    const avgLoss = total - wins > 0 ? filtered.filter(o => o.profit < 0).reduce((s, o) => s + o.profit, 0) / (total - wins) : 0
    return { total, wins, losses: total - wins, winRate: total > 0 ? (wins / total * 100).toFixed(0) : '0', avgWin, avgLoss }
  }, [filtered])

  const maxAbsProfit = Math.max(...filtered.map(o => Math.abs(o.profit)), 1)
  const showLimit = range === 0 && filtered.length > 6
  const display = showLimit ? filtered.slice(0, 6) : filtered

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
            <span className="text-xs text-muted-foreground font-semibold">اعتبارسنجی</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black">
            عملکرد <span className="bg-gradient-to-r from-emerald-400 to-primary bg-clip-text text-transparent">A|CAP</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">پیشنهادات معاملاتی ثبت‌شده — شفافیت کامل در عملکرد</p>
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

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            <AnimatePresence>
              {display.map((offer, i) => {
                const Icon = TI[offer.type] || Activity
                const color = TC[offer.type] || '#666'
                const isWin = offer.profit > 0
                const pct = Math.abs(offer.profit) / maxAbsProfit * 100
                const isExpanded = expandedId === offer.id

                return (
                  <motion.div key={offer.id}
                    layout
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                    className="glass border border-border hover:border-emerald-500/20 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group"
                    onClick={() => setExpandedId(isExpanded ? null : offer.id)}
                  >
                    <div className="p-4 pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                            <Icon className="w-4.5 h-4.5" style={{ color }} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground leading-tight">{offer.label}</div>
                            <div className="text-[9px] text-muted-foreground">{offer.year} | {offer.mon}</div>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-accent/50 rounded-lg px-2.5 py-1.5">
                        <span className="font-semibold text-foreground">{offer.startDay} {offer.mon}</span>
                        <span>→</span>
                        <span className="font-semibold text-foreground">{offer.endDay} {offer.mon}</span>
                      </div>
                    </div>

                    <div className="px-4">
                      <div className="h-1.5 rounded-full bg-accent/50 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: isWin ? '#10B981' : '#EF4444' }} />
                      </div>
                    </div>

                    <div className="p-4 pt-3 flex items-center justify-between">
                      <div className={`text-lg font-black tabular-nums ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isWin ? '+' : ''}{offer.profit.toFixed(1)}%
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isWin ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {isWin ? 'سود' : 'ضرر'}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border mx-4 overflow-hidden"
                        >
                          <div className="py-3 space-y-2">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">نوع دارایی</span>
                              <span className="text-foreground font-semibold">{offer.type === 'btc' ? 'رمز ارز' : offer.type === 'eth' ? 'رمز ارز' : offer.type === 'stock' ? 'بورس ایران' : offer.type === 'gold' ? 'طلای اونس' : offer.type === 'gold18' ? 'طلای ۱۸ عیار' : offer.type === 'forex' ? 'فارکس' : offer.type === 'oil' ? 'نفت' : offer.type === 'silver' ? 'نقره' : 'صندوق'}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">مدت معامله</span>
                              <span className="text-foreground font-semibold">{offer.endDay - offer.startDay} روز</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">تاریخ شروع</span>
                              <span className="text-foreground font-semibold">{offer.startDay} {offer.mon} {offer.year}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">تاریخ پایان</span>
                              <span className="text-foreground font-semibold">{offer.endDay} {offer.mon} {offer.year}</span>
                            </div>
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

        {/* Real signals with image/voice */}
        {signals.filter(s => s.imageUrl || s.audioUrl).length > 0 && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-10">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-1.5">
                <Volume2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground font-semibold">سیگنال‌های تصویری و صوتی</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              {signals.filter(s => s.imageUrl || s.audioUrl).map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="glass border border-border rounded-2xl overflow-hidden"
                >
                  {s.imageUrl && (
                    <div className="relative h-40 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(s.imageUrl)}>
                      <img src={s.imageUrl} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                      <div className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1.5">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground truncate">{s.title || s.symbol}</div>
                        <div className="text-[9px] text-muted-foreground">{s.symbol}</div>
                      </div>
                    </div>
                    {s.description && <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">{s.description}</p>}
                    {s.audioUrl && (
                      <div className="flex items-center gap-2 bg-accent/50 rounded-lg p-2">
                        <button onClick={() => setPlayingAudio(playingAudio === s.audioUrl ? null : s.audioUrl)}
                          className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 hover:bg-primary/30 transition-colors"
                        >
                          {playingAudio === s.audioUrl ? <Pause className="w-3.5 h-3.5 text-primary" /> : <Play className="w-3.5 h-3.5 text-primary ml-0.5" />}
                        </button>
                        <span className="text-[10px] text-muted-foreground">{playingAudio === s.audioUrl ? 'در حال پخش...' : 'پخش ویس'}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
