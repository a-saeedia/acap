'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, TrendingUp, Award, Activity, X } from 'lucide-react'

const persianMonthsShort = ['فر', 'ار', 'خ', 'ت', 'م', 'ش', 'مه', 'آب', 'آ', 'د', 'ب', 'اس']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

export function RevenueWidget() {
  const [signals, setSignals] = useState<any[]>([])
  const [revMonths, setRevMonths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'1' | '3' | '6' | 'net'>('3')
  const [selectedSignal, setSelectedSignal] = useState<any | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    const monthsParam = filter === 'net' ? '' : `?months=${filter}`
    fetch('/api/signals' + monthsParam, { signal: ac.signal })
      .then(r => r.json())
      .then(d => {
        setSignals(d.signals || [])
        setRevMonths(d.revenue || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [filter])

  const total = signals.length
  const wins = signals.filter((s: any) => (s.actualReturn ?? 0) > 0).length
  const winRate = total > 0 ? Math.round(wins / total * 100) : 0
  const withReturn = signals.filter((s: any) => s.actualReturn !== null && s.actualReturn !== undefined)
  const avgReturn = withReturn.length > 0 ? withReturn.reduce((s: number, o: any) => s + (o.actualReturn ?? 0), 0) / withReturn.length : 0
  const bestReturn = withReturn.length > 0 ? Math.max(...withReturn.map((s: any) => s.actualReturn ?? 0)) : 0
  const netRev = revMonths.length > 0 ? revMonths.reduce((s: number, r: any) => s + r.amount, 0) : 0

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-6xl mx-auto" dir="rtl">
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5" /> A|CAP Revenue
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">عملکرد سیگنال‌های A|CAP</h2>
          <p className="text-sm text-gray-400 mt-2">درصد بازده واقعی تمام سیگنال‌های صادره</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : total === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-16 text-gray-500">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">هنوز سیگنالی ثبت نشده</p>
          </motion.div>
        ) : (
          <>
            {/* Filter bar */}
            <motion.div variants={itemVariants} className="flex justify-center mb-8">
              <div className="inline-flex gap-1 p-1 rounded-xl bg-gray-800/50 border border-gray-700/30">
                {([['1', 'ماه'], ['3', '۳ ماه'], ['6', '۶ ماه'], ['net', 'خالص']] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      filter === key ? 'bg-amber-500 text-white shadow-lg shadow-amber-900/30' : 'text-gray-400 hover:text-white'
                    }`}
                  >{label}</button>
                ))}
              </div>
            </motion.div>

            {/* Stats cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'کل سیگنال‌ها', value: total, suffix: '', color: 'text-white', icon: Activity },
                { label: 'نرخ برد', value: winRate, suffix: '%', color: 'text-emerald-400', icon: Award },
                { label: 'میانگین بازده', value: (avgReturn >= 0 ? '+' : '') + avgReturn.toFixed(1), suffix: '%', color: 'text-amber-400', icon: TrendingUp },
                { label: 'بهترین بازده', value: '+' + bestReturn.toFixed(1), suffix: '%', color: 'text-emerald-400', icon: Zap },
              ].map(stat => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 text-center hover:border-amber-500/20 transition-all">
                    <Icon className="w-5 h-5 mx-auto mb-2 text-gray-500" />
                    <div className={`text-xl sm:text-2xl font-black ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{stat.label}</div>
                  </div>
                )
              })}
            </motion.div>

            {/* Bar chart + signal feed side by side on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Bar chart - dashboard style */}
              <motion.div variants={itemVariants}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    {filter === 'net' ? 'بازده خالص' : `بازده ${filter === '1' ? 'ماه جاری' : filter === '3' ? 'سه ماه اخیر' : 'شش ماه اخیر'}`}
                  </h3>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg font-bold">{winRate}% موفقیت</span>
                </div>
                <div className="flex items-end gap-2" style={{ height: '100px' }}>
                  {filter === 'net' ? (
                    <div className="flex flex-col items-center gap-1 w-full">
                      <span className={`text-base font-black ${netRev >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{netRev >= 0 ? '+' : ''}{netRev.toFixed(1)}%</span>
                      <div className={`w-full rounded-t ${netRev >= 0 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gradient-to-t from-red-600 to-red-400'}`}
                        style={{ height: `${Math.max(Math.abs(netRev) / (Math.abs(netRev) || 1) * 80, 8)}px` }} />
                    </div>
                  ) : (
                    revMonths.length > 0 ? (
                      [...revMonths].sort((a, b) => (b.year - a.year) || (b.month - a.month)).reverse().map((r: any) => {
                        const maxAmt = Math.max(...revMonths.map((x: any) => Math.abs(x.amount)), 1)
                        const barH = Math.max(Math.round((Math.abs(r.amount) / maxAmt) * 80), 4)
                        const isPos = r.amount >= 0
                        return (
                          <div key={`${r.year}-${r.month}`} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                            <span className={`text-[10px] font-bold tabular-nums ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>{isPos ? '+' : ''}{r.amount.toFixed(1)}%</span>
                            <div className={`w-full rounded-t ${isPos ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gradient-to-t from-red-600 to-red-400'}`}
                              style={{ height: `${barH}px` }} />
                            <span className="text-[8px] text-gray-500">{persianMonthsShort[r.month - 1] || r.month}</span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-xs text-gray-600">داده‌ای نیست</div>
                    )
                  )}
                </div>
              </motion.div>

              {/* Signal feed */}
              <motion.div variants={itemVariants}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">خوراک سیگنال‌ها</h3>
                </div>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {signals.slice(0, filter === 'net' ? 20 : 8).map((s: any) => {
                    const isWin = (s.actualReturn ?? 0) > 0
                    const sd = s.publishedAt ? new Date(s.publishedAt) : new Date()
                    return (
                      <div key={s.id}
                        className="rounded-xl px-3 py-2.5 cursor-pointer transition-all border border-gray-700/20 bg-gray-800/20 hover:border-amber-500/20 hover:bg-gray-700/20"
                        onClick={() => setSelectedSignal(s)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-sm font-bold text-white truncate">{s.title}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                              s.action === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>{s.action === 'buy' ? 'BUY' : 'SELL'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-gray-500 ltr" dir="ltr">{sd.toLocaleDateString('fa-IR')}</span>
                            <span className={`text-[11px] font-black tabular-nums ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                              {s.actualReturn !== null && s.actualReturn !== undefined ? `${isWin ? '+' : ''}${s.actualReturn.toFixed(1)}%` : '—'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-500 font-semibold">{s.symbol}</span>
                          <span className="text-[10px] text-gray-500">{String(s.type) === 'crypto' ? 'ارز دیجیتال' : String(s.type) === 'stock' ? 'سهام' : String(s.type) === 'gold' ? 'طلا' : String(s.type) === 'dollar' ? 'دلار' : 'فارکس'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* Signal Detail Modal */}
        <AnimatePresence>
          {selectedSignal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedSignal(null)}
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
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">{selectedSignal.title}</h3>
                  </div>
                  <button onClick={() => setSelectedSignal(null)} className="p-1 rounded-lg hover:bg-gray-800 text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between"><span className="text-gray-500">نماد</span><span className="text-white font-semibold">{selectedSignal.symbol}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">نوع</span><span className="text-white font-semibold">{String(selectedSignal.type) === 'crypto' ? 'ارز دیجیتال' : String(selectedSignal.type) === 'stock' ? 'سهام' : String(selectedSignal.type) === 'gold' ? 'طلا' : String(selectedSignal.type) === 'dollar' ? 'دلار' : 'فارکس'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">نوع معامله</span><span className={`font-bold ${selectedSignal.action === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>{selectedSignal.action === 'buy' ? 'خرید' : 'فروش'}</span></div>
                  {selectedSignal.entryPrice && <div className="flex justify-between"><span className="text-gray-500">قیمت ورود</span><span className="text-white font-semibold">{selectedSignal.entryPrice.toLocaleString()}</span></div>}
                  {selectedSignal.targetPrice && <div className="flex justify-between"><span className="text-gray-500">قیمت هدف</span><span className="text-emerald-400 font-semibold">{selectedSignal.targetPrice.toLocaleString()}</span></div>}
                  {selectedSignal.stopLoss && <div className="flex justify-between"><span className="text-gray-500">حد ضرر</span><span className="text-red-400 font-semibold">{selectedSignal.stopLoss.toLocaleString()}</span></div>}
                  {selectedSignal.actualReturn !== null && selectedSignal.actualReturn !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-500">بازده واقعی</span><span className={`font-black ${(selectedSignal.actualReturn ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{(selectedSignal.actualReturn ?? 0) >= 0 ? '+' : ''}{selectedSignal.actualReturn.toFixed(2)}%</span></div>
                  )}
                  {selectedSignal.description && (
                    <div className="pt-2 border-t border-gray-800">
                      <span className="text-gray-500 text-xs">توضیحات</span>
                      <p className="text-white mt-1 text-xs leading-relaxed">{selectedSignal.description}</p>
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
