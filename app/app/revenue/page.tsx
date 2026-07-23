'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '@/lib/auth-client'
import { Zap } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

const persianMonthsShort = ['فر', 'ار', 'خ', 'ت', 'م', 'ش', 'مه', 'آب', 'آ', 'د', 'ب', 'اس']

export default function RevenuePage() {
  const { data: session } = useSession()
  const [revSignals, setRevSignals] = useState<any[]>([])
  const [revStats, setRevStats] = useState<{total: number; wins: number; winRate: number} | null>(null)
  const [revenueFilteredMonths, setRevenueFilteredMonths] = useState<any[]>([])
  const [selectedSignal, setSelectedSignal] = useState<any | null>(null)
  const [revenueFilter, setRevenueFilter] = useState<'1' | '3' | '6' | 'net'>('3')

  useEffect(() => {
    const ac = new AbortController()
    const monthsParam = revenueFilter === 'net' ? '' : `?months=${revenueFilter}`
    const userIdParam = session?.user?.id ? `&userId=${session.user.id}` : ''
    fetch('/api/signals' + monthsParam + userIdParam, { signal: ac.signal })
      .then(r => r.json()).then(d => {
        const sigs = d?.signals || []
        setRevSignals(sigs)
        setRevenueFilteredMonths(d?.revenue || [])
        if (sigs.length > 0) {
          const wins = sigs.filter((s: any) => (s.actualProfit ?? 0) > 0).length
          setRevStats({ total: sigs.length, wins, winRate: Math.round((wins / sigs.length) * 100) })
        }
      }).catch(() => {})
    return () => ac.abort()
  }, [revenueFilter])

  if (!session) return null

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Filter bar */}
      <motion.div variants={itemVariants}
        className="inline-flex gap-1 p-1 rounded-xl bg-white/[0.05] border border-white/[0.08]"
      >
        {([['1', 'ماه'], ['3', '۳ ماه'], ['6', '۶ ماه'], ['net', 'خالص']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setRevenueFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              revenueFilter === key ? 'bg-amber-500 text-white shadow-lg shadow-amber-900/30' : 'text-gray-400 hover:text-white'
            }`}
          >{label}</button>
        ))}
      </motion.div>

      {revStats && (
      <motion.div variants={itemVariants}
        className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">آمار بازده</h3>
          {revStats && (
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg font-bold">{revStats.winRate}% موفقیت</span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="grid grid-cols-3 gap-2">
            {revSignals.length > 0 && (() => {
              const total = revSignals.length
              const wins = revSignals.filter((s: any) => (s.actualReturn ?? 0) > 0).length
              const withR = revSignals.filter((s: any) => s.actualReturn !== null && s.actualReturn !== undefined)
              const avgR = withR.length > 0 ? withR.reduce((s: number, o: any) => s + (o.actualReturn ?? 0), 0) / withR.length : 0
              const bestR = withR.length > 0 ? Math.max(...withR.map((s: any) => s.actualReturn ?? 0)) : 0
              const netRev = revenueFilteredMonths.length > 0 ? revenueFilteredMonths.reduce((s: number, r: any) => s + r.amount, 0) : 0
              return (<>
                <div className="bg-white/[0.05] rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-gray-500 mb-0.5">برد</div>
                  <div className="text-sm font-black text-emerald-400">{wins}/{total}</div>
                </div>
                <div className="bg-white/[0.05] rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-gray-500 mb-0.5">میانگین</div>
                  <div className={`text-sm font-black ${avgR >= 0 ? 'text-amber-400' : 'text-red-400'}`}>{avgR >= 0 ? '+' : ''}{avgR.toFixed(1)}%</div>
                </div>
                <div className="bg-white/[0.05] rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-gray-500 mb-0.5">بهترین</div>
                  <div className="text-sm font-black text-emerald-400">+{bestR.toFixed(1)}%</div>
                </div>
                {revenueFilter === 'net' && (
                  <div className="bg-white/[0.05] rounded-xl p-2.5 text-center col-span-3">
                    <div className="text-[10px] text-gray-500 mb-0.5">خالص بازده</div>
                    <div className={`text-base font-black ${netRev >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{netRev >= 0 ? '+' : ''}{netRev.toFixed(1)}%</div>
                  </div>
                )}
              </>)
            })()}
          </div>
          <div className="bg-white/[0.05] rounded-xl p-3">
            <div className="text-[10px] text-gray-500 mb-2">
              {revenueFilter === 'net' ? 'بازده خالص' : `بازده ${revenueFilter === '1' ? 'ماه جاری' : revenueFilter === '3' ? 'سه ماه اخیر' : 'شش ماه اخیر'}`}
            </div>
            <div className="flex items-end gap-2" style={{ height: '80px' }}>
              {revenueFilter === 'net' ? (
                (() => {
                  const netRev = revenueFilteredMonths.length > 0 ? revenueFilteredMonths.reduce((s: number, r: any) => s + r.amount, 0) : 0
                  const maxAmt = Math.abs(netRev) || 1
                  const barH = Math.max(Math.round((netRev / maxAmt) * 70), netRev > 0 ? 4 : 0)
                  const isPos = netRev >= 0
                  return (
                    <div className="flex flex-col items-center gap-1 w-full">
                      <span className={`text-base font-black ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>{isPos ? '+' : ''}{netRev.toFixed(1)}%</span>
                      <div className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t" style={{ height: `${Math.max(barH, 8)}px` }} />
                    </div>
                  )
                })()
              ) : (
                revenueFilteredMonths.length > 0 ? (
                  [...revenueFilteredMonths].sort((a, b) => (b.year - a.year) || (b.month - a.month)).reverse().map((r: any) => {
                    const maxAmt = Math.max(...revenueFilteredMonths.map((x: any) => x.amount), 1)
                    const barPct = (r.amount / maxAmt)
                    const barH = Math.max(Math.round(barPct * 70), r.amount > 0 ? 4 : 0)
                    const isPos = r.amount >= 0
                    return (
                      <div key={`${r.year}-${r.month}`} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <span className={`text-[10px] font-bold tabular-nums ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>{isPos ? '+' : ''}{r.amount.toFixed(1)}%</span>
                        <div className={`w-full rounded-t ${isPos ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gradient-to-t from-red-600 to-red-400'}`} style={{ height: `${barH}px` }} />
                        <span className="text-[8px] text-gray-500">{persianMonthsShort[r.month - 1] || r.month}</span>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-xs text-gray-600">داده‌ای نیست</div>
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
      )}

      {/* Signal feed */}
      <motion.div variants={itemVariants}
        className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">خوراک سیگنال‌ها</h3>
        </div>
        <div className="space-y-2">
          {revSignals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Zap className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">هنوز سیگنالی نیست</p>
            </div>
          ) : (
            revSignals.slice(0, revenueFilter === 'net' ? 20 : 6).map((s: any) => {
              const isWin = (s.actualProfit ?? 0) > 0
              const sd = s.publishedAt ? new Date(s.publishedAt) : new Date()
              return (
                <div key={s.id}
                  className="rounded-xl px-3 py-2.5 cursor-pointer transition-all border border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.06]"
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
                        {s.actualProfit !== null && s.actualProfit !== undefined ? `${isWin ? '+' : ''}${s.actualProfit.toFixed(1)}%` : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500 font-semibold">{s.symbol}</span>
                    <span className="text-[10px] text-gray-500">{String(s.type) === 'crypto' ? 'ارز دیجیتال' : String(s.type) === 'stock' ? 'سهام' : String(s.type) === 'gold' ? 'طلا' : String(s.type) === 'dollar' ? 'دلار' : 'فارکس'}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </motion.div>

      {/* Signal Detail Modal */}
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
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex justify-between"><span className="text-gray-500">نماد</span><span className="text-white font-semibold">{selectedSignal.symbol}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">نوع</span><span className="text-white font-semibold">{String(selectedSignal.type) === 'crypto' ? 'ارز دیجیتال' : String(selectedSignal.type) === 'stock' ? 'سهام' : String(selectedSignal.type) === 'gold' ? 'طلا' : String(selectedSignal.type) === 'dollar' ? 'دلار' : 'فارکس'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">نوع معامله</span><span className={`font-bold ${selectedSignal.action === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>{selectedSignal.action === 'buy' ? 'خرید' : 'فروش'}</span></div>
              {selectedSignal.entryPrice && <div className="flex justify-between"><span className="text-gray-500">قیمت ورود</span><span className="text-white font-semibold">{selectedSignal.entryPrice.toLocaleString()}</span></div>}
              {selectedSignal.targetPrice && <div className="flex justify-between"><span className="text-gray-500">قیمت هدف</span><span className="text-emerald-400 font-semibold">{selectedSignal.targetPrice.toLocaleString()}</span></div>}
              {selectedSignal.stopLoss && <div className="flex justify-between"><span className="text-gray-500">حد ضرر</span><span className="text-red-400 font-semibold">{selectedSignal.stopLoss.toLocaleString()}</span></div>}
              {selectedSignal.actualProfit !== null && selectedSignal.actualProfit !== undefined && (
                <div className="flex justify-between"><span className="text-gray-500">بازده واقعی</span><span className={`font-black ${(selectedSignal.actualProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{(selectedSignal.actualProfit ?? 0) >= 0 ? '+' : ''}{selectedSignal.actualProfit.toFixed(2)}%</span></div>
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
    </motion.div>
  )
}
