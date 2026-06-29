'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '@/lib/auth-client'
import { getMyAssets, createAsset, updateAsset, deleteAsset } from '@/app/actions/assets'
import {
  Plus, Trash2, Edit3, X, Search, RefreshCw,
  Wallet, Loader2, Clock, Bitcoin, PieChart, Crown, Brain,
} from 'lucide-react'
import { PortfolioAdvisor } from '@/components/portfolio-advisor'

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

const DONUT_COLORS = ['#F59E0B', '#2979FF', '#FF6B35', '#10B981', '#8B5CF6']

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
  const upper = symbol.toUpperCase()
  if (stockPrices[upper] !== undefined) return stockPrices[upper]
  const irrKey = `${upper}-IRR`
  if (prices[irrKey]) return prices[irrKey].price
  const direct = prices[upper] ?? prices[symbol]
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

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const [hovered, setHovered] = useState<number | null>(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(t)
  }, [])

  const radius = 70
  const strokeWidth = 24
  const cx = 100
  const cy = 100
  const circumference = 2 * Math.PI * radius

  let cumulative = 0
  const arcs = segments.map((seg, i) => {
    const pct = total > 0 ? seg.value / total : 0
    const offset = cumulative * circumference
    const length = pct * circumference
    cumulative += pct
    return { ...seg, pct, offset, length, index: i }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {arcs.map(a => (
          <circle
            key={a.index}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={a.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${animated ? a.length : 0} ${circumference - (animated ? a.length : 0)}`}
            strokeDashoffset={-a.offset}
            strokeLinecap="round"
            opacity={hovered === null || hovered === a.index ? 1 : 0.25}
            onMouseEnter={() => setHovered(a.index)}
            onMouseLeave={() => setHovered(null)}
            style={{
              transition: 'stroke-dasharray 1.2s ease-out, stroke-dashoffset 1.2s ease-out, opacity 0.2s',
              transform: 'rotate(-90deg)',
              transformOrigin: '100px 100px',
              cursor: 'pointer',
            }}
          />
        ))}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          className="fill-foreground font-black"
          fontSize="22"
        >
          {total > 0 ? `${(hovered !== null ? arcs[hovered].pct * 100 : 100).toFixed(0)}%` : '—'}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="11"
        >
          {hovered !== null ? arcs[hovered].label : 'مجموع'}
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {arcs.map(a => (
          <div
            key={a.index}
            className="flex items-center gap-1.5 text-xs cursor-pointer"
            onMouseEnter={() => setHovered(a.index)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ background: a.color }}
            />
            <span className="text-muted-foreground">{a.label}</span>
            <span className="text-foreground font-bold">{(a.pct * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PerformanceBars({ assets, prices, stockPrices }: {
  assets: Asset[]
  prices: PriceMap
  stockPrices: Record<string, number>
}) {
  const maxVal = Math.max(
    ...assets.map(a => Math.abs(getCurrentValue(a, prices, stockPrices) - getTotalCost(a))),
    1
  )

  return (
    <div className="space-y-2.5" dir="ltr">
      {assets.map(a => {
        const val = getCurrentValue(a, prices, stockPrices)
        const cost = getTotalCost(a)
        const diff = val - cost
        const isProfit = diff >= 0
        const barWidth = maxVal > 0 ? (Math.abs(diff) / maxVal) * 100 : 0
        const cfg = TYPE_CONFIG[a.type] ?? TYPE_CONFIG.other
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-xs"
          >
            <span
              className="w-16 sm:w-20 truncate font-semibold text-foreground text-right shrink-0"
              style={{ direction: 'rtl' }}
            >
              {a.label}
            </span>
            <div className="flex-1 h-5 relative flex items-center">
              {isProfit ? (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-3 rounded-sm"
                  style={{ background: 'linear-gradient(90deg, #10B98140, #10B981)' }}
                />
              ) : (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-3 rounded-sm"
                  style={{
                    background: 'linear-gradient(90deg, #EF4444, #EF444440)',
                    marginInlineStart: `${100 - barWidth}%`,
                  }}
                />
              )}
            </div>
            <span
              className={`w-20 sm:w-24 text-left font-bold shrink-0 font-mono ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {isProfit ? '+' : ''}{formatCurrency(Math.round(diff))}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}

export function PortfolioDashboard({ isPlus = false, investorType, quizTaken }: { isPlus?: boolean; investorType?: string | null; quizTaken?: boolean }) {
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
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPrices = useCallback(async () => {
    setPriceLoading(true)
    try {
      const res = await fetch('/api/prices')
      const data = await res.json()
      setPrices(data.prices ?? {})
      if (data.stockPrices) {
        const sp: Record<string, number> = {}
        for (const [sym, val] of Object.entries(data.stockPrices) as [string, any][]) {
          sp[sym] = val.price
        }
        setStockPrices(sp)
      }
      setLastUpdate(new Date())
    } catch (e) { console.error('fetchPrices error:', e) }
    setPriceLoading(false)
  }, [])

  const fetchAll = useCallback(async () => {
    try {
      const [a] = await Promise.all([getMyAssets()])
      setAssets(a)
      return a
    } catch (e) { console.error('fetchAll error:', e); return [] as Asset[] }
  }, [])

  useEffect(() => {
    if (isPending) return
    ;(async () => {
      const a = await fetchAll()
      await fetchPrices()
      setLoading(false)
    })()
  }, [isPending, fetchAll, fetchPrices])

  useEffect(() => {
    if (loading) return
    const interval = setInterval(() => fetchPrices(), 30000)
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

  const totalValue = assets.reduce((sum, a) => sum + getCurrentValue(a, prices, stockPrices), 0)
  const totalCost = assets.reduce((sum, a) => sum + getTotalCost(a), 0)

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
        showToast('دارایی با موفقیت ویرایش شد')
      } else {
        await createAsset(form)
        showToast('دارایی با موفقیت به سبد اضافه شد')
      }
      setShowModal(false)
      setForm(INITIAL_FORM)
      setEditingId(null)
      const [a] = await Promise.all([getMyAssets()])
      setAssets(a)
    } catch { showToast('خطا در ثبت دارایی', 'error') }
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    try {
      await deleteAsset(id)
      setAssets(await getMyAssets())
      showToast('دارایی حذف شد')
    } catch { showToast('خطا در حذف دارایی', 'error') }
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

  if (!isPlus) {
    return (
      <div dir="rtl" className="flex items-center justify-center py-8 sm:py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.15) 50%, rgba(180,83,9,0.08) 100%)',
            border: '1px solid rgba(245,158,11,0.2)',
            boxShadow: '0 0 60px rgba(245,158,11,0.08), inset 0 1px 0 rgba(245,158,11,0.1)',
          }}
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.1) 0%, transparent 70%)' }} />
          <div className="relative p-8 sm:p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.3))',
                border: '2px solid rgba(245,158,11,0.3)',
              }}
            >
              <Crown className="w-10 h-10" style={{ color: '#F59E0B' }} />
            </motion.div>
            <h2
              className="text-2xl sm:text-3xl font-black mb-3"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706, #F59E0B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              پرتفوی اختصاصی
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed max-w-sm mx-auto">
              این قابلیت فقط برای کاربران A|CAP+ در دسترس است
            </p>
            <a
              href="/acap-plus"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                boxShadow: '0 0 30px rgba(245,158,11,0.3)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 50px rgba(245,158,11,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(245,158,11,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <Crown className="w-4 h-4" />
              خرید اشتراک A|CAP+
            </a>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="relative">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl border flex items-center gap-2.5 ${
            toast.type === 'success'
              ? 'bg-emerald-900/90 border-emerald-500/30 text-emerald-300'
              : 'bg-red-900/90 border-red-500/30 text-red-300'
          }`}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {toast.type === 'success' ? '✓' : '✕'}
          {toast.msg}
        </motion.div>
      )}

      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl animate-mesh"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15 blur-3xl animate-mesh"
          style={{ animationDelay: '-4s', background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-10 blur-3xl animate-mesh"
          style={{ animationDelay: '-8s', background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }} />
      </div>

      {/* Hero Value Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(16,185,129,0.05) 100%)',
          border: '1px solid rgba(59,130,246,0.15)',
          boxShadow: '0 0 60px rgba(59,130,246,0.06), inset 0 1px 0 rgba(59,130,246,0.1)',
        }}
      >
        {/* Conic gradient border animation */}
        <div className="absolute inset-0 rounded-3xl p-[1px] pointer-events-none">
          <div className="absolute inset-0 rounded-3xl animate-conic opacity-40"
            style={{ background: 'conic-gradient(#3B82F6, #8B5CF6, #10B981, #F59E0B, #3B82F6)' }} />
        </div>
        <div className="absolute inset-[1px] rounded-[calc(1.5rem-1px)]" style={{ background: 'var(--background)' }} />

        <div className="relative p-6 sm:p-8">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <Wallet className="w-4 h-4" />
            <span>ارزش کل سبد سرمایه‌گذاری</span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-shimmer animate-glow-soft">
              <AnimatedNumber value={totalValue} />
            </span>
            <span className="text-muted-foreground text-sm font-semibold">تومان</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 mt-4 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {assets.length} دارایی
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {Object.keys(byType).length} دسته
            </span>
            {investorType && (
              <span className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-primary" />
                مشاوره فعال
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: 'تعداد دارایی‌ها',
            value: String(assets.length),
            sub: `در ${Object.keys(byType).length} دسته`,
            icon: Wallet,
            gradient: 'from-blue-500 to-purple-600',
          },
          {
            label: 'بیشترین سهم',
            value: Object.entries(byType).sort((a, b) => b[1].value - a[1].value)[0]?.[0]
              ? (TYPE_CONFIG[Object.entries(byType).sort((a, b) => b[1].value - a[1].value)[0][0]]?.icon ?? '—')
              : '—',
            sub: Object.entries(byType).sort((a, b) => b[1].value - a[1].value)[0]?.[0]
              ? (TYPE_CONFIG[Object.entries(byType).sort((a, b) => b[1].value - a[1].value)[0][0]]?.label ?? 'دارایی ثبت نشده')
              : 'دارایی ثبت نشده',
            icon: PieChart,
            gradient: 'from-amber-500 to-orange-600',
          },
          {
            label: 'تنوع سبد',
            value: `${Object.keys(byType).length}/${Object.keys(TYPE_CONFIG).length - 1}`,
            sub: 'دسته از ۴ دسته',
            icon: BarChart3,
            gradient: 'from-emerald-500 to-teal-600',
          },
          {
            label: 'مشاوره هوشمند',
            value: investorType ? 'فعال' : 'غیرفعال',
            sub: investorType ? 'بر اساس شخصیت مالی' : 'تست شخصیت دهید',
            icon: Brain,
            gradient: 'from-violet-500 to-purple-600',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.4 }}
            className="glass border border-border rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r opacity-60" style={{ background: `linear-gradient(90deg, ${stat.gradient.replace('from-', '').split(' ')[0]}, ${stat.gradient.split(' ')[1]?.replace('to-', '') ?? stat.gradient.split(' ')[0]})` }} />
            <div className="flex items-start justify-between mb-2">
              <span className="text-muted-foreground text-xs">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-muted-foreground/40" />
            </div>
            <div className={`text-xl sm:text-2xl font-black ${stat.label === 'مشاوره هوشمند' && !investorType ? 'text-muted-foreground' : 'text-foreground'}`}>
              {stat.value}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="mb-8">
        <PortfolioAdvisor
          assets={assets}
          prices={prices}
          stockPrices={stockPrices}
          investorType={investorType ?? null}
          quizTaken={!!investorType}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass border border-border rounded-3xl p-5 sm:p-6 hover-glow"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-black text-base text-brand-shimmer">توزیع دارایی‌ها</h3>
          </div>
          {Object.keys(byType).length === 0 ? (
            <div className="py-6">
              <DonutChart segments={[]} />
              <p className="text-muted-foreground text-sm text-center mt-4">هنوز دارایی ثبت نشده</p>
            </div>
          ) : (
            <DonutChart
              segments={Object.entries(byType).map(([type, data], i) => ({
                label: TYPE_CONFIG[type]?.label ?? 'سایر',
                value: data.value,
                color: DONUT_COLORS[i] ?? '#8B5CF6',
              }))}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass border border-border rounded-3xl p-5 sm:p-6 hover-glow"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-black text-base" style={{
              background: 'linear-gradient(90deg, #10B981, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>تفکیک دسته‌بندی</h3>
          </div>
          {assets.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">دارایی‌ای برای نمایش وجود ندارد</p>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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

        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass border border-border rounded-3xl p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Bitcoin className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="font-black text-base" style={{
                  background: 'linear-gradient(90deg, #F59E0B, #3B82F6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>مدیریت سبد دارایی</h3>
              </div>
              <button
                onClick={openAdd}
                className="btn-primary px-4 py-2 rounded-xl text-sm gap-1.5 flex items-center"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">افزودن دارایی</span>
              </button>
            </div>

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg text-brand-shimmer">دارایی‌های من</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ delay: i * 0.04, duration: 0.35, ease: 'easeOut' }}
                    className="relative rounded-2xl p-[1px] group transition-all duration-300"
                    style={{ perspective: '600px' }}
                  >
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `conic-gradient(from var(--angle, 0deg), ${cfg.color}00, ${cfg.color}60, ${cfg.color}00)`, animation: 'conic-spin 3s linear infinite' }} />
                    <div
                      className="relative rounded-[calc(1rem-1px)] p-4 sm:p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${cfg.color}08, ${cfg.color}02)`,
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                      onMouseMove={e => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = (e.clientX - rect.left) / rect.width - 0.5
                        const y = (e.clientY - rect.top) / rect.height - 0.5
                        e.currentTarget.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shadow-lg"
                            style={{
                              background: `linear-gradient(135deg, ${cfg.color}25, ${cfg.color}10)`,
                              border: `1px solid ${cfg.color}35`,
                              boxShadow: `0 0 20px ${cfg.color}15`,
                            }}
                          >
                            {cfg.icon}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-foreground leading-tight">{a.label}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1" dir="ltr" style={{ textAlign: 'start' }}>
                              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: cfg.color }} />
                              {a.symbol}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
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

                      <div className="mb-3">
                        <div className="text-xl sm:text-2xl font-black text-foreground" dir="ltr" style={{ textAlign: 'start' }}>
                          {formatCurrency(value)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">تومان</div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">تعداد</span>
                          <span className="text-foreground font-semibold font-mono" dir="ltr">
                            {formatQuantity(a.quantity, a.symbol)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">قیمت واحد</span>
                          <span className="text-foreground font-semibold font-mono" dir="ltr">
                            {price > 0 ? price.toLocaleString('fa-IR') : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs pt-1.5 border-t border-border/40">
                          <span className="text-muted-foreground">ارزش روز</span>
                          <span className={`font-bold font-mono ${cost > 0 && value !== cost ? (value > cost ? 'text-emerald-400' : 'text-red-400') : 'text-foreground'}`}>
                            {formatCurrency(value)}
                          </span>
                        </div>
                      </div>

                      {a.purchaseDate && (
                        <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          خرید: {new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(a.purchaseDate))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto"
            onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setForm(INITIAL_FORM) } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass border border-border rounded-3xl p-6 sm:p-7 w-full max-w-lg mx-auto shadow-2xl max-h-[90dvh] overflow-y-auto sm:max-h-none"
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
                <div>
                  <label className="text-xs text-muted-foreground font-semibold mb-2 block">نوع دارایی</label>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 sm:grid sm:grid-cols-5">
                    {ASSET_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setForm(prev => ({ ...INITIAL_FORM, type: t.value }))}
                        className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all sm:px-2 ${
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

                {form.type === 'crypto' && (
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-2 block">انتخاب سریع رمز ارز</label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 flex-nowrap sm:flex-wrap">
                      {QUICK_CRYPTO.map(sym => (
                        <button
                          key={sym}
                          onClick={() => handleQuickSymbol(sym)}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                    <div className="flex gap-1.5 overflow-x-auto pb-1 flex-nowrap sm:flex-wrap">
                      {QUICK_CURRENCY.map(sym => (
                        <button
                          key={sym}
                          onClick={() => handleQuickSymbol(sym)}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                    <div className="flex gap-1.5 overflow-x-auto pb-1 flex-nowrap sm:flex-wrap">
                      {QUICK_GOLD.map(g => (
                        <button
                          key={g.symbol}
                          onClick={() => handleQuickSymbol(g.symbol, g.label)}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
