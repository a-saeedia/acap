'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '@/lib/auth-client'
import { useLang } from '@/components/lang-provider'
import { Zap, TrendingUp, BarChart3, X } from 'lucide-react'

const persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const englishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function fmtPct(v: number) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

export default function RevenuePage() {
  const { data: session } = useSession()
  const { t, lang } = useLang()
  const [signals, setSignals] = useState<any[]>([])
  const [monthlyRev, setMonthlyRev] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'1' | '3' | '6' | 'all'>('3')
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    const monthsParam = filter === 'all' ? '' : `?months=${filter}`
    const userIdParam = session?.user?.id ? `&userId=${session.user.id}` : ''
    fetch('/api/signals' + monthsParam + userIdParam)
      .then(r => r.json())
      .then(d => {
        setSignals(d?.signals || [])
        setMonthlyRev(d?.revenue || [])
      }).catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  const stats = useMemo(() => {
    const total = signals.length
    if (!total) return null
    const withR = signals.filter(s => s.actualReturn !== null && s.actualReturn !== undefined)
    const returns = withR.map(s => s.actualReturn)
    const wins = returns.filter(r => r > 0)
    const losses = returns.filter(r => r < 0)
    const grossWin = wins.reduce((a, b) => a + b, 0)
    const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0))
    return {
      total,
      wins: wins.length,
      losses: losses.length,
      winRate: total ? Math.round((wins.length / total) * 100) : 0,
      avgWin: wins.length ? grossWin / wins.length : 0,
      avgLoss: losses.length ? grossLoss / losses.length : 0,
      totalPnl: returns.reduce((a, b) => a + b, 0),
      profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0,
      bestTrade: returns.length ? Math.max(...returns) : 0,
      worstTrade: returns.length ? Math.min(...returns) : 0,
    }
  }, [signals])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h1 className="text-base font-black text-white">A|CAP Revenue</h1>
        </div>
        <span className="text-[10px] text-gray-500">{t('rev.signals.count').replace('{{count}}', String(signals.length))}</span>
      </div>

      {/* Filter bar */}
      <div className="inline-flex gap-1 p-1 rounded-xl bg-white/[0.05] border border-white/[0.08]">
        {([['1', t('rev.filter.1m')], ['3', t('rev.filter.3m')], ['6', t('rev.filter.6m')], ['all', t('rev.filter.all')]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === k ? 'bg-amber-500 text-white shadow-lg shadow-amber-900/30' : 'text-gray-400 hover:text-white'
            }`}
          >{label}</button>
        ))}
      </div>

      {/* Total P&L Hero */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 text-center"
        >
          <div className="text-[10px] text-gray-500 mb-1">{t('rev.total.pnl')}</div>
          <div className={`text-3xl font-black tabular-nums ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmtPct(stats.totalPnl)}
          </div>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-[11px] text-emerald-400 font-bold">{t('rev.wins').replace('{{count}}', String(stats.wins))}</span>
            <span className="text-[11px] text-gray-600">|</span>
            <span className="text-[11px] text-red-400 font-bold">{t('rev.losses').replace('{{count}}', String(stats.losses))}</span>
            <span className="text-[11px] text-gray-600">|</span>
            <span className="text-[11px] text-gray-400 font-bold">{t('rev.win.rate').replace('{{rate}}', String(stats.winRate))}</span>
          </div>
        </motion.div>
      )}

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: t('rev.avg.win'), value: fmtPct(stats.avgWin), color: 'text-emerald-400' },
            { label: t('rev.avg.loss'), value: fmtPct(stats.avgLoss), color: 'text-red-400' },
            { label: t('rev.profit.factor'), value: stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2), color: stats.profitFactor >= 1.5 ? 'text-emerald-400' : 'text-amber-400' },
            { label: t('rev.best.trade'), value: fmtPct(stats.bestTrade), color: 'text-emerald-400' },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-3 text-center"
            >
              <div className="text-[9px] text-gray-500 mb-1">{item.label}</div>
              <div className={`text-sm font-black tabular-nums ${item.color}`}>{item.value}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Monthly bar chart */}
      {monthlyRev.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">{t('rev.monthly.return')}</h3>
          </div>
          <div className="flex items-end gap-1.5" style={{ height: '100px' }}>
            {(() => {
              const sorted = [...monthlyRev].sort((a, b) => (a.year - b.year) || (a.month - b.month))
              const maxAbs = Math.max(...sorted.map(r => Math.abs(r.amount)), 1)
              return sorted.map(r => {
                const isPos = r.amount >= 0
                const pct = Math.abs(r.amount) / maxAbs
                const h = Math.max(Math.round(pct * 80), 4)
                return (
                  <div key={`${r.year}-${r.month}`} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span className={`text-[9px] font-bold tabular-nums ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPos ? '+' : ''}{r.amount.toFixed(1)}%
                    </span>
                    <div
                      className={`w-full rounded-t ${isPos ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gradient-to-t from-red-600 to-red-400'}`}
                      style={{ height: `${h}px` }}
                    />
                    <span className="text-[7px] text-gray-500">{(lang === 'fa' ? persianMonths : englishMonths)[r.month - 1]?.slice(0, 2) || r.month}</span>
                  </div>
                )
              })
            })()}
          </div>
        </motion.div>
      )}

      {/* Signal feed */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.05] border border-white/[0.08] rounded-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2 p-4 pb-3">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">{t('rev.signals')}</h3>
        </div>
        {signals.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-gray-500">
            <Zap className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">{t('rev.no.signals')}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {signals.map((s) => {
              const ret = s.actualReturn
              const isWin = ret !== null && ret !== undefined && ret > 0
              return (
                <div key={s.id}
                  className="px-4 py-3 cursor-pointer transition-all hover:bg-white/[0.03] active:bg-white/[0.05]"
                  onClick={() => setSelected(s)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isWin ? 'bg-emerald-400' : ret !== null && ret !== undefined ? 'bg-red-400' : 'bg-gray-600'}`} />
                      <span className="text-[13px] font-bold text-white truncate">{s.title}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                        s.action === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>{s.action === 'buy' ? 'BUY' : 'SELL'}</span>
                    </div>
                    <span className={`text-[12px] font-black tabular-nums shrink-0 ${isWin ? 'text-emerald-400' : ret !== null && ret !== undefined ? 'text-red-400' : 'text-gray-600'}`}>
                      {ret !== null && ret !== undefined ? fmtPct(ret) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 mr-3">
                    <span className="text-[10px] text-gray-500">{s.symbol}</span>
                    <span className="text-[10px] text-gray-600">•</span>
                    <span className="text-[10px] text-gray-500">
                      {String(s.type) === 'crypto' ? t('asset.crypto.long') : String(s.type) === 'stock' ? t('asset.stock.market') : String(s.type) === 'gold' ? t('asset.gold') : String(s.type) === 'dollar' ? t('asset.dollar') : t('asset.forex')}
                    </span>
                    <span className="text-[10px] text-gray-600">•</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(s.publishedAt || s.createdAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-[#1c1f2e] border border-[#2a2d3a] shadow-2xl p-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">{selected.title}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  {selected.actualReturn !== null && selected.actualReturn !== undefined && (
                    <div className="bg-white/[0.05] rounded-xl p-3 text-center">
                      <div className="text-[9px] text-gray-500 mb-0.5">{t('rev.return')}</div>
                      <div className={`text-base font-black ${selected.actualReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmtPct(selected.actualReturn)}
                      </div>
                    </div>
                  )}
                  <div className="bg-white/[0.05] rounded-xl p-3 text-center">
                    <div className="text-[9px] text-gray-500 mb-0.5">{t('rev.action')}</div>
                    <div className={`text-sm font-bold ${selected.action === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selected.action === 'buy' ? t('rev.buy') : t('rev.sell')}
                    </div>
                  </div>
                </div>
                <div className="bg-white/[0.05] rounded-xl p-3 space-y-2">
                  <InfoRow label={t('rev.symbol')} value={selected.symbol} />
                  <InfoRow label={t('rev.type')} value={String(selected.type) === 'crypto' ? t('asset.crypto.long') : String(selected.type) === 'stock' ? t('asset.stock.market') : String(selected.type) === 'gold' ? t('asset.gold') : String(selected.type) === 'dollar' ? t('asset.dollar') : t('asset.forex')} />
                  {selected.entryPrice != null && <InfoRow label={t('rev.entry.price')} value={selected.entryPrice.toLocaleString()} />}
                  {selected.targetPrice != null && <InfoRow label={t('rev.target.price')} value={selected.targetPrice.toLocaleString()} valueClass="text-emerald-400" />}
                  {selected.stopLoss != null && <InfoRow label={t('rev.stop.loss')} value={selected.stopLoss.toLocaleString()} valueClass="text-red-400" />}
                  <InfoRow label={t('rev.date')} value={new Date(selected.publishedAt || selected.createdAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')} />
                </div>
                {selected.description && (
                  <div className="bg-white/[0.05] rounded-xl p-3">
                    <div className="text-[9px] text-gray-500 mb-1">{t('rev.description')}</div>
                    <p className="text-[12px] text-gray-300 leading-6 whitespace-pre-wrap">{selected.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InfoRow({ label, value, valueClass }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className={`text-[12px] font-semibold text-white ${valueClass || ''}`}>{value}</span>
    </div>
  )
}
