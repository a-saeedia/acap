'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '@/components/lang-provider'
import { useSession } from '@/lib/auth-client'
import { Play, Pause, X, Crown, Mic, ChevronDown, ImageIcon, Volume2 } from 'lucide-react'

function formatTime(d: Date) {
  return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(d: Date) {
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'امروز'
  if (d.toDateString() === yesterday.toDateString()) return 'دیروز'
  return d.toLocaleDateString('fa-IR', { month: 'long', day: 'numeric' })
}

function groupByDay(items: any[], dateField: string) {
  const groups: { date: string; items: any[] }[] = []
  let current: any[] = []
  let currentKey = ''
  for (const item of items) {
    const d = new Date(dateField === 'createdAt' ? item.createdAt : (item.publishedAt || item.createdAt))
    const k = d.toDateString()
    if (k !== currentKey) {
      if (current.length) groups.push({ date: currentKey, items: current })
      current = []
      currentKey = k
    }
    current.push(item)
  }
  if (current.length) groups.push({ date: currentKey, items: current })
  return groups
}

function ImagePreview({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
        className="relative max-w-[95vw] max-h-[95vh]" onClick={e => e.stopPropagation()}
      >
        <img src={src} alt="" className="max-w-full max-h-[95vh] rounded-2xl shadow-2xl" style={{ objectFit: 'contain' }} />
        <button onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 flex items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  )
}

function AudioMessage({ audioUrl, playing, onToggle }: { audioUrl: string; playing: boolean; onToggle: () => void }) {
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onloadedmetadata = () => setDuration(audioRef.current!.duration)
      audioRef.current.ontimeupdate = () => setCurrentTime(audioRef.current!.currentTime)
      audioRef.current.onended = () => { setCurrentTime(0); onToggle() }
    }
    if (playing) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null } }
  }, [playing, audioUrl])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const remaining = duration - currentTime
  const mins = Math.floor((playing ? remaining : duration) / 60)
  const secs = Math.floor((playing ? remaining : duration) % 60)

  return (
    <div className="flex items-center gap-2.5 min-w-[180px] max-w-full" dir="ltr">
      <button onClick={onToggle}
        className="w-9 h-9 rounded-full bg-[#2AABEE]/15 flex items-center justify-center hover:bg-[#2AABEE]/25 shrink-0 transition-all"
      >
        {playing ? <Pause className="w-4 h-4 text-[#2AABEE]" /> : <Play className="w-4 h-4 text-[#2AABEE] mr-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#2AABEE] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex gap-px items-center">
            {playing ? [1,2,3].map(i => (
              <div key={i} className="w-0.5 h-2.5 bg-[#2AABEE] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.6s' }} />
            )) : <Volume2 className="w-3 h-3 text-gray-500" />}
          </div>
          <span className="text-[10px] text-gray-500 font-mono">{`${mins}:${secs.toString().padStart(2, '0')}`}</span>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ item, isSent, playingAudio, setPlayingAudio, setPreviewImg, isSuggestion }: {
  item: any; isSent: boolean; playingAudio: string | null; setPlayingAudio: (v: string | null) => void
  setPreviewImg: (v: string | null) => void; isSuggestion?: boolean
}) {
  const { t } = useLang()
  const profit = isSuggestion ? item.profitPercent : item.actualReturn
  const content = item.content || item.description || ''
  const hasImage = !!item.imageUrl && item.imageUrl.startsWith('data:image')
  const hasAudio = !!item.audioUrl

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-1.5`}>
      <div className={`max-w-[85%] sm:max-w-[75%] ${isSent ? 'bg-gradient-to-br from-[#2AABEE]/90 to-[#2AABEE]/70 rounded-[18px_18px_4px_18px]' : 'bg-[#1c1f2e] rounded-[18px_18px_18px_4px]'} px-3.5 py-2.5 shadow-sm border ${isSent ? 'border-[#2AABEE]/20' : 'border-[#2a2d3a]'}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[12px] font-bold ${isSent ? 'text-white' : 'text-white'} truncate leading-tight`}>{item.title}</span>
          {!isSuggestion && (
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full shrink-0 font-bold ${
              item.action === 'buy' ? 'bg-emerald-500/25 text-emerald-400' : 'bg-red-500/25 text-red-400'
            }`}>{item.action === 'buy' ? 'خرید' : 'فروش'}</span>
          )}
        </div>

        {profit !== null && profit !== undefined && profit > 0 && (
          <div className="bg-emerald-500/10 rounded-lg px-2.5 py-1.5 mb-1.5 inline-block">
            <span className="text-[11px] font-black text-emerald-400">+{Number(profit).toFixed(1)}%</span>
            <span className="text-[8px] text-emerald-400/60 mr-1">{t('sig.profit')}</span>
          </div>
        )}

        {content && (
          <div className={`text-[12px] leading-6 whitespace-pre-wrap mb-1 ${isSent ? 'text-white/85' : 'text-gray-300'}`} style={{ direction: 'rtl', textAlign: 'right' }}>
            {content.split('\n').map((line: string, i: number) => {
              const t = line.trim()
              if (!t) return <div key={i} className="h-1" />
              const isHeader = /^[🟡🔵🟢🔴🟣🟠⚪✅❌⚠️⏳🎯📊📈📉💰💎🔥⭐🌟✨💡📌🔔🚀🏆🎯]/.test(t)
              let cls = 'leading-6'
              if (isHeader) cls += ' font-bold text-white'
              else if (/[\d,]+(,\d{3})*(\.\d+)?\s*(تومان|ریال|دلار)/.test(t)) cls += ' text-emerald-300 font-medium'
              else if (/\d+(\.\d+)?%/.test(t)) cls += ' text-amber-300 font-medium'
              return <p key={i} className={cls}>{t}</p>
            })}
          </div>
        )}

        {hasImage && (
          <div className="mb-1.5 -mx-1">
            <img src={item.imageUrl} alt=""
              className="w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity border border-white/5 max-h-52 object-cover"
              onClick={() => setPreviewImg(item.imageUrl)} loading="lazy"
            />
          </div>
        )}

        {hasAudio && (
          <div className={`rounded-xl p-2.5 ${isSent ? 'bg-white/5' : 'bg-black/20'}`}>
            <AudioMessage
              audioUrl={item.audioUrl}
              playing={playingAudio === item.audioUrl}
              onToggle={() => setPlayingAudio(playingAudio === item.audioUrl ? null : item.audioUrl)}
            />
          </div>
        )}

        <div className={`flex items-center gap-1 ${isSent ? 'justify-start' : 'justify-start'}`}>
          <span className={`text-[9px] ${isSent ? 'text-white/40' : 'text-gray-600'}`}>
            {formatTime(new Date(isSuggestion ? item.createdAt : (item.publishedAt || item.createdAt)))}
          </span>
          {!isSuggestion && item.symbol && (
            <span className={`text-[8px] ${isSent ? 'text-white/30' : 'text-gray-600'} mr-auto`}>{item.symbol}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PersonalPage() {
  const { t, lang } = useLang()
  const { data: session } = useSession()
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [signals, setSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [sigTab, setSigTab] = useState<'suggestions' | 'signals'>('suggestions')
  const [previewImg, setPreviewImg] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const userId = session?.user?.id || ''
    Promise.all([
      import('@/app/actions/admin').then(m =>
        m.getUserSuggestions().then(setSuggestions).catch(() => {})
      ),
      fetch('/api/signals' + (userId ? `?userId=${userId}` : '')).then(r => r.json()).then(d => setSignals(d.signals || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [session])

  useEffect(() => {
    if (!loading && listRef.current) {
      setTimeout(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }) }, 50)
    }
  }, [loading, sigTab, suggestions, signals])

  const itemsToShow = sigTab === 'signals' ? signals : suggestions
  const dateField = sigTab === 'signals' ? 'publishedAt' : 'createdAt'
  const grouped = groupByDay(itemsToShow, dateField)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-1 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-black text-white">{t('sig.title')}</h1>
          <span className="text-[9px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{itemsToShow.length}</span>
        </div>
        <div className="flex gap-1 bg-black/30 rounded-xl p-0.5 border border-white/5">
          <button onClick={() => setSigTab('suggestions')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${sigTab === 'suggestions' ? 'bg-[#2AABEE] text-white shadow-lg shadow-[#2AABEE]/20' : 'text-gray-500 hover:text-gray-300'}`}
          >خصوصی</button>
          <button onClick={() => setSigTab('signals')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${sigTab === 'signals' ? 'bg-[#2AABEE] text-white shadow-lg shadow-[#2AABEE]/20' : 'text-gray-500 hover:text-gray-300'}`}
          >عمومی</button>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto py-3 px-0.5 space-y-1 scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#2AABEE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : itemsToShow.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-600 py-20">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Crown className="w-6 h-6 opacity-30" />
            </div>
            <p className="text-sm">{sigTab === 'signals' ? t('sig.no.public') : t('sig.no.private')}</p>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.date}>
              <div className="flex items-center justify-center mb-2 mt-1">
                <div className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5">
                  <span className="text-[10px] text-gray-500 font-medium">{formatDate(new Date(group.date))}</span>
                </div>
              </div>
              {group.items.map((item: any) => (
                <ChatBubble
                  key={item.id}
                  item={item}
                  isSent={sigTab === 'suggestions'}
                  playingAudio={playingAudio}
                  setPlayingAudio={setPlayingAudio}
                  setPreviewImg={setPreviewImg}
                  isSuggestion={sigTab === 'suggestions'}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <AnimatePresence>{previewImg && <ImagePreview src={previewImg} onClose={() => setPreviewImg(null)} />}</AnimatePresence>
    </div>
  )
}
