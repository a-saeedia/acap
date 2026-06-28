'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { motion } from 'framer-motion'
import { Crown, MessageCircle, ArrowLeft, Check, Star, TrendingUp, Shield, X } from 'lucide-react'
import { getUserSuggestions, markSuggestionRead } from '@/app/actions/admin'

type Suggestion = Awaited<ReturnType<typeof getUserSuggestions>>[number]

export default function AcapPlusPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [isPlus, setIsPlus] = useState(false)
  const [checking, setChecking] = useState(true)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loadingSugs, setLoadingSugs] = useState(true)
  const [selectedSug, setSelectedSug] = useState<Suggestion | null>(null)

  useEffect(() => {
    if (isPending) return
    if (!session) { router.push('/'); return }

    fetch('/api/acap-plus').then(r => r.json()).then(async data => {
      setIsPlus(data.isPlus)
      setChecking(false)
      if (data.isPlus) {
        try {
          const sugs = await getUserSuggestions()
          setSuggestions(sugs)
        } catch {}
        setLoadingSugs(false)
      }
    })
  }, [session, isPending, router])

  const handleMarkRead = async (id: string) => {
    try {
      await markSuggestionRead(id)
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, isRead: true } : s))
    } catch {}
  }

  if (isPending || checking) return (
    <div className="min-h-screen flex items-center justify-center text-foreground">...</div>
  )
  if (!session) return null

  if (!isPlus) {
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

            <a
              href="https://t.me/acapitalsbot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-6 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg shadow-amber-500/20 mb-4"
            >
              <MessageCircle className="w-5 h-5" />
              فعال‌سازی از طریق تلگرام
            </a>

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

        {loadingSugs ? (
          <div className="text-center py-12 text-muted-foreground">در حال بارگذاری...</div>
        ) : suggestions.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass border border-border rounded-3xl p-10 text-center"
          >
            <div className="text-5xl mb-4">📋</div>
            <p className="text-muted-foreground text-lg">هنوز پیشنهادی برای شما ثبت نشده</p>
            <p className="text-muted-foreground/60 text-sm mt-2">به زودی اولین پیشنهاد اختصاصی خود را دریافت خواهید کرد</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openSuggestion(s)}
                className={`w-full text-right rounded-2xl p-4 border transition-all ${!s.isRead ? 'bg-amber-500/5 border-amber-500/20 shadow-lg shadow-amber-500/5' : 'glass border-border hover:border-amber-500/30'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {!s.isRead && <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0 animate-pulse shadow-lg shadow-amber-400/50" />}
                    {s.isRead && <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20 flex-shrink-0" />}
                    <span className={`font-bold truncate ${!s.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{s.title}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-muted-foreground/50 text-xs">{new Date(s.createdAt).toLocaleDateString('fa-IR')}</span>
                    {s.profitAmount && <span className="text-emerald-400 text-xs font-bold">+{s.profitAmount.toLocaleString('fa-IR')}</span>}
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

      {/* Suggestion detail modal */}
      {selectedSug && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedSug(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-lg glass border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Header gradient */}
            <div className="bg-gradient-to-l from-amber-500/20 via-amber-500/10 to-transparent px-6 pt-6 pb-4 border-b border-amber-500/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-amber-400 font-bold">پیشنهاد اختصاصی</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground leading-tight">{selectedSug.title}</h2>
                </div>
                <button onClick={() => setSelectedSug(null)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/20 hover:bg-black/30 text-muted-foreground hover:text-foreground transition-all flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground font-medium">جزئیات پیشنهاد</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <p className="text-foreground/90 leading-relaxed text-sm whitespace-pre-wrap">{selectedSug.content}</p>
              </div>

              {selectedSug.profitAmount && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-400/70 font-medium">سود حاصل از پیشنهاد</p>
                      <p className="text-emerald-400 text-lg font-black">+{selectedSug.profitAmount.toLocaleString('fa-IR')} تومان</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground/50 pt-2 border-t border-border">
                <span>ارسال شده در {new Date(selectedSug.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                {selectedSug.isRead && <span>خوانده شده</span>}
                {!selectedSug.isRead && <span className="text-amber-400 font-bold">جدید</span>}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
