'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, BarChart3, Play, Pause, Volume2, X, Check, Clock } from 'lucide-react'

function pDate(d: Date) {
  const g = new Date(d.getTime() + 3.5 * 3600000)
  const y = g.getFullYear()
  const m20 = new Date(y, 2, 20)
  const diff = Math.floor((g.getTime() - m20.getTime()) / 86400000)
  let py = y - 621, pm = diff < 0 ? 11 : Math.min(Math.floor(diff / 31), 11)
  if (diff < 0) { py--; pm += 12 }
  return { year: py, month: pm + 1, day: diff < 0 ? 30 + diff : diff - (pm > 6 ? 186 + 30 * (pm - 6) : 31 * pm) + 1 }
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
}

function dateLabel(d: Date, now: Date) {
  const pd = pDate(d), pn = pDate(now)
  const sameDay = pd.year === pn.year && pd.month === pn.month && pd.day === pn.day
  const yesterday = new Date(now.getTime() - 86400000)
  const py = pDate(yesterday)
  const isYesterday = pd.year === py.year && pd.month === py.month && pd.day === py.day
  if (sameDay) return 'امروز'
  if (isYesterday) return 'دیروز'
  return `${pd.day} ${['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'][pd.month - 1]} ${pd.year}`
}

const TYPE_AVATARS: Record<string, { bg: string; emoji: string }> = {
  crypto: { bg: 'from-orange-500/30 to-yellow-500/30', emoji: '₿' },
  stock: { bg: 'from-emerald-500/30 to-teal-500/30', emoji: '🏢' },
  gold: { bg: 'from-yellow-500/30 to-amber-500/30', emoji: '🥇' },
  forex: { bg: 'from-blue-500/30 to-indigo-500/30', emoji: '$' },
  dollar: { bg: 'from-green-500/30 to-emerald-500/30', emoji: '💵' },
}

export function RevenueWidget() {
  const [range, setRange] = useState(0)
  const [signals, setSignals] = useState<any[]>([])
  const [revenue, setRevenue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const listEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/signals${range > 0 ? `?months=${range}` : ''}`)
      .then(r => r.json())
      .then(d => { setSignals(d.signals || []); setRevenue(d.revenue || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [range])

  useEffect(() => {
    if (!playingAudio || !audioRef.current) return
    audioRef.current.play().catch(() => setPlayingAudio(null))
    const interval = setInterval(() => {
      if (audioRef.current) setAudioProgress(audioRef.current.currentTime / (audioRef.current.duration || 1))
    }, 100)
    return () => clearInterval(interval)
  }, [playingAudio])

  const stats = useMemo(() => {
    const total = signals.length
    const wins = signals.filter(s => s.actualProfit > 0).length
    return { total, wins, losses: total - wins, winRate: total > 0 ? (wins / total * 100).toFixed(0) : '0' }
  }, [signals])

  const totalRevenue = revenue.reduce((s, r) => s + Number(r.amount), 0)

  const grouped = useMemo(() => {
    const groups: { label: string; signals: any[] }[] = []
    let currentLabel = ''
    let currentGroup: any[] = []
    for (const s of signals) {
      const d = s.publishedAt ? new Date(s.publishedAt) : new Date()
      const label = dateLabel(d, new Date())
      if (label !== currentLabel && currentGroup.length > 0) {
        groups.push({ label: currentLabel, signals: currentGroup })
        currentGroup = []
      }
      currentLabel = label
      currentGroup.push(s)
    }
    if (currentGroup.length > 0) groups.push({ label: currentLabel, signals: currentGroup })
    return groups
  }, [signals])

  const SignalBubble = ({ s }: { s: any }) => {
    const [expanded, setExpanded] = useState(false)
    const isWin = s.actualProfit > 0
    const sd = s.publishedAt ? new Date(s.publishedAt) : new Date()
    const avatar = TYPE_AVATARS[s.type] || { bg: 'from-gray-500/30 to-gray-600/30', emoji: '📊' }
    const isPlaying = playingAudio === s.audioUrl

    return (
      <div className="flex justify-end mb-3 px-2">
        <div
          dir="rtl"
          className="max-w-[92%] sm:max-w-[75%] lg:max-w-[65%] bg-gray-800/80 backdrop-blur-sm rounded-[18px] rounded-l-[6px] border border-gray-700/50 overflow-hidden shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => setExpanded(!expanded)}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-1.5">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-xs font-bold shrink-0 border border-white/10`}>
              {avatar.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate">{s.title || s.symbol}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${s.action === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {s.action === 'buy' ? 'خرید' : 'فروش'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-500">{s.symbol}</span>
                <span className="text-[9px] text-gray-600">•</span>
                <span className="text-[9px] text-gray-500">{fmtTime(sd)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {s.description && (
            <div className="px-3.5 pb-1">
              <p className="text-[13px] text-gray-300 leading-relaxed">{s.description}</p>
            </div>
          )}

          {/* Image */}
          {s.imageUrl && (
            <div className="px-2 pb-1.5" onClick={e => { e.stopPropagation(); setPreviewImage(s.imageUrl) }}>
              <img src={s.imageUrl} alt="" className="w-full rounded-2xl max-h-56 object-cover border border-white/5" />
            </div>
          )}

          {/* Voice message (Telegram style) */}
          {s.audioUrl && (
            <div className="px-3.5 pb-2" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 bg-gray-900/60 rounded-xl p-2.5 border border-gray-700/30">
                <button
                  onClick={() => setPlayingAudio(isPlaying ? null : s.audioUrl)}
                  className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0 hover:bg-primary/30 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4 text-primary ml-0.5" />}
                </button>
                <div className="flex-1 h-8 flex items-end gap-[2px]">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-full transition-all duration-150"
                      style={{
                        height: `${Math.max(15, 50 + Math.sin(i * 1.2 + (isPlaying ? audioProgress * 30 : 0)) * 40)}%`,
                        background: isPlaying && i < audioProgress * 30 ? '#3b82f6' : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expanded details */}
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-3.5 pb-2 space-y-1.5 border-t border-gray-700/30 pt-2">
                  <div className="flex justify-between text-[11px]"><span className="text-gray-500">نوع</span><span className="text-gray-200">{['crypto', 'stock', 'gold', 'forex', 'dollar'][['crypto', 'stock', 'gold', 'forex', 'dollar'].indexOf(s.type)] || s.type}</span></div>
                  <div className="flex justify-between text-[11px]"><span className="text-gray-500">قیمت انتشار</span><span className="text-gray-200">{Number(s.priceAtPublish).toLocaleString()}</span></div>
                  {s.expectedProfit && <div className="flex justify-between text-[11px]"><span className="text-gray-500">سود هدف</span><span className="text-emerald-400 font-bold">+{s.expectedProfit}%</span></div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer: profit + read status */}
          <div className="flex items-center justify-between px-3.5 pb-2.5">
            {s.actualProfit !== null && s.actualProfit !== undefined ? (
              <div className={`text-sm font-black tabular-nums ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                {isWin ? '+' : ''}{s.actualProfit.toFixed(1)}%
              </div>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-1.5 text-[9px] text-gray-600">
              <Check className="w-3 h-3" />
              <span>خوانده شده</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="relative min-h-screen pb-20">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-primary/20 flex items-center justify-center border border-white/5">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black text-white">A|CAP Signals</h1>
            <p className="text-[11px] text-gray-500">سیگنال‌های معاملاتی</p>
          </div>
          {totalRevenue > 0 && (
            <div className="text-left">
              <div className="text-[9px] text-gray-600">کل درآمد</div>
              <div className="text-sm font-black text-emerald-400">{totalRevenue.toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex gap-2 mb-4">
          {[
            { label: 'کل', value: stats.total },
            { label: 'برد', value: stats.wins, color: 'text-emerald-400' },
            { label: 'باخت', value: stats.losses, color: 'text-red-400' },
            { label: 'نرخ برد', value: `${stats.winRate}%`, color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="flex-1 bg-gray-800/40 rounded-xl py-2 text-center border border-gray-800/50">
              <div className="text-[9px] text-gray-500">{s.label}</div>
              <div className={`text-sm font-black ${s.color || 'text-white'}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { label: 'همه', value: 0 },
            { label: '۱ ماهه', value: 1 },
            { label: '۳ ماهه', value: 3 },
            { label: '۶ ماهه', value: 6 },
            { label: '۱۲ ماهه', value: 12 },
          ].map(r => (
            <button key={r.value} onClick={() => setRange(r.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                range === r.value
                  ? 'bg-primary/20 border-primary/40 text-primary'
                  : 'bg-gray-800/40 border-gray-700/30 text-gray-400 hover:border-gray-600'
              }`}
            >{r.label}</button>
          ))}
        </div>

        {/* Chat list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : signals.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p className="text-sm text-gray-500">هنوز سیگنالی ثبت نشده</p>
          </div>
        ) : (
          <div className="pb-4">
            {grouped.map((g, gi) => (
              <div key={gi}>
                <div className="flex justify-center mb-3 mt-1">
                  <span className="text-[10px] text-gray-600 bg-gray-800/60 px-3 py-1 rounded-full">{g.label}</span>
                </div>
                {g.signals.map(s => (
                  <SignalBubble key={s.id} s={s} />
                ))}
              </div>
            ))}
            <div ref={listEndRef} />
          </div>
        )}
      </div>

      {playingAudio && (
        <audio ref={audioRef} src={playingAudio} onEnded={() => { setPlayingAudio(null); setAudioProgress(0) }} onTimeUpdate={() => {
          if (audioRef.current) setAudioProgress(audioRef.current.currentTime / (audioRef.current.duration || 1))
        }} className="hidden" />
      )}

      <AnimatePresence>
        {previewImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button onClick={() => setPreviewImage(null)} className="absolute top-5 right-5 p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-10">
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
