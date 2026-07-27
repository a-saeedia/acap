'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, TrendingUp, Award, Activity, X, Signal } from 'lucide-react'
import { useLang } from '@/components/lang-provider'

const persianMonthsShort = ['فر', 'ار', 'خ', 'ت', 'م', 'ش', 'مه', 'آب', 'آ', 'د', 'ب', 'اس']
const englishMonthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

export function RevenueWidget() {
  const { t, lang } = useLang()
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [revMonths, setRevMonths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'1' | '3' | '6' | 'net'>('3')
  const [selectedSug, setSelectedSug] = useState<any | null>(null)
  const [chartLoaded, setChartLoaded] = useState(false)
  const monthsShort = lang === 'fa' ? persianMonthsShort : englishMonthsShort

  useEffect(() => {
    const ac = new AbortController()
    fetch('/api/revenue', { signal: ac.signal })
      .then(r => r.json())
      .then(d => {
        setRevMonths(d.revenue || [])
        setSuggestions(d.suggestions || [])
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setTimeout(() => setChartLoaded(true), 100) })
    return () => ac.abort()
  }, [])

  const total = suggestions.length
  const wins = suggestions.filter((s: any) => (s.profitPercent ?? 0) > 0).length
  const winRate = total > 0 ? Math.round(wins / total * 100) : 0
  const withReturn = suggestions.filter((s: any) => s.profitPercent != null)
  const avgReturn = withReturn.length > 0 ? withReturn.reduce((s: number, o: any) => s + (o.profitPercent ?? 0), 0) / withReturn.length : 0
  const bestReturn = withReturn.length > 0 ? Math.max(...withReturn.map((s: any) => s.profitPercent ?? 0)) : 0
  const netRev = revMonths.length > 0 ? revMonths.reduce((s: number, r: any) => s + r.amount, 0) : 0

  const sorted = [...revMonths].sort((a, b) => a.year - b.year || a.month - b.month)
  let cumulative = 0
  const points = sorted.map(r => {
    cumulative += r.amount
    return { amount: cumulative, label: monthsShort[r.month - 1] || String(r.month), raw: r.amount }
  })
  const values = points.map(p => p.amount)
  const minVal = Math.min(...values, 0)
  const maxVal = Math.max(...values, 1)
  const range = maxVal - minVal || 1

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-6xl mx-auto" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5" /> A|CAP Revenue
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">{t('rev.title')}</h2>
          <p className="text-sm text-gray-400 mt-2">{t('rev.lbl.performance')}</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : total === 0 && revMonths.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-16 text-gray-500">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('rev.no.signals')}</p>
          </motion.div>
        ) : (
          <>
            <motion.div variants={itemVariants} className="flex justify-center mb-8">
              <div className="inline-flex gap-1 p-1 rounded-xl bg-gray-800/50 border border-gray-700/30">
                {([['1', '1 ماهه'], ['3', '۳ ماهه'], ['6', '۶ ماهه'], ['net', 'کل']] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      filter === key ? 'bg-amber-500 text-white shadow-lg shadow-amber-900/30' : 'text-gray-400 hover:text-white'
                    }`}
                  >{label}</button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: t('rev.total.signals'), value: total, suffix: '', color: 'text-white', icon: Activity },
                { label: t('rev.win.rate.lbl'), value: winRate, suffix: '%', color: 'text-emerald-400', icon: Award },
                { label: t('rev.avg.return'), value: (avgReturn >= 0 ? '+' : '') + avgReturn.toFixed(1), suffix: '%', color: 'text-amber-400', icon: TrendingUp },
                { label: t('rev.best.return'), value: '+' + bestReturn.toFixed(1), suffix: '%', color: 'text-emerald-400', icon: Zap },
              ].map(stat => {
                const Icon = stat.icon
                return (
                  <motion.div key={stat.label} whileHover={{ scale: 1.02 }} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 text-center hover:border-amber-500/20 transition-all">
                    <Icon className="w-5 h-5 mx-auto mb-2 text-gray-500" />
                    <div className={`text-xl sm:text-2xl font-black ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{stat.label}</div>
                  </motion.div>
                )
              })}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <motion.div variants={itemVariants}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    {filter === 'net' ? t('rev.net.return') : filter === '1' ? t('rev.this.month') : filter === '3' ? t('rev.3months') : t('rev.6months')}
                  </h3>
                </div>
                <div style={{ height: '140px' }}>
                  {filter === 'net' ? (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 100 }} className="flex flex-col items-center justify-center h-full gap-1">
                      <span className={`text-2xl font-black ${netRev >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{netRev >= 0 ? '+' : ''}{netRev.toFixed(1)}%</span>
                      <span className="text-[10px] text-gray-500">{t('rev.total.return')}</span>
                    </motion.div>
                  ) : points.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-gray-600">{t('common.no.data')}</div>
                  ) : (
                    <Chart points={points} minVal={minVal} maxVal={maxVal} range={range} chartLoaded={chartLoaded} />
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Signal className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">سیگنال‌های A|CAP+</h3>
                </div>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {suggestions.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 text-xs">هنوز سیگنالی ارسال نشده</p>
                  ) : suggestions.slice(0, 20).map((s: any) => {
                    const isWin = (s.profitPercent ?? 0) > 0
                    const sd = s.createdAt ? new Date(s.createdAt) : new Date()
                    return (
                      <motion.div key={s.id} whileHover={{ x: 2 }}
                        className="rounded-xl px-3 py-2.5 cursor-pointer transition-all border border-gray-700/20 bg-gray-800/20 hover:border-amber-500/20 hover:bg-gray-700/20"
                        onClick={() => setSelectedSug(s)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-bold text-white truncate block">{s.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-gray-500 ltr" dir="ltr">{sd.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}</span>
                            {s.profitPercent != null && (
                              <span className={`text-[11px] font-black tabular-nums ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isWin ? '+' : ''}{Number(s.profitPercent).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                        {s.content && <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{s.content}</p>}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </>
        )}

        <AnimatePresence>
          {selectedSug && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedSug(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl p-5"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Signal className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">{selectedSug.title}</h3>
                  </div>
                  <button onClick={() => setSelectedSug(null)} className="p-1 rounded-lg hover:bg-gray-800 text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  {selectedSug.profitPercent != null && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">سود</span>
                      <span className={`font-black ${(selectedSug.profitPercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(selectedSug.profitPercent ?? 0) >= 0 ? '+' : ''}{Number(selectedSug.profitPercent).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {selectedSug.isBroadcast && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">نوع</span>
                      <span className="text-amber-400 font-semibold">ارسال به همه A|CAP+</span>
                    </div>
                  )}
                  {selectedSug.content && (
                    <div className="pt-2 border-t border-gray-800">
                      <span className="text-gray-500 text-xs">متن</span>
                      <p className="text-white mt-1 text-xs leading-relaxed whitespace-pre-wrap">{selectedSug.content}</p>
                    </div>
                  )}
                  {selectedSug.expiresAt && (
                    <div className="text-[11px] text-gray-400">
                      {new Date(selectedSug.expiresAt) < new Date() ? '⛔ منقضی شده' : `⏳ اعتبار تا ${new Date(selectedSug.expiresAt).toLocaleDateString('fa-IR')}`}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}

function Chart({ points, minVal, maxVal, range, chartLoaded }: {
  points: { amount: number; label: string; raw: number }[]
  minVal: number; maxVal: number; range: number; chartLoaded: boolean
}) {
  const w = 560, h = 140, padL = 40, padR = 10, padT = 10, padB = 20
  const chartW = w - padL - padR, chartH = h - padT - padB
  const toX = (i: number) => padL + (i / Math.max(points.length - 1, 1)) * chartW
  const toY = (v: number) => padT + chartH - ((v - minVal) / range) * chartH

  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p.amount).toFixed(1)}`).join(' ')
  const areaD = `${lineD} L${toX(points.length - 1).toFixed(1)},${toY(minVal).toFixed(1)} L${toX(0).toFixed(1)},${toY(minVal).toFixed(1)} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="rgb(251,191,36)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaD}
        fill="url(#cumGrad)"
        initial={{ opacity: 0 }}
        animate={chartLoaded ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      />
      <motion.path
        d={lineD}
        fill="none"
        stroke="rgb(251,191,36)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={chartLoaded ? { pathLength: 1 } : {}}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
      {points.map((p, i) => (
        <motion.g key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={chartLoaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8 + i * 0.08, type: 'spring', stiffness: 200 }}
        >
          <motion.circle
            cx={toX(i)} cy={toY(p.amount)} r="3"
            fill="rgb(251,191,36)" stroke="#1f2937" strokeWidth="1.5"
            whileHover={{ r: 6 }}
          />
          <text x={toX(i)} y={h - 4} textAnchor="middle" fill="#6b7280" fontSize="8">{p.label}</text>
        </motion.g>
      ))}
    </svg>
  )
}
