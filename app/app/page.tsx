'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getMyAssets } from '@/app/actions/assets'
import { formatToman } from '@/lib/utils'

type Asset = Awaited<ReturnType<typeof getMyAssets>>[number]

const TYPE_LABELS: Record<string, string> = {
  crypto: 'رمز ارز', stock: 'بورس', gold: 'طلا', currency: 'ارز', cash: 'وجه نقد', other: 'سایر',
}
const TYPE_COLORS: Record<string, string> = {
  crypto: '#F59E0B', stock: '#3B82F6', gold: '#F59E0B', currency: '#10B981', cash: '#22C55E', other: '#8B5CF6',
}

export default function AppPage() {
  const router = useRouter()

  useEffect(() => { router.replace('/app/assets') }, [])

  const [assets, setAssets] = useState<Asset[]>([])
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getMyAssets().then(setAssets),
      fetch('/api/prices').then(r => r.json()).then(d => {
        const m: Record<string, number> = {}
        if (d.prices) for (const [k, v] of Object.entries(d.prices) as [string, any][]) m[k] = v.price
        if (d.stockPrices) for (const [k, v] of Object.entries(d.stockPrices) as [string, any][]) m[k] = v.price
        setPrices(m)
      }).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  function getPriceToman(symbol: string): number {
    const p = prices[symbol]
    if (!p) return 0
    const usdRate = prices['USD-IRR'] || prices['USDT-IRR']
    if (typeof p === 'number' && usdRate && symbol !== 'USD-IRR' && symbol !== 'USDT-IRR' && symbol !== 'EUR-IRR') {
      return p * usdRate / 10
    }
    return p / 10
  }

  const totalValue = assets.reduce((sum, a) => sum + getPriceToman(a.symbol) * a.quantity, 0)
  const totalCost = assets.reduce((sum, a) => sum + ((a.purchasePrice || 0) * a.quantity), 0)
  const profit = totalValue - totalCost
  const profitPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0

  const byType: Record<string, { count: number; value: number }> = {}
  for (const a of assets) {
    const price = getPriceToman(a.symbol)
    byType[a.type] ??= { count: 0, value: 0 }
    byType[a.type].count++
    byType[a.type].value += a.quantity * price
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const hasAssets = assets.length > 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-black">خلاصه Portfolio</h1>
        <button onClick={() => router.push('/app/assets')}
          className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors"
        >
          مدیریت دارایی‌ها ←
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'کل دارایی‌ها', value: hasAssets ? assets.length.toString() : '—', color: '#3B82F6' },
          { label: 'ارزش کل', value: hasAssets ? formatToman(totalValue) : '—', color: '#10B981' },
          { label: 'سود/زیان', value: hasAssets ? `${profit >= 0 ? '+' : ''}${formatToman(profit)}` : '—', color: profit >= 0 ? '#10B981' : '#EF4444' },
          { label: 'درصد سود', value: hasAssets ? `${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(1)}%` : '—', color: profitPercent >= 0 ? '#10B981' : '#EF4444' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
          >
            <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {!hasAssets && (
        <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-2xl mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
          <h3 className="text-xl font-bold mb-2">هنوز دارایی ثبت نکرده‌اید</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">اولین دارایی خود را اضافه کنید تا مدیریت سبد سرمایه آغاز شود</p>
          <button onClick={() => router.push('/app/assets')}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
          >
            افزودن دارایی
          </button>
        </div>
      )}

      {/* By type */}
      {hasAssets && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4">توزیع دارایی‌ها</h2>
            {Object.keys(byType).length === 0 ? (
              <p className="text-gray-500 text-sm">هیچ دارایی ثبت نشده</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(byType).map(([type, data]) => {
                  const pct = totalValue > 0 ? (data.value / totalValue) * 100 : 0
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{TYPE_LABELS[type] || type}</span>
                        <span className="text-gray-400">{pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          className="h-full rounded-full" style={{ background: TYPE_COLORS[type] || '#3B82F6' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4">دارایی‌های اخیر</h2>
            {assets.length === 0 ? (
              <p className="text-gray-500 text-sm">هنوز دارایی ثبت نکرده‌اید</p>
            ) : (
              <div className="space-y-2">
                {assets.slice(0, 5).map(a => {
                  const price = prices[a.symbol] || 0
                  const value = a.quantity * price
                  return (
                    <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <div>
                        <div className="font-semibold text-sm">{a.label}</div>
                        <div className="text-xs text-gray-500">{a.symbol} · {a.quantity.toLocaleString()}</div>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">{value.toLocaleString()} تومان</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
