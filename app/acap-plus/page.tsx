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
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl p-5 border transition-all cursor-pointer ${!s.isRead ? 'bg-amber-500/5 border-amber-500/20 shadow-lg shadow-amber-500/5' : 'glass border-border'}`}
                onClick={() => { if (!s.isRead) handleMarkRead(s.id) }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {!s.isRead && <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" />}
                      <span className="font-bold text-foreground">{s.title}</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.content}</p>
                    {s.profitAmount && (
                      <div className="inline-flex items-center gap-1.5 mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-bold">+{s.profitAmount.toLocaleString('fa-IR')} تومان سود</span>
                      </div>
                    )}
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="text-muted-foreground/50 text-xs">{new Date(s.createdAt).toLocaleDateString('fa-IR')}</p>
                    {s.isRead && <p className="text-muted-foreground/30 text-[10px] mt-1">خوانده شده</p>}
                  </div>
                </div>
              </motion.div>
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
    </div>
  )
}
