'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from '@/lib/auth-client'

import { useState, useEffect } from 'react'
import { getMyAssets } from '@/app/actions/assets'
import {
  User, Shield, Target, Trophy, Calendar, Phone, Crown, HelpCircle, X, Loader2, BarChart3, LogOut, Home, TrendingUp, Zap, TrendingDown, ChevronLeft, Wallet, BookOpen, GraduationCap, ArrowLeft, Gift, Bot, MessageSquare, ChevronDown, Play, Pause, Mic
} from 'lucide-react'
import { saveProfile, getDashboardData } from '@/app/actions/profile'
import { getMyReferralStats } from '@/app/actions/referral'
import { OnboardingTasks } from '@/components/onboarding-tasks'
import { ReferralCard } from '@/components/referral-card'
import { InvitationTab } from '@/components/invitation-tab'
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
  const [signals, setSignals] = useState<any[]>([])
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null)
  const [selectedSignal, setSelectedSignal] = useState<any | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [referralStats, setReferralStats] = useState<any>(null)
  const [dashboardTab, setDashboardTab] = useState<'dashboard' | 'invite'>('dashboard')

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
    fetch('/api/signals', { signal: controller.signal }).then(r => r.json()).then((d: any) => {
      const sigs = d?.signals || []
      setSignals(sigs)
      if (sigs.length > 0) {
        const wins = sigs.filter((s: any) => (s.actualProfit ?? 0) > 0).length
        setSignalStats({ total: sigs.length, wins, winRate: Math.round((wins / sigs.length) * 100) })
      }
    }).catch(() => {})
    return () => { clearTimeout(tid); controller.abort() }
  }, [dashData])

  useEffect(() => {
    if (!dashData) return
    getMyReferralStats().then(setReferralStats)
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

          {/* Referral code card — always visible */}
          {referralStats && (
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl mb-4 p-4"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)' }}
            >
              <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
              <div className="relative flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-white/70 text-xs whitespace-nowrap">کد معرف شما:</span>
                  <span className="font-mono font-black text-white bg-white/15 px-3 py-1 rounded-lg text-sm">{referralStats.code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={async () => {
                    try { await navigator.clipboard.writeText(referralStats.inviteLink); setReferralStats((p: any) => p ? { ...p, _justCopied: true } : p); setTimeout(() => setReferralStats((p: any) => p ? { ...p, _justCopied: false } : p), 2000) } catch {}
                  }} className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold text-white transition-colors">
                    {referralStats._justCopied ? '✓ کپی شد' : 'کپی لینک'}
                  </button>
                  <button onClick={() => setDashboardTab('invite')} className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold text-white transition-colors">
                    جزئیات بیشتر
                  </button>
                </div>
              </div>
              <div className="relative flex items-center gap-3 mt-2 text-[10px] text-white/60">
                <span>{referralStats.totalInvites} دعوت</span>
                <span>•</span>
                <span>{referralStats.quizCompleted} تست</span>
                <span>•</span>
                <span>{referralStats.converted} خرید</span>
              </div>
            </motion.div>
          )}
          {!referralStats && (
            <motion.div variants={itemVariants} className="mb-4">
              <button onClick={() => getMyReferralStats().then(setReferralStats)} className="w-full glass border border-border rounded-2xl p-4 text-center hover:border-primary/30 transition-all group">
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">نمایش لینک دعوت</p>
              </button>
            </motion.div>
          )}

          {/* Tab bar */}
          <motion.div variants={itemVariants} className="flex items-center gap-1 mb-4 bg-accent/50 rounded-2xl p-1 w-fit">
            <button onClick={() => setDashboardTab('dashboard')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dashboardTab === 'dashboard' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}>
              داشبورد
            </button>
            <button onClick={() => setDashboardTab('invite')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dashboardTab === 'invite' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}>
              🎁 دعوت از دوستان
            </button>
          </motion.div>

          {dashboardTab === 'invite' ? (
            <InvitationTab />
          ) : (
          <>
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

              {/* A|CAP Revenue — Telegram style */}
              <motion.div variants={itemVariants} className="flex-1">
                <div className="glass border border-border rounded-2xl p-3 h-full flex flex-col"
                  style={{ minHeight: '220px' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-black text-foreground">A|CAP Revenue</span>
                    </div>
                    {signalStats && (
                      <span className="text-[10px] text-muted-foreground">
                        {signalStats.winRate}% موفقیت
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {signals.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Zap className="w-6 h-6 mb-1 opacity-30" />
                        <p className="text-[10px]">هنوز سیگنالی نیست</p>
                      </div>
                    ) : (
                      signals.slice(0, 5).map((s) => {
                        const isWin = s.actualProfit > 0
                        const sd = s.publishedAt ? new Date(s.publishedAt) : new Date()
                        return (
                          <div key={s.id}
                            className="rounded-xl px-3 py-2 cursor-pointer transition-all border border-gray-700/30 bg-gray-800/60 hover:border-gray-600/50 hover:bg-gray-800"
                            onClick={() => setSelectedSignal(s)}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[11px] font-bold text-foreground truncate">{s.title}</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                                  s.action === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                }`}>{s.action === 'buy' ? 'BUY' : 'SELL'}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className={`text-[10px] font-black tabular-nums ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {s.actualProfit !== null && s.actualProfit !== undefined ? `${isWin ? '+' : ''}${s.actualProfit.toFixed(1)}%` : '—'}
                                </span>
                                <ChevronDown className="w-3 h-3 text-gray-600" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-muted-foreground font-semibold">{s.symbol}</span>
                              <span className="text-[9px] text-muted-foreground">{String(s.type) === 'crypto' ? 'ارز دیجیتال' : String(s.type) === 'stock' ? 'سهام' : String(s.type) === 'gold' ? 'طلا' : String(s.type) === 'dollar' ? 'دلار' : 'فارکس'}</span>
                              <span className="text-[9px] text-muted-foreground/60">{sd.getHours().toString().padStart(2,'0')}:{sd.getMinutes().toString().padStart(2,'0')}</span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
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
              { label: 'تیپ سرمایه‌گذار', value: typeInfo?.emoji ? `${typeInfo.emoji} ${typeInfo.name}` : '—', color: typeInfo?.color ?? '#888' },
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
                    {[...quizResults].reverse().slice(0, 3).map((r, i) => (
                      <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/30">
                        <div className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</div>
                        <div className="font-black text-sm text-foreground">{r.score}</div>
                      </div>
                    ))}
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
                    { label: 'A|CAP+', icon: Crown, action: () => router.push(isPlus ? '/app/personal' : '/acap-plus'), color: 'text-amber-400' },
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
                  <div className="col-span-2">
                    <button onClick={() => setDashboardTab('invite')} className="w-full glass border border-border rounded-2xl p-4 text-center hover:border-primary/30 transition-all group">
                      <Gift className="w-6 h-6 text-primary mx-auto mb-1" />
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">دعوت از دوستان</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">دریافت لینک اختصاصی و پاداش</p>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
        )}
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
      {playingAudio && <audio src={playingAudio} onEnded={() => setPlayingAudio(null)} className="hidden" />}

      {/* Signal detail modal — Telegram style */}
      <AnimatePresence>
        {selectedSignal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center"
            onClick={() => setSelectedSignal(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full sm:max-w-lg sm:rounded-3xl sm:mx-4 max-h-[90vh] flex flex-col bg-gray-900 sm:border sm:border-emerald-500/20 sm:shadow-2xl sm:shadow-emerald-500/10 overflow-hidden"
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
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs text-emerald-400 font-bold">A|CAP Signal</span>
                  <span className="text-[10px] text-gray-600">|</span>
                  <span className="text-[10px] text-gray-500">{new Date(selectedSignal.publishedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <button onClick={() => setSelectedSignal(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Signal bubble */}
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[90%] sm:max-w-[85%] shadow-sm">
                    {/* Sender + meta */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                      <span className="text-[10px] text-emerald-400/80 font-bold">A|CAP Bot</span>
                      <span className="text-[9px] text-gray-600">{selectedSignal.symbol}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                        selectedSignal.action === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                      }`}>{selectedSignal.action === 'buy' ? 'BUY' : 'SELL'}</span>
                    </div>

                    {/* Title + profit */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{selectedSignal.title}</span>
                      {selectedSignal.actualProfit !== null && selectedSignal.actualProfit !== undefined && (
                        <span className={`text-xs font-black tabular-nums shrink-0 ${selectedSignal.actualProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {selectedSignal.actualProfit >= 0 ? '+' : ''}{selectedSignal.actualProfit.toFixed(1)}%
                        </span>
                      )}
                    </div>

                    {/* Type + time */}
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-1.5">
                      <span className="bg-gray-700/50 px-1.5 py-0.5 rounded">{new Date(selectedSignal.publishedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>{selectedSignal.type === 'crypto' ? 'ارز دیجیتال' : selectedSignal.type === 'stock' ? 'سهام' : selectedSignal.type === 'gold' ? 'طلا' : selectedSignal.type === 'dollar' ? 'دلار' : selectedSignal.type === 'forex' ? 'فارکس' : selectedSignal.type}</span>
                    </div>

                    {/* Description */}
                    {selectedSignal.description && (
                      <div className="mt-1 space-y-1">
                        {selectedSignal.description.split('\n').map((line: string, i: number) => {
                          const t = line.trim()
                          if (!t) return <div key={i} className="h-1" />
                          const isEmojiHeader = /^[🟡🔵🟢🔴🟣🟠⚪✅❌⚠️⏳🎯📊📈📉💰💎🔥⭐🌟✨💡📌🔔🚀🏆]/.test(t) && t.length < 80
                          const hasPrice = /[\d,]+(,\d{3})*(\.\d+)?\s*(تومان|ریال|دلار)/.test(t)
                          const hasPercent = /\d+(\.\d+)?%/.test(t)
                          let cls = 'text-[14px] leading-8'
                          if (isEmojiHeader) cls += ' text-amber-300 font-bold text-[16px]'
                          else if (hasPrice) cls += ' text-emerald-400 font-medium'
                          else if (hasPercent) cls += ' text-amber-400 font-medium'
                          return <p key={i} className={cls} style={{ direction: 'rtl', textAlign: 'right' }}>{t}</p>
                        })}
                      </div>
                    )}

                    {/* Image */}
                    {selectedSignal.imageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-gray-700/30" onClick={e => { e.stopPropagation(); setPreviewImage(selectedSignal.imageUrl) }}>
                        <img src={selectedSignal.imageUrl} alt="" className="w-full h-auto max-h-64 object-cover hover:brightness-110 transition-all" loading="lazy" />
                      </div>
                    )}

                    {/* Audio */}
                    {selectedSignal.audioUrl && (
                      <div className="mt-2 flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700/20" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPlayingAudio(playingAudio === selectedSignal.audioUrl ? null : selectedSignal.audioUrl)}
                          className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors shrink-0"
                        >
                          {playingAudio === selectedSignal.audioUrl ? <Pause className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 text-emerald-400 mr-0.5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Mic className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                            <span className="text-[11px] text-gray-400">ویس تحلیل</span>
                            {playingAudio === selectedSignal.audioUrl && (
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

                    {/* Expandable details */}
                    <div className="mt-2 pt-2 border-t border-gray-700/30 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">قیمت انتشار</span>
                        <span className="text-white font-semibold">{Number(selectedSignal.priceAtPublish).toLocaleString()}</span>
                      </div>
                      {selectedSignal.expectedProfit && <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">هدف سود</span>
                        <span className="text-emerald-400 font-bold">+{selectedSignal.expectedProfit}%</span>
                      </div>}
                      {selectedSignal.investorType && <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">مناسب برای</span>
                        <span className="text-gray-300">{selectedSignal.investorType === 'conservative' ? 'محافظه‌کار' : selectedSignal.investorType === 'balanced' ? 'متعادل' : selectedSignal.investorType === 'growth' ? 'رشدگرا' : 'تهاجمی'}</span>
                      </div>}
                    </div>
                  </div>
                </div>

                {/* Date + read receipt */}
                <div className="flex justify-end">
                  <div className="flex items-center gap-2 text-[10px] text-gray-600">
                    <span>{new Date(selectedSignal.publishedAt).toLocaleDateString('fa-IR', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    {selectedSignal.actualProfit !== null && selectedSignal.actualProfit !== undefined ? (
                      <span className="text-blue-400">✓✓</span>
                    ) : (
                      <span className="text-gray-600">✓</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="border-t border-gray-800 px-4 py-3">
                <button onClick={() => setSelectedSignal(null)}
                  className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  بستن
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image preview modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
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
    </div>
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
