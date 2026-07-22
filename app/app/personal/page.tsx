'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, X, Crown, Mic, ArrowLeft, Calendar } from 'lucide-react'

function formatTime(d: Date) {
  return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
}

function getGradient(title: string) {
  const t = title.toLowerCase()
  if (/\b(btc|bitcoin|بیت)\b/.test(t)) return ['from-orange-500/50', 'to-orange-900/50', 'border-orange-500/40', 'text-orange-400']
  if (/\b(eth|ethereum|اتریوم)\b/.test(t)) return ['from-indigo-500/50', 'to-indigo-900/50', 'border-indigo-500/40', 'text-indigo-400']
  if (/\b(sol|solana|سولانا)\b/.test(t)) return ['from-purple-500/50', 'to-purple-900/50', 'border-purple-500/40', 'text-purple-400']
  if (/\b(bnb|binance|بایننس)\b/.test(t)) return ['from-amber-500/50', 'to-amber-900/50', 'border-amber-500/40', 'text-amber-400']
  if (/\b(gold|طلا|سکه)\b/.test(t)) return ['from-yellow-500/50', 'to-yellow-900/50', 'border-yellow-500/40', 'text-yellow-400']
  if (/\b(دلار|usd|dollar|تتر|usdt)\b/.test(t)) return ['from-emerald-500/50', 'to-emerald-900/50', 'border-emerald-500/40', 'text-emerald-400']
  if (/\b(یورو|eur|euro)\b/.test(t)) return ['from-blue-500/50', 'to-blue-900/50', 'border-blue-500/40', 'text-blue-400']
  if (/\b(فولاد|فملی|خودرو|بورس|stock|سهام|شپنا|وبملت)\b/.test(t)) return ['from-cyan-500/50', 'to-cyan-900/50', 'border-cyan-500/40', 'text-cyan-400']
  if (/\b(ارز|crypto|دیجیتال)\b/.test(t)) return ['from-rose-500/50', 'to-rose-900/50', 'border-rose-500/40', 'text-rose-400']
  return ['from-pink-500/50', 'to-pink-900/50', 'border-pink-500/40', 'text-pink-400']
}

function monthKey(d: Date) {
  const j = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long' }).format(d)
  return j
}

const allMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

export default function PersonalPage() {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  useEffect(() => {
    import('@/app/actions/admin').then(m =>
      m.getUserSuggestions().then(setSuggestions).catch(() => {})
    ).finally(() => setLoading(false))
  }, [])

  const sorted = [...suggestions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const grouped = sorted.reduce((acc: Record<string, any[]>, s: any) => {
    const k = monthKey(new Date(s.createdAt))
    if (!acc[k]) acc[k] = []
    acc[k].push(s)
    return acc
  }, {})

  const groupEntries = Object.entries(grouped)

  return (
    <div className="min-h-screen bg-[#0b0e17] flex flex-col" dir="rtl">
      {/* Header */}
      <header className="shrink-0 bg-[#1c1f2e]/95 backdrop-blur-xl border-b border-[#2a2d3a] px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2AABEE] to-[#1a7fc4] flex items-center justify-center shadow-lg shadow-[#2AABEE]/20">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white leading-tight">سیگنال‌های شخصی</h1>
            <p className="text-[9px] text-gray-500">{suggestions.length} سیگنال</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#2AABEE]" />
          <span className="text-[9px] text-gray-500">{new Intl.DateTimeFormat('fa-IR', { month: 'long', year: 'numeric' }).format(new Date())}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-full py-20">
            <div className="w-5 h-5 border-2 border-[#2AABEE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
            <Crown className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">هنوز سیگنالی ثبت نشده</p>
          </div>
        ) : (
          <div className="space-y-5">
            {groupEntries.map(([month, items]: [string, any[]]) => (
              <div key={month}>
                {/* Month separator */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2a2d3a] to-transparent" />
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1f2e] border border-[#2a2d3a]">
                    <Calendar className="w-3 h-3 text-[#2AABEE]" />
                    <span className="text-[10px] font-bold text-white">{month}</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2a2d3a] to-transparent" />
                </div>

                {/* Square grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {items.map((item: any) => {
                    const [bg1, bg2, border, iconColor] = getGradient(item.title + ' ' + (item.content || ''))
                    return (
                      <button key={item.id} onClick={() => setSelected(item)}
                        className={`rounded-2xl border ${border} p-3 flex flex-col items-center justify-center text-center hover:scale-[1.03] hover:shadow-xl transition-all group aspect-square relative overflow-hidden`}
                      >
                        {/* Gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${bg1} ${bg2} opacity-90`} />
                        <div className="absolute inset-0 bg-[#0b0e17]/40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center w-full h-full">
                          {/* Top row: read status */}
                          <div className="self-end mb-auto">
                            {item.isRead ? (
                              <span className="text-blue-400/60 text-[7px]">✓✓</span>
                            ) : (
                              <span className={`${iconColor} text-[9px]`}>●</span>
                            )}
                          </div>

                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-2 group-hover:bg-white/20 group-hover:scale-110 transition-all`}>
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <Crown className={`w-4 h-4 ${iconColor}`} />
                            )}
                          </div>

                          {/* Title */}
                          <span className="text-[11px] font-bold text-white leading-tight line-clamp-2 mb-1 max-w-full px-0.5 break-words">{item.title}</span>

                          {/* Profit */}
                          {item.profitPercent && (
                            <span className="text-[10px] font-black text-emerald-400 drop-shadow-sm">+{Number(item.profitPercent).toFixed(1)}%</span>
                          )}

                          {/* Date */}
                          <span className="text-[7px] text-white/40 mt-auto">{formatTime(new Date(item.createdAt))}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3"
            onClick={() => { setSelected(null); setPlayingAudio(null) }}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#1c1f2e] border border-[#2a2d3a] rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-l from-[#2AABEE]/10 to-transparent border-b border-[#2a2d3a] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#2AABEE]/15 flex items-center justify-center shrink-0">
                    <Crown className="w-3.5 h-3.5 text-[#2AABEE]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[14px] font-bold text-white truncate">{selected.title}</h2>
                    <div className="flex items-center gap-2 text-[8px] text-gray-500">
                      <span>{formatTime(new Date(selected.createdAt))}</span>
                      <span>{new Date(selected.createdAt).toLocaleDateString('fa-IR')}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => { setSelected(null); setPlayingAudio(null) }} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="px-4 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
                {selected.profitPercent && (
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 text-center">
                    <div className="text-[9px] text-gray-500 mb-0.5">سود پیشنهادی</div>
                    <div className="text-xl font-black text-emerald-400">+{Number(selected.profitPercent).toFixed(1)}%</div>
                  </div>
                )}

                {selected.profitMessage && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                    <span className="text-[12px] text-emerald-400 font-bold">{selected.profitMessage}</span>
                  </div>
                )}

                {selected.content && (
                  <div className="text-[13px] text-gray-300 leading-7 whitespace-pre-wrap" style={{ direction: 'rtl', textAlign: 'right' }}>
                    {selected.content.split('\n').map((line: string, i: number) => {
                      const t = line.trim()
                      if (!t) return <div key={i} className="h-1.5" />
                      const isHeader = /^[🟡🔵🟢🔴🟣🟠⚪✅❌⚠️⏳🎯📊📈📉💰💎🔥⭐🌟✨💡📌🔔🚀🏆🎯]/.test(t)
                      const hasPrice = /[\d,]+(,\d{3})*(\.\d+)?\s*(تومان|ریال|دلار)/.test(t)
                      const hasPercent = /\d+(\.\d+)?%/.test(t)
                      let cls = 'leading-7'
                      if (isHeader) cls += ' text-amber-300 font-bold text-[14px]'
                      else if (hasPrice) cls += ' text-emerald-400 font-medium'
                      else if (hasPercent) cls += ' text-amber-400 font-medium'
                      return <p key={i} className={cls}>{t}</p>
                    })}
                  </div>
                )}

                {selected.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-[#2a2d3a]">
                    <img src={selected.imageUrl} alt="" className="w-full h-auto max-h-80 object-cover" loading="lazy" />
                  </div>
                )}

                {selected.audioUrl && (
                  <div className="flex items-center gap-2.5 bg-[#0b0e17] rounded-xl px-3.5 py-3 border border-[#2a2d3a]">
                    <button onClick={() => setPlayingAudio(playingAudio === selected.audioUrl ? null : selected.audioUrl)}
                      className="w-8 h-8 rounded-full bg-[#2AABEE]/15 flex items-center justify-center hover:bg-[#2AABEE]/25 shrink-0 transition-all"
                    >
                      {playingAudio === selected.audioUrl ? <Pause className="w-4 h-4 text-[#2AABEE]" /> : <Play className="w-4 h-4 text-[#2AABEE] mr-0.5" />}
                    </button>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Mic className="w-4 h-4 text-gray-600 shrink-0" />
                      <span className="text-[11px] text-gray-400">ویس تحلیل</span>
                      {playingAudio === selected.audioUrl && (
                        <div className="flex gap-px items-center">
                          {[1,2,3].map(i => <div key={i} className="w-0.5 h-3 bg-[#2AABEE] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selected.expiresAt && (
                  <div className={`text-[11px] ${new Date(selected.expiresAt) < new Date() ? 'text-red-400' : 'text-gray-500'}`}>
                    {new Date(selected.expiresAt) < new Date() ? '⛔ منقضی شده' : `⏳ ${new Date(selected.expiresAt).toLocaleDateString('fa-IR')}`}
                  </div>
                )}
              </div>

              <div className="border-t border-[#2a2d3a] px-4 py-2.5">
                <button onClick={() => { setSelected(null); setPlayingAudio(null) }}
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-[#2a2d3a] text-gray-400 hover:text-white hover:border-[#2AABEE]/30 transition-all text-[12px] font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5 inline-block ml-1.5" /> بستن
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {playingAudio && <audio src={playingAudio} onEnded={() => setPlayingAudio(null)} className="hidden" />}
    </div>
  )
}
