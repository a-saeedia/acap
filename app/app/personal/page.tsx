'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, X, Bot, Mic, Crown, MessageSquare } from 'lucide-react'

function formatTime(d: Date) {
  return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
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

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export default function PersonalPage() {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    import('@/app/actions/admin').then(m =>
      m.getUserSuggestions().then(setSuggestions).catch(() => {})
    ).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [suggestions])

  const grouped = suggestions.reduce((acc: Record<string, any[]>, s: any) => {
    const d = s.createdAt ? new Date(s.createdAt) : new Date()
    const k = dateKey(d)
    if (!acc[k]) acc[k] = []
    acc[k].push(s)
    return acc
  }, {} as Record<string, any[]>)

  const sortedGroups = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <div className="h-screen bg-gray-950 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="shrink-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">A|CAP Personal</h1>
            <p className="text-[10px] text-gray-500">پیام‌های خصوصی</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-gray-600">آنلاین</span>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">هنوز پیامی دریافت نکردی</p>
            <p className="text-xs text-gray-600 mt-1">پیشنهادات اختصاصی A|CAP+ اینجا ظاهر می‌شه</p>
          </div>
        ) : (
          <>
            {/* Welcome message */}
            <div className="flex justify-start mb-4">
              <div className="bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] text-amber-400/80 font-bold">A|CAP Personal</span>
                </div>
                <p className="text-[13px] text-gray-300 leading-relaxed">
                  سلام! اینجا پیام‌ها و پیشنهادات اختصاصی سرمایه‌گذاری که مخصوص تو نوشته شده رو می‌تونی ببینی. هر پیشنهاد می‌تونه شامل تحلیل، تصویر، ویس یا ویدیو باشه.
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-gray-600">هماکنون</span>
                  <span className="text-blue-400 text-[9px]">✓✓</span>
                </div>
              </div>
            </div>

            {sortedGroups.map(([date, dayItems]) => (
              <div key={date}>
                <div className="flex justify-center my-3">
                  <span className="text-[10px] text-gray-600 bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700/30">
                    {formatDateLabel(new Date(dayItems[0].createdAt))}
                  </span>
                </div>

                {dayItems.map((item: any) => {
                  const sd = item.createdAt ? new Date(item.createdAt) : new Date()
                  const isExpired = item.expiresAt ? new Date(item.expiresAt) < new Date() : false

                  return (
                    <div key={item.id} className="flex justify-start mb-3">
                      <div className="max-w-[90%] sm:max-w-[85%]">
                        <div className="bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm border border-gray-700/20">
                          {/* Sender */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-5 h-5 rounded-full bg-amber-500/30 flex items-center justify-center flex-shrink-0">
                              <Crown className="w-2.5 h-2.5 text-amber-400" />
                            </div>
                            <span className="text-[10px] text-amber-400/80 font-bold">A|CAP Personal</span>
                            {item.isRead ? (
                              <span className="text-blue-400 text-[9px] mr-auto">✓✓</span>
                            ) : (
                              <span className="text-gray-600 text-[9px] mr-auto">✓</span>
                            )}
                          </div>

                          {/* Title */}
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-sm font-bold text-white">{item.title}</span>
                            {item.profitPercent && (
                              <span className="text-xs font-black text-emerald-400 shrink-0">+{Number(item.profitPercent).toFixed(1)}%</span>
                            )}
                          </div>

                          {/* Content */}
                          {item.content && (
                            <div className="text-[14px] text-gray-300 leading-8 whitespace-pre-wrap" style={{ direction: 'rtl', textAlign: 'right' }}>
                              {item.content.split('\n').map((line: string, i: number) => {
                                const t = line.trim()
                                if (!t) return <div key={i} className="h-1" />
                                const isEmojiHeader = /^[🟡🔵🟢🔴🟣🟠⚪✅❌⚠️⏳🎯📊📈📉💰💎🔥⭐🌟✨💡📌🔔🚀🏆🎯]/.test(t)
                                const hasPrice = /[\d,]+(,\d{3})*(\.\d+)?\s*(تومان|ریال|دلار)/.test(t)
                                const hasPercent = /\d+(\.\d+)?%/.test(t)
                                let cls = 'leading-8'
                                if (isEmojiHeader) cls += ' text-amber-300 font-bold text-[16px]'
                                else if (hasPrice) cls += ' text-emerald-400 font-medium'
                                else if (hasPercent) cls += ' text-amber-400 font-medium'
                                return <p key={i} className={cls}>{t}</p>
                              })}
                            </div>
                          )}

                          {/* Profit message */}
                          {item.profitMessage && (
                            <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5">
                              <span className="text-emerald-400 text-xs font-bold">{item.profitMessage}</span>
                            </div>
                          )}

                          {/* Image */}
                          {item.imageUrl && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-gray-700/30">
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="w-full h-auto max-h-80 object-cover hover:brightness-110 transition-all cursor-pointer"
                                loading="lazy"
                                onClick={() => setPreviewImage(item.imageUrl)}
                              />
                            </div>
                          )}

                          {/* Audio */}
                          {item.audioUrl && (
                            <div className="mt-2 flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700/20">
                              <button onClick={() => setPlayingAudio(playingAudio === item.audioUrl ? null : item.audioUrl)}
                                className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center hover:bg-amber-500/30 transition-colors shrink-0"
                              >
                                {playingAudio === item.audioUrl ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-amber-400 mr-0.5" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Mic className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                  <span className="text-[11px] text-gray-400">ویس پیام</span>
                                  {playingAudio === item.audioUrl && (
                                    <div className="flex gap-0.5 items-center">
                                      {[1,2,3].map(i => (
                                        <div key={i} className="w-0.5 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Video */}
                          {item.videoUrl && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-gray-700/30">
                              <video
                                src={item.videoUrl}
                                controls
                                className="w-full h-auto max-h-80"
                                controlsList="nodownload"
                              />
                            </div>
                          )}

                          {/* Expiry */}
                          {item.expiresAt && (
                            <div className={`mt-1.5 text-[10px] ${isExpired ? 'text-red-400' : 'text-gray-500'}`}>
                              {isExpired ? '⛔ منقضی شده' : `⏳ اعتبار تا ${formatDateLabel(new Date(item.expiresAt))}`}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5 mr-1">
                          <span className="text-[10px] text-gray-600">{formatTime(sd)}</span>
                          {item.isRead ? (
                            <span className="text-blue-400 text-[9px]">✓✓</span>
                          ) : (
                            <span className="text-gray-600 text-[9px]">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </>
        )}
        <div ref={chatEndRef} />
      </div>

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

      {playingAudio && <audio src={playingAudio} onEnded={() => setPlayingAudio(null)} className="hidden" />}
    </div>
  )
}
