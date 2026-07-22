'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scan, Brain, Shield, TrendingUp, Target, Loader2, Sparkles, ArrowLeft, TrendingDown } from 'lucide-react'
import Link from 'next/link'

const INVESTOR_TYPES = [
  { id: 'conservative', name: 'محافظه‌کار', emoji: '🛡️', color: '#10B981', desc: 'ریسک کم، بازده مطمئن', bg: 'rgba(16,185,129,0.08)' },
  { id: 'balanced', name: 'متعادل', emoji: '⚖️', color: '#3B82F6', desc: 'ریسک متعادل، بازده مناسب', bg: 'rgba(59,130,246,0.08)' },
  { id: 'growth', name: 'رشدگرا', emoji: '🚀', color: '#1D9BF0', desc: 'ریسک بالا، بازده بیشتر', bg: 'rgba(29,155,240,0.08)' },
  { id: 'aggressive', name: 'تهاجمی', emoji: '🔥', color: '#EF4444', desc: 'ریسک بسیار بالا، بازده حداکثری', bg: 'rgba(239,68,68,0.08)' },
]

const ASSET_TYPES = [
  { key: 'crypto', label: 'ارز دیجیتال', icon: '₿', color: '#F7931A', bg: 'rgba(247,147,26,0.12)', sym: 'BTC' },
  { key: 'stock', label: 'بورس ایران', icon: '📈', color: '#2979FF', bg: 'rgba(41,121,255,0.12)', sym: 'فولاد' },
  { key: 'gold', label: 'طلا', icon: '🟡', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', sym: 'GOLD18' },
  { key: 'currency', label: 'ارز', icon: '💵', color: '#10B981', bg: 'rgba(16,185,129,0.12)', sym: 'USD' },
]

const IDEAL_ALLOCATION: Record<string, Record<string, number>> = {
  conservative: { gold: 40, currency: 30, stock: 20, crypto: 10 },
  balanced: { gold: 25, currency: 20, stock: 35, crypto: 20 },
  growth: { gold: 10, currency: 10, stock: 40, crypto: 40 },
  aggressive: { gold: 5, currency: 5, stock: 30, crypto: 60 },
}

const TYPE_LABELS: Record<string, string> = { crypto: 'ارز دیجیتال', stock: 'بورس ایران', gold: 'طلا', currency: 'ارز' }

function getAssetPriceIr(sym: string, prices: Record<string, { price: number; currency: string }>, stockPrices: Record<string, number>): number {
  if (stockPrices[sym] !== undefined) return stockPrices[sym] / 10
  const irrKey = `${sym.toUpperCase()}-IRR`
  if (prices[irrKey]) return prices[irrKey].price / 10
  const d = prices[sym.toUpperCase()] ?? prices[sym]
  if (!d) return 0
  if (d.currency === 'IRR') return d.price / 10
  if (d.currency === 'USD') {
    const usdRate = prices['USDT-IRR']?.price
    return usdRate ? (d.price * usdRate) / 10 : d.price
  }
  return 0
}

function formatTomanShort(n: number): string {
  if (n >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(2) + ' همت'
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + ' میلیارد'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + ' میلیون'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + ' هزار'
  return Math.round(n).toLocaleString('fa-IR')
}

function ScoreCircle({ score }: { score: number }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t) }, [])
  const r = 54, c = 2 * Math.PI * r
  const color = score >= 80 ? '#10B981' : score >= 50 ? '#EAB308' : '#EF4444'
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={animated ? c * (1 - score / 100) : c}
        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)', transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }}
      />
      <motion.text x="70" y="64" textAnchor="middle" className="fill-foreground font-black" fontSize="28"
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
      >{score}</motion.text>
      <text x="70" y="82" textAnchor="middle" className="fill-muted-foreground" fontSize="10">از ۱۰۰</text>
    </svg>
  )
}

export default function ScanPage() {
  const [step, setStep] = useState<'intro' | 'form' | 'scanning' | 'results'>('intro')
  const [investorType, setInvestorType] = useState<string | null>(null)
  const [amounts, setAmounts] = useState<Record<string, string>>({ crypto: '', stock: '', gold: '', currency: '' })
  const [prices, setPrices] = useState<Record<string, { price: number; currency: string }>>({})
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/prices').then(r => r.json()).then(d => {
      setPrices(d.prices ?? {})
      setStockPrices(Object.fromEntries(Object.entries(d.stockPrices ?? {}).map(([k, v]: any) => [k, v.price])))
    })
  }, [])

  const totalEntered = useMemo(() =>
    Object.values(amounts).reduce((s, v) => s + (parseFloat(v.replace(/[^0-9.]/g, '')) || 0), 0), [amounts])

  const virtualAssets = useMemo(() => {
    const items: { type: string; symbol: string; label: string; quantity: number }[] = []
    for (const at of ASSET_TYPES) {
      const amt = parseFloat(amounts[at.key]?.replace(/[^0-9.]/g, '') || '0')
      if (amt > 0) {
        const price = getAssetPriceIr(at.sym, prices, stockPrices)
        if (price > 0) items.push({ type: at.key, symbol: at.sym, label: at.label, quantity: amt / price })
      }
    }
    return items
  }, [amounts, prices, stockPrices])

  function handleScan() {
    if (!investorType || totalEntered <= 0) return
    setStep('scanning')
    setTimeout(() => setStep('results'), 1400)
  }

  const pctAlloc = useMemo(() => {
    if (totalEntered <= 0) return {}
    const m: Record<string, number> = {}
    for (const at of ASSET_TYPES) {
      m[at.key] = ((parseFloat(amounts[at.key]?.replace(/[^0-9.]/g, '') || '0')) / totalEntered) * 100
    }
    return m
  }, [amounts, totalEntered])

  const results = useMemo(() => {
    if (step !== 'results' || !investorType) return null
    const totalVal = virtualAssets.reduce((s, a) => s + getAssetPriceIr(a.symbol, prices, stockPrices) * a.quantity, 0)
    const byType: Record<string, number> = {}
    for (const a of virtualAssets) byType[a.type] = (byType[a.type] || 0) + getAssetPriceIr(a.symbol, prices, stockPrices) * a.quantity
    const ideal = IDEAL_ALLOCATION[investorType]
    const curAlloc: Record<string, number> = {}
    for (const k of Object.keys(ideal)) curAlloc[k] = totalVal > 0 ? ((byType[k] || 0) / totalVal) * 100 : 0
    let td = 0
    const gaps = Object.keys(ideal).map(type => { const cur = curAlloc[type] || 0; const g = ideal[type] - cur; td += Math.abs(g); return { type, current: cur, ideal: ideal[type], gap: g } })
    const score = Math.max(0, Math.min(100, Math.round(100 - td / 2)))
    const adv: { text: string; severity: 'critical' | 'warning' | 'good'; icon: string }[] = []
    for (const g of gaps) {
      if (Math.abs(g.gap) < 5) continue
      const absGap = Math.abs(Math.round(g.gap))
      const lbl = TYPE_LABELS[g.type] || g.type
      if (g.gap > 0) adv.push({ text: `سهم ${lbl} را ${absGap}% افزایش دهید`, severity: 'warning', icon: '↑' })
      else adv.push({ text: `سهم ${lbl} را ${absGap}% کاهش دهید`, severity: 'critical', icon: '↓' })
    }
    if (adv.length === 0) adv.push({ text: 'پرتفوی شما متعادل است', severity: 'good', icon: '✅' })
    const inv = INVESTOR_TYPES.find(i => i.id === investorType)!
    return { score, gaps, advice: adv, investor: inv, totalVal, typeCount: Object.keys(byType).length }
  }, [step, investorType, virtualAssets, prices, stockPrices])

  return (
    <div className="min-h-screen" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> A|CAP
          </Link>
          {step !== 'intro' && (
            <button onClick={() => setStep('intro')} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> بازگشت
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* INTRO */}
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/30 flex items-center justify-center"
              >
                <Scan className="w-10 h-10 text-primary" />
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl font-black text-foreground mb-3"
              >اسکنر هوشمند پرتفوی</motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-8"
              >ترکیب دارایی‌هات رو وارد کن و ببین چقدر با شخصیت مالی‌ت هماهنگه. تحلیل هوشمند با توصیه‌های دقیق.</motion.p>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                <button onClick={() => setStep('form')}
                  className="px-8 py-3.5 rounded-2xl bg-primary text-white font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >شروع اسکن پرتفوی</button>
                <a href="/#quiz"
                  className="px-8 py-3.5 rounded-2xl bg-accent/50 border border-border text-foreground font-bold text-sm hover:bg-accent transition-all"
                >اول تست شخصیت مالی بده</a>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 max-w-2xl mx-auto"
              >
                {[
                  { icon: Brain, label: 'تحلیل هوشمند', desc: 'بر اساس شخصیت مالی' },
                  { icon: Shield, label: 'امن و خصوصی', desc: 'داده‌ها ذخیره نمی‌شه' },
                  { icon: Target, label: 'توصیه دقیق', desc: 'درصد اختلاف دقیق' },
                  { icon: Sparkles, label: 'رایگان', desc: 'بدون نیاز به ثبت‌نام' },
                ].map((f, i) => (
                  <div key={i} className="glass border border-border rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-xs font-bold text-foreground">{f.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* FORM */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {['نوع سرمایه‌گذار', 'مقدار دارایی', 'دریافت نتیجه'].map((l, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black ${i === 0 ? (investorType ? 'bg-emerald-500 text-white' : 'bg-primary text-white') : i === 1 ? 'bg-primary text-white' : 'text-muted-foreground bg-accent/50'}`}>{i + 1}</div>
                    <span className={`text-xs font-semibold ${i === 1 ? 'text-foreground' : 'text-muted-foreground'}`}>{l}</span>
                    {i < 2 && <div className="w-6 h-px bg-border" />}
                  </div>
                ))}
              </div>

              {/* Investor Type */}
              <div className="glass border border-border rounded-3xl p-5 sm:p-6 mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-black text-foreground">نوع سرمایه‌گذار خود را انتخاب کنید</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {INVESTOR_TYPES.map(t => {
                    const active = investorType === t.id
                    return (
                      <button key={t.id} onClick={() => setInvestorType(t.id)}
                        className={`relative rounded-2xl p-3.5 text-center transition-all duration-200 border ${active ? 'border-transparent' : 'border-border hover:border-primary/30'}`}
                        style={{ background: active ? `linear-gradient(135deg, ${t.bg}, transparent)` : undefined, borderColor: active ? t.color : undefined }}
                      >
                        <motion.div className="text-2xl mb-1.5" whileHover={{ scale: 1.15 }}>{t.emoji}</motion.div>
                        <div className="text-xs font-bold text-foreground">{t.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</div>
                        {active && (
                          <motion.div layoutId="inv-check" initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: t.color }}
                          >
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </motion.div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Amount inputs */}
              <div className="glass border border-border rounded-3xl p-5 sm:p-6 mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-5 text-primary" />
                  <h3 className="text-sm font-black text-foreground">مقدار دارایی‌های خود را وارد کنید</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ASSET_TYPES.map(at => (
                    <div key={at.key} className="relative">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: at.bg, color: at.color }}>{at.icon}</span>
                        <label className="text-xs font-bold text-foreground">{at.label}</label>
                      </div>
                      <div className="relative">
                        <input value={amounts[at.key]} onChange={e => setAmounts(p => ({ ...p, [at.key]: e.target.value.replace(/[^0-9]/g, '') }))}
                          placeholder="مثلاً ۱۰۰۰۰۰۰۰۰"
                          className="w-full px-3.5 py-3 rounded-xl bg-accent/50 border border-border text-foreground text-sm font-bold outline-none transition-all focus:border-primary/50 ltr text-left tabular-nums"
                          inputMode="numeric"
                        />
                        {amounts[at.key] && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">تومان</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {totalEntered > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground">جمع کل:</span>
                      <span className="text-foreground font-black tabular-nums">{formatTomanShort(totalEntered)} تومان</span>
                    </div>
                    <div className="flex gap-1 h-2">
                      {ASSET_TYPES.map(at => {
                        const pct = pctAlloc[at.key] || 0
                        if (pct <= 0) return null
                        return (
                          <motion.div key={at.key} initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            className="h-full rounded-full first:rounded-r-full last:rounded-l-full"
                            style={{ background: at.color }}
                          />
                        )
                      })}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                      {ASSET_TYPES.map(at => {
                        const pct = pctAlloc[at.key] || 0
                        if (pct <= 0) return null
                        return (
                          <span key={at.key} className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: at.color }} />
                            {at.label}: {Math.round(pct)}%
                          </span>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Scan button */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <button onClick={handleScan} disabled={!investorType || totalEntered <= 0 || Object.keys(prices).length === 0}
                  className="w-full py-4 rounded-2xl bg-gradient-to-l from-primary to-emerald-500 text-white font-black text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="flex items-center justify-center gap-2">
                    {Object.keys(prices).length === 0 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                    {Object.keys(prices).length === 0 ? 'در حال دریافت قیمت‌ها...' : 'اسکن پرتفوی'}
                  </span>
                </button>
                {(!investorType || totalEntered <= 0) && (
                  <p className="text-[11px] text-muted-foreground text-center mt-2">
                    {!investorType ? 'لطفاً نوع سرمایه‌گذار را انتخاب کنید' : Object.keys(prices).length === 0 ? 'در حال دریافت قیمت‌های لحظه‌ای...' : 'لطفاً حداقل یک دارایی وارد کنید'}
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* SCANNING ANIMATION */}
          {step === 'scanning' && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 text-center">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1, rotate: 360 }} transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-emerald-500/20 border border-primary/30 flex items-center justify-center"
              >
                <Scan className="w-12 h-12 text-primary" />
              </motion.div>
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-lg font-black text-foreground mb-2"
              >در حال اسکن پرتفوی...</motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-sm text-muted-foreground"
              >تحلیل ترکیب دارایی‌ها و تطابق با شخصیت مالی...</motion.p>
              <div className="flex justify-center gap-1 mt-6">
                {[0, 0.15, 0.3, 0.45, 0.6].map((d, i) => (
                  <motion.div key={i} initial={{ scaleY: 0.3 }} animate={{ scaleY: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: d }}
                    className="w-1.5 h-6 rounded-full bg-primary"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* RESULTS */}
          {step === 'results' && results && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Score + Investor */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass border border-border rounded-3xl overflow-hidden mb-5"
                style={{ borderColor: `${results.investor.color}30` }}
              >
                <div className="p-6 sm:p-8 text-center relative overflow-hidden" style={{ background: `${results.investor.color}0A` }}>
                  <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, ${results.investor.color}, transparent 70%)` }} />
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} className="text-4xl mb-2">
                    {results.investor.emoji}
                  </motion.div>
                  <div className="text-[11px] font-mono tracking-widest text-muted-foreground mb-1">شخصیت مالی شما</div>
                  <h3 className="text-xl font-black mb-1" style={{ color: results.investor.color }}>{results.investor.name}</h3>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col items-center gap-2 mb-6">
                    <span className="text-xs text-muted-foreground font-semibold">امتیاز تطابق پرتفوی</span>
                    <ScoreCircle score={results.score} />
                  </div>

                  {/* Allocation comparison */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-4 h-4 text-primary" />
                      <h4 className="font-black text-sm text-foreground">مقایسه توزیع فعلی و ایده‌آل</h4>
                    </div>
                    <div className="space-y-5" dir="ltr">
                      {results.gaps.map((g, i) => {
                        const maxPct = Math.max(g.current, g.ideal, 5)
                        return (
                          <motion.div key={g.type} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}>
                            <div className="flex items-center gap-2 mb-2.5" dir="rtl">
                              <span className="text-base">{g.type === 'crypto' ? '₿' : g.type === 'stock' ? '📈' : g.type === 'gold' ? '🟡' : '💵'}</span>
                              <span className="text-xs font-bold text-foreground">{TYPE_LABELS[g.type] || g.type}</span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground w-16 shrink-0" dir="rtl">وضعیت فعلی</span>
                                <div className="flex-1 h-4 bg-accent/30 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${(g.current / maxPct) * 100}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + i * 0.08 }}
                                    className="h-full rounded-full" style={{ background: '#3B82F6' }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-foreground w-12 text-right shrink-0 font-mono">{g.current.toFixed(1)}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground w-16 shrink-0" dir="rtl">مقدار ایده‌آل</span>
                                <div className="flex-1 h-4 bg-accent/30 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${(g.ideal / maxPct) * 100}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 + i * 0.08 }}
                                    className="h-full rounded-full" style={{ background: '#10B981' }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-foreground w-12 text-right shrink-0 font-mono">{g.ideal.toFixed(1)}%</span>
                              </div>
                            </div>
                            {Math.abs(g.gap) >= 0.5 && (
                              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.08 }}
                                className="flex items-center gap-1 mt-1.5 mr-[4.5rem]" dir="rtl"
                              >
                                {g.gap > 0 ? (
                                  <><TrendingUp className="w-3 h-3 text-emerald-400" /><span className="text-[11px] font-bold text-emerald-400">+{Math.abs(Math.round(g.gap))}%</span><span className="text-[10px] text-muted-foreground">نیاز به افزایش</span></>
                                ) : (
                                  <><TrendingDown className="w-3 h-3 text-red-400" /><span className="text-[11px] font-bold text-red-400">-{Math.abs(Math.round(g.gap))}%</span><span className="text-[10px] text-muted-foreground">نیاز به کاهش</span></>
                                )}
                              </motion.div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Advice */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-4 h-4 text-primary" />
                      <h4 className="font-black text-sm text-foreground">توصیه‌های پرتفوی</h4>
                    </div>
                    <div className="space-y-3">
                      {results.advice.map((item, i) => {
                        const borderColor = item.severity === 'critical' ? '#EF4444' : item.severity === 'warning' ? '#EAB308' : '#10B981'
                        const bgColor = item.severity === 'critical' ? 'rgba(239,68,68,0.06)' : item.severity === 'warning' ? 'rgba(234,179,8,0.06)' : 'rgba(16,185,129,0.06)'
                        return (
                          <motion.div key={i} initial={{ opacity: 0, y: 10, x: -10 }} animate={{ opacity: 1, y: 0, x: 0 }} transition={{ delay: 0.4 + i * 0.1, duration: 0.35 }}
                            className="rounded-xl p-3.5 flex items-start gap-3 text-sm" style={{ borderRight: `3px solid ${borderColor}`, background: bgColor }}
                          >
                            <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                            <span className="text-foreground leading-relaxed">{item.text}</span>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats bar */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="glass border border-border rounded-2xl p-4 flex items-center justify-around gap-3"
              >
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">ارزش کل پرتفوی</div>
                  <div className="text-sm font-black text-foreground">{formatTomanShort(Math.round(results.totalVal))}</div>
                </div>
                <div className="w-px h-8 bg-border/50" />
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">تعداد دارایی‌ها</div>
                  <div className="text-sm font-black text-foreground">{virtualAssets.length}</div>
                </div>
                <div className="w-px h-8 bg-border/50" />
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">دسته‌بندی</div>
                  <div className="text-sm font-black text-foreground">{results.typeCount}</div>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="text-center mt-8"
              >
                <p className="text-sm text-muted-foreground mb-4">می‌تونی با ثبت‌نام، دارایی‌هات رو مدیریت کنی و اسکن دقیق‌تری بگیری</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/#quiz"
                    className="px-6 py-3 rounded-2xl bg-accent/50 border border-border text-foreground font-bold text-sm hover:bg-accent transition-all"
                  >تست شخصیت مالی</Link>
                  <Link href="/app/assets"
                    className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >مدیریت سبد سرمایه</Link>
                </div>
                <button onClick={() => { setStep('form'); setAmounts({ crypto: '', stock: '', gold: '', currency: '' }) }}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                >اسکن مجدد با مقادیر جدید</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
