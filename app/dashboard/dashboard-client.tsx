'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from '@/lib/auth-client'
import { getMyReferralStats, ensureReferralCode } from '@/app/actions/referral'
import { useState, useEffect } from 'react'
import { getMyAssets } from '@/app/actions/assets'
import {
  User, Shield, Target, Trophy, Calendar, Phone, Crown, HelpCircle, X, Loader2, BarChart3, LogOut, Home, TrendingUp, Zap, TrendingDown, ChevronLeft, Wallet, BookOpen, GraduationCap, ArrowLeft
} from 'lucide-react'
import { saveProfile, getDashboardData } from '@/app/actions/profile'
import { OnboardingTasks } from '@/components/onboarding-tasks'
import { toPersianDigits } from '@/lib/utils'

type InvestorKey = 'conservative' | 'balanced' | 'growth' | 'aggressive'

const TYPE_MAP: Record<InvestorKey, { name: string; emoji: string; color: string }> = {
  conservative: { name: 'محافظه‌کار', emoji: '🛡️', color: '#10B981' },
  balanced: { name: 'متعادل', emoji: '⚖️', color: '#3B82F6' },
  growth: { name: 'رشدگرا', emoji: '🚀', color: '#1D9BF0' },
  aggressive: { name: 'تهاجمی', emoji: '🔥', color: '#EF4444' },
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d))
}

export function DashboardClient() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [loading, setLoading] = useState(true)
  const [dashData, setDashData] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneMsg, setPhoneMsg] = useState('')
  const [dismissBanner, setDismissBanner] = useState(false)
  const [assetsCount, setAssetsCount] = useState(0)
  const [tutorialStep, setTutorialStep] = useState<number | null>(null)
  const [priceData, setPriceData] = useState<Record<string, {price: number; currency: string; change: number}>>({})
  const [signalStats, setSignalStats] = useState<{total: number; wins: number; winRate: number} | null>(null)

  useEffect(() => {
    if (isPending) return
    if (!session) { router.push('/'); return }
    fetch('/api/admin-check').then(r => r.json()).then(d => setIsAdmin(d.admin)).catch(() => {})
    getDashboardData().then(data => {
      if (!data) return
      setDashData(data)
      if (typeof window !== 'undefined' && !localStorage.getItem('acap_tutorial_done')) {
        setTimeout(() => setTutorialStep(0), 500)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [session, isPending, router])

  useEffect(() => {
    if (!dashData) return
    getMyAssets().then(a => setAssetsCount(a.length)).catch(() => {})
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), 8000)
    fetch('/api/prices', { signal: controller.signal }).then(r => r.json()).then(d => {
      const merged: Record<string, {price: number; currency: string; change: number}> = {}
      if (d.prices) for (const [k, v] of Object.entries(d.prices) as [string, any][]) merged[k] = v
      if (d.stockPrices) for (const [k, v] of Object.entries(d.stockPrices) as [string, any][]) merged[k] = v
      setPriceData(merged)
    }).catch(() => {})
    fetch('/api/signals', { signal: controller.signal }).then(r => r.json()).then((signals: any[]) => {
      if (signals.length > 0) {
        const wins = signals.filter((s: any) => (s.actualProfit ?? 0) > 0).length
        setSignalStats({ total: signals.length, wins, winRate: Math.round((wins / signals.length) * 100) })
      }
    }).catch(() => {})
    return () => { clearTimeout(tid); controller.abort() }
  }, [dashData])

  if (isPending || loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  )
  if (!dashData) return null

  const { user, profile, quizResults, subscription } = dashData
  const isPlus = subscription?.acapPlus ?? false
  const latest = quizResults?.[quizResults.length - 1]
  const typeInfo = latest ? TYPE_MAP[latest.investorType as InvestorKey] ?? TYPE_MAP.balanced : null
  const phone = profile?.phone || quizResults?.find((r: any) => r.phone)?.phone || ''

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

  const SYM_NAME: Record<string, string> = {
    BTC: 'بیت‌کوین', 'GOLD18': 'طلای ۱۸', 'USD-IRR': 'دلار',
  }
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/app')} className="flex items-center gap-2 group">
            <span className="font-black text-xl sm:text-2xl tracking-widest text-foreground group-hover:text-primary transition-colors">
              A <span className="text-primary">|</span> CAP
            </span>
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
              className="flex items-center gap-1.5 glass border border-border hover:border-primary/40 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-all"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">صفحه اصلی</span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Welcome Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-black text-foreground truncate">
                خوش آمدی، {user.name.split(' ')[0]} 👋
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-muted-foreground text-xs truncate">{user.email}</p>
                {isPlus && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-500/15 text-amber-400 font-bold px-1.5 py-0.5 rounded-full border border-amber-500/20">
                    <Crown className="w-2.5 h-2.5" />
                    +
                  </span>
                )}
              </div>
            </div>
            <OnboardingTasks profile={profile} quizResults={quizResults} subscription={subscription} assetsCount={assetsCount} />
          </motion.div>

          {/* Mosaic — Portfolio (big) + Prices / A|CAP Revenue (mini squares) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {/* Portfolio — takes 2/3 */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <button onClick={() => router.push('/app/assets')}
                className="w-full relative overflow-hidden rounded-3xl p-5 sm:p-7 text-right group cursor-pointer border-0 h-full"
                style={{
                  background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 50%, #9A3412 100%)',
                  boxShadow: '0 8px 40px rgba(234,88,12,0.25)',
                }}
              >
                <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 60%)' }} />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
                <div className="relative flex items-center justify-between gap-4 h-full">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <BarChart3 className="w-5 h-5 text-white/90" />
                      <h2 className="text-lg sm:text-xl font-black text-white">مدیریت سبد سرمایه</h2>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed mb-3">مشاهده و مدیریت دارایی‌ها، تحلیل پرتفوی و ابزارهای هوشمند</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-white/90 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-xl">{assetsCount} دارایی</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-white/90 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-xl"><BarChart3 className="w-3 h-3" /> ورود به سبد</span>
                    </div>
                  </div>
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                </div>
              </button>
            </motion.div>

            {/* Right column: mini squares stacked */}
            <div className="flex flex-col gap-3">
              {/* Prices mini square */}
              <motion.div variants={itemVariants} className="flex-1">
                <button onClick={() => router.push('/app/prices')}
                  className="w-full relative overflow-hidden rounded-2xl p-4 text-right group cursor-pointer border-0 h-full"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #1E40AF 100%)',
                    boxShadow: '0 4px 20px rgba(37,99,235,0.2)',
                  }}
                >
                  <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
                  <div className="relative flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-black text-white">قیمت‌های لحظه‌ای</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-auto">
                      {['BTC', 'GOLD18', 'USD-IRR'].map(sym => {
                        const p = priceData[sym]
                        const change = p?.change ?? 0
                        const isUp = change >= 0
                        return (
                          <span key={sym} className="text-[10px] font-bold text-white/80 bg-white/10 rounded-lg px-1.5 py-0.5 flex items-center gap-0.5">
                            {SYM_NAME[sym]?.slice(0, 3)}
                            {isUp ? <TrendingUp className="w-2 h-2 text-green-300" /> : <TrendingDown className="w-2 h-2 text-red-300" />}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </button>
              </motion.div>

              {/* A|CAP Revenue mini square */}
              <motion.div variants={itemVariants} className="flex-1">
                <button onClick={() => router.push('/app/signals')}
                  className="w-full relative overflow-hidden rounded-2xl p-4 text-right group cursor-pointer border-0 h-full"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)',
                    boxShadow: '0 4px 20px rgba(124,58,237,0.2)',
                  }}
                >
                  <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
                  <div className="relative flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-black text-white">درآمد A|CAP</span>
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-xs font-bold text-white/80 bg-white/10 rounded-lg px-2 py-0.5">
                        {signalStats ? `${signalStats.winRate}%` : '...'}
                      </span>
                      <span className="text-[10px] text-white/60">موفقیت</span>
                    </div>
                  </div>
                </button>
              </motion.div>
            </div>
          </div>

          {/* Phone Number Banner */}
          {!phone && !dismissBanner && (
            <motion.div variants={itemVariants}
              className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4"
            >
              <div className="flex items-start gap-2">
                <span className="text-amber-400 shrink-0 mt-0.5 text-sm">⚠️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-amber-400 font-semibold text-xs mb-1.5">ثبت شماره موبایل</p>
                  <div className="flex gap-1.5">
                    <input value={phoneInput} onChange={e => setPhoneInput(e.target.value)} placeholder="شماره موبایل" type="tel" className="input-field flex-1 text-xs py-1.5 px-2.5" />
                    <button onClick={handleSavePhone} className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0">ثبت</button>
                  </div>
                  {phoneMsg && <p className={`text-xs mt-1 ${phoneMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{phoneMsg}</p>}
                </div>
                <button onClick={() => setDismissBanner(true)} className="text-amber-400/50 hover:text-amber-400 shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Profile Stats */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4 overflow-x-auto pb-0.5">
            {[
              { label: 'تست‌ها', value: quizResults.length, color: '#2979FF' },
              { label: 'شخصیت', value: typeInfo?.emoji ?? '—', color: typeInfo?.color ?? '#888' },
              { label: 'امتیاز', value: latest ? `${latest.score}` : '—', color: '#10B981' },
              { label: 'موبایل', value: phone ? '✓' : '✗', color: phone ? '#10B981' : '#EF4444' },
            ].map((stat, i) => (
              <div key={stat.label}
                className="glass border border-border rounded-xl px-3 py-2 text-center shrink-0 min-w-[64px]"
              >
                <div className="text-base font-black" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Two Column Content */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 space-y-3">
              {typeInfo && latest && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-4 flex items-center gap-3"
                  style={{ border: `1px solid ${typeInfo.color}30` }}
                >
                  <div className="text-3xl">{typeInfo.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">شخصیت مالی</div>
                    <div className="font-black text-base" style={{ color: typeInfo.color }}>{typeInfo.name}</div>
                    <div className="text-xs text-muted-foreground">ریسک‌پذیری {toPersianDigits(latest.score)}/۱۰۰</div>
                  </div>
                  <div className="w-20">
                    <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${latest.score}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full" style={{ background: typeInfo.color }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass border border-border rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-primary" />
                  <h3 className="font-black text-sm text-foreground">تاریخچه تست‌ها</h3>
                </div>
                {quizResults.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-xs mb-2">هنوز تستی نداده‌اید</p>
                    <button onClick={() => router.push('/#quiz')} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold">شروع تست</button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {[...quizResults].reverse().slice(0, 3).map((r, i) => {
                      const t = TYPE_MAP[r.investorType as InvestorKey] ?? TYPE_MAP.balanced
                      return (
                        <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/30">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{t.emoji}</span>
                            <div>
                              <div className="font-bold text-xs text-foreground">{t.name}</div>
                              <div className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</div>
                            </div>
                          </div>
                          <div className="font-black text-sm" style={{ color: t.color }}>{r.score}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            </div>

            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass border border-border rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-primary" />
                  <h3 className="font-black text-sm text-foreground">اطلاعات حساب</h3>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'نام', value: user.name },
                    { label: 'ایمیل', value: user.email },
                    ...(phone ? [{ label: 'موبایل', value: phone }] : []),
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
                      <span className="text-muted-foreground text-xs">{item.label}</span>
                      <span className="text-foreground text-xs font-semibold text-left truncate max-w-[60%]" dir="ltr">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass border border-border rounded-2xl p-4"
              >
                <h3 className="font-black text-sm text-foreground mb-3">اقدامات سریع</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'A|CAP+', icon: Crown, action: () => router.push(isPlus ? '/app/signals' : '/acap-plus'), color: 'text-amber-400' },
                    { label: 'تیکت', icon: HelpCircle, action: () => router.push('/tickets'), color: 'text-blue-400' },
                    { label: 'تست مجدد', icon: Trophy, action: () => router.push('/#quiz'), color: '' },
                  ].map(btn => (
                    <button key={btn.label} onClick={btn.action}
                      className={`flex items-center gap-1.5 px-3 py-3 rounded-lg glass border border-border hover:border-primary/30 transition-colors text-sm font-semibold ${btn.color || 'text-foreground'}`}
                    >
                      <btn.icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                      {btn.label}
                    </button>
                  ))}
                  <ReferralCard />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Onboarding Tutorial */}
        <AnimatePresence>
          {tutorialStep !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => {
                if (tutorialStep >= steps.length - 1) {
                  localStorage.setItem('acap_tutorial_done', 'true')
                  setTutorialStep(null)
                } else {
                  setTutorialStep(tutorialStep + 1)
                }
              }}
            >
              <motion.div
                key={tutorialStep}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-card border border-border rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center mb-5">
                  <div className="text-5xl mb-3">{steps[tutorialStep].icon}</div>
                  <h2 className="text-xl font-black text-foreground">{steps[tutorialStep].title}</h2>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{steps[tutorialStep].desc}</p>
                </div>

                <div className="flex items-center justify-center gap-1.5 mb-5">
                  {steps.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === tutorialStep ? 'bg-primary w-5' : i < tutorialStep ? 'bg-primary/40' : 'bg-border'}`} />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => {
                    if (tutorialStep >= steps.length - 1) {
                      localStorage.setItem('acap_tutorial_done', 'true')
                      setTutorialStep(null)
                    } else {
                      setTutorialStep(tutorialStep + 1)
                    }
                  }}
                    className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    {tutorialStep >= steps.length - 1 ? 'شروع کن!' : 'بعدی'}
                    <ArrowLeft className="w-4 h-4 inline-block mr-1.5" />
                  </button>
                  <button onClick={() => {
                    localStorage.setItem('acap_tutorial_done', 'true')
                    setTutorialStep(null)
                  }}
                    className="px-4 py-3 rounded-xl bg-accent text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  >
                    رد کردن
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function ReferralCard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getMyReferralStats().then(d => setData(d)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleCopy = () => {
    if (!data?.code) return
    navigator.clipboard.writeText(data.inviteLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  if (loading) return <div className="col-span-2 py-3 text-center text-xs text-muted-foreground">...</div>
  if (!data) return null

  const tierColors: Record<string, string> = { partner: '#CD7F32', silver: '#C0C0C0', gold: '#1D9BF0', ambassador: '#6366F1' }
  const tierColor = tierColors[data.tier.key] || '#888'

  return (
    <>
      <button onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-3 rounded-lg glass border border-amber-500/20 hover:border-amber-500/40 transition-all text-sm font-semibold text-amber-400 col-span-2"
        title="کپی لینک دعوت"
      >
        <User className="w-3 h-3 shrink-0" />
        {copied ? '✓ کپی شد!' : `دعوت دوستان — ${data.totalInvites} نفر`}
      </button>
      {data.totalInvites > 0 && (
        <div className="col-span-2 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 text-[10px] text-muted-foreground text-center">
          {data.totalInvites} دعوت · {data.converted} خرید · {data.tier.name} ({data.tier.commission}%)
        </div>
      )}
      {data.nextMilestone && (
        <div className="col-span-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-[10px] text-emerald-400 text-center font-bold">
          🎉 تبریک! به {data.nextMilestone.invites} دعوت رسیدید — {data.nextMilestone.reward}
        </div>
      )}
    </>
  )
}

const steps = [
  {
    icon: '👋',
    title: 'به A|CAP خوش اومدی!',
    desc: 'این داشبورد مرکز مدیریت سرمایه‌تست. از اینجا می‌تونی همه کارهای مالی‌ت رو انجام بدی.'
  },
  {
    icon: '📊',
    title: 'مدیریت سبد سرمایه',
    desc: 'با کلیک روی کارت «مدیریت سبد سرمایه» می‌تونی دارایی‌هات رو اضافه کنی - از رمزارز و طلا و سهام گرفته تا وجه نقد. قابلیت افزودن سریع وجه نقد با دکمه کیف پول اضافه شده.'
  },
  {
    icon: '💎',
    title: 'سیگنال‌ها و A|CAP+',
    desc: 'با فعال‌سازی A|CAP+ سیگنال‌های خرید و فروش اختصاصی، تحلیل پرتفوی هوشمند و پشتیبانی VIP دریافت می‌کنی.'
  },
  {
    icon: '📚',
    title: 'آکادمی و وبلاگ',
    desc: 'دوره‌های آموزشی ICT، هوش مصنوعی، فارکس و بورس رو در آکادمی ببین. وبلاگ هم پر از مقالات تحلیلی و آموزشی روزانه‌ست.'
  },
  {
    icon: '🚀',
    title: 'آماده شروع هستی!',
    desc: 'همین حالا می‌تونی دارایی‌هات رو اضافه کنی، تست شخصیت مالی بدی و از همه امکانات استفاده کنی. موفق باشی!'
  }
]
