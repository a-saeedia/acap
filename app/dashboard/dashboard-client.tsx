'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { signOut } from '@/lib/auth-client'
import { useState, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import {
  User, Shield, Target, TrendingUp, Flame,
  LogOut, Home, Trophy, Calendar, Phone, Crown, HelpCircle, AlertTriangle, X, GraduationCap
} from 'lucide-react'
import { saveProfile } from '@/app/actions/profile'

type InvestorKey = 'conservative' | 'balanced' | 'growth' | 'aggressive'

const TYPE_MAP: Record<InvestorKey, { name: string; emoji: string; color: string }> = {
  conservative: { name: 'محافظه‌کار', emoji: '🛡️', color: '#10B981' },
  balanced: { name: 'متعادل', emoji: '⚖️', color: '#3B82F6' },
  growth: { name: 'رشدگرا', emoji: '🚀', color: '#1D9BF0' },
  aggressive: { name: 'تهاجمی', emoji: '🔥', color: '#EF4444' },
}

type SuggestionRow = {
  id: string
  userId: string
  adminId: string | null
  title: string
  content: string
  isRead: boolean | null
  readAt: Date | null
  profitPercent: number | null
  profitMessage: string | null
  createdAt: Date
}

interface Props {
  data: {
    user: { id: string; name: string; email: string; image?: string | null }
    profile: {
      phone: string
      age?: number | null
      investmentCapital?: number | null
    } | null
    quizResults: {
      id: string
      score: number
      investorType: string
      phone: string | null
      createdAt: Date
    }[]
    suggestions: SuggestionRow[]
  }
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d))
}

export function DashboardClient({ data }: Props) {
  const router = useRouter()
  const { theme } = useTheme()
  const { user, profile, quizResults, suggestions } = data
  const unreadCount = suggestions.filter(s => !s.isRead).length
  const latest = quizResults[quizResults.length - 1]
  const typeInfo = latest ? TYPE_MAP[latest.investorType as InvestorKey] ?? TYPE_MAP.balanced : null
  const phone = profile?.phone || quizResults.find(r => r.phone)?.phone || ''
  const [isAdmin, setIsAdmin] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneMsg, setPhoneMsg] = useState('')
  const [dismissBanner, setDismissBanner] = useState(false)

  useEffect(() => {
    fetch('/api/admin-check').then(r => r.json()).then(d => setIsAdmin(d.admin)).catch(() => {})
  }, [])

  const handleSavePhone = async () => {
    if (!/^0\d{10}$/.test(phoneInput)) { setPhoneMsg('شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد'); return }
    setPhoneMsg('')
    await saveProfile({ phone: phoneInput })
    setPhoneMsg('✓ شماره موبایل با موفقیت ثبت شد')
    setTimeout(() => window.location.reload(), 1500)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Top bar */}
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2">
            <Image src={theme === 'light' ? '/logo-light.png' : '/logo-transparent.png'} alt="A Capital" width={140} height={42} className="h-8 w-auto object-contain" />
          </button>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => router.push('/admin')}
                className="flex items-center gap-1.5 glass border border-red-500/30 hover:border-red-500/60 rounded-xl px-3 py-1.5 text-sm text-red-400 transition-all"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">مدیریت</span>
              </button>
            )}
            <button onClick={() => router.push('/')}
              className="hidden sm:flex items-center gap-1.5 glass border border-border hover:border-primary/40 rounded-xl px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-all"
            >
              <Home className="w-4 h-4" />
              صفحه اصلی
            </button>
            <button onClick={handleSignOut}
              className="flex items-center gap-1.5 glass border border-border hover:border-red-400/40 rounded-xl px-3 py-1.5 text-sm text-muted-foreground hover:text-red-400 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-1">
            خوش آمدی، {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </motion.div>

        {/* Phone warning banner */}
        {!phone && !dismissBanner && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-amber-400 font-semibold mb-2">شماره موبایل شما ثبت نشده است</p>
                <p className="text-amber-300/70 text-sm mb-3">برای استفاده از تمامی امکانات، لطفاً شماره موبایل خود را وارد کنید</p>
                <div className="flex gap-2">
                  <input value={phoneInput} onChange={e => setPhoneInput(e.target.value)} placeholder="شماره موبایل (مثال: ۰۹۱۲۳۴۵۶۷۸۹)" type="tel" className="input-field flex-1" />
                  <button onClick={handleSavePhone} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">ثبت</button>
                </div>
                {phoneMsg && <p className={`text-sm mt-2 ${phoneMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{phoneMsg}</p>}
              </div>
              <button onClick={() => setDismissBanner(true)} className="text-amber-400/50 hover:text-amber-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'تعداد تست', value: quizResults.length, icon: Trophy, color: '#2979FF' },
            { label: 'شخصیت مالی', value: typeInfo?.emoji ?? '—', icon: User, color: typeInfo?.color ?? '#888' },
            { label: 'آخرین امتیاز', value: latest ? `${latest.score}/۱۰۰` : '—', icon: Target, color: '#10B981' },
            { label: 'موبایل ثبت‌شده', value: phone ? '✓' : '✗', icon: Phone, color: phone ? '#10B981' : '#EF4444' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="glass border border-border rounded-2xl p-4 text-center"
            >
              <div className="text-2xl font-black mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-muted-foreground text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile + Latest result */}
          <div className="lg:col-span-2 space-y-5">
            {/* Latest investor type */}
            {typeInfo && latest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass border rounded-3xl p-6 sm:p-8"
                style={{ borderColor: `${typeInfo.color}30` }}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="text-5xl">{typeInfo.emoji}</div>
                  <div>
                    <div className="text-muted-foreground text-sm mb-0.5">شخصیت مالی شما</div>
                    <h2 className="font-black text-2xl" style={{ color: typeInfo.color }}>{typeInfo.name}</h2>
                    <div className="text-muted-foreground text-xs mt-1">
                      آخرین تست: {formatDate(latest.createdAt)}
                    </div>
                  </div>
                </div>
                {/* Score bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">امتیاز ریسک‌پذیری</span>
                    <span className="font-black text-foreground">{latest.score} / ۱۰۰</span>
                  </div>
                  <div className="h-2.5 bg-accent rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${latest.score}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: typeInfo.color }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quiz history */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass border border-border rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="font-black text-lg text-foreground">تاریخچه تست‌ها</h3>
              </div>
              {quizResults.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-muted-foreground text-sm">هنوز تستی انجام نداده‌اید</p>
                  <button
                    onClick={() => { router.push('/#quiz') }}
                    className="mt-4 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold"
                  >
                    شروع تست شخصیت مالی
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...quizResults].reverse().map((r, i) => {
                    const t = TYPE_MAP[r.investorType as InvestorKey] ?? TYPE_MAP.balanced
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-accent/30 border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{t.emoji}</span>
                          <div>
                            <div className="font-bold text-sm text-foreground">{t.name}</div>
                            <div className="text-muted-foreground text-xs flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              {formatDate(r.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="font-black text-lg" style={{ color: t.color }}>{r.score}</div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Account info */}
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass border border-border rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-black text-lg text-foreground">اطلاعات حساب</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'نام', value: user.name },
                  { label: 'ایمیل', value: user.email },
                  ...(phone ? [{ label: 'موبایل', value: phone }] : []),
                  ...(profile?.age ? [{ label: 'سن', value: `${profile.age} سال` }] : []),
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                    <span className="text-muted-foreground text-sm">{item.label}</span>
                    <span className="text-foreground text-sm font-semibold text-left" dir="ltr">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass border border-border rounded-3xl p-6"
            >
              <h3 className="font-black text-lg text-foreground mb-4">اقدامات سریع</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/education')}
                  className="flex items-center gap-3 w-full text-right px-4 py-3 rounded-xl glass border border-border hover:border-primary/30 transition-colors text-sm font-semibold text-foreground"
                >
                  <GraduationCap className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  آکادمی A|CAP
                </button>
                <button
                  onClick={() => router.push('/acap-plus')}
                  className="flex items-center gap-3 w-full text-right px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-sm font-semibold text-amber-400 relative"
                >
                  <Crown className="w-4 h-4 flex-shrink-0" />
                  <span>A|CAP+</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -left-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-red-500/30">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => router.push('/tickets')}
                  className="flex items-center gap-3 w-full text-right px-4 py-3 rounded-xl glass border border-border hover:border-blue-400/30 transition-colors text-sm font-semibold text-blue-400"
                >
                  <HelpCircle className="w-4 h-4 flex-shrink-0" />
                  تیکت‌های پشتیبانی
                </button>
                <a href="https://t.me/acapitalsbot?start=ref_3bCj2pqq" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full text-right px-4 py-3 rounded-xl glass border border-border hover:border-primary/30 transition-colors text-sm font-semibold text-foreground"
                >
                  <User className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  لینک سفیر من
                </a>
                <button
                  onClick={() => router.push('/#quiz')}
                  className="flex items-center gap-3 w-full text-right px-4 py-3 rounded-xl glass border border-border hover:border-primary/30 transition-colors text-sm font-semibold text-foreground"
                >
                  <Trophy className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  تست مجدد شخصیت مالی
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
