'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, X, Bot, ChevronDown, Image, Mic } from 'lucide-react'

const PM = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

function pDate(d: Date) {
  const g = new Date(d.getTime() + 3.5 * 3600000)
  const y = g.getFullYear()
  const m20 = new Date(y, 2, 20)
  const diff = Math.floor((g.getTime() - m20.getTime()) / 86400000)
  let py = y - 621, pm = diff < 0 ? 11 : Math.min(Math.floor(diff / 31), 11)
  if (diff < 0) { py--; pm += 12 }
  const pd = diff < 0 ? 30 + diff : diff - (pm > 6 ? 186 + 30 * (pm - 6) : 31 * pm) + 1
  return { year: py, month: pm + 1, day: pd }
}

function dateKey(sd: Date) {
  const pd = pDate(sd)
  return `${pd.year}/${pd.month}/${pd.day}`
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
}

function formatDateLabel(d: Date) {
  const pd = pDate(d)
  const today = pDate(new Date())
  if (pd.year === today.year && pd.month === today.month && pd.day === today.day) return 'امروز'
  if (pd.year === today.year && pd.month === today.month && pd.day === today.day - 1) return 'دیروز'
  return `${pd.day} ${PM[pd.month - 1]} ${pd.year}`
}

function ContentLines({ text }: { text?: string | null }) {
  if (!text) return null
  return (
    <div className="space-y-1">
      {text.split('\n').map((line, i) => {
        const t = line.trim()
        if (!t) return <div key={i} className="h-1" />
        const isEmojiHeader = /^[🟡🔵🟢🔴🟣🟠⚪✅❌⚠️⏳🎯📊📈📉💰💎🔥⭐🌟✨💡📌🔔🚀🏆🎯🎯]/.test(t) && t.length < 80
        const hasPrice = /[\d,]+(,\d{3})*(\.\d+)?\s*(تومان|ریال|دلار)/.test(t)
        const hasPercent = /\d+(\.\d+)?%/.test(t)
        let cls = 'text-[14px] leading-8'
        if (isEmojiHeader) cls += ' text-amber-300 font-bold text-[16px]'
        else if (hasPrice) cls += ' text-emerald-400 font-medium'
        else if (hasPercent) cls += ' text-amber-400 font-medium'
        return <p key={i} className={cls} style={{ direction: 'rtl', textAlign: 'right' }}>{t}</p>
      })}
    </div>
  )
}

export function RevenueWidget() {
  const [range, setRange] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [signals, setSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

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

  function togglePlay(s: any) {
    if (!s.audioUrl) return
    if (playingId === s.id) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) audioRef.current.pause()
      const audio = new Audio(s.audioUrl)
      audio.onended = () => setPlayingId(null)
      audio.play()
      audioRef.current = audio
      setPlayingId(s.id)
    }
  }

  const rangeFilters = [
    { label: 'همه', value: 0 },
    { label: '۱ ماه', value: 1 },
    { label: '۳ ماه', value: 3 },
    { label: '۶ ماه', value: 6 },
    { label: '۱۲ ماه', value: 12 },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6" dir="rtl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-1.5 mb-3">
          <Bot className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-gray-400 font-semibold">A|CAP Signal Bot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="text-xs text-gray-500">سیگنال‌های معاملاتی — مثل پیام‌های تلگرام</p>
      </div>

      {/* Stats row */}
      <div className="flex gap-1.5 justify-center mb-4 flex-wrap">
        {[
          { label: 'کل', value: stats.total, color: 'text-white' },
          { label: 'برد', value: stats.wins, color: 'text-emerald-400' },
          { label: 'باخت', value: stats.losses, color: 'text-red-400' },
          { label: 'نرخ برد', value: `${stats.winRate}%`, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800/50 border border-gray-700/30 rounded-xl px-3 py-1.5 text-center min-w-[55px]">
            <div className="text-[9px] text-gray-500">{s.label}</div>
            <div className={`text-xs font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Range filter */}
      <div className="flex gap-1.5 justify-center mb-6">
        {rangeFilters.map(r => (
          <button key={r.value} onClick={() => setRange(r.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              range === r.value
                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400'
                : 'bg-gray-800/30 border-gray-700/30 text-gray-400 hover:text-white hover:border-gray-600'
            }`}
          >{r.label}</button>
        ))}
      </div>

      {/* Chat */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : signals.length === 0 ? (
        <div className="text-center py-12">
          <Bot className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-sm text-gray-500">هنوز سیگنالی ارسال نشده</p>
        </div>
      ) : (
        <div className="space-y-1">
          {grouped.map(([date, daySignals], gi) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex justify-center my-4">
                <span className="text-[11px] text-gray-500 bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700/30">
                  {formatDateLabel(new Date(daySignals[0].publishedAt))}
                </span>
              </div>

              {daySignals.map((s, i) => {
                const isWin = s.actualProfit > 0
                const isExpanded = expandedId === s.id
                const sd = s.publishedAt ? new Date(s.publishedAt) : new Date()

                return (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex gap-2.5 mb-3"
                  >
                    {/* Avatar */}
                    <div className="shrink-0 mt-1">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-700/30 flex items-center justify-center border border-emerald-500/20">
                        <Bot className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>

                    {/* Bubble */}
                    <div className="flex-1 min-w-0 max-w-[85%]">
                      {/* Sender name */}
                      <div className="flex items-center gap-2 mb-0.5 mr-1">
                        <span className="text-[11px] font-bold text-emerald-400">A|CAP Bot</span>
                        <span className="text-[9px] text-gray-600">{s.symbol}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                          s.action === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                        }`}>{s.action === 'buy' ? 'BUY' : 'SELL'}</span>
                      </div>

                      {/* Bubble body */}
                      <div
                        className="relative rounded-2xl rounded-tr-sm px-4 py-2.5 cursor-pointer select-none transition-colors border border-gray-700/30 hover:border-gray-600/50 bg-gray-800/70"
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      >
                        {/* Title */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-bold text-white">{s.title}</span>
                          {s.actualProfit !== null && s.actualProfit !== undefined && (
                            <span className={`text-xs font-black tabular-nums shrink-0 ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isWin ? '+' : ''}{s.actualProfit.toFixed(1)}%
                            </span>
                          )}
                        </div>

                        {/* Type badge */}
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-1.5">
                          <span className="bg-gray-700/50 px-1.5 py-0.5 rounded">{formatTime(sd)}</span>
                          <span>{s.type === 'crypto' ? 'ارز دیجیتال' : s.type === 'stock' ? 'سهام' : s.type === 'gold' ? 'طلا' : s.type === 'dollar' ? 'دلار' : s.type === 'forex' ? 'فارکس' : s.type}</span>
                        </div>

                        {/* Description */}
                        {s.description && <ContentLines text={s.description} />}

                        {/* Image */}
                        {s.imageUrl && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-gray-700/30" onClick={e => { e.stopPropagation(); setPreviewImage(s.imageUrl) }}>
                            <img src={s.imageUrl} alt="" className="w-full h-auto max-h-64 object-cover hover:brightness-110 transition-all" loading="lazy" />
                          </div>
                        )}

                        {/* Audio */}
                        {s.audioUrl && (
                          <div className="mt-2 flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700/20" onClick={e => e.stopPropagation()}>
                            <button onClick={() => togglePlay(s)}
                              className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors shrink-0"
                            >
                              {playingId === s.id ? <Pause className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 text-emerald-400 mr-0.5" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Mic className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                <span className="text-[11px] text-gray-400">ویس تحلیل</span>
                                {playingId === s.id && (
                                  <div className="flex gap-0.5 items-center">
                                    {[1,2,3].map(i => (
                                      <div key={i} className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Expandable details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="mt-2 pt-2 border-t border-gray-700/30 space-y-1 overflow-hidden"
                            >
                              <div className="flex justify-between text-[11px]">
                                <span className="text-gray-500">قیمت انتشار</span>
                                <span className="text-white font-semibold">{Number(s.priceAtPublish).toLocaleString()}</span>
                              </div>
                              {s.expectedProfit && <div className="flex justify-between text-[11px]">
                                <span className="text-gray-500">هدف سود</span>
                                <span className="text-emerald-400 font-bold">+{s.expectedProfit}%</span>
                              </div>}
                              {s.investorType && <div className="flex justify-between text-[11px]">
                                <span className="text-gray-500">مناسب برای</span>
                                <span className="text-gray-300">{s.investorType === 'conservative' ? 'محافظه‌کار' : s.investorType === 'balanced' ? 'متعادل' : s.investorType === 'growth' ? 'رشدگرا' : 'تهاجمی'}</span>
                              </div>}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <ChevronDown className={`absolute left-3 bottom-2 w-3 h-3 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>

                      {/* Footer: time + status */}
                      <div className="flex items-center gap-1.5 mt-0.5 mr-1">
                        <span className="text-[10px] text-gray-600">{formatTime(sd)}</span>
                        {s.actualProfit !== null && s.actualProfit !== undefined ? (
                          <span className="text-blue-400 text-[9px]">✓✓</span>
                        ) : (
                          <span className="text-gray-600 text-[9px]">✓</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ))}

          {/* Bot status footer */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700/30 rounded-full px-4 py-1.5">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-gray-500">A|CAP Signal Bot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      )}

      {/* Image preview */}
      <AnimatePresence>
        {previewImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={previewImage} alt="" className="max-w-full max-h-[90vh] rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
