'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { motion } from 'framer-motion'
import { Crown, MessageCircle, ArrowLeft, Check, Star, TrendingUp, Shield, X, Loader2, Send, Clock } from 'lucide-react'
import { getUserSuggestions, markSuggestionRead } from '@/app/actions/admin'
import { ContentRenderer } from '@/components/content-renderer'

type Suggestion = Awaited<ReturnType<typeof getUserSuggestions>>[number]

export default function AcapPlusPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isPlus, setIsPlus] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedSug, setSelectedSug] = useState<Suggestion | null>(null)

  useEffect(() => {
    if (isPending) return
    if (!session) { router.push('/'); return }

    Promise.all([
      fetch('/api/acap-plus').then(r => r.json()).then(d => {
        setIsPlus(d.isPlus)
        setHasRequested(d.hasRequested ?? false)
        if (d.isPlus) { router.push('/app/signals'); return }
      }).catch(() => {}),
      getUserSuggestions().then(setSuggestions).catch(() => {}),
    ]).finally(() => setChecking(false))
  }, [session, isPending, router])

  const handleMarkRead = async (id: string) => {
    try {
      await markSuggestionRead(id)
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, isRead: true } : s))
    } catch {}
  }

  if (isPending || checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!session) return null

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

            <h1 className="text-3xl sm:text-4xl font-black mb-3 bg-gradient-to-l from-amber-300 to-amber-500 bg-clip-text text-transparent">
              A|CAP+
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              سطح بعدی مدیریت سرمایه هوشمند. پیشنهادات اختصاصی، سیگنال‌های لحظه‌ای و پشتیبانی VIP
            </p>

            <div className="space-y-3 text-right mb-8">
              {[
                'پیشنهادات سرمایه‌گذاری اختصاصی',
                'سیگنال‌های خرید و فروش لحظه‌ای',
                'تحلیل اختصاصی پورتفولیو',
                'پشتیبانی VIP در تلگرام',
                'دسترسی به آکادمی A|CAP',
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </motion.div>
              ))}
            </div>

            {hasRequested ? (
              <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-4 rounded-2xl text-sm font-bold mb-4 flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                درخواست شما ثبت شد. پس از تأیید ادمین فعال خواهد شد.
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
                  {requesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  درخواست A|CAP+
                </button>
                <a href="https://t.me/a_cap_support" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-6 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg shadow-amber-500/20 mb-4"
                >
                  <MessageCircle className="w-5 h-5" />
                  فعال‌سازی از طریق تلگرام
                </a>
              </>
            )}

            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center justify-center gap-2 w-full text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              بازگشت به داشبورد
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const openSuggestion = (s: Suggestion) => {
    setSelectedSug(s)
    if (!s.isRead) handleMarkRead(s.id)
  }

  // Plus user — show suggestions
  return (
    <div className="min-h-screen bg-background text-foreground p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/20">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-l from-amber-300 to-amber-500 bg-clip-text text-transparent">
            پیشنهادات A|CAP+
          </h1>
          <p className="text-muted-foreground text-sm mt-1">پیشنهادات اختصاصی سرمایه‌گذاری برای شما</p>
        </motion.div>

        {suggestions.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass border border-border rounded-3xl p-10 text-center"
          >
            <div className="text-5xl mb-4">📋</div>
            <p className="text-muted-foreground text-lg">هنوز پیشنهادی برای شما ثبت نشده</p>
            <p className="text-muted-foreground/60 text-sm mt-2">به زودی اولین پیشنهاد اختصاصی خود را دریافت خواهید کرد</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, x: -15, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 30 }}
                onClick={() => openSuggestion(s)}
                className={`w-full text-right rounded-2xl border transition-all relative overflow-hidden ${!s.isRead ? 'bg-gradient-to-l from-amber-500/5 via-transparent to-transparent border-amber-500/30 shadow-lg shadow-amber-500/10' : 'glass border-border hover:border-amber-500/30'}`}
              >
                {/* Unread glow bar */}
                {!s.isRead && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
                    className="absolute top-0 left-0 h-full w-0 bg-gradient-to-r from-amber-500/10 to-transparent rounded-2xl"
                  />
                )}
                <div className="relative flex items-start justify-between gap-4 p-5">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                           style={{ 
                             backgroundColor: !s.isRead ? 'rgba(251, 191, 36, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                             color: !s.isRead ? '#FBBF24' : '#94A3B8'
                           }}>
                        <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`font-bold text-sm sm:text-base truncate ${!s.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {s.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground/60">
                            {new Date(s.createdAt).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}
                          </span>
                          {s.profitPercent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                              <TrendingUp className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 text-xs font-bold">+{s.profitPercent}%</span>
                            </span>
                          )}
                        </div>
                      </div>
                  </div>
                  <div className="flex items-center flex-shrink-0">
                    {!s.isRead && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 flex-shrink-0"
                      />
                    )}
                    <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted/30 text-muted-foreground/30 hover:bg-amber-500/10 hover:text-amber-400 transition-all">
                      <ArrowLeft className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت به داشبورد
          </button>
        </motion.div>
      </div>

      {/* Suggestion detail modal — Telegram style */}
      {selectedSug && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center"
          onClick={() => setSelectedSug(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full sm:max-w-lg sm:rounded-3xl sm:mx-4 max-h-[90vh] flex flex-col bg-gray-900 sm:border sm:border-amber-500/20 sm:shadow-2xl sm:shadow-amber-500/10 overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{ borderRadius: '16px 16px 0 0' }}
          >
            {/* Handle bar for mobile */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Crown className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs text-amber-400 font-bold">ACAP</span>
                <span className="text-[10px] text-gray-600">|</span>
                <span className="text-[10px] text-gray-500">{new Date(selectedSug.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <button onClick={() => setSelectedSug(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Title bubble */}
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[90%] sm:max-w-[85%] shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-[10px] text-amber-400/70 font-bold">پیشنهاد اختصاصی</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white leading-snug">{selectedSug.title}</h2>
                </div>
              </div>

              {/* Content bubble */}
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[90%] sm:max-w-[85%] shadow-sm">
                  <ContentRenderer text={selectedSug.content} />
                </div>
              </div>

              {/* Image */}
              {selectedSug.imageUrl && (
                <div className="flex justify-start">
                  <div className="rounded-2xl overflow-hidden max-w-[85%] shadow-sm border border-gray-700/50">
                    <img src={selectedSug.imageUrl} alt="" className="w-full h-auto max-h-80 object-cover" loading="lazy" />
                  </div>
                </div>
              )}

              {/* Audio */}
              {selectedSug.audioUrl && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-sm">
                    <audio controls className="w-full max-w-[260px] h-10" style={{ filter: 'invert(0.85) hue-rotate(180deg)' }}>
                      <source src={selectedSug.audioUrl} />
                    </audio>
                  </div>
                </div>
              )}

              {/* Profit bubble */}
              {selectedSug.profitPercent && (
                <div className="flex justify-start">
                  <div className="bg-emerald-900/40 border border-emerald-700/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-emerald-400/60 font-medium">سود حاصل از پیشنهاد</p>
                        <p className="text-emerald-400 text-base font-black">+{selectedSug.profitPercent}%</p>
                        {selectedSug.profitMessage && (
                          <p className="text-emerald-400/70 text-xs mt-0.5">{selectedSug.profitMessage}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Date & read receipt */}
              <div className="flex justify-end">
                <div className="flex items-center gap-2 text-[10px] text-gray-600">
                  <span>{new Date(selectedSug.createdAt).toLocaleDateString('fa-IR', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  {selectedSug.isRead ? (
                    <span className="text-blue-400">✓✓</span>
                  ) : (
                    <span className="text-gray-600">✓</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-800 px-4 py-3">
              <button
                onClick={() => setSelectedSug(null)}
                className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all text-sm font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                بستن
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
