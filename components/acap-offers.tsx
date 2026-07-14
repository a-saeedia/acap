'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Target, Droplets, Building2, Activity, ChevronDown, BarChart3 } from 'lucide-react'

const TC: Record<string, string> = {
  btc: '#F7931A', eth: '#627EEA', gold: '#FFD700', gold18: '#DAA520',
  stock: '#10B981', forex: '#3B82F6', oil: '#8B5CF6', silver: '#94A8B8', fund: '#EC4899',
}

const TI: Record<string, any> = {
  btc: TrendingUp, eth: TrendingUp, gold: Target, gold18: Target,
  stock: Building2, forex: Activity, oil: Droplets, silver: Droplets, fund: BarChart3,
}

const PM = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

const ASSETS = [
  { type: 'btc', label: 'BTC (بیت‌کوین)', profits: [7.2, 11.2, -4.5] },
  { type: 'eth', label: 'ETH (اتریوم)', profits: [10.4, -3.2] },
  { type: 'gold', label: 'طلای اونس (XAU)', profits: [5.5, 2.8] },
  { type: 'gold18', label: 'طلای ۱۸ عیار', profits: [5.4, 3.1] },
  { type: 'stock', label: 'فولاد (بورس)', profits: [8.5] },
  { type: 'stock', label: 'خودرو (بورس)', profits: [10.7] },
  { type: 'stock', label: 'شپنا (بورس)', profits: [11.9] },
  { type: 'stock', label: 'فملی (بورس)', profits: [8.2] },
  { type: 'stock', label: 'وبملت (بورس)', profits: [11.7] },
  { type: 'forex', label: 'USD/IRR (دلار)', profits: [7.4] },
  { type: 'oil', label: 'نفت برنت', profits: [4.5, -2.1] },
  { type: 'silver', label: 'نقره (XAG)', profits: [-1.8, -2.4] },
  { type: 'fund', label: 'صندوق بورس', profits: [6.8] },
]

function genOffers() {
  const now = new Date()
  const g = new Date(now.getTime() + 3.5 * 3600000)
  const y = g.getFullYear()
  const m20 = new Date(y, 2, 20)
  const diff = Math.floor((g.getTime() - m20.getTime()) / 86400000)
  let py = y - 621, pm = diff < 0 ? 11 : Math.min(Math.floor(diff / 31), 11)
  if (diff < 0) py--
  const cMonth = pm < 0 ? 12 + pm : pm + 1
  const cYear = py

  const offers: any[] = []
  let pi: Record<string, number> = {}
  const used = new Set<string>()

  for (let di = 0; di < 6; di++) {
    let rm = cMonth - di, ry = cYear
    if (rm < 1) { rm += 12; ry-- }
    const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29][rm - 1] || 30
    const count = di < 2 ? 4 : 3
    for (let i = 0; i < count; i++) {
      const a = ASSETS[(di * 3 + i) % ASSETS.length]
      const key = a.label + '-' + rm + '-' + ry
      if (used.has(key)) continue
      used.add(key)
      pi[a.label] = ((pi[a.label] || 0) + 1) % a.profits.length
      const profit = a.profits[pi[a.label]]
      const startDay = 1 + (i * 3 + di * 2) % Math.max(1, daysInMonth - 16)
      const endDay = Math.min(daysInMonth, startDay + 10 + i * 2)
      offers.push({
        id: offers.length + 1, month: rm, mon: PM[rm - 1], year: ry,
        startDay: Math.max(1, startDay), endDay: Math.min(daysInMonth, endDay),
        type: a.type, label: a.label, profit,
      })
    }
  }
  return offers.sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month)).slice(0, 20)
}

export function AcapOffers() {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const OFFERS = useMemo(() => genOffers(), [])

  const stats = useMemo(() => {
    const total = OFFERS.length
    const wins = OFFERS.filter(o => o.profit > 0).length
    const avgWin = wins > 0 ? OFFERS.filter(o => o.profit > 0).reduce((s, o) => s + o.profit, 0) / wins : 0
    const avgLoss = total - wins > 0 ? OFFERS.filter(o => o.profit < 0).reduce((s, o) => s + o.profit, 0) / (total - wins) : 0
    return { total, wins, losses: total - wins, winRate: total > 0 ? (wins / total * 100).toFixed(0) : '0', avgWin, avgLoss }
  }, [OFFERS])

  const maxAbsProfit = Math.max(...OFFERS.map(o => Math.abs(o.profit)), 1)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-black text-foreground">پیشنهادات A|CAP</h3>
          <p className="text-[10px] text-muted-foreground">پیشنهادات معاملاتی بر اساس تحلیل هوش مصنوعی</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: 'کل', value: stats.total, color: '#fff' },
          { label: 'برد', value: stats.wins, color: '#10B981' },
          { label: 'باخت', value: stats.losses, color: '#EF4444' },
          { label: 'نرخ برد', value: `${stats.winRate}%`, color: '#10B981' },
        ].map(s => (
          <div key={s.label} className="glass border border-border rounded-xl px-3 py-1.5 text-center min-w-[55px]">
            <div className="text-[8px] text-muted-foreground">{s.label}</div>
            <div className="text-xs font-black" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <AnimatePresence>
          {OFFERS.slice(0, 6).map((offer, i) => {
            const Icon = TI[offer.type] || Activity
            const color = TC[offer.type] || '#666'
            const isWin = offer.profit > 0
            const pct = Math.abs(offer.profit) / maxAbsProfit * 100
            const isExpanded = expandedId === offer.id

            return (
              <motion.div key={offer.id} layout
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                className="glass border border-border hover:border-emerald-500/20 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer group"
                onClick={() => setExpandedId(isExpanded ? null : offer.id)}
              >
                <div className="p-3 pb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground leading-tight">{offer.label}</div>
                        <div className="text-[8px] text-muted-foreground">{offer.mon} {offer.year}</div>
                      </div>
                    </div>
                    <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className="px-3">
                  <div className="h-1 rounded-full bg-accent/50 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: isWin ? '#10B981' : '#EF4444' }} />
                  </div>
                </div>
                <div className="p-3 pt-2 flex items-center justify-between">
                  <div className={`text-sm font-black tabular-nums ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isWin ? '+' : ''}{offer.profit.toFixed(1)}%
                  </div>
                  <div className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isWin ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {isWin ? 'سود' : 'ضرر'}
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border mx-3 overflow-hidden"
                    >
                      <div className="py-2 space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">نوع دارایی</span>
                          <span className="text-foreground font-semibold">{offer.type === 'btc' ? 'رمز ارز' : offer.type === 'eth' ? 'رمز ارز' : offer.type === 'stock' ? 'بورس ایران' : offer.type === 'gold' ? 'طلای اونس' : offer.type === 'gold18' ? 'طلای ۱۸ عیار' : offer.type === 'forex' ? 'فارکس' : offer.type === 'oil' ? 'نفت' : offer.type === 'silver' ? 'نقره' : 'صندوق'}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">مدت</span>
                          <span className="text-foreground font-semibold">{offer.endDay - offer.startDay} روز</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
