'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, BarChart3, Play, Pause, Volume2, X, Check } from 'lucide-react'

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

function dateLabel(d: Date) {
  const now = new Date()
  const pd = pDate(d), pn = pDate(now)
  const sameDay = pd.year === pn.year && pd.month === pn.month && pd.day === pn.day
  const yesterday = new Date(now.getTime() - 86400000)
  const py = pDate(yesterday)
  const isYesterday = pd.year === py.year && pd.month === py.month && pd.day === py.day
  if (sameDay) return 'امروز'
  if (isYesterday) return 'دیروز'
  return `${pd.day} ${['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'][pd.month - 1]}`
}

const AVATARS: Record<string, { bg: string; emoji: string }> = {
  crypto: { bg: 'from-orange-500 to-yellow-500', emoji: '₿' },
  stock: { bg: 'from-emerald-500 to-teal-500', emoji: '🏢' },
  gold: { bg: 'from-yellow-500 to-amber-500', emoji: '🥇' },
  forex: { bg: 'from-blue-500 to-indigo-500', emoji: '$' },
  dollar: { bg: 'from-green-500 to-emerald-500', emoji: '💵' },
}

function Bubble({ s }: { s: any }) {
  const [expanded, setExpanded] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isWin = s.actualProfit > 0
  const sd = s.publishedAt ? new Date(s.publishedAt) : new Date()
  const avatar = AVATARS[s.type] || { bg: 'from-gray-500 to-gray-600', emoji: '📊' }
  const isPlaying = playingAudio === s.audioUrl

  useEffect(() => {
    if (!playingAudio || !audioRef.current) return
    audioRef.current.play().catch(() => setPlayingAudio(null))
    const interval = setInterval(() => {
      if (audioRef.current) setAudioProgress(audioRef.current.currentTime / (audioRef.current.duration || 1))
    }, 100)
    return () => clearInterval(interval)
  }, [playingAudio])

  return (
    <div className="flex justify-end mb-3 px-2">
      <div dir="rtl"
        className="max-w-[92%] sm:max-w-[80%] lg:max-w-[70%] bg-[#1e293b] rounded-[18px] rounded-l-[6px] border border-[#334155]/60 overflow-hidden shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-1.5">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-xs font-bold shrink-0 border border-white/10 shadow-sm`}>
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
              <span className="text-[10px] text-[#94a3b8]">{s.symbol}</span>
              <span className="text-[9px] text-[#475569]">•</span>
              <span className="text-[9px] text-[#64748b]">{fmtTime(sd)}</span>
            </div>
          </div>
        </div>

        {s.description && (
          <div className="px-3.5 pb-1">
            <p className="text-[13px] text-[#cbd5e1] leading-relaxed">{s.description}</p>
          </div>
        )}

        {s.imageUrl && (
          <div className="px-2 pb-1.5" onClick={e => { e.stopPropagation(); setPreviewImage(s.imageUrl) }}>
            <img src={s.imageUrl} alt="" className="w-full rounded-2xl max-h-56 object-cover border border-white/5" />
          </div>
        )}

        {s.audioUrl && (
          <div className="px-3.5 pb-2" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 bg-[#0f172a]/60 rounded-xl p-2.5 border border-[#334155]/30">
              <button
                onClick={() => setPlayingAudio(isPlaying ? null : s.audioUrl)}
                className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 hover:bg-blue-500/30 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-blue-400" /> : <Play className="w-4 h-4 text-blue-400 ml-0.5" />}
              </button>
              <div className="flex-1 h-8 flex items-end gap-[2px]">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className="flex-1 rounded-full transition-all duration-150"
                    style={{
                      height: `${Math.max(15, 45 + Math.sin(i * 1.2 + (isPlaying ? audioProgress * 28 : 0)) * 35)}%`,
                      background: isPlaying && i < audioProgress * 28 ? '#3b82f6' : 'rgba(255,255,255,0.12)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-3.5 pb-2 space-y-1.5 border-t border-[#334155]/30 pt-2">
                <div className="flex justify-between text-[11px]"><span className="text-[#64748b]">نوع</span><span className="text-[#e2e8f0]">{s.type === 'crypto' ? 'ارز دیجیتال' : s.type === 'stock' ? 'سهام' : s.type === 'gold' ? 'طلا' : s.type === 'forex' ? 'فارکس' : s.type}</span></div>
                <div className="flex justify-between text-[11px]"><span className="text-[#64748b]">قیمت انتشار</span><span className="text-[#e2e8f0]">{Number(s.priceAtPublish).toLocaleString()}</span></div>
                {s.expectedProfit && <div className="flex justify-between text-[11px]"><span className="text-[#64748b]">سود هدف</span><span className="text-emerald-400 font-bold">+{s.expectedProfit}%</span></div>}
                <div className="flex justify-between text-[11px]"><span className="text-[#64748b]">تاریخ</span><span className="text-[#e2e8f0]">{pDate(sd).year}/{pDate(sd).month}/{pDate(sd).day}</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between px-3.5 pb-2.5">
          {s.actualProfit !== null && s.actualProfit !== undefined ? (
            <div className={`text-sm font-black tabular-nums ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
              {isWin ? '+' : ''}{s.actualProfit.toFixed(1)}%
            </div>
          ) : <div />}
          <div className="flex items-center gap-1.5 text-[9px] text-[#475569]">
            <Check className="w-3 h-3" />
            <span>خوانده شده</span>
          </div>
        </div>
      </div>

      {playingAudio && <audio ref={audioRef} src={playingAudio} onEnded={() => { setPlayingAudio(null); setAudioProgress(0) }} className="hidden" />}

      <AnimatePresence>
        {previewImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setPreviewImage(null)}
          >
            <button onClick={() => setPreviewImage(null)} className="absolute top-5 right-5 p-2 bg-black/60 rounded-full text-white hover:bg-black/80 z-10">
              <X className="w-5 h-5" />
            </button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={previewImage} alt="" className="max-w-full max-h-[90vh] rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function RevenueWidget() {
  const [range, setRange] = useState(0)
  const [signals, setSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const listEndRef = useRef<HTMLDivElement>(null)

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
    return { total, wins, losses: total - wins, winRate: total > 0 ? (wins / total * 100).toFixed(0) : '0' }
  }, [signals])

  const grouped = useMemo(() => {
    const groups: { label: string; signals: any[] }[] = []
    let currentLabel = ''
    let currentGroup: any[] = []
    for (const s of signals) {
      const d = s.publishedAt ? new Date(s.publishedAt) : new Date()
      const label = dateLabel(d)
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

  return (
    <section className="min-h-screen bg-[#0b1121]">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 flex items-center justify-center border border-white/5">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black text-white">A|CAP Signals</h1>
            <p className="text-[11px] text-[#64748b]">سیگنال‌های معاملاتی</p>
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {[
            { label: 'کل', value: stats.total },
            { label: 'برد', value: stats.wins, color: 'text-emerald-400' },
            { label: 'باخت', value: stats.losses, color: 'text-red-400' },
            { label: 'نرخ برد', value: `${stats.winRate}%`, color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="flex-1 bg-[#1e293b]/50 rounded-xl py-2 text-center border border-[#334155]/30">
              <div className="text-[9px] text-[#64748b]">{s.label}</div>
              <div className={`text-sm font-black ${s.color || 'text-white'}`}>{s.value}</div>
            </div>
          ))}
        </div>

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
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-[#1e293b]/40 border-[#334155]/30 text-[#64748b] hover:border-[#475569]'
              }`}
            >{r.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : signals.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-[#334155]" />
            <p className="text-sm text-[#64748b]">هنوز سیگنالی ثبت نشده</p>
          </div>
        ) : (
          <div>
            {grouped.map((g, gi) => (
              <div key={gi}>
                <div className="flex justify-center mb-3 mt-1">
                  <span className="text-[10px] text-[#475569] bg-[#1e293b]/60 px-3 py-1 rounded-full border border-[#334155]/20">{g.label}</span>
                </div>
                {g.signals.map(s => (
                  <Bubble key={s.id} s={s} />
                ))}
              </div>
            ))}
            <div ref={listEndRef} />
          </div>
        )}
      </div>
    </section>
  )
}
