'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, X, Crown, Mic, ArrowLeft } from 'lucide-react'

function formatTime(d: Date) {
  return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
}

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

  return (
    <div className="min-h-screen bg-[#0b0e17] flex flex-col" dir="rtl">
      {/* Header */}
      <header className="shrink-0 bg-[#1c1f2e] border-b border-[#2a2d3a] px-3 py-2.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#2AABEE]/15 flex items-center justify-center">
            <Crown className="w-3.5 h-3.5 text-[#2AABEE]" />
          </div>
          <div>
            <h1 className="text-[13px] font-bold text-white leading-tight">A|CAP Personal</h1>
            <p className="text-[8px] text-gray-500">{suggestions.length} سیگنال</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[8px] text-gray-600">آنلاین</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-[#2AABEE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Crown className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs">هنوز سیگنالی ثبت نشده</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {sorted.map((item: any) => (
              <button key={item.id} onClick={() => setSelected(item)}
                className="bg-[#1c1f2e] rounded-xl border border-[#2a2d3a] p-3 flex flex-col items-center justify-center text-center hover:border-[#2AABEE]/30 hover:bg-[#1c1f2e]/80 transition-all group aspect-square"
              >
                {/* Read status */}
                <div className="self-end mb-1">
                  {item.isRead ? (
                    <span className="text-blue-400 text-[7px]">✓✓</span>
                  ) : (
                    <span className="text-[#2AABEE] text-[7px]">✓</span>
                  )}
                </div>

                {/* Icon area */}
                <div className="w-8 h-8 rounded-full bg-[#2AABEE]/10 flex items-center justify-center mb-1.5 group-hover:bg-[#2AABEE]/20 transition-colors">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Crown className="w-4 h-4 text-[#2AABEE]" />
                  )}
                </div>

                {/* Title */}
                <span className="text-[10px] font-bold text-white leading-tight line-clamp-2 mb-0.5">{item.title}</span>

                {/* Profit */}
                {item.profitPercent && (
                  <span className="text-[9px] font-bold text-emerald-400">+{Number(item.profitPercent).toFixed(1)}%</span>
                )}

                {/* Time */}
                <span className="text-[7px] text-gray-600 mt-auto">{formatTime(new Date(item.createdAt))}</span>
              </button>
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
              {/* Modal header */}
              <div className="bg-[#2AABEE]/5 border-b border-[#2a2d3a] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#2AABEE]/15 flex items-center justify-center shrink-0">
                    <Crown className="w-3 h-3 text-[#2AABEE]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[13px] font-bold text-white truncate">{selected.title}</h2>
                    <span className="text-[8px] text-gray-500">{formatTime(new Date(selected.createdAt))}</span>
                  </div>
                </div>
                <button onClick={() => { setSelected(null); setPlayingAudio(null) }} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="px-4 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
                {/* Profit badge */}
                {selected.profitPercent && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                    <div className="text-[9px] text-gray-500 mb-0.5">سود پیشنهادی</div>
                    <div className="text-lg font-black text-emerald-400">+{Number(selected.profitPercent).toFixed(1)}%</div>
                  </div>
                )}

                {/* Profit message */}
                {selected.profitMessage && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                    <span className="text-[11px] text-emerald-400 font-bold">{selected.profitMessage}</span>
                  </div>
                )}

                {/* Content */}
                {selected.content && (
                  <div className="text-[12px] text-gray-300 leading-7 whitespace-pre-wrap" style={{ direction: 'rtl', textAlign: 'right' }}>
                    {selected.content.split('\n').map((line: string, i: number) => {
                      const t = line.trim()
                      if (!t) return <div key={i} className="h-1.5" />
                      const isHeader = /^[🟡🔵🟢🔴🟣🟠⚪✅❌⚠️⏳🎯📊📈📉💰💎🔥⭐🌟✨💡📌🔔🚀🏆🎯]/.test(t)
                      const hasPrice = /[\d,]+(,\d{3})*(\.\d+)?\s*(تومان|ریال|دلار)/.test(t)
                      const hasPercent = /\d+(\.\d+)?%/.test(t)
                      let cls = 'leading-7'
                      if (isHeader) cls += ' text-amber-300 font-bold text-[13px]'
                      else if (hasPrice) cls += ' text-emerald-400 font-medium'
                      else if (hasPercent) cls += ' text-amber-400 font-medium'
                      return <p key={i} className={cls}>{t}</p>
                    })}
                  </div>
                )}

                {/* Image */}
                {selected.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-[#2a2d3a]">
                    <img src={selected.imageUrl} alt="" className="w-full h-auto max-h-72 object-cover" loading="lazy" />
                  </div>
                )}

                {/* Audio */}
                {selected.audioUrl && (
                  <div className="flex items-center gap-2 bg-[#0b0e17] rounded-xl px-3 py-2.5 border border-[#2a2d3a]">
                    <button onClick={() => setPlayingAudio(playingAudio === selected.audioUrl ? null : selected.audioUrl)}
                      className="w-7 h-7 rounded-full bg-[#2AABEE]/15 flex items-center justify-center hover:bg-[#2AABEE]/25 shrink-0"
                    >
                      {playingAudio === selected.audioUrl ? <Pause className="w-3.5 h-3.5 text-[#2AABEE]" /> : <Play className="w-3.5 h-3.5 text-[#2AABEE] mr-0.5" />}
                    </button>
                    <Mic className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                    <span className="text-[10px] text-gray-400">ویس تحلیل</span>
                    {playingAudio === selected.audioUrl && (
                      <div className="flex gap-px items-center">
                        {[1,2,3].map(i => <div key={i} className="w-0.5 h-3 bg-[#2AABEE] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                      </div>
                    )}
                  </div>
                )}

                {/* Expiry */}
                {selected.expiresAt && (
                  <div className={`text-[10px] ${new Date(selected.expiresAt) < new Date() ? 'text-red-400' : 'text-gray-500'}`}>
                    {new Date(selected.expiresAt) < new Date() ? '⛔ منقضی شده' : `⏳ ${new Date(selected.expiresAt).toLocaleDateString('fa-IR')}`}
                  </div>
                )}
              </div>

              <div className="border-t border-[#2a2d3a] px-4 py-2.5">
                <button onClick={() => { setSelected(null); setPlayingAudio(null) }}
                  className="w-full py-2 rounded-xl bg-white/[0.04] border border-[#2a2d3a] text-gray-400 hover:text-white hover:border-[#2AABEE]/30 transition-all text-[11px] font-medium"
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
