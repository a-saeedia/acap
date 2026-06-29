'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '@/lib/auth-client'
import { getMyAssets, createAsset, updateAsset, deleteAsset } from '@/app/actions/assets'
import {
  Plus, Trash2, Edit3, X, Search, RefreshCw,
  TrendingUp, TrendingDown, Wallet, Loader2, Clock, Bitcoin, PieChart,
} from 'lucide-react'

type Asset = Awaited<ReturnType<typeof getMyAssets>>[number]

type PriceEntry = { price: number; currency: string }
type PriceMap = Record<string, PriceEntry>

type AssetForm = {
  type: string
  symbol: string
  label: string
  quantity: number
  purchasePrice?: number
  purchaseDate?: string
  notes?: string
}

type IranStock = {
  id: string
  symbol: string
  name: string
  sector: string | null
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string; gradient: string }> = {
  crypto: { label: 'رمز ارز', icon: '₿', color: '#F59E0B', gradient: 'from-amber-500/20 to-yellow-600/10' },
  stock: { label: 'بورس ایران', icon: '📈', color: '#2979FF', gradient: 'from-blue-500/20 to-blue-600/10' },
  gold: { label: 'طلا', icon: '🥇', color: '#F59E0B', gradient: 'from-yellow-500/20 to-amber-600/10' },
  currency: { label: 'ارز', icon: '💵', color: '#10B981', gradient: 'from-emerald-500/20 to-green-600/10' },
  other: { label: 'سایر', icon: '💰', color: '#8B5CF6', gradient: 'from-purple-500/20 to-violet-600/10' },
}

const ASSET_TYPES = [
  { value: 'crypto', label: 'رمز ارز' },
  { value: 'stock', label: 'بورس ایران' },
  { value: 'gold', label: 'طلا' },
  { value: 'currency', label: 'ارز' },
  { value: 'other', label: 'سایر' },
]

const QUICK_CRYPTO = ['BTC', 'ETH', 'USDT', 'SOL', 'XRP', 'ADA', 'TRX', 'DOGE', 'BNB']
const QUICK_CURRENCY = ['USD', 'EUR', 'AED', 'TRY']
const QUICK_GOLD = [{ symbol: 'GOLD', label: 'طلای ۱۸ عیار' }]

const INITIAL_FORM: AssetForm = {
  type: 'crypto',
  symbol: '',
  label: '',
  quantity: 0,
  purchasePrice: undefined,
  purchaseDate: '',
  notes: '',
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(2) + ' تریلیون'
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + ' میلیارد'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + ' میلیون'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + ' هزار'
  return n.toLocaleString('fa-IR')
}

function formatQuantity(n: number, symbol: string): string {
  const cryptoLike = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOT', 'LINK', 'AVAX', 'MATIC']
  if (cryptoLike.includes(symbol.toUpperCase())) {
    if (n < 0.001) return n.toFixed(8)
    if (n < 1) return n.toFixed(4)
    return n.toLocaleString('fa-IR', { maximumFractionDigits: 4 })
  }
  if (n < 1) return n.toFixed(2)
  return n.toLocaleString('fa-IR', { maximumFractionDigits: 0 })
}

function getAssetPriceIr(
  symbol: string,
  prices: PriceMap,
  stockPrices: Record<string, number>
): number {
  if (stockPrices[symbol] !== undefined) return stockPrices[symbol]
  const irrKey = `${symbol}-IRR`
  if (prices[irrKey]) return prices[irrKey].price
  const direct = prices[symbol]
  if (!direct) return 0
  if (direct.currency === 'IRR') return direct.price
  if (direct.currency === 'USD') {
    const usdRate = prices['USDT-IRR']?.price
    if (usdRate) return direct.price * usdRate
  }
  return 0
}

function getTotalCost(asset: Asset): number {
  return (asset.purchasePrice ?? 0) * asset.quantity
}

function getCurrentValue(asset: Asset, prices: PriceMap, stockPrices: Record<string, number>): number {
  return getAssetPriceIr(asset.symbol, prices, stockPrices) * asset.quantity
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)
  const rafRef = useRef<number>()

  useEffect(() => {
    const start = prevRef.current
    const diff = value - start
    if (Math.abs(diff) < 0.5) {
      setDisplay(value)
      prevRef.current = value
      return
    }
    const startTime = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + diff * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
      else prevRef.current = value
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration])

  return <>{Math.round(display).toLocaleString('fa-IR')}</>
}

function InvestorTypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type]
  if (!cfg) return null
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
    >
      <span className="text-sm">{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}

function typeIcon(type: string): string {
  return TYPE_CONFIG[type]?.icon ?? '💰'
}

export function PortfolioDashboard() {
  const { data: session, isPending } = useSession()
  const [assets, setAssets] = useState<Asset[]>([])
  const [prices, setPrices] = useState<PriceMap>({})
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [priceLoading, setPriceLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AssetForm>(INITIAL_FORM)
  const [stockSearch, setStockSearch] = useState('')
  const [stockResults, setStockResults] = useState<IranStock[]>([])
  const [stockSearching, setStockSearching] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()
  const [submitting, setSubmitting] = useState(false)

  const fetchPrices = useCallback(async () => {
    setPriceLoading(true)
    try {
      const res = await fetch('/api/prices')
      const data: PriceMap = await res.json()
      setPrices(data)

      const stockSymbols = assets.filter(a => a.type === 'stock').map(a => a.symbol)
      if (stockSymbols.length > 0) {
        const sp: Record<string, number> = {}
        await Promise.all(
          [...new Set(stockSymbols)].map(async (sym) => {
            try {
              const r = await fetch(`/api/iran-stocks/price?symbol=${encodeURIComponent(sym)}`)
              if (r.ok) {
                const d = await r.json()
                sp[sym] = d.price
              }
            } catch {}
          })
        )
        setStockPrices(sp)
      }
      setLastUpdate(new Date())
    } catch {}
    setPriceLoading(false)
  }, [assets])

  const fetchAll = useCallback(async () => {
    try {
      const [a] = await Promise.all([getMyAssets()])
      setAssets(a)
    } catch {}
  }, [])

  useEffect(() => {
    if (isPending) return
    Promise.all([
      fetchAll(),
      fetch('/api/prices').then(r => r.json()).then(setPrices).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [isPending, fetchAll])

  useEffect(() => {
    if (loading) return
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [loading, fetchPrices])

  useEffect(() => {
    if (!showModal || form.type !== 'stock') {
      setStockSearch('')
      setStockResults([])
      return
    }
  }, [showModal, form.type])

  useEffect(() => {
    if (form.type !== 'stock' || !stockSearch.trim()) {
      setStockResults([])
      return
    }
    clearTimeout(searchTimer.current)
    setStockSearching(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/iran-stocks?search=${encodeURIComponent(stockSearch.trim())}`)
        if (res.ok) setStockResults(await res.json())
      } catch {}
      setStockSearching(false)
    }, 400)
    return () => clearTimeout(searchTimer.current)
  }, [stockSearch, form.type])

  useEffect(() => {
    if (!lastUpdate || priceLoading) return
    fetchPrices()
  }, [assets.length])

  const totalValue = assets.reduce((sum, a) => sum + getCurrentValue(a, prices, stockPrices), 0)
  const totalCost = assets.reduce((sum, a) => sum + getTotalCost(a), 0)
  const profit = totalValue - totalCost
  const profitPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0

  const byType: Record<string, { count: number; value: number; cost: number }> = {}
  for (const a of assets) {
    byType[a.type] ??= { count: 0, value: 0, cost: 0 }
    byType[a.type].count++
    byType[a.type].value += getCurrentValue(a, prices, stockPrices)
    byType[a.type].cost += getTotalCost(a)
  }

  function openAdd() {
    setForm(INITIAL_FORM)
    setEditingId(null)
    setShowModal(true)
  }

  function openEdit(a: Asset) {
    setForm({
      type: a.type,
      symbol: a.symbol,
      label: a.label,
      quantity: a.quantity,
      purchasePrice: a.purchasePrice ?? undefined,
      purchaseDate: a.purchaseDate ? new Date(a.purchaseDate).toISOString().split('T')[0] : '',
      notes: a.notes ?? '',
    })
    setEditingId(a.id)
    setShowModal(true)
  }

  async function handleSubmit() {
    if (!form.label || !form.quantity) return
    setSubmitting(true)
    try {
      if (editingId) {
        await updateAsset(editingId, form)
      } else {
        await createAsset(form)
      }
      setShowModal(false)
      setForm(INITIAL_FORM)
      setEditingId(null)
      const [a] = await Promise.all([getMyAssets()])
      setAssets(a)
    } catch {}
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    await deleteAsset(id)
    setAssets(await getMyAssets())
  }

  function handleQuickSymbol(sym: string, label?: string) {
    setForm(prev => ({
      ...prev,
      symbol: sym,
      label: label ?? sym,
    }))
  }

  function selectStock(stock: IranStock) {
    setForm(prev => ({
      ...prev,
      symbol: stock.symbol,
      label: stock.name,
    }))
    setStockSearch('')
    setStockResults([])
  }

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div dir="rtl">
      {/* Summary Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      >
        <div className="glass border border-border rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #2979FF, #10B981)' }} />
          <div className="text-muted-foreground text-xs mb-1.5 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            ارزش کل سبد
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground">
            <AnimatedNumber value={totalValue} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">تومان</div>
        </div>

        <div className="glass border border-border rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: profit >= 0 ? '#10B981' : '#EF4444' }} />
          <div className="text-muted-foreground text-xs mb-1.5 flex items-center gap-1.5">
            {profit >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
            سود / زیان
          </div>
          <div className="text-xl sm:text-2xl font-black" style={{ color: profit >= 0 ? '#10B981' : '#EF4444' }}>
            {profit >= 0 ? '+' : ''}<AnimatedNumber value={Math.abs(profit)} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">تومان</div>
        </div>

        <div className="glass border border-border rounded-2xl p-4 sm:p-5">
          <div className="text-muted-foreground text-xs mb-1.5">درصد سود</div>
          <div className="text-xl sm:text-2xl font-black" style={{ color: profitPercent >= 0 ? '#10B981' : '#EF4444' }}>
            {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {totalCost > 0 ? 'از مجموع خرید' : '—'}
          </div>
        </div>

        <div className="glass border border-border rounded-2xl p-4 sm:p-5">
          <div className="text-muted-foreground text-xs mb-1.5">تعداد دارایی‌ها</div>
          <div className="text-xl sm:text-2xl font-black text-primary">
            {assets.length}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            در {Object.keys(byType).length} دسته
          </div>
        </div>
      </motion.div>

      {/* Second row: Allocation + Assets header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Allocation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass border border-border rounded-3xl p-5 sm:p-6"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <PieChart className="w-5 h-5 text-primary" />
            <h3 className="font-black text-base text-foreground">توزیع دارایی‌ها</h3>
          </div>
          {Object.keys(byType).length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">هنوز دارایی ثبت نشده</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(byType).map(([type, data]) => {
                const pct = totalValue > 0 ? (data.value / totalValue) * 100 : 0
                const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.other
                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cfg.icon}</span>
                        <span className="text-sm font-semibold text-foreground">{cfg.label}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-bold text-foreground">{pct.toFixed(1)}%</span>
                        <span className="text-[10px] text-muted-foreground mr-1.5">
                          {formatCurrency(data.value)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-accent rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: cfg.color }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Quick actions + price indicator */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass border border-border rounded-3xl p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Bitcoin className="w-5 h-5 text-primary" />
                <h3 className="font-black text-base text-foreground">مدیریت سبد دارایی</h3>
              </div>
              <button
                onClick={openAdd}
                className="btn-primary px-4 py-2 rounded-xl text-sm gap-1.5 flex items-center"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">افزودن دارایی</span>
              </button>
            </div>

            {/* Price refresh indicator */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {lastUpdate ? (
                  <span>آخرین به‌روزرسانی: {new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(lastUpdate)}</span>
                ) : (
                  <span>در انتظار دریافت قیمت‌ها...</span>
                )}
              </div>
              <button
                onClick={fetchPrices}
                disabled={priceLoading}
                className="flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${priceLoading ? 'animate-spin' : ''}`} />
                {priceLoading ? 'به‌روزرسانی قیمت‌ها...' : 'به‌روزرسانی'}
              </button>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass border border-border rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="text-xl mt-0.5">💡</div>
              <div>
                <p className="text-sm text-foreground font-semibold mb-0.5">قیمت‌ها هر ۳۰ ثانیه به‌روز می‌شوند</p>
                <p className="text-xs text-muted-foreground">
                  قیمت‌های طلا و ارز به صورت لحظه‌ای از بازار جهانی دریافت می‌شوند.
                  قیمت سهام بورس ایران به صورت شبیه‌سازی شده است.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Assets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg text-foreground">دارایی‌های من</h3>
          <span className="text-sm text-muted-foreground">{assets.length} مورد</span>
        </div>

        {assets.length === 0 ? (
          <div className="glass border border-border rounded-3xl p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-muted-foreground text-lg font-semibold mb-2">سبد دارایی شما خالی است</p>
            <p className="text-muted-foreground text-sm mb-6">اولین دارایی خود را اضافه کنید</p>
            <button onClick={openAdd} className="btn-primary px-6 py-3 rounded-xl text-sm font-bold gap-2 inline-flex items-center">
              <Plus className="w-4 h-4" />
              افزودن دارایی
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {assets.map((a, i) => {
                const price = getAssetPriceIr(a.symbol, prices, stockPrices)
                const value = price * a.quantity
                const cost = getTotalCost(a)
                const pnl = cost > 0 ? ((value - cost) / cost) * 100 : 0
                const cfg = TYPE_CONFIG[a.type] ?? TYPE_CONFIG.other
                return (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="glass border border-border rounded-2xl p-4 sm:p-5 hover:border-primary/20 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}
                        >
                          {cfg.icon}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground leading-tight">{a.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5" dir="ltr" style={{ textAlign: 'start' }}>
                            {a.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(a)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">تعداد</span>
                        <span className="text-foreground font-semibold font-mono" dir="ltr">
                          {formatQuantity(a.quantity, a.symbol)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">قیمت هر واحد</span>
                        <span className="text-foreground font-semibold font-mono" dir="ltr">
                          {price > 0 ? price.toLocaleString('fa-IR') : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">ارزش کل</span>
                        <span className="text-foreground font-bold font-mono" dir="ltr">
                          {formatCurrency(value)}
                        </span>
                      </div>
                      {cost > 0 && (
                        <div className="flex justify-between text-xs pt-1 border-t border-border/40">
                          <span className="text-muted-foreground">سود/زیان</span>
                          <span
                            className="font-bold"
                            style={{ color: pnl >= 0 ? '#10B981' : '#EF4444' }}
                          >
                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {a.purchaseDate && (
                      <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        خرید: {new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(a.purchaseDate))}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
            onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setForm(INITIAL_FORM) } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass border border-border rounded-3xl p-6 sm:p-7 w-full max-w-lg mx-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-black text-foreground">
                  {editingId ? 'ویرایش دارایی' : 'افزودن دارایی جدید'}
                </h2>
                <button
                  onClick={() => { setShowModal(false); setForm(INITIAL_FORM) }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Type selector */}
                <div>
                  <label className="text-xs text-muted-foreground font-semibold mb-2 block">نوع دارایی</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {ASSET_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setForm(prev => ({ ...INITIAL_FORM, type: t.value }))}
                        className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                          form.type === t.value
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-accent/30 text-muted-foreground border border-transparent hover:border-border'
                        }`}
                      >
                        <div className="text-base mb-0.5">{TYPE_CONFIG[t.value]?.icon}</div>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick-add symbols */}
                {form.type === 'crypto' && (
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-2 block">انتخاب سریع رمز ارز</label>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_CRYPTO.map(sym => (
                        <button
                          key={sym}
                          onClick={() => handleQuickSymbol(sym)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            form.symbol === sym
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-accent/30 text-muted-foreground border border-transparent hover:border-border'
                          }`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {form.type === 'currency' && (
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-2 block">انتخاب سریع ارز</label>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_CURRENCY.map(sym => (
                        <button
                          key={sym}
                          onClick={() => handleQuickSymbol(sym)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            form.symbol === sym
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-accent/30 text-muted-foreground border border-transparent hover:border-border'
                          }`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {form.type === 'gold' && (
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-2 block">انتخاب سریع</label>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_GOLD.map(g => (
                        <button
                          key={g.symbol}
                          onClick={() => handleQuickSymbol(g.symbol, g.label)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            form.symbol === g.symbol
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-accent/30 text-muted-foreground border border-transparent hover:border-border'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock search */}
                {form.type === 'stock' && (
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-2 block">جستجوی سهام بورس ایران</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        value={stockSearch}
                        onChange={e => setStockSearch(e.target.value)}
                        placeholder="نام یا نماد سهم را جستجو کنید..."
                        className="input-field pr-9"
                      />
                      {stockSearching && (
                        <Loader2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
                      )}
                    </div>
                    {stockResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-surface-elevated divide-y divide-border/40"
                      >
                        {stockResults.map(s => (
                          <button
                            key={s.id}
                            onClick={() => selectStock(s)}
                            className={`w-full text-right px-4 py-3 text-sm transition-colors hover:bg-accent/50 ${
                              form.symbol === s.symbol ? 'bg-accent/30' : ''
                            }`}
                          >
                            <div className="font-semibold text-foreground">{s.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                              <span>{s.symbol}</span>
                              {s.sector && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/50">{s.sector}</span>}
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                    {stockSearch && !stockSearching && stockResults.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-2">نتیجه‌ای یافت نشد</p>
                    )}
                  </div>
                )}

                {/* Symbol + Label */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">نماد</label>
                    <input
                      value={form.symbol}
                      onChange={e => setForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                      placeholder="مثال: BTC"
                      className="input-field"
                      dir="ltr"
                      style={{ textAlign: 'start' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">نام دارایی *</label>
                    <input
                      value={form.label}
                      onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="نام دارایی"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Quantity + Purchase price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">تعداد *</label>
                    <input
                      value={form.quantity || ''}
                      onChange={e => setForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      placeholder="مثال: ۰.۵"
                      type="number"
                      step="any"
                      className="input-field"
                      dir="ltr"
                      style={{ textAlign: 'start' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">قیمت خرید (تومان)</label>
                    <input
                      value={form.purchasePrice || ''}
                      onChange={e => setForm(prev => ({ ...prev, purchasePrice: e.target.value ? Number(e.target.value) : undefined }))}
                      placeholder="اختیاری"
                      type="number"
                      className="input-field"
                      dir="ltr"
                      style={{ textAlign: 'start' }}
                    />
                  </div>
                </div>

                {/* Date + Notes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">تاریخ خرید</label>
                    <input
                      value={form.purchaseDate}
                      onChange={e => setForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                      type="date"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">یادداشت</label>
                    <input
                      value={form.notes ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="اختیاری"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !form.label || !form.quantity}
                    className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold gap-2 inline-flex items-center justify-center disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? 'ویرایش دارایی' : 'افزودن به سبد'}
                  </button>
                  <button
                    onClick={() => { setShowModal(false); setForm(INITIAL_FORM) }}
                    className="px-6 py-3 rounded-xl bg-accent/30 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all text-sm font-semibold"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
