'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function PricesPage() {
  const [prices, setPrices] = useState<Record<string, { price: number; currency: string }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/prices').then(r => r.json()).then(d => {
      const m: Record<string, { price: number; currency: string }> = {}
      for (const [k, v] of Object.entries(d) as [string, any][]) m[k] = v
      setPrices(m)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl md:text-3xl font-black mb-8">قیمت‌های به‌روز</h1>

      {loading ? (
        <p className="text-gray-500">در حال دریافت قیمت‌ها...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(prices).map(([symbol, data]) => (
            <motion.div key={symbol} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <div className="font-bold text-lg">{symbol}</div>
              <div className="text-2xl font-black text-blue-400 mt-1">
                {data.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">{data.currency === 'USD' ? 'دلار' : 'تومان'}</div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
