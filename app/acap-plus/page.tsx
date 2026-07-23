'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, ArrowLeft, TrendingUp, X, Loader2, Send, Clock, Bot, Play, Pause, Mic, ChevronDown, MessageSquare, Check, MessageCircle } from 'lucide-react'
import { getUserSuggestions, markSuggestionRead } from '@/app/actions/admin'

type Suggestion = Awaited<ReturnType<typeof getUserSuggestions>>[number]

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

export default function AcapPlusPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isPlus, setIsPlus] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [expandedSug, setExpandedSug] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPending) return
    if (!session) { router.push('/'); return }
    Promise.all([
      fetch('/api/acap-plus').then(r => r.json()).then(d => {
        setIsPlus(d.isPlus)
        setHasRequested(d.hasRequested ?? false)
      }).catch(() => {}),
      getUserSuggestions().then(setSuggestions).catch(() => {}),
    ]).finally(() => setChecking(false))
  }, [session, isPending, router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [suggestions])

  useEffect(() => {
    // Mark all as read when viewing
    suggestions.forEach(s => {
      if (!s.isRead) markSuggestionRead(s.id).catch(() => {})
    })
  }, [suggestions.length])

  const handleMarkRead = async (id: string) => {
    try {
      await markSuggestionRead(id)
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, isRead: true } : s))
    } catch {}
  }

  if (isPending || checking) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!session) return null

  // Non-plus user — request page
  if (!isPlus && suggestions.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6" dir="rtl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <div className="glass border border-amber-500/20 rounded-3xl p-8 sm:p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/20"
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-black mb-3 bg-gradient-to-l from-amber-300 to-amber-500 bg-clip-text text-transparent">A|CAP+</h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">سطح بعدی مدیریت سرمایه هوشمند</p>
            <div className="space-y-3 text-right mb-8">
              {['پیشنهادات سرمایه‌گذاری اختصاصی', 'سیگنال‌های خرید و فروش لحظه‌ای', 'تحلیل اختصاصی پورتفولیو', 'پشتیبانی VIP در تلگرام', 'دسترسی به آکادمی A|CAP'].map((item, i) => (
                <motion.div key={item} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </motion.div>
              ))}
            </div>
            {hasRequested ? (
              <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-4 rounded-2xl text-sm font-bold mb-4 flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />درخواست شما ثبت شد. پس از تأیید ادمین فعال خواهد شد.
              </div>
            ) : (
              <>
                <button onClick={async () => {
                  setRequesting(true)
                  try {
                    const { requestAcapPlus } = await import('@/app/actions/admin')
                    await requestAcapPlus(session!.user.id)
                    setHasRequested(true)
                  } catch (e) { console.error(e) }
                  setRequesting(false)
                }} disabled={requesting}
                  className="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-l from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg shadow-emerald-500/20 mb-3"
                >
                  {requesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}درخواست A|CAP+
                </button>
                <a href="https://t.me/a_cap_support" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-6 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg shadow-amber-500/20 mb-4"
                >
                  <MessageCircle className="w-5 h-5" />فعال‌سازی از طریق تلگرام
                </a>
              </>
            )}
            <button onClick={() => router.push('/app')} className="flex items-center justify-center gap-2 w-full text-muted-foreground hover:text-foreground transition-colors py-2">
              <ArrowLeft className="w-4 h-4" />بازگشت به داشبورد
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const grouped = suggestions.reduce((acc, s) => {
    const d = s.createdAt ? new Date(s.createdAt) : new Date()
    const k = dateKey(d)
    if (!acc[k]) acc[k] = []
    acc[k].push(s)
    return acc
  }, {} as Record<string, Suggestion[]>)

  const sortedGroups = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <div className="h-screen bg-gray-950 flex flex-col" dir="rtl">
      {/* Fixed header */}
      <header className="shrink-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/app')} className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white">A|CAP Bot</h1>
              <p className="text-[10px] text-gray-500">{suggestions.length} پیشنهاد</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-gray-600">آنلاین</span>
        </div>
      </header>

      {/* Scrollable chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">هنوز پیشنهادی دریافت نکردی</p>
            <p className="text-xs text-gray-600 mt-1 mt-1">به زودی اولین پیشنهاد اختصاصی برات میاد</p>
          </div>
        ) : (
          <>
            {/* Bot welcome message */}
            <div className="flex justify-start mb-4">
              <div className="bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] text-amber-400/80 font-bold">A|CAP+</span>
                </div>
                <p className="text-[13px] text-gray-300 leading-relaxed" style={{ direction: 'rtl', textAlign: 'right' }}>
                  سلام! اینجا پیشنهادات اختصاصی سرمایه‌گذاری برای تو قرار می‌گیره. هر پیشنهاد می‌تونه شامل تحلیل، تصویر، ویس و ویدئو باشه.
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-gray-600">هماکنون</span>
                  <span className="text-blue-400 text-[9px]">✓✓</span>
                </div>
              </div>
            </div>

            {sortedGroups.map(([date, daySugs]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex justify-center my-3">
                  <span className="text-[10px] text-gray-600 bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700/30">
                    {formatDateLabel(new Date(daySugs[0].createdAt))}
                  </span>
                </div>

                {daySugs.map(s => {
                  const isExpanded = expandedSug === s.id
                  const sd = s.createdAt ? new Date(s.createdAt) : new Date()
                  return (
                    <div key={s.id} className="flex justify-start mb-3">
                      <div className="max-w-[90%] sm:max-w-[85%]">
                        {/* Bubble */}
                        <div
                          className="bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm cursor-pointer transition-colors hover:bg-gray-750 border border-gray-700/20"
                          onClick={() => { setExpandedSug(isExpanded ? null : s.id); if (!s.isRead) handleMarkRead(s.id) }}
                        >
                          {/* Sender */}
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-amber-500/30 flex items-center justify-center flex-shrink-0">
                              <Crown className="w-2.5 h-2.5 text-amber-400" />
                            </div>
                            <span className="text-[10px] text-amber-400/80 font-bold">پیشنهاد اختصاصی</span>
                            {!s.isRead && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            )}
                          </div>

                          {/* Title */}
                          <h2 className="text-sm font-black text-white leading-snug mb-1">{s.title}</h2>

                          {/* Content preview */}
                          {s.content && (
                            <div className={isExpanded ? '' : 'line-clamp-3'}>
                              <ContentLines text={s.content} />
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
                                className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center hover:bg-amber-500/30 transition-colors shrink-0"
                              >
                                {playingAudio === s.audioUrl ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-amber-400 mr-0.5" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Mic className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                  <span className="text-[11px] text-gray-400">ویس پیام</span>
                                  {playingAudio === s.audioUrl && (
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

                          {/* Profit */}
                          {s.profitPercent && (
                            <div className="mt-2 bg-emerald-900/30 border border-emerald-700/20 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 text-xs font-bold">+{s.profitPercent}%</span>
                                {s.profitMessage && <span className="text-emerald-400/60 text-[10px]">{s.profitMessage}</span>}
                              </div>
                            </div>
                          )}

                          <ChevronDown className={`w-3 h-3 text-gray-600 mx-auto mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Footer: time + read */}
                        <div className="flex items-center gap-1.5 mt-0.5 mr-1">
                          <span className="text-[10px] text-gray-600">{formatTime(sd)}</span>
                          {s.isRead ? (
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

      {/* Bottom input area */}
      <div className="shrink-0 border-t border-gray-800 px-4 py-3 bg-gray-900/95">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <div className="flex-1 bg-gray-800 rounded-xl px-4 py-2.5 text-gray-500 text-sm text-right border border-gray-700/50">
            {suggestions.length > 0 ? '💬 برای ثبت نظر با ادمین تماس بگیرید' : 'هنوز پیشنهادی نیست'}
          </div>
          <button className="w-11 h-11 rounded-xl bg-amber-600/20 flex items-center justify-center text-amber-400 hover:bg-amber-600/30 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
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
