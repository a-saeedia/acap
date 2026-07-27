'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '@/components/lang-provider'
import { Play, Pause, X, Crown, Volume2, ChevronLeft, Signal, TrendingUp, CalendarDays, MessageSquare } from 'lucide-react'

function formatDateHeader(d: Date) {
  const t = new Date(); const y = new Date(t); y.setDate(y.getDate() - 1)
  if (d.toDateString() === t.toDateString()) return 'امروز'
  if (d.toDateString() === y.toDateString()) return 'دیروز'
  return d.toLocaleDateString('fa-IR', { month: 'long', day: 'numeric' })
}

function formatDateFull(d: Date) {
  return d.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
}

function groupByDay(items: any[], f: string) {
  const g: { d: string; items: any[] }[] = []; let cur: any[] = []; let ck = ''
  for (const item of items) {
    const k = new Date(f === 'createdAt' ? item.createdAt : (item.publishedAt || item.createdAt)).toDateString()
    if (k !== ck) { if (cur.length) g.push({ d: ck, items: cur }); cur = []; ck = k }
    cur.push(item)
  }
  if (cur.length) g.push({ d: ck, items: cur })
  return g
}

function ImagePreview({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="relative max-w-[95vw] max-h-[95vh]" onClick={e => e.stopPropagation()}>
        <img src={src} alt="" className="max-w-full max-h-[95vh] rounded-2xl shadow-2xl" style={{ objectFit: 'contain' }} />
        <button onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 flex items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  )
}

function AudioPlayer({ url, playing, onToggle }: { url: string; playing: boolean; onToggle: () => void }) {
  const [d, setD] = useState(0); const [ct, setCt] = useState(0); const ref = useRef<HTMLAudioElement | null>(null)
  useEffect(() => {
    if (!ref.current) {
      ref.current = new Audio(url)
      ref.current.onloadedmetadata = () => setD(ref.current!.duration)
      ref.current.ontimeupdate = () => setCt(ref.current!.currentTime)
      ref.current.onended = () => { setCt(0); onToggle() }
    }
    if (playing) ref.current.play().catch(() => {}); else ref.current.pause()
    return () => { if (ref.current) { ref.current.pause(); ref.current = null } }
  }, [playing, url])
  const pct = d > 0 ? (ct / d) * 100 : 0
  const r = d - ct; const m = Math.floor((playing ? r : d) / 60); const s = Math.floor((playing ? r : d) % 60)
  return (
    <div className="flex items-center gap-3" dir="ltr">
      <button onClick={onToggle}
        className="w-10 h-10 rounded-full bg-gray-700/80 flex items-center justify-center hover:bg-gray-600/80 shrink-0 transition-all">
        {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white mr-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1">
          {playing ? (
            <div className="flex gap-0.5 items-center">
              {[1,2,3,4].map(i => <div key={i} className="w-0.5 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.12}s`, animationDuration: '0.5s' }} />)}
            </div>
          ) : <Volume2 className="w-3.5 h-3.5 text-gray-500" />}
          <span className="text-[10px] text-gray-500 font-mono">{`${m}:${s.toString().padStart(2, '0')}`}</span>
        </div>
      </div>
    </div>
  )
}

function SignalCard({ item, onSelect }: { item: any; onSelect: () => void }) {
  const actualOk = item.actualReturn !== null && item.actualReturn !== undefined
  const isWin = actualOk && item.actualReturn >= 0
  const hasImg = item.imageUrl && (String(item.imageUrl).startsWith('data:image') || /\.(jpg|jpeg|png|webp|gif)$/i.test(String(item.imageUrl)))
  const hasAud = !!item.audioUrl
  const hasAction = item.action === 'buy' || item.action === 'sell'
  const desc = item.description || item.content || ''
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
      className="w-full text-right bg-gray-900/80 rounded-xl p-4 border border-gray-700/50 hover:bg-gray-800/80 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
            {hasAction && <span className={`text-[8px] px-1.5 py-0.5 rounded-full shrink-0 ${item.action === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{item.action === 'buy' ? 'خرید' : 'فروش'}</span>}
            {item.isBroadcast && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">همگانی</span>}
          </div>
          {item.symbol && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-gray-400 font-semibold">{item.symbol}</span>
              <span className="text-[9px] text-gray-500">{item.type === 'crypto' ? 'ارز دیجیتال' : item.type === 'stock' ? 'سهام' : item.type === 'gold' ? 'طلا' : item.type === 'dollar' ? 'دلار' : 'فارکس'}</span>
              {hasImg && <span className="text-[8px] text-blue-400">🖼</span>}
              {hasAud && <span className="text-[8px] text-amber-400">🎤</span>}
            </div>
          )}
        </div>
        <ChevronLeft className="w-4 h-4 shrink-0 text-gray-500 group-hover:text-gray-300 transition-colors" />
      </div>
      {hasImg && (
        <div className="mb-2 -mx-1">
          <img src={item.imageUrl} alt="" className="w-full h-24 object-cover rounded-lg border border-gray-700/50" />
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-black/30 rounded-lg p-2 text-center">
          <div className="text-[8px] text-gray-500">سود هدف</div>
          <div className="text-xs font-bold text-blue-400">{item.expectedProfit ? `+${item.expectedProfit}%` : '—'}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-2 text-center">
          <div className="text-[8px] text-gray-500">بازده واقعی</div>
          <div className={`text-xs font-bold ${actualOk ? (isWin ? 'text-emerald-400' : 'text-red-400') : 'text-gray-500'}`}>
            {actualOk ? `${isWin ? '+' : ''}${item.actualReturn}%` : '—'}
          </div>
        </div>
        <div className="bg-black/30 rounded-lg p-2 text-center">
          <div className="text-[8px] text-gray-500">تاریخ</div>
          <div className="text-[10px] text-gray-400">{new Date(item.publishedAt || item.createdAt).toLocaleDateString('fa-IR')}</div>
        </div>
      </div>
      {desc && <p className="text-[10px] text-gray-400 mt-2 line-clamp-2">{desc}</p>}
    </motion.button>
  )
}

function DetailModal({ item, onClose, isSug }: { item: any; onClose: () => void; isSug?: boolean }) {
  const { t } = useLang()
  const [playing, setPlaying] = useState<string | null>(null)
  const [previewImg, setPreviewImg] = useState<string | null>(null)
  const p = isSug ? item.profitPercent : item.actualReturn
  const c = item.content || item.description || ''
  const d = new Date(item.publishedAt || item.createdAt)
  const hasImg = !!item.imageUrl && (item.imageUrl.startsWith('data:image') || /\.(jpg|jpeg|png|webp|gif)$/i.test(item.imageUrl))
  const hasAud = !!item.audioUrl

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={() => { onClose(); setPlaying(null) }}>
        <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.8) 100%)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(148,163,184,0.1)',
            boxShadow: '0 0 60px rgba(56,189,248,0.08), 0 0 120px rgba(251,146,60,0.05), inset 0 1px 0 rgba(255,255,255,0.06)'
          }}
          onClick={e => e.stopPropagation()}>
          <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)' }} />
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full -translate-y-1/4 translate-x-1/4 blur-3xl pointer-events-none" style={{ background: 'rgba(56,189,248,0.1)' }} />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full translate-y-1/4 -translate-x-1/4 blur-3xl pointer-events-none" style={{ background: 'rgba(251,146,60,0.08)' }} />
          <div className="sticky top-0 px-4 py-3 flex items-center justify-between z-10"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              background: 'rgba(15,23,42,0.6)',
              borderBottom: '1px solid rgba(148,163,184,0.06)'
            }}>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-white truncate">{item.title}</h2>
              <p className="text-[10px] text-gray-500 mt-0.5">{formatDateFull(d)} ساعت {formatTime(d)}</p>
            </div>
            <button onClick={() => { onClose(); setPlaying(null) }} className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="px-4 py-4 space-y-3 relative z-10">
            {p !== null && p !== undefined && p > 0 && (
              <div className="rounded-xl px-4 py-3 text-center relative overflow-hidden"
                style={{
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.04) 100%)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  boxShadow: '0 0 30px rgba(16,185,129,0.06), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)' }} />
                <span className="text-lg font-black text-emerald-400 relative z-10">+{Number(p).toFixed(1)}%</span>
                <span className="text-[10px] text-emerald-400/60 mr-1.5 relative z-10">{t('sig.profit')}</span>
              </div>
            )}

            {c && (
              <div className="text-[13px] text-gray-300 leading-7 whitespace-pre-wrap rounded-xl px-3.5 py-3 relative overflow-hidden"
                style={{
                  direction: 'rtl',
                  textAlign: 'right',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  background: 'rgba(15,23,42,0.5)',
                  border: '1px solid rgba(148,163,184,0.06)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)'
                }}>
                {c.split('\n').map((line: string, i: number) => {
                  const tr = line.trim()
                  if (!tr) return <div key={i} className="h-1.5" />
                  const h = /^[🟡🔵🟢🔴🟣🟠⚪✅❌⚠️⏳🎯📊📈📉💰💎🔥⭐🌟✨💡📌🔔🚀🏆🎯]/.test(tr)
                  let cls = 'leading-7'
                  if (h) cls += ' text-amber-300 font-bold text-[14px]'
                  else if (/[\d,]+(,\d{3})*(\.\d+)?\s*(تومان|ریال|دلار)/.test(tr)) cls += ' text-emerald-300 font-medium'
                  else if (/\d+(\.\d+)?%/.test(tr)) cls += ' text-amber-300 font-medium'
                  return <p key={i} className={cls}>{tr}</p>
                })}
              </div>
            )}

            {hasImg && (
              <div className="rounded-xl overflow-hidden cursor-pointer relative"
                style={{ border: '1px solid rgba(148,163,184,0.08)' }}
                onClick={() => setPreviewImg(item.imageUrl)}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10" />
                <img src={item.imageUrl} alt="" className="w-full h-auto max-h-72 object-cover hover:opacity-90 transition-opacity" loading="lazy" />
              </div>
            )}

            {hasAud && (
              <div className="rounded-xl px-4 py-3.5 relative overflow-hidden"
                style={{
                  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.06)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)'
                }}>
                <AudioPlayer url={item.audioUrl} playing={playing === item.audioUrl} onToggle={() => setPlaying(playing === item.audioUrl ? null : item.audioUrl)} />
              </div>
            )}

            {item.expiresAt && (
              <div className={`text-[11px] rounded-lg px-3 py-2 relative overflow-hidden`}
                style={{
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  background: new Date(item.expiresAt) < new Date() ? 'rgba(239,68,68,0.1)' : 'rgba(148,163,184,0.04)',
                  border: '1px solid rgba(148,163,184,0.06)',
                  color: new Date(item.expiresAt) < new Date() ? '#f87171' : '#9ca3af'
                }}>
                {new Date(item.expiresAt) < new Date() ? '⛔ منقضی شده' : `⏳ اعتبار تا ${new Date(item.expiresAt).toLocaleDateString('fa-IR')}`}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      <AnimatePresence>{previewImg && <ImagePreview src={previewImg} onClose={() => setPreviewImg(null)} />}</AnimatePresence>
    </>
  )
}

export default function PersonalPage() {
  const { t } = useLang()
  const [sugs, setSugs] = useState<any[]>([])
  const [revenues, setRevenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'sugs' | 'signals' | 'revenue'>('sugs')
  const [revenueTab, setRevenueTab] = useState<'general' | 'plus'>('general')
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    Promise.all([
      import('@/app/actions/admin').then(m => m.getUserSuggestions().then(setSugs).catch(() => {})),
      import('@/app/actions/admin').then(m => m.getAcapRevenue().then(setRevenues).catch(() => {})),
    ]).finally(() => setLoading(false))
  }, [])

  const acapSignals = sugs.filter((s: any) => s.profitPercent != null && s.profitPercent > 0)
  const winCount = acapSignals.filter((s: any) => s.profitPercent > 0).length
  const winRate = acapSignals.length > 0 ? Math.round(winCount / acapSignals.length * 100) : 0
  const avgReturn = acapSignals.length > 0
    ? acapSignals.reduce((s: number, o: any) => s + (o.profitPercent || 0), 0) / acapSignals.length
    : 0
  const bestReturn = acapSignals.length > 0 ? Math.max(...acapSignals.map((s: any) => s.profitPercent || 0)) : 0

  const filteredRevenues = revenues.filter((r: any) => (r.type || 'general') === revenueTab)
  const totalRevenue = filteredRevenues.reduce((sum: number, r: any) => sum + r.amount, 0)

  const persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-gray-700/30">
        <h1 className="text-base md:text-lg font-black text-white flex items-center gap-2">
          <Signal className="w-5 h-5 text-amber-400" />{t('sig.title')}
        </h1>
      </div>

      <div className="flex gap-2 my-3 overflow-x-auto pb-1">
        <button onClick={() => setTab('sugs')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${tab === 'sugs' ? 'bg-gradient-to-l from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/20' : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700/30'}`}>
          <MessageSquare className="w-3.5 h-3.5 inline-block ml-1" />پیغام‌ها ({sugs.length})
        </button>
        <button onClick={() => setTab('signals')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${tab === 'signals' ? 'bg-gradient-to-l from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/20' : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700/30'}`}>
          <Signal className="w-3.5 h-3.5 inline-block ml-1" />سیگنال‌ها ({acapSignals.length})
        </button>
        <button onClick={() => setTab('revenue')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${tab === 'revenue' ? 'bg-gradient-to-l from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/20' : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700/30'}`}>
          <TrendingUp className="w-3.5 h-3.5 inline-block ml-1" />درآمد A|CAP ({revenues.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : tab === 'sugs' ? (
        <div className="flex-1 overflow-y-auto py-1 px-0.5 scrollbar-thin space-y-3">
          {sugs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 relative overflow-hidden rounded-2xl mx-2"
              style={{
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(148,163,184,0.05)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
              }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(251,146,60,0.08) 100%)' }} />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 relative overflow-hidden"
                style={{
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.06)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)'
                }}>
                <Crown className="w-6 h-6 text-gray-500" style={{ opacity: 0.4 }} />
              </div>
              <p className="text-sm text-gray-500 relative">{t('sig.no.private')}</p>
            </div>
          ) : (groupByDay(sugs, 'createdAt').map(g => (
            <div key={g.d}>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent)' }} />
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full relative overflow-hidden"
                  style={{
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(148,163,184,0.06)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)'
                  }}>
                  <CalendarDays className="w-3 h-3 text-sky-400" />
                  <span className="text-[10px] font-bold text-gray-300">{formatDateHeader(new Date(g.d))}</span>
                </div>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,146,60,0.2), transparent)' }} />
              </div>
              <div className="space-y-2">
                {g.items.map((item: any) => (
                  <button key={item.id} onClick={() => setSelected({ ...item, isSug: true })}
                    className="w-full text-right px-4 py-3 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:bg-gray-700/50 transition-all">
                    <div className="text-sm font-bold text-white">{item.title}</div>
                    {item.content && <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{item.content}</p>}
                    <div className="text-[9px] text-gray-500 mt-1">{formatTime(new Date(item.createdAt))}</div>
                  </button>
                ))}
              </div>
            </div>
          )))}
        </div>
      ) : tab === 'signals' ? (
        <div className="flex-1 overflow-y-auto py-1 px-0.5 scrollbar-thin">
          {acapSignals.length === 0 ? (
            <p className="text-center py-8 text-gray-500">سیگنالی یافت نشد</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {acapSignals.map((s: any) => (
                <SignalCard key={s.id} item={{ ...s, actualReturn: s.profitPercent, description: s.content, publishedAt: s.createdAt }} onSelect={() => setSelected({ ...s, isSug: true })} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-1 px-0.5 scrollbar-thin space-y-4">
          {/* Performance stats */}
          {acapSignals.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'کل سیگنال‌ها', value: acapSignals.length, color: 'text-white' },
                { label: 'نرخ برد', value: `${winRate}%`, color: 'text-emerald-400' },
                { label: 'میانگین بازده', value: `${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(1)}%`, color: 'text-amber-400' },
                { label: 'بهترین بازده', value: `+${bestReturn.toFixed(1)}%`, color: 'text-emerald-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl p-4 border border-gray-800/60 shadow-lg shadow-black/10">
                  <div className="text-[10px] text-gray-500 mb-1">{stat.label}</div>
                  <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          )}
          {acapSignals.length === 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl p-4 border border-gray-800/60 shadow-lg shadow-black/10">
              <div className="text-[10px] text-gray-500 mb-1">آمار عملکرد</div>
              <div className="text-lg font-black text-gray-600">هنوز سیگنالی ثبت نشده</div>
            </div>
          )}

          {/* Revenue tabs */}
          <div className="flex items-center gap-2">
            <button onClick={() => setRevenueTab('general')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${revenueTab === 'general' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>عمومی</button>
            <button onClick={() => setRevenueTab('plus')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${revenueTab === 'plus' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>A|CAP+</button>
            <span className="text-xs text-gray-500">عملکرد ماهانه</span>
          </div>

          {/* Monthly revenue */}
          {filteredRevenues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[...filteredRevenues].sort((a, b) => (b.year - a.year) || (b.month - a.month)).map((r: any) => (
                <div key={r.id || `${r.year}-${r.month}`} className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-bold text-gray-300">{persianMonths[r.month - 1] || r.month}</span>
                      <span className="text-[10px] text-gray-500">{r.year}</span>
                    </div>
                  </div>
                  <div className="text-lg font-black text-emerald-400">+{Number(r.amount).toFixed(1)}%</div>
                  {r.description && <div className="text-[11px] text-gray-500 mt-1.5 line-clamp-2">{r.description}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">عملکردی ثبت نشده است</p>
          )}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <DetailModal item={selected} onClose={() => setSelected(null)} isSug={selected.isSug} />
        )}
      </AnimatePresence>
    </div>
  )
}