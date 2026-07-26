'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '@/components/lang-provider'
import { useSession } from '@/lib/auth-client'
import { Play, Pause, X, Crown, Volume2 } from 'lucide-react'

function formatTime(d: Date) {
  return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(d: Date) {
  const t = new Date(); const y = new Date(t); y.setDate(y.getDate() - 1)
  if (d.toDateString() === t.toDateString()) return 'امروز'
  if (d.toDateString() === y.toDateString()) return 'دیروز'
  return d.toLocaleDateString('fa-IR', { month: 'long', day: 'numeric' })
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
          className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  )
}

function AudioMsg({ url, playing, onToggle }: { url: string; playing: boolean; onToggle: () => void }) {
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
    <div className="flex items-center gap-2 min-w-[150px] max-w-full" dir="ltr">
      <button onClick={onToggle}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 shrink-0 transition-all">
        {playing ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white mr-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="h-1 bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-white/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between mt-0.5">
          {playing ? (
            <div className="flex gap-px items-center">
              {[1,2,3].map(i => <div key={i} className="w-0.5 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.5s' }} />)}
            </div>
          ) : <Volume2 className="w-2.5 h-2.5 text-white/40" />}
          <span className="text-[9px] text-white/50 font-mono">{`${m}:${s.toString().padStart(2, '0')}`}</span>
        </div>
      </div>
    </div>
  )
}

function Bubble({ item, sent, playing, setPlaying, setImg, isSug }: {
  item: any; sent: boolean; playing: string | null; setPlaying: (v: string | null) => void
  setImg: (v: string | null) => void; isSug?: boolean
}) {
  const { t } = useLang()
  const p = isSug ? item.profitPercent : item.actualReturn
  const c = item.content || item.description || ''
  const hasImg = !!item.imageUrl && item.imageUrl.startsWith('data:image')
  const hasAud = !!item.audioUrl
  const time = formatTime(new Date(isSug ? item.createdAt : (item.publishedAt || item.createdAt)))

  return (
    <div className={`flex ${sent ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`max-w-[88%] ${sent ? 'bg-[#2AABEE] rounded-[14px_14px_3px_14px]' : 'bg-[#1c1f2e] rounded-[14px_14px_14px_3px]'} px-2.5 py-2 border ${sent ? 'border-[#2AABEE]/10' : 'border-[#2a2d3a]'}`}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[11px] font-bold text-white truncate leading-tight">{item.title}</span>
          {!isSug && (
            <span className={`text-[7px] px-1.5 py-0.5 rounded-full shrink-0 font-bold ${
              item.action === 'buy' ? 'bg-emerald-500/25 text-emerald-400' : 'bg-red-500/25 text-red-400'
            }`}>{item.action === 'buy' ? 'خرید' : 'فروش'}</span>
          )}
        </div>

        {p !== null && p !== undefined && p > 0 && (
          <div className="mb-0.5">
            <span className="text-[10px] font-black text-emerald-400">+{Number(p).toFixed(1)}%</span>
            <span className="text-[7px] text-emerald-400/60 mr-1">{t('sig.profit')}</span>
          </div>
        )}

        {c && (
          <div className={`text-[11px] leading-5 whitespace-pre-wrap mb-0.5 ${sent ? 'text-white/90' : 'text-gray-300'}`} style={{ direction: 'rtl', textAlign: 'right' }}>
            {c.split('\n').map((line: string, i: number) => {
              const tr = line.trim()
              if (!tr) return <div key={i} className="h-0.5" />
              const h = /^[🟡🔵🟢🔴🟣🟠⚪✅❌⚠️⏳🎯📊📈📉💰💎🔥⭐🌟✨💡📌🔔🚀🏆🎯]/.test(tr)
              let cls = 'leading-5'
              if (h) cls += ' font-bold text-white'
              else if (/[\d,]+(,\d{3})*(\.\d+)?\s*(تومان|ریال|دلار)/.test(tr)) cls += ' text-emerald-300 font-medium'
              else if (/\d+(\.\d+)?%/.test(tr)) cls += ' text-amber-300 font-medium'
              return <p key={i} className={cls}>{tr}</p>
            })}
          </div>
        )}

        {hasImg && (
          <div className="-mx-0.5 mb-0.5">
            <img src={item.imageUrl} alt="" className="w-full rounded-lg cursor-pointer hover:opacity-85 transition-opacity max-h-44 object-cover" onClick={() => setImg(item.imageUrl)} loading="lazy" />
          </div>
        )}

        {hasAud && (
          <div className={`rounded-lg p-2 mb-0.5 ${sent ? 'bg-white/5' : 'bg-black/20'}`}>
            <AudioMsg url={item.audioUrl} playing={playing === item.audioUrl} onToggle={() => setPlaying(playing === item.audioUrl ? null : item.audioUrl)} />
          </div>
        )}

        <div className="flex items-center gap-1">
          <span className={`text-[8px] ${sent ? 'text-white/40' : 'text-gray-600'}`}>{time}</span>
          {!isSug && item.symbol && <span className={`text-[7px] ${sent ? 'text-white/25' : 'text-gray-600'} mr-auto`}>{item.symbol}</span>}
        </div>
      </div>
    </div>
  )
}

export default function PersonalPage() {
  const { t } = useLang()
  const { data: session } = useSession()
  const [sugs, setSugs] = useState<any[]>([])
  const [sigs, setSigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState<string | null>(null)
  const [tab, setTab] = useState<'sugs' | 'sigs'>('sugs')
  const [img, setImg] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const uid = session?.user?.id || ''
    Promise.all([
      import('@/app/actions/admin').then(m => m.getUserSuggestions().then(setSugs).catch(() => {})),
      fetch('/api/signals' + (uid ? `?userId=${uid}` : '')).then(r => r.json()).then(d => setSigs(d.signals || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [session])

  useEffect(() => {
    if (!loading && ref.current) setTimeout(() => ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' }), 50)
  }, [loading, tab, sugs, sigs])

  const items = tab === 'sigs' ? sigs : sugs
  const df = tab === 'sigs' ? 'publishedAt' : 'createdAt'
  const grouped = groupByDay(items, df)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-black text-white">{t('sig.title')}</h1>
          <span className="text-[8px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-full">{items.length}</span>
        </div>
        <div className="flex gap-0.5 bg-black/20 rounded-lg p-0.5 border border-white/5">
          <button onClick={() => setTab('sugs')}
            className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all ${tab === 'sugs' ? 'bg-[#2AABEE] text-white' : 'text-gray-500 hover:text-gray-300'}`}>خصوصی</button>
          <button onClick={() => setTab('sigs')}
            className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all ${tab === 'sigs' ? 'bg-[#2AABEE] text-white' : 'text-gray-500 hover:text-gray-300'}`}>عمومی</button>
        </div>
      </div>

      <div ref={ref} className="flex-1 overflow-y-auto py-2 px-0.5 scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-5 h-5 border-2 border-[#2AABEE] border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-600 py-16">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2"><Crown className="w-5 h-5 opacity-30" /></div>
            <p className="text-xs">{tab === 'sigs' ? t('sig.no.public') : t('sig.no.private')}</p>
          </div>
        ) : (
          grouped.map(g => (
            <div key={g.d}>
              <div className="flex items-center justify-center my-1.5">
                <div className="bg-black/30 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/5">
                  <span className="text-[9px] text-gray-500">{formatDate(new Date(g.d))}</span>
                </div>
              </div>
              {g.items.map((item: any) => (
                <Bubble key={item.id} item={item} sent={tab === 'sugs'} playing={playing} setPlaying={setPlaying} setImg={setImg} isSug={tab === 'sugs'} />
              ))}
            </div>
          ))
        )}
      </div>

      <AnimatePresence>{img && <ImagePreview src={img} onClose={() => setImg(null)} />}</AnimatePresence>
    </div>
  )
}
