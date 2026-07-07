'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { getMyAssets } from '@/app/actions/assets'
import { getDashboardData } from '@/app/actions/profile'
import { OnboardingTasks } from '@/components/onboarding-tasks'
import { PortfolioAdvisor } from '@/components/portfolio-advisor'
import {
  Wallet, TrendingUp, Crown, Brain, Shield,
  X, BarChart3, Loader2, HelpCircle, User
} from 'lucide-react'
import { formatToman, toPersianDigits } from '@/lib/utils'

type Asset = Awaited<ReturnType<typeof getMyAssets>>[number]
type InvestorKey = 'conservative' | 'balanced' | 'growth' | 'aggressive'

const TYPE_INFO: Record<InvestorKey, { name: string; emoji: string; color: string }> = {
  conservative: { name: 'محافظه‌کار', emoji: '🛡️', color: '#10B981' },
  balanced: { name: 'متعادل', emoji: '⚖️', color: '#3B82F6' },
  growth: { name: 'رشدگرا', emoji: '🚀', color: '#1D9BF0' },
  aggressive: { name: 'تهاجمی', emoji: '🔥', color: '#EF4444' },
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  crypto: { label: 'رمز ارز', color: '#F59E0B' },
  stock: { label: 'بورس ایران', color: '#2979FF' },
  gold: { label: 'طلا', color: '#F59E0B' },
  currency: { label: 'ارز', color: '#10B981' },
  cash: { label: 'وجه نقد', color: '#06B6D4' },
  other: { label: 'سایر', color: '#8B5CF6' },
}

function getAssetPriceIr(
  symbol: string,
  prices: Record<string, { price: number; currency: string }>,
  stockPrices: Record<string, number>
): number {
  if (stockPrices[symbol] !== undefined) return stockPrices[symbol] / 10
  const upper = symbol.toUpperCase()
  if (stockPrices[upper] !== undefined) return stockPrices[upper] / 10
  const irrKey = `${upper}-IRR`
  if (prices[irrKey]) return prices[irrKey].price / 10
  const direct = prices[upper] ?? prices[symbol]
  if (!direct) return 0
  if (direct.currency === 'IRR') return direct.price / 10
  if (direct.currency === 'USD') {
    const usdRate = prices['USDT-IRR']?.price
    if (usdRate) return (direct.price * usdRate) / 10
    return direct.price
  }
  return 0
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
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
    desc: 'می‌تونی دارایی‌هات رو اضافه کنی - از رمزارز و طلا و سهام گرفته تا وجه نقد. با اسکن هوشمند پرتفوی، پیشنهادات شخصی دریافت کن.'
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

export default function MergedDashboard() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [loading, setLoading] = useState(true)
  const [dashData, setDashData] = useState<any>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [prices, setPrices] = useState<Record<string, { price: number; currency: string }>>({})
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({})
  const [showAdvisor, setShowAdvisor] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tutorialStep, setTutorialStep] = useState<number | null>(null)

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
    }).catch(() => {})
  }, [session, isPending, router])

  const doRefresh = useCallback(() => {
    getMyAssets().then(setAssets).catch(() => {})
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), 8000)
    fetch('/api/prices', { signal: controller.signal }).then(r => r.json()).then(d => {
      const pm: Record<string, { price: number; currency: string }> = {}
      const sm: Record<string, number> = {}
      if (d.prices) for (const [k, v] of Object.entries(d.prices) as [string, any][]) pm[k] = v
      if (d.stockPrices) for (const [k, v] of Object.entries(d.stockPrices) as [string, any][]) sm[k] = v.price
      setPrices(pm)
      setStockPrices(sm)
    }).catch(() => {})
    return { controller, tid }
  }, [])

  useEffect(() => {
    if (!dashData) return
    const { controller, tid } = doRefresh()
    const handleVisible = () => { if (!document.hidden) doRefresh() }
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', handleVisible)
    return () => {
      clearTimeout(tid)
      controller.abort()
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', handleVisible)
    }
  }, [dashData, doRefresh])

  useEffect(() => {
    if (dashData !== null || isPending === false) setLoading(false)
  }, [dashData, isPending])

  const byType = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of assets) {
      const val = a.type === 'cash' ? a.quantity : getAssetPriceIr(a.symbol, prices, stockPrices) * a.quantity
      map[a.type] = (map[a.type] || 0) + val
    }
    return map
  }, [assets, prices, stockPrices])

  if (!session && !isPending) {
    router.push('/')
    return null
  }

  const showLoading = isPending || loading
  const ready = dashData && session && !showLoading

  const user = dashData?.user ?? { name: '', email: '' }
  const profile = dashData?.profile ?? null
  const quizResults = dashData?.quizResults ?? []
  const subscription = dashData?.subscription ?? null
  const isPlus = subscription?.acapPlus ?? false
  const latest = quizResults?.[quizResults.length - 1] ?? null
  const typeInfo = latest ? TYPE_INFO[latest.investorType as InvestorKey] ?? TYPE_INFO.balanced : null

  const totalValue = assets.reduce((sum, a) => {
    if (a.type === 'cash') return sum + a.quantity
    return sum + getAssetPriceIr(a.symbol, prices, stockPrices) * a.quantity
  }, 0)
  const totalCost = assets.reduce((sum, a) => {
    if (a.type === 'cash') return sum + a.quantity
    return sum + ((a.purchasePrice || 0) * a.quantity)
  }, 0)
  const profit = totalValue - totalCost
  const hasAssets = assets.length > 0

  return (
    <div dir="rtl">
      {showLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      )}

      {ready && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {/* Welcome Header */}
          <motion.div variants={itemVariants} className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-white truncate">
                خوش آمدی، {user.name.split(' ')[0]} 👋
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-gray-400 text-xs truncate">{user.email}</p>
                {isPlus && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-500/15 text-amber-400 font-bold px-1.5 py-0.5 rounded-full border border-amber-500/20">
                    <Crown className="w-2.5 h-2.5" />+
                  </span>
                )}
              </div>
            </div>
            <OnboardingTasks profile={profile} quizResults={quizResults} subscription={subscription} assetsCount={assets.length} />
          </motion.div>

          {/* Key Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'ارزش کل', value: hasAssets ? formatToman(totalValue) : '—', color: '#10B981', icon: Wallet },
              { label: 'سود/زیان', value: hasAssets ? `${profit >= 0 ? '+' : ''}${formatToman(profit)}` : '—', color: profit >= 0 ? '#10B981' : '#EF4444', icon: TrendingUp },
            ].map((stat, i) => (
              <div key={stat.label}
                className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 hover:border-white/[0.15] transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  {'icon' in stat && stat.icon && <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />}
                  <span className="text-[10px] text-gray-400">{stat.label}</span>
                </div>
                <div className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</div>
              </div>
            ))}
            {typeInfo && latest ? (
              <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 flex items-center gap-3 col-span-2 md:col-span-1 hover:border-white/[0.15] transition-all">
                <span className="text-2xl">{typeInfo.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-gray-400">شخصیت مالی</div>
                  <div className="font-black text-sm" style={{ color: typeInfo.color }}>{typeInfo.name}</div>
                  <div className="text-[10px] text-gray-400">ریسک‌پذیری {toPersianDigits(latest.score)}/۱۰۰</div>
                </div>
                <div className="w-12 shrink-0">
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${latest.score}%`, background: typeInfo.color }} />
                  </div>
                </div>
                <button onClick={() => router.push('/#quiz')}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold shrink-0 border border-blue-500/20 rounded-lg px-2 py-1"
                >
                  تست مجدد
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 hover:border-white/[0.15] transition-all">
                <span className="text-[10px] text-gray-400">شخصیت مالی</span>
                <div className="text-lg font-black" style={{ color: '#888' }}>—</div>
              </div>
            )}
            {[
              { label: 'امتیاز ریسک', value: latest ? `${toPersianDigits(latest.score)}/۱۰۰` : '—', color: typeInfo?.color ?? '#888' },
            ].map((stat, i) => (
              <div key={stat.label}
                className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 hover:border-white/[0.15] transition-all"
              >
                <div className="text-[10px] text-gray-400">{stat.label}</div>
                <div className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Portfolio + Distribution */}
            <div className="lg:col-span-2 space-y-4">
              {/* Portfolio Overview */}
              <motion.div variants={itemVariants}
                className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">سبد سرمایه</h3>
                  </div>
                  <button onClick={() => router.push('/app/assets')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    مدیریت کامل ←
                  </button>
                </div>

                {!hasAssets ? (
                  <div className="text-center py-6">
                    <p className="text-gray-400 text-sm mb-3">سبد شما خالی است — اولین دارایی را ثبت کنید</p>
                    <button onClick={() => router.push('/app/assets')}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all"
                    >
                      + افزودن دارایی
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="shrink-0">
                        <svg width="80" height="80" viewBox="0 0 80 80">
                          {(() => {
                            const entries = Object.entries(byType).sort((a, b) => b[1] - a[1])
                            const total = totalValue || 1
                            const r = 32, cx = 40, cy = 40
                            const circ = 2 * Math.PI * r
                            let offset = 0
                            return entries.map(([type, val]) => {
                              const pct = val / total
                              const len = pct * circ
                              const seg = (
                                <circle key={type} cx={cx} cy={cy} r={r} fill="none"
                                  stroke={TYPE_CONFIG[type]?.color || '#666'}
                                  strokeWidth="14" strokeDasharray={`${len} ${circ - len}`}
                                  strokeDashoffset={-offset} transform={`rotate(-90 ${cx} ${cy})`}
                                  className="transition-all duration-700"
                                />
                              )
                              offset += len
                              return seg
                            })
                          })()}
                          <circle cx="40" cy="40" r="23" fill="#111827" />
                          <text x="40" y="38" textAnchor="middle" className="fill-white text-[7px] font-bold">{assets.length}</text>
                          <text x="40" y="48" textAnchor="middle" className="fill-gray-400 text-[5px]">دارایی</text>
                        </svg>
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        {Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([type, val]) => {
                          const pct = totalValue > 0 ? (val / totalValue) * 100 : 0
                          const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.other
                          return (
                            <div key={type} className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                                <span className="text-white font-medium">{cfg.label}</span>
                              </span>
                              <span className="text-gray-400">{pct.toFixed(0)}%</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <button onClick={() => setShowAdvisor(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 text-blue-400 text-sm font-bold hover:from-blue-600/30 hover:to-purple-600/30 transition-all"
                    >
                      <Brain className="w-4 h-4" />
                      اسکن هوشمند پرتفوی
                    </button>

                    <div className="space-y-1 mt-3">
                      {assets.slice(0, 4).map(a => {
                        const val = a.type === 'cash' ? a.quantity : getAssetPriceIr(a.symbol, prices, stockPrices) * a.quantity
                        return (
                          <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-white/[0.06] last:border-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: TYPE_CONFIG[a.type]?.color ?? '#666' }} />
                              <span className="text-sm text-white font-medium truncate">{a.label}</span>
                            </div>
                            <span className="text-xs text-gray-400 font-mono shrink-0">{formatToman(val)}</span>
                          </div>
                        )
                      })}
                      {assets.length > 4 && (
                        <button onClick={() => router.push('/app/assets')}
                          className="text-xs text-blue-400 hover:text-blue-300 font-semibold w-full text-center pt-1"
                        >
                          + {assets.length - 4} دارایی دیگر
                        </button>
                      )}
                    </div>
                  </>
                )}
              </motion.div>

            </div>

            {/* Right column */}
            <div className="space-y-4">
              <motion.div variants={itemVariants}
                className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4"
              >
                <h3 className="text-sm font-bold text-white mb-3">دسترسی سریع</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'A|CAP+', icon: Crown, action: () => router.push(isPlus ? '/app/signals' : '/acap-plus'), color: 'text-amber-400' },
                    { label: 'قیمت‌ها', icon: TrendingUp, action: () => router.push('/app/prices'), color: 'text-emerald-400' },
                    { label: 'تیکت', icon: HelpCircle, action: () => router.push('/tickets'), color: 'text-blue-400' },
                    { label: 'آکادمی', icon: Shield, action: () => router.push('/app/academy'), color: 'text-purple-400' },
                  ].map(btn => (
                    <button key={btn.label} onClick={btn.action}
                      className="flex items-center gap-2 px-3 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.08] transition-all text-sm font-semibold text-white"
                    >
                      <btn.icon className={`w-4 h-4 shrink-0 ${btn.color}`} />
                      {btn.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}
                className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">اطلاعات حساب</h3>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'نام', value: user.name },
                    { label: 'ایمیل', value: user.email },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-1 border-b border-white/[0.06] last:border-0">
                      <span className="text-gray-400 text-xs">{item.label}</span>
                      <span className="text-white text-xs font-semibold text-left truncate max-w-[60%]" dir="ltr">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {isAdmin && (
                <motion.button variants={itemVariants} onClick={() => router.push('/admin')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  پنل مدیریت
                </motion.button>
              )}
            </div>
          </div>

          {/* Portfolio Advisor Modal */}
          <AnimatePresence>
            {showAdvisor && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowAdvisor(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-bold text-white">اسکن هوشمند پرتفوی</h3>
                    </div>
                    <button onClick={() => setShowAdvisor(false)} className="p-1 rounded-lg hover:bg-gray-800 text-gray-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <PortfolioAdvisor
                    assets={assets}
                    prices={prices}
                    stockPrices={stockPrices}
                    investorType={latest?.investorType ?? null}
                    quizTaken={latest !== null}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
                  className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="text-center mb-5">
                    <div className="text-5xl mb-3">{steps[tutorialStep].icon}</div>
                    <h2 className="text-xl font-black text-white">{steps[tutorialStep].title}</h2>
                    <p className="text-sm text-gray-400 mt-2 leading-relaxed">{steps[tutorialStep].desc}</p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mb-5">
                    {steps.map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === tutorialStep ? 'bg-blue-400 w-5' : i < tutorialStep ? 'bg-blue-400/40' : 'bg-gray-700'}`} />
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
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-colors"
                    >
                      {tutorialStep >= steps.length - 1 ? 'شروع کن!' : 'بعدی'}
                    </button>
                    <button onClick={() => {
                      localStorage.setItem('acap_tutorial_done', 'true')
                      setTutorialStep(null)
                    }}
                      className="px-4 py-3 rounded-xl bg-gray-800 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                    >
                      رد کردن
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
