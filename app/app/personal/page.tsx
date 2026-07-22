'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, X, Crown, Mic } from 'lucide-react'

function formatTime(d: Date) {
  return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function formatDateLabel(d: Date) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = Math.floor((today.getTime() - target.getTime()) / 86400000)
  if (diff === 0) return 'امروز'
  if (diff === 1) return 'دیروز'
  return d.toLocaleDateString('fa-IR', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function PersonalPage() {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    import('@/app/actions/admin').then(m =>
      m.getUserSuggestions().then(setSuggestions).catch(() => {})
    ).finally(() => setLoading(false))
  }, [])

  const grouped = suggestions.reduce((acc: Record<string, any[]>, s: any) => {
    const k = dateKey(s.createdAt ? new Date(s.createdAt) : new Date())
    if (!acc[k]) acc[k] = []
    acc[k].push(s)
    return acc
  }, {} as Record<string, any[]>)

  const sortedGroups = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <div className="h-screen bg-[#0b0e17] flex flex-col" dir="rtl">
      {/* Header */}
      <header className="shrink-0 bg-[#1c1f2e] border-b border-[#2a2d3a] px-3 py-2.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#2AABEE]/15 flex items-center justify-center">
            <Crown className="w-3.5 h-3.5 text-[#2AABEE]" />
          </div>
          <div>
            <h1 className="text-[13px] font-bold text-white leading-tight">A|CAP Personal</h1>
            <p className="text-[8px] text-gray-500">{suggestions.length} پیام</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[8px] text-gray-600">آنلاین</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-[#2AABEE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Crown className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs">هنوز پیامی نیست</p>
          </div>
        ) : (
          <div className="px-2 py-2 space-y-3">
            {/* Welcome */}
            <div className="bg-[#1c1f2e] rounded-xl border border-[#2a2d3a] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Crown className="w-3.5 h-3.5 text-[#2AABEE]" />
                <span className="text-[10px] font-bold text-[#2AABEE]/80">A|CAP Personal</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">سلام! پیام‌های اختصاصی سرمایه‌گذاری مخصوص تو اینجا نمایش داده می‌شه.</p>
            </div>

            {sortedGroups.map(([date, dayItems]) => (
              <div key={date}>
                <div className="flex justify-center mb-2">
                  <span className="text-[8px] text-gray-600 bg-[#1c1f2e]/60 px-2 py-0.5 rounded-full">{formatDateLabel(new Date(dayItems[0].createdAt))}</span>
                </div>
                <div className="space-y-1.5">
                  {dayItems.map((item: any) => {
                    const sd = item.createdAt ? new Date(item.createdAt) : new Date()
                    const isExpired = item.expiresAt ? new Date(item.expiresAt) < new Date() : false

                    return (
                      <div key={item.id} className="bg-[#1c1f2e] rounded-xl border border-[#2a2d3a] p-3 hover:border-[#2AABEE]/20 transition-colors">
                        {/* Header row */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-[#2AABEE]/15 flex items-center justify-center">
                              <Crown className="w-2 h-2 text-[#2AABEE]" />
                            </div>
                            <span className="text-[8px] text-[#2AABEE]/60">Personal</span>
                            <span className="text-[7px] text-gray-600">{formatTime(sd)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {item.profitPercent && (
                              <span className="text-[7px] font-bold text-emerald-400">+{Number(item.profitPercent).toFixed(0)}%</span>
                            )}
                            {item.isRead ? (
                              <span className="text-blue-400 text-[6px]">✓✓</span>
                            ) : (
                              <span className="text-[#2AABEE] text-[6px]">✓</span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[12px] font-bold text-white leading-tight">{item.title}</span>
                        </div>

                        {/* Content */}
                        {item.content && (
                          <p className="text-[10px] text-gray-400 leading-relaxed whitespace-pre-wrap line-clamp-4">{item.content}</p>
                        )}

                        {/* Profit message */}
                        {item.profitMessage && (
                          <div className="mt-1 bg-emerald-500/8 border border-emerald-500/15 rounded-lg px-2 py-1">
                            <span className="text-[9px] text-emerald-400">{item.profitMessage}</span>
                          </div>
                        )}

                        {/* Image */}
                        {item.imageUrl && (
                          <div className="mt-1.5 rounded-lg overflow-hidden border border-[#2a2d3a]">
                            <img src={item.imageUrl} alt="" className="w-full h-auto max-h-48 object-cover" loading="lazy" onClick={() => setPreviewImage(item.imageUrl)} />
                          </div>
                        )}

                        {/* Audio */}
                        {item.audioUrl && (
                          <div className="mt-1.5 flex items-center gap-1.5 bg-[#0b0e17] rounded-lg px-2 py-1.5 border border-[#2a2d3a]">
                            <button onClick={() => setPlayingAudio(playingAudio === item.audioUrl ? null : item.audioUrl)}
                              className="w-6 h-6 rounded-full bg-[#2AABEE]/15 flex items-center justify-center hover:bg-[#2AABEE]/25 shrink-0"
                            >
                              {playingAudio === item.audioUrl ? <Pause className="w-3 h-3 text-[#2AABEE]" /> : <Play className="w-3 h-3 text-[#2AABEE] mr-0.5" />}
                            </button>
                            <Mic className="w-3 h-3 text-gray-600 shrink-0" />
                            <span className="text-[9px] text-gray-500">ویس پیام</span>
                            {playingAudio === item.audioUrl && (
                              <div className="flex gap-px items-center">
                                {[1,2,3].map(i => <div key={i} className="w-px h-2.5 bg-[#2AABEE] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Expiry */}
                        {item.expiresAt && (
                          <div className={`mt-1 text-[7px] ${isExpired ? 'text-red-400' : 'text-gray-600'}`}>
                            {isExpired ? '⛔ منقضی شده' : `⏳ ${new Date(item.expiresAt).toLocaleDateString('fa-IR')}`}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Image preview */}
      <AnimatePresence>
        {previewImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 p-1.5 bg-black/50 rounded-full text-white z-10">
              <X className="w-4 h-4" />
            </button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={previewImage} alt="" className="max-w-full max-h-[90vh] rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {playingAudio && <audio src={playingAudio} onEnded={() => setPlayingAudio(null)} className="hidden" />}
    </div>
  )
}
