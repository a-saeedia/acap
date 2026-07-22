'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, X, Bot, Mic, ChevronDown } from 'lucide-react'

const PM = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

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

function ContentLines({ text }: { text?: string | null }) {
  if (!text) return null
  return (
    <div className="space-y-1">
      {text.split('\n').map((line, i) => {
        const t = line.trim()
        if (!t) return <div key={i} className="h-1" />
        const isEmojiHeader = /^[🟡🔵🟢🔴🟣🟠⚪✅❌⚠️⏳🎯📊📈📉💰💎🔥⭐🌟✨💡📌🔔🚀🏆🎯]/.test(t) && t.length < 80
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
  const [signals, setSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/signals')
      .then(r => r.json())
      .then(d => setSignals(d.signals || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [signals])

  const grouped = signals.reduce((acc: Record<string, any[]>, s: any) => {
    const d = s.publishedAt ? new Date(s.publishedAt) : new Date()
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
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">A|CAP Signal Bot</h1>
            <p className="text-[10px] text-gray-500">{signals.length} سیگنال</p>
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
            <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">هنوز سیگنالی ثبت نشده</p>
            <p className="text-xs text-gray-600 mt-1">از پنل ادمین سیگنال جدید اضافه کنید</p>
          </div>
        ) : (
          <>
            {/* Welcome message */}
            <div className="flex justify-start mb-4">
              <div className="bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400/80 font-bold">A|CAP Signal Bot</span>
                </div>
                <p className="text-[13px] text-gray-300 leading-relaxed" style={{ direction: 'rtl', textAlign: 'right' }}>
                  به کانال سیگنال‌های A|CAP خوش اومدی! تمام سیگنال‌های معاملاتی با تحلیل، تصویر و ویس اینجا قرار می‌گیره.
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-gray-600">هماکنون</span>
                  <span className="text-blue-400 text-[9px]">✓✓</span>
                </div>
              </div>
            </div>

            {sortedGroups.map(([date, daySignals]) => (
              <div key={date}>
                <div className="flex justify-center my-3">
                  <span className="text-[10px] text-gray-600 bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700/30">
                    {formatDateLabel(new Date(daySignals[0].publishedAt))}
                  </span>
                </div>

                {daySignals.map((s: any) => {
                  const isWin = s.actualProfit > 0
                  const isExpanded = expandedId === s.id
                  const sd = s.publishedAt ? new Date(s.publishedAt) : new Date()

                  return (
                    <div key={s.id} className="flex justify-start mb-3">
                      <div className="max-w-[90%] sm:max-w-[85%]">
                        <div
                          className="bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm cursor-pointer transition-colors hover:bg-gray-750 border border-gray-700/20"
                          onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        >
                          {/* Sender */}
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-2.5 h-2.5 text-emerald-400" />
                            </div>
                            <span className="text-[10px] text-emerald-400/80 font-bold">A|CAP Bot</span>
                            <span className="text-[9px] text-gray-600">{s.symbol}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                              s.action === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                            }`}>{s.action === 'buy' ? 'BUY' : 'SELL'}</span>
                          </div>

                          {/* Title + profit */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-bold text-white">{s.title}</span>
                            {s.actualProfit !== null && s.actualProfit !== undefined && (
                              <span className={`text-xs font-black tabular-nums shrink-0 ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isWin ? '+' : ''}{s.actualProfit.toFixed(1)}%
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          {s.description && (
                            <div className={isExpanded ? '' : 'line-clamp-3'}>
                              <ContentLines text={s.description} />
                            </div>
                          )}

                          {/* Image */}
                          {s.imageUrl && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-gray-700/30" onClick={e => { e.stopPropagation(); setPreviewImage(s.imageUrl) }}>
                              <img src={s.imageUrl} alt="" className="w-full h-auto max-h-64 object-cover hover:brightness-110 transition-all" loading="lazy" />
                            </div>
                          )}

                          {/* Audio */}
                          {s.audioUrl && (
                            <div className="mt-2 flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700/20" onClick={e => e.stopPropagation()}>
                              <button onClick={() => setPlayingAudio(playingAudio === s.audioUrl ? null : s.audioUrl)}
                                className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors shrink-0"
                              >
                                {playingAudio === s.audioUrl ? <Pause className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 text-emerald-400 mr-0.5" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Mic className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                  <span className="text-[11px] text-gray-400">ویس تحلیل</span>
                                  {playingAudio === s.audioUrl && (
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

                          {/* Expanded details */}
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

                          <ChevronDown className={`w-3 h-3 text-gray-600 mx-auto mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5 mr-1">
                          <span className="text-[10px] text-gray-600">{formatTime(sd)}</span>
                          {s.actualProfit !== null && s.actualProfit !== undefined ? (
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
