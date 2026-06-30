'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '@/lib/auth-client'
import { getMyAssets, createAsset, updateAsset, deleteAsset } from '@/app/actions/assets'
import {
  Plus, Trash2, Edit3, X, Search, RefreshCw,
  Wallet, Loader2, Clock, Bitcoin, PieChart, Crown, Brain, BarChart3,
} from 'lucide-react'

import { AISupport } from '@/components/ai-support'

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
): number | null {
  if (stockPrices[symbol] !== undefined) return stockPrices[symbol] / 10
  const upper = symbol.toUpperCase()
  if (stockPrices[upper] !== undefined) return stockPrices[upper] / 10
  const irrKey = `${upper}-IRR`
  if (prices[irrKey]) return prices[irrKey].price / 10
  const direct = prices[upper] ?? prices[symbol]
  if (!direct) return null
  if (direct.currency === 'IRR') return direct.price / 10
  if (direct.currency === 'USD') {
    const usdRate = prices['USDT-IRR']?.price
    if (usdRate) return (direct.price * usdRate) / 10
    return direct.price
  }
  return null
}

function getTotalCost(asset: Asset): number {
  return (asset.purchasePrice ?? 0) * asset.quantity
}

function getCurrentValue(asset: Asset, prices: PriceMap, stockPrices: Record<string, number>): number {
  const price = getAssetPriceIr(asset.symbol, prices, stockPrices)
  if (price === null) return 0
  return price * asset.quantity
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)
  const rafRef = useRef<number | null>(null)

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
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t) }, [])

  const radius = 50, strokeWidth = 16, cx = 60, cy = 60
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
    <div className="flex flex-col items-center gap-1.5">
      <svg width="140" height="140" viewBox="0 0 120 120" className="mx-auto">
        {arcs.map(a => (
          <circle key={a.index} cx={cx} cy={cy} r={radius} fill="none" stroke={a.color} strokeWidth={strokeWidth}
            strokeDasharray={`${animated ? a.length : 0} ${circumference - (animated ? a.length : 0)}`}
            strokeDashoffset={-a.offset} strokeLinecap="round"
            opacity={hovered === null || hovered === a.index ? 1 : 0.25}
            onMouseEnter={() => setHovered(a.index)} onMouseLeave={() => setHovered(null)}
            style={{ transition: 'stroke-dasharray 1.2s ease-out, stroke-dashoffset 1.2s ease-out, opacity 0.2s', transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, cursor: 'pointer' }}
          />
        ))}
        <text x={cx} y={cy - 2} textAnchor="middle" className="fill-foreground font-black" fontSize="16">{total > 0 ? `${(hovered !== null ? arcs[hovered].pct * 100 : 100).toFixed(0)}%` : '—'}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-muted-foreground" fontSize="9">{hovered !== null ? arcs[hovered].label : 'مجموع'}</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-1 text-xs">
        {arcs.map(a => (
          <div key={a.index} className="flex items-center gap-0.5 cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-accent" onMouseEnter={() => setHovered(a.index)} onMouseLeave={() => setHovered(null)}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: a.color }} />
            <span className="font-bold">{(a.pct * 100).toFixed(1)}%</span>
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
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AssetForm>(INITIAL_FORM)
  const [stockSearch, setStockSearch] = useState('')
  const [stockResults, setStockResults] = useState<IranStock[]>([])
  const [stockSearching, setStockSearching] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    if (typeof window !== 'undefined') {
      const existing = (window as any).__toastTimer
      if (existing) clearTimeout(existing)
      ;(window as any).__toastTimer = setTimeout(() => setToast(null), 5000)
    }
  }

  const fetchPrices = useCallback(async (isUserAction = false) => {
    if (isUserAction) setPriceLoading(true)
    else setRefreshing(true)
    try {
      // Fetch server API (crypto + stocks)
      const apiRes = await fetch('/api/prices')
      const data = apiRes ? await apiRes.json().catch(() => ({})) : {}
      const mergedPrices = { ...(data.prices ?? {}) }
      
      // Fetch TGJU live prices directly from browser (try multiple endpoints)
      const rev = Math.random().toString(36).substring(2, 12)
      const tgjuUrls = [
        `https://call2.tgju.org/ajax.json?rev=${rev}`,
        `https://call3.tgju.org/ajax.json?rev=${rev}`,
        `https://call4.tgju.org/ajax.json?rev=${rev}`,
      ]
      let tgjuOk = false
      for (const url of tgjuUrls) {
        try {
          const r = await fetch(url)
          if (!r.ok) continue
          const tj = await r.json()
          if (tj?.current?.price_dollar_rl?.p) {
            const c = tj.current
            const irrRate = Number(c.price_dollar_rl.p.replace(/,/g, ''))
            mergedPrices['USD-IRR'] = { price: irrRate, currency: 'IRR' }
            mergedPrices['USDT-IRR'] = { price: irrRate, currency: 'IRR' }
            if (c.price_eur?.p) mergedPrices['EUR-IRR'] = { price: Number(c.price_eur.p.replace(/,/g, '')), currency: 'IRR' }
            if (c.geram18?.p) mergedPrices['GOLD18'] = { price: Number(c.geram18.p.replace(/,/g, '')), currency: 'IRR' }
            if (c.sekee?.p) mergedPrices['COIN'] = { price: Number(c.sekee.p.replace(/,/g, '')), currency: 'IRR' }
            tgjuOk = true
            break
          }
        } catch {}
      }
      if (!tgjuOk) console.warn('TGJU: all AJAX endpoints failed, using DB fallback')
      
      setPrices(mergedPrices)
      
      // Stock prices: try individual API, fall back to bulk API
      const stockAssets = assets.filter(a => a.type === 'stock')
      let sp: Record<string, number> = {}
      if (stockAssets.length > 0) {
        const stockPricePromises = stockAssets.map(a => 
          fetch(`/api/iran-stocks/price?symbol=${encodeURIComponent(a.symbol)}`).then(r => r.json())
        )
        const stockResults = await Promise.allSettled(stockPricePromises)
        for (const result of stockResults) {
          if (result.status === 'fulfilled' && result.value.price > 0) {
            sp[result.value.symbol] = result.value.price
          }
        }
      }
      // Fall back to bulk API stock prices for symbols still missing
      if (data.stockPrices) {
        for (const [sym, val] of Object.entries(data.stockPrices)) {
          const v = val as { price: number }
          if (sp[sym] === undefined && v.price > 0) {
            sp[sym] = v.price
          }
        }
      }
      if (Object.keys(sp).length > 0) setStockPrices(sp)
      
      setLastUpdate(new Date())
    } catch (e) { console.error('fetchPrices error:', e) }
    setPriceLoading(false)
    setRefreshing(false)
  }, [assets])

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
      await fetchPrices(true)
      setLoading(false)
    })()
  }, [isPending, fetchAll, fetchPrices])

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
          <span className="text-lg">{toast.type === 'success' ? '✓' : '✕'}</span>
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}



      {/* Dashboard */}
      <div className="space-y-4">

        {/* ── User Profile Card ── */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {session?.user?.name?.[0] || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground truncate">{session?.user?.name || 'کاربر'}</div>
              <div className="text-xs text-muted-foreground truncate">{session?.user?.email || ''}</div>
            </div>
            {lastUpdate && (
              <div className="text-[11px] text-muted-foreground shrink-0 text-left leading-snug">
                <div>بروزرسانی</div>
                <div dir="ltr">{new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(lastUpdate)}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Portfolio Value ── */}
        <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-4">
          <div>
            <div className="text-xs text-muted-foreground font-medium">ارزش کل سبد</div>
            <div className="text-2xl font-bold text-foreground mt-0.5 tracking-tight">
              <AnimatedNumber value={totalValue} /> <span className="text-sm font-normal text-muted-foreground">تومان</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchPrices(true)} disabled={priceLoading}
              className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={openAdd}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Quick Stats Row ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'تعداد دارایی‌ها', value: String(assets.length) },
            { label: 'دسته‌بندی', value: String(Object.keys(byType).length) },
            { label: 'سود / زیان', value: totalCost > 0 ? `${(((totalValue - totalCost) / totalCost) * 100).toFixed(1)}%` : '—' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl py-3 px-3 text-center">
              <div className="text-lg font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Category Distribution ── */}
        {Object.keys(byType).length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">توزیع سرمایه</h3>
            <div className="space-y-3">
              {Object.entries(byType).sort((a, b) => b[1].value - a[1].value).map(([type, data]) => {
                const pct = totalValue > 0 ? (data.value / totalValue) * 100 : 0
                const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.other
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{cfg.icon} {cfg.label}</span>
                      <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Assets Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">دارایی‌ها</h3>
            <span className="text-xs text-muted-foreground">{assets.length} مورد</span>
          </div>

          {assets.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-muted-foreground text-sm mb-3">سبد شما خالی است</p>
              <button onClick={openAdd} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                + افزودن دارایی
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[...assets]
                .sort((a, b) => {
                  const valA = getCurrentValue(a, prices, stockPrices)
                  const valB = getCurrentValue(b, prices, stockPrices)
                  return valB - valA
                })
                .map((a) => {
                  const value = getCurrentValue(a, prices, stockPrices)
                  const cost = getTotalCost(a)
                  const pnl = cost > 0 ? ((value - cost) / cost) * 100 : 0
                  const cfg = TYPE_CONFIG[a.type] ?? TYPE_CONFIG.other
                  const diff = value - cost
                  return (
                    <div key={a.id} onClick={() => openEdit(a)}
                      className="bg-card border border-border rounded-2xl p-3 text-center cursor-pointer hover:border-primary/30 transition-colors relative group"
                    >
                      <div className="text-2xl leading-none mb-1.5">{cfg.icon}</div>
                      <div className="text-sm font-semibold text-foreground truncate leading-snug">{a.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{formatQuantity(a.quantity, a.symbol)}</div>
                      <div className="text-sm font-bold text-foreground mt-1" dir="ltr">
                        {value > 0 ? formatCurrency(value) : '—'}
                      </div>
                      {cost > 0 && (
                        <div className={`text-xs font-semibold mt-0.5 ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {diff >= 0 ? '+' : ''}{pnl.toFixed(1)}%
                        </div>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-md space-y-4 overflow-y-auto max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-foreground">{editingId ? 'ویرایش دارایی' : 'افزودن دارایی جدید'}</h2>

            {/* Type selector */}
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, symbol: '', label: '' })}
              className="w-full px-3 py-2.5 rounded-xl bg-accent border border-border text-foreground text-sm outline-none"
            >
              {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            {/* Quick crypto symbols */}
            {form.type === 'crypto' && (
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CRYPTO.map(s => (
                  <button key={s} onClick={() => handleQuickSymbol(s)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${form.symbol === s ? 'bg-primary text-white' : 'bg-accent text-muted-foreground hover:text-foreground'}`}
                  >{s}</button>
                ))}
              </div>
            )}

            {/* Quick currency symbols */}
            {form.type === 'currency' && (
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CURRENCY.map(s => (
                  <button key={s} onClick={() => handleQuickSymbol(s)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${form.symbol === s ? 'bg-primary text-white' : 'bg-accent text-muted-foreground hover:text-foreground'}`}
                  >{s}</button>
                ))}
              </div>
            )}

            {/* Quick gold */}
            {form.type === 'gold' && (
              <div className="flex flex-wrap gap-1.5">
                {QUICK_GOLD.map(g => (
                  <button key={g.symbol} onClick={() => handleQuickSymbol(g.symbol, g.label)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${form.symbol === g.symbol ? 'bg-primary text-white' : 'bg-accent text-muted-foreground hover:text-foreground'}`}
                  >{g.label}</button>
                ))}
              </div>
            )}

            {/* Stock search */}
            {form.type === 'stock' && (
              <div>
                <input value={stockSearch} onChange={e => setStockSearch(e.target.value)} placeholder="جستجوی نماد بورسی..."
                  className="w-full px-3 py-2.5 rounded-xl bg-accent border border-border text-foreground text-sm outline-none mb-2"
                />
                {stockSearching && <div className="text-xs text-muted-foreground text-center py-2">در حال جستجو...</div>}
                {stockResults.length > 0 && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {stockResults.map(s => (
                      <button key={s.id} onClick={() => selectStock(s)}
                        className="w-full text-right px-3 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                      >
                        <div className="text-xs font-semibold text-foreground">{s.name}</div>
                        <div className="text-[10px] text-muted-foreground">{s.symbol} · {s.sector}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Symbol + Label */}
            <div className="grid grid-cols-2 gap-2">
              <input value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} placeholder="نماد (مثال: BTC)"
                className="px-3 py-2.5 rounded-xl bg-accent border border-border text-foreground text-sm outline-none" />
              <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="نام دارایی *"
                className="px-3 py-2.5 rounded-xl bg-accent border border-border text-foreground text-sm outline-none" />
            </div>

            {/* Quantity + Price */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">تعداد *</label>
                <input value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} type="number"
                  className="w-full px-3 py-2.5 rounded-xl bg-accent border border-border text-foreground text-sm outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">قیمت خرید (تومان)</label>
                <input value={form.purchasePrice || ''} onChange={e => setForm({ ...form, purchasePrice: Number(e.target.value) })} type="number"
                  className="w-full px-3 py-2.5 rounded-xl bg-accent border border-border text-foreground text-sm outline-none" />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">تاریخ خرید</label>
              <input value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} type="date"
                className="w-full px-3 py-2.5 rounded-xl bg-accent border border-border text-foreground text-sm outline-none" />
            </div>

            {/* Notes */}
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="یادداشت" rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-accent border border-border text-foreground text-sm outline-none resize-none" />

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : editingId ? 'ویرایش' : 'افزودن'}
              </button>
              <button onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl bg-accent text-muted-foreground hover:text-foreground text-sm font-bold transition-colors"
              >انصراف</button>
            </div>
          </div>
        </div>
      )}
      <AISupport />
    </div>
  )
}
