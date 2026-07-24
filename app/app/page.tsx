'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { useLang } from '@/components/lang-provider'
import { getMyAssets } from '@/app/actions/assets'
import { getDashboardData } from '@/app/actions/profile'
import { OnboardingTasks } from '@/components/onboarding-tasks'
import { PortfolioAdvisor } from '@/components/portfolio-advisor'
import {
  Wallet, TrendingUp, Crown, Brain, Shield,
  X, BarChart3, Loader2, HelpCircle, User, Gift, ArrowLeft,
  Bot, MessageSquare, Play, Pause, Mic, LogOut, Home
} from 'lucide-react'
import { formatToman, toPersianDigits } from '@/lib/utils'
import { getAssetPriceIr } from '@/lib/price-utils'

type Asset = Awaited<ReturnType<typeof getMyAssets>>[number]
type InvestorKey = 'conservative' | 'balanced' | 'growth' | 'aggressive'

const TYPE_INFO: Record<InvestorKey, { key: string; emoji: string; color: string }> = {
  conservative: { key: 'investor.conservative', emoji: '🛡️', color: '#10B981' },
  balanced: { key: 'investor.balanced', emoji: '⚖️', color: '#3B82F6' },
  growth: { key: 'investor.growth', emoji: '🚀', color: '#1D9BF0' },
  aggressive: { key: 'investor.aggressive', emoji: '🔥', color: '#EF4444' },
}

const TYPE_CONFIG: Record<string, { key: string; color: string }> = {
  crypto: { key: 'asset.crypto', color: '#F59E0B' },
  stock: { key: 'asset.stock', color: '#2979FF' },
  gold: { key: 'asset.gold', color: '#F59E0B' },
  currency: { key: 'asset.currency', color: '#10B981' },
  cash: { key: 'asset.cash', color: '#06B6D4' },
  other: { key: 'asset.other', color: '#8B5CF6' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

const stepKeys = ['tutorial.step1', 'tutorial.step2', 'tutorial.step3', 'tutorial.step4', 'tutorial.step5']

const stepIcons = ['👋', '📊', '💎', '📚', '🚀']

export default function MergedDashboard() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const { t, lang } = useLang()
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

    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 8000)
    getMyAssets().then(setAssets).catch(() => {})
    fetch('/api/prices', { signal: ac.signal }).then(r => r.json()).then(d => {
      if (!d) return
      const pm: Record<string, { price: number; currency: string }> = {}
      const sm: Record<string, number> = {}
      if (d.prices) for (const [k, v] of Object.entries(d.prices) as [string, any][]) pm[k] = v
      if (d.stockPrices) for (const [k, v] of Object.entries(d.stockPrices) as [string, any][]) sm[k] = v.price
      setPrices(pm)
      setStockPrices(sm)
    }).catch(() => {})

    const handleVisible = () => {
      if (document.hidden) return
      getMyAssets().then(setAssets).catch(() => {})
      const ac2 = new AbortController()
      setTimeout(() => ac2.abort(), 8000)
      fetch('/api/prices', { signal: ac2.signal }).then(r => r.json()).then(d => {
        if (!d) return
        const pm: Record<string, { price: number; currency: string }> = {}
        const sm: Record<string, number> = {}
        if (d.prices) for (const [k, v] of Object.entries(d.prices) as [string, any][]) pm[k] = v
        if (d.stockPrices) for (const [k, v] of Object.entries(d.stockPrices) as [string, any][]) sm[k] = v.price
        setPrices(pm)
        setStockPrices(sm)
      }).catch(() => {})
    }
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', handleVisible)
    return () => {
      clearTimeout(t)
      ac.abort()
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', handleVisible)
    }
  }, [session, isPending])

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

  const showLoading = isPending
  const ready = session && !isPending

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
  const hasAssets = assets.length > 0

  return (
    <div dir={lang === 'fa' ? 'rtl' : 'ltr'} className="overflow-x-hidden">
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
                {lang === 'fa' ? `خوش آمدی، ${user.name.split(' ')[0]} 👋` : `Welcome, ${user.name.split(' ')[0]} 👋`}
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

          {/* ========== DASHBOARD ========== */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: t('dash.total.value'), value: hasAssets ? formatToman(totalValue) : '—', color: '#10B981', icon: Wallet },
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
                  <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 flex items-center gap-3 col-span-1 sm:col-span-2 md:col-span-2 hover:border-white/[0.15] transition-all">
                    <span className="text-xl sm:text-2xl">{typeInfo.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] sm:text-xs text-gray-400">{t('dash.financial.personality')}</div>
                      <div className="font-black text-sm sm:text-base" style={{ color: typeInfo.color }}>{t(typeInfo.key)}</div>
                      <div className="text-[10px] sm:text-xs text-gray-400">{t('dash.risk.tolerance').replace('{{score}}', lang === 'fa' ? toPersianDigits(latest.score) : String(latest.score))}</div>
                    </div>
                    <div className="w-20 sm:w-24 md:w-32 shrink-0">
                      <div className="h-1.5 sm:h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${latest.score}%`, background: typeInfo.color }} />
                      </div>
                    </div>
                    <button onClick={() => router.push('/#quiz')}
                      className="text-[10px] sm:text-xs text-blue-400 hover:text-blue-300 font-semibold shrink-0 border border-blue-500/20 rounded-lg px-2 sm:px-3 py-1.5"
                    >
                      {t('dash.retest')}
                     </button>
                   </div>
                 ) : (
                   <div className="col-span-1 sm:col-span-2 md:col-span-1 bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-4 hover:border-blue-500/40 transition-all cursor-pointer group"
                     onClick={() => router.push('/#quiz')}
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
                         <Brain className="w-5 h-5 text-white" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <span className="text-[10px] text-blue-400 font-semibold">{t('dash.quiz.title')}</span>
                         <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{t('dash.start.test')}</div>
                       </div>
                      <div className="shrink-0">
                        <svg className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Quiz CTA Banner */}
              {!latest && (
                <motion.div variants={itemVariants}
                  onClick={() => router.push('/#quiz')}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-blue-600/20 via-purple-600/20 to-blue-600/10 border border-blue-500/20 p-5 cursor-pointer group hover:border-blue-400/40 transition-all"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />
                  <div className="relative flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-xl shadow-blue-900/30">
                      <Brain className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-white">{t('dash.quiz.cta.title')}</h3>
                      <p className="text-sm text-gray-300 mt-0.5">{t('dash.quiz.cta.desc')}</p>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg">
                        {t('dash.start.quiz')}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

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
                        <h3 className="text-sm font-bold text-white">{t('dash.portfolio')}</h3>
                      </div>
                      <button onClick={() => router.push('/app/assets')}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                      >
                        {t('dash.full.manage')}
                      </button>
                    </div>

                    {!hasAssets ? (
                      <div className="text-center py-6">
                        <p className="text-gray-400 text-sm mb-3">{t('dash.empty.portfolio')}</p>
                        <button onClick={() => router.push('/app/assets')}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all"
                        >
                          {t('dash.add.asset')}
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
                              <text x="40" y="48" textAnchor="middle" className="fill-gray-400 text-[5px]">{t('dash.assets.count')}</text>
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
                                    <span className="text-white font-medium">{t(cfg.key)}</span>
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
                          {t('dash.smart.scan')}
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
                              {t('dash.more.assets').replace('{{count}}', String(assets.length - 4))}
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
                    <h3 className="text-sm font-bold text-white mb-3">{t('dash.quick.access')}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: t('nav.plus'), icon: Crown, action: () => router.push(isPlus ? '/app/personal' : '/acap-plus'), color: 'text-amber-400' },
                        { label: t('app.prices'), icon: TrendingUp, action: () => router.push('/app/prices'), color: 'text-emerald-400' },
                        { label: t('nav.ticket'), icon: HelpCircle, action: () => router.push('/tickets'), color: 'text-blue-400' },
                        { label: t('app.academy'), icon: Shield, action: () => router.push('/app/academy'), color: 'text-purple-400' },
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
                      <h3 className="text-sm font-bold text-white">{t('dash.account.info')}</h3>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { label: t('dash.name'), value: user.name },
                        { label: t('dash.email'), value: user.email },
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
                      {t('dash.admin.panel')}
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
                      <h3 className="text-sm font-bold text-white">{t('dash.smart.scan')}</h3>
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
                    if (tutorialStep >= stepKeys.length - 1) {
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
                      <div className="text-5xl mb-3">{stepIcons[tutorialStep]}</div>
                      <h2 className="text-xl font-black text-white">{t(stepKeys[tutorialStep] + '.title')}</h2>
                      <p className="text-sm text-gray-400 mt-2 leading-relaxed">{t(stepKeys[tutorialStep] + '.desc')}</p>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mb-5">
                      {stepKeys.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === tutorialStep ? 'bg-blue-400 w-5' : i < tutorialStep ? 'bg-blue-400/40' : 'bg-gray-700'}`} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        if (tutorialStep >= stepKeys.length - 1) {
                          localStorage.setItem('acap_tutorial_done', 'true')
                          setTutorialStep(null)
                        } else {
                          setTutorialStep(tutorialStep + 1)
                        }
                      }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-colors"
                      >
                        {tutorialStep >= stepKeys.length - 1 ? t('dash.start') : t('dash.next')}
                      </button>
                      <button onClick={() => {
                        localStorage.setItem('acap_tutorial_done', 'true')
                        setTutorialStep(null)
                      }}
                        className="px-4 py-3 rounded-xl bg-gray-800 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                      >
                        {t('dash.skip')}
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
