'use client'

import { useState, useEffect } from 'react'
import { Zap, TrendingUp, Award, Activity } from 'lucide-react'

export function RevenueWidget() {
  const [signals, setSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/signals')
      .then(r => r.json())
      .then(d => setSignals(d.signals || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const total = signals.length
  const wins = signals.filter((s: any) => (s.actualReturn ?? 0) > 0).length
  const winRate = total > 0 ? Math.round(wins / total * 100) : 0
  const withReturn = signals.filter((s: any) => s.actualReturn !== null && s.actualReturn !== undefined)
  const avgReturn = withReturn.length > 0 ? withReturn.reduce((s: number, o: any) => s + (o.actualReturn ?? 0), 0) / withReturn.length : 0
  const bestReturn = withReturn.length > 0 ? Math.max(...withReturn.map((s: any) => s.actualReturn ?? 0)) : 0

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-6xl mx-auto" dir="rtl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5" /> A|CAP Revenue
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">عملکرد سیگنال‌های A|CAP</h2>
          <p className="text-sm text-gray-400 mt-2">درصد بازده واقعی تمام سیگنال‌های صادره</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : total === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">هنوز سیگنالی ثبت نشده</p>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
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
            </div>

            {/* Monthly performance */}
            {signals.length > 0 && (
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-gray-400 mb-3">عملکرد ماهانه</h3>
                <div className="space-y-2">
                  {(() => {
                    const months: Record<string, { count: number; profit: number; wins: number }> = {}
                    for (const s of signals) {
                      const d = s.publishedAt ? new Date(s.publishedAt) : new Date()
                      const key = d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' })
                      if (!months[key]) months[key] = { count: 0, profit: 0, wins: 0 }
                      months[key].count++
                      if (s.actualReturn !== null) {
                        months[key].profit += s.actualReturn
                        if (s.actualReturn > 0) months[key].wins++
                      }
                    }
                    return Object.entries(months).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6).map(([month, data]) => {
                      const avg = data.count > 0 ? data.profit / data.count : 0
                      const wr = data.count > 0 ? Math.round(data.wins / data.count * 100) : 0
                      const barW = Math.min(Math.abs(avg) * 3, 100)
                      return (
                        <div key={month} className="flex items-center gap-3 text-xs">
                          <span className="text-gray-400 w-28 shrink-0">{month}</span>
                          <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${avg >= 0 ? 'bg-emerald-500/60' : 'bg-red-500/60'}`}
                              style={{ width: `${barW}%`, direction: 'ltr' }}
                            />
                          </div>
                          <span className={`font-bold w-12 text-left ${avg >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {avg >= 0 ? '+' : ''}{avg.toFixed(1)}%
                          </span>
                          <span className="text-gray-500 w-6 text-left">{wr}%</span>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
