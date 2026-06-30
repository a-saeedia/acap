'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Brain, PieChart, Target } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  crypto: 'رمز ارز',
  stock: 'بورس ایران',
  gold: 'طلا',
  currency: 'ارز',
  other: 'سایر',
}

const TYPE_EMOJI: Record<string, string> = {
  crypto: '\u20BF',
  stock: '\uD83D\uDCC8',
  gold: '\uD83D\uDD36',
  currency: '\uD83D\uDCB5',
  other: '\uD83D\uDCB0',
}

const INVESTOR_TYPES: Record<string, { name: string; emoji: string; color: string }> = {
  conservative: { name: '\u0645\u062D\u0627\u0641\u0638\u0647\u200C\u06A9\u0627\u0631', emoji: '\uD83D\uDEE1\uFE0F', color: '#10B981' },
  balanced: { name: '\u0645\u062A\u0639\u0627\u062F\u0644', emoji: '\u2696\uFE0F', color: '#3B82F6' },
  growth: { name: '\u0631\u0634\u062F\u06AF\u0631\u0627', emoji: '\uD83D\uDE80', color: '#1D9BF0' },
  aggressive: { name: '\u062A\u0647\u0627\u062C\u0645\u06CC', emoji: '\uD83D\uDD25', color: '#EF4444' },
}

const IDEAL_ALLOCATION: Record<string, Record<string, number>> = {
  conservative: { gold: 40, currency: 30, stock: 20, crypto: 10, other: 0 },
  balanced: { gold: 25, currency: 20, stock: 35, crypto: 20, other: 0 },
  growth: { gold: 10, currency: 10, stock: 40, crypto: 40, other: 0 },
  aggressive: { gold: 5, currency: 5, stock: 30, crypto: 60, other: 0 },
}

const CHART_TYPES = ['crypto', 'stock', 'gold', 'currency'] as const

interface AdvisorProps {
  assets: { type: string; symbol: string; label: string; quantity: number }[]
  prices: Record<string, { price: number; currency: string }>
  stockPrices: Record<string, number>
  investorType: string | null
  quizTaken: boolean
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

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(2) + ' \u062A\u0631\u06CC\u0644\u06CC\u0648\u0646'
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + ' \u0645\u06CC\u0644\u06CC\u0627\u0631\u062F'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + ' \u0645\u06CC\u0644\u06CC\u0648\u0646'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + ' \u0647\u0632\u0627\u0631'
  return n.toLocaleString('fa-IR')
}

function ScoreCircle({ score }: { score: number }) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(t)
  }, [])

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const color = score >= 80 ? '#10B981' : score >= 50 ? '#EAB308' : '#EF4444'
  const offset = animated ? circumference * (1 - score / 100) : circumference

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
      <circle
        cx="70" cy="70" r={radius}
        fill="none" stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)', transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }}
      />
      <motion.text
        x="70" y="64" textAnchor="middle"
        className="fill-foreground font-black"
        fontSize="28"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
      >
        {score}
      </motion.text>
      <text x="70" y="82" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
        {'\u0627\u0632 \u06F1\u06F0\u06F0'}
      </text>
    </svg>
  )
}

export function PortfolioAdvisor(props: AdvisorProps) {
  const { assets, prices, stockPrices, investorType, quizTaken } = props

  const totalValue = useMemo(() => {
    return assets.reduce((sum, a) => {
      return sum + getAssetPriceIr(a.symbol, prices, stockPrices) * a.quantity
    }, 0)
  }, [assets, prices, stockPrices])

  const byType = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of assets) {
      const val = getAssetPriceIr(a.symbol, prices, stockPrices) * a.quantity
      map[a.type] = (map[a.type] || 0) + val
    }
    return map
  }, [assets, prices, stockPrices])

  const typeCount = Object.keys(byType).length

  const currentAllocation = useMemo(() => {
    const alloc: Record<string, number> = {}
    for (const type of Object.keys(IDEAL_ALLOCATION.conservative)) {
      alloc[type] = totalValue > 0 ? ((byType[type] || 0) / totalValue) * 100 : 0
    }
    return alloc
  }, [byType, totalValue])

  const idealAllocation = useMemo(() => {
    if (!investorType || !IDEAL_ALLOCATION[investorType]) return IDEAL_ALLOCATION.conservative
    return IDEAL_ALLOCATION[investorType]
  }, [investorType])

  const score = useMemo(() => {
    let totalDiff = 0
    for (const type of Object.keys(idealAllocation)) {
      totalDiff += Math.abs((currentAllocation[type] || 0) - idealAllocation[type])
    }
    return Math.max(0, Math.min(100, Math.round(100 - totalDiff / 2)))
  }, [currentAllocation, idealAllocation])

  const investorInfo = useMemo(() => {
    if (!investorType || !INVESTOR_TYPES[investorType]) return INVESTOR_TYPES.conservative
    return INVESTOR_TYPES[investorType]
  }, [investorType])

  const gaps = useMemo(() => {
    return CHART_TYPES.map(type => {
      const current = currentAllocation[type] || 0
      const ideal = idealAllocation[type] || 0
      const gap = ideal - current
      return { type, current, ideal, gap }
    })
  }, [currentAllocation, idealAllocation])

  const adviceItems = useMemo(() => {
    const items: { text: string; severity: 'critical' | 'warning' | 'good'; icon: string }[] = []
    let significantGaps = 0

    for (const g of gaps) {
      if (Math.abs(g.gap) < 5) continue
      significantGaps++
      const absGap = Math.abs(Math.round(g.gap))
      const label = TYPE_LABELS[g.type]

      if (g.gap > 0) {
        if (g.type === 'stock') {
          items.push({
            text: `\u0628\u0631\u0627\u06CC \u0633\u0631\u0645\u0627\u06CC\u0647\u200C\u06AF\u0630\u0627\u0631\u06CC \u062F\u0631 \u0628\u0648\u0631\u0633 \u0627\u06CC\u0631\u0627\u0646\u060C ${absGap}\u066A \u0627\u0632 \u0633\u0628\u062F \u062E\u0648\u062F \u0631\u0627 \u0627\u062E\u062A\u0635\u0627\u0635 \u062F\u0647\u06CC\u062F`,
            severity: 'warning',
            icon: '\uD83D\uDCC8',
          })
        } else {
          items.push({
            text: `\u0633\u0647\u0645 ${label} \u062E\u0648\u062F \u0631\u0627 ${absGap}\u066A \u0627\u0641\u0632\u0627\u06CC\u0634 \u062F\u0647\u06CC\u062F`,
            severity: 'warning',
            icon: '↑',
          })
        }
      } else {
        if (investorType === 'conservative' && g.type === 'crypto') {
          items.push({
            text: `\u06A9\u0631\u06CC\u067E\u062A\u0648 \u062E\u0648\u062F \u0631\u0627 ${absGap}\u066A \u06A9\u0627\u0647\u0634 \u062F\u0647\u06CC\u062F \u0648 \u0628\u0647 \u0637\u0644\u0627 \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F`,
            severity: 'critical',
            icon: '\uD83D\uDD25',
          })
        } else {
          items.push({
            text: `\u0633\u0647\u0645 ${label} \u062E\u0648\u062F \u0631\u0627 ${absGap}\u066A \u06A9\u0627\u0647\u0634 \u062F\u0647\u06CC\u062F`,
            severity: 'critical',
            icon: '\uD83D\uDCC9',
          })
        }
      }
    }

    const otherCurrent = currentAllocation['other'] || 0
    if (otherCurrent > 5) {
      significantGaps++
      items.push({
        text: `\u0633\u0647\u0645 \u0633\u0627\u06CC\u0631 \u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627\u06CC \u062E\u0648\u062F \u0631\u0627 ${Math.round(otherCurrent)}\u066A \u06A9\u0627\u0647\u0634 \u062F\u0647\u06CC\u062F`,
        severity: 'critical',
        icon: '\uD83D\uDCB0',
      })
    }

    if (significantGaps === 0 && totalValue > 0) {
      items.push({
        text: '\u067E\u0631\u062A\u0641\u0648\u06CC \u0634\u0645\u0627 \u0645\u062A\u0639\u0627\u062F\u0644 \u0627\u0633\u062A',
        severity: 'good',
        icon: '\u2705',
      })
    }

    return items
  }, [gaps, investorType, currentAllocation, totalValue])

  if (!quizTaken) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border border-border rounded-3xl p-8 text-center"
        dir="rtl"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-black text-foreground mb-2">{'\u062A\u0633\u062A \u0634\u062E\u0635\u06CC\u062A \u0645\u0627\u0644\u06CC \u0627\u0646\u062C\u0627\u0645 \u0646\u0634\u062F\u0647'}</h3>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          {'\u0628\u0631\u0627\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u0645\u0634\u0627\u0648\u0631\u0647 \u067E\u0631\u062A\u0641\u0648\u06CC\u060C \u0627\u0628\u062A\u062F\u0627 \u062A\u0633\u062A \u0634\u062E\u0635\u06CC\u062A \u0645\u0627\u0644\u06CC \u0631\u0627 \u0627\u0646\u062C\u0627\u0645 \u062F\u0647\u06CC\u062F'}
        </p>
        <a
          href="/#quiz"
          className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm font-bold"
        >
          <Brain className="w-4 h-4" />
          {'\u0634\u0631\u0648\u0639 \u062A\u0633\u062A \u0634\u062E\u0635\u06CC\u062A \u0645\u0627\u0644\u06CC'}
        </a>
      </motion.div>
    )
  }

  if (assets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border border-border rounded-3xl p-8 text-center"
        dir="rtl"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20">
          <PieChart className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-black text-foreground mb-2">{'\u0633\u0628\u062F \u062F\u0627\u0631\u0627\u06CC\u06CC \u062E\u0627\u0644\u06CC \u0627\u0633\u062A'}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {'\u0628\u0631\u0627\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u0645\u0634\u0627\u0648\u0631\u0647\u060C \u0627\u0628\u062A\u062F\u0627 \u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627\u06CC \u062E\u0648\u062F \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F'}
        </p>
      </motion.div>
    )
  }

  return (
    <div dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border border-border rounded-3xl overflow-hidden mb-6"
        style={{ borderColor: `${investorInfo.color}35` }}
      >
        <div
          className="p-6 sm:p-8 text-center relative overflow-hidden"
          style={{ background: `${investorInfo.color}0E` }}
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, ${investorInfo.color}, transparent 70%)` }} />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className="text-4xl mb-3"
          >
            {investorInfo.emoji}
          </motion.div>
          <div className="text-xs font-mono tracking-widest text-muted-foreground mb-1">
            {'\u0634\u062E\u0635\u06CC\u062A \u0645\u0627\u0644\u06CC \u0634\u0645\u0627'}
          </div>
          <h3 className="text-xl sm:text-2xl font-black mb-1" style={{ color: investorInfo.color }}>
            {investorInfo.name}
          </h3>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-2 mb-6">
            <span className="text-xs text-muted-foreground font-semibold">
              {'\u0627\u0645\u062A\u06CC\u0627\u0632 \u062A\u0637\u0627\u0628\u0642 \u067E\u0631\u062A\u0641\u0648\u06CC'}
            </span>
            <ScoreCircle score={score} />
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" />
              <h4 className="font-black text-sm text-foreground">
                {'\u0645\u0642\u0627\u06CC\u0633\u0647 \u062A\u0648\u0632\u06CC\u0639 \u0641\u0639\u0644\u06CC \u0648 \u0627\u06CC\u062F\u0647\u200C\u0622\u0644'}
              </h4>
            </div>
            <div className="space-y-5" dir="ltr">
              {gaps.map((g, i) => {
                const maxPct = Math.max(g.current, g.ideal, 5)
                return (
                  <motion.div
                    key={g.type}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-2.5" dir="rtl">
                      <span className="text-lg">{TYPE_EMOJI[g.type]}</span>
                      <span className="text-xs font-bold text-foreground">{TYPE_LABELS[g.type]}</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-16 shrink-0" dir="rtl">
                          {'\u0648\u0636\u0639\u06CC\u062A \u0641\u0639\u0644\u06CC'}
                        </span>
                        <div className="flex-1 h-4 bg-accent/30 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(g.current / maxPct) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + i * 0.08 }}
                            className="h-full rounded-full"
                            style={{ background: '#3B82F6' }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground w-12 text-right shrink-0 font-mono">
                          {g.current.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-16 shrink-0" dir="rtl">
                          {'\u0645\u0642\u062F\u0627\u0631 \u0627\u06CC\u062F\u0647\u200C\u0622\u0644'}
                        </span>
                        <div className="flex-1 h-4 bg-accent/30 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(g.ideal / maxPct) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 + i * 0.08 }}
                            className="h-full rounded-full"
                            style={{ background: '#10B981' }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground w-12 text-right shrink-0 font-mono">
                          {g.ideal.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {Math.abs(g.gap) >= 0.5 && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.08 }}
                        className="flex items-center gap-1 mt-1.5 mr-[4.5rem]"
                        dir="rtl"
                      >
                        {g.gap > 0 ? (
                          <>
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <span className="text-[11px] font-bold text-emerald-400">
                              +{Math.abs(Math.round(g.gap))}%
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {'\u0646\u06CC\u0627\u0632 \u0628\u0647 \u0627\u0641\u0632\u0627\u06CC\u0634'}
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3 text-red-400" />
                            <span className="text-[11px] font-bold text-red-400">
                              -{Math.abs(Math.round(g.gap))}%
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {'\u0646\u06CC\u0627\u0632 \u0628\u0647 \u06A9\u0627\u0647\u0634'}
                            </span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <h4 className="font-black text-sm text-foreground">
                {'\u062A\u0648\u0635\u06CC\u0647 \u0647\u0627\u06CC \u067E\u0631\u062A\u0641\u0648\u06CC'}
              </h4>
            </div>
            <div className="space-y-3">
              {adviceItems.map((item, i) => {
                const borderColor = item.severity === 'critical'
                  ? '#EF4444'
                  : item.severity === 'warning'
                    ? '#EAB308'
                    : '#10B981'
                const bgColor = item.severity === 'critical'
                  ? 'rgba(239,68,68,0.06)'
                  : item.severity === 'warning'
                    ? 'rgba(234,179,8,0.06)'
                    : 'rgba(16,185,129,0.06)'
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, x: -10 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.35 }}
                    className="rounded-xl p-3.5 flex items-start gap-3 text-sm"
                    style={{
                      borderLeft: `3px solid ${borderColor}`,
                      background: bgColor,
                    }}
                  >
                    <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                    <span className="text-foreground leading-relaxed">{item.text}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass border border-border rounded-2xl p-4 flex items-center justify-around gap-3"
        dir="rtl"
      >
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">
            {'\u0627\u0631\u0632\u0634 \u06A9\u0644 \u067E\u0631\u062A\u0641\u0648\u06CC'}
          </div>
          <div className="text-sm font-black text-foreground">
            {formatCurrency(Math.round(totalValue))}
          </div>
        </div>
        <div className="w-px h-8 bg-border/50" />
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">
            {'\u062A\u0639\u062F\u0627\u062F \u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627'}
          </div>
          <div className="text-sm font-black text-foreground">
            {assets.length}
          </div>
        </div>
        <div className="w-px h-8 bg-border/50" />
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">
            {'\u062A\u0639\u062F\u0627\u062F \u062F\u0633\u062A\u0647\u200C\u0647\u0627'}
          </div>
          <div className="text-sm font-black text-foreground">
            {typeCount}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
