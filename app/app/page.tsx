'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMyAssets } from '@/app/actions/assets'

type Asset = Awaited<ReturnType<typeof getMyAssets>>[number]

const TYPE_LABELS: Record<string, string> = {
  crypto: 'رمز ارز', stock: 'بورس', gold: 'طلا', currency: 'ارز', other: 'سایر',
}
const TYPE_COLORS: Record<string, string> = {
  crypto: '#F59E0B', stock: '#3B82F6', gold: '#F59E0B', currency: '#10B981', other: '#8B5CF6',
}

export default function AppPage() {
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl md:text-3xl font-black mb-8">خلاصه Portfolio</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'کل دارایی‌ها', value: assets.length, color: '#3B82F6' },
          { label: 'ارزش کل', value: totalValue.toLocaleString(), color: '#10B981', unit: 'تومان' },
          { label: 'سود/زیان', value: `${profit >= 0 ? '+' : ''}${profit.toLocaleString()}`, color: profit >= 0 ? '#10B981' : '#EF4444', unit: 'تومان' },
          { label: 'درصد سود', value: `${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(1)}`, color: profitPercent >= 0 ? '#10B981' : '#EF4444', unit: '%' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
          >
            <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* By type */}
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
                      <div className="text-sm font-semibold">{value.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">تومان</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
