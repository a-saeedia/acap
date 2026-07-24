'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '@/components/lang-provider'
import { useSession } from '@/lib/auth-client'
import { Play, Pause, X, Crown, Mic, Calendar } from 'lucide-react'

function formatTime(d: Date, lang: string) {
  return d.toLocaleTimeString(lang === 'fa' ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
}

const signalLabels: Record<string, { bg: string; border: string; icon: string; key: string }> = {
  crypto: { bg: 'from-orange-600/20 via-orange-600/5 to-transparent', border: 'border-r-orange-500', icon: 'text-orange-400', key: 'asset.crypto.long' },
  gold: { bg: 'from-yellow-600/20 via-yellow-600/5 to-transparent', border: 'border-r-yellow-500', icon: 'text-yellow-400', key: 'asset.gold' },
  dollar: { bg: 'from-emerald-600/20 via-emerald-600/5 to-transparent', border: 'border-r-emerald-500', icon: 'text-emerald-400', key: 'asset.dollar' },
  stock: { bg: 'from-cyan-600/20 via-cyan-600/5 to-transparent', border: 'border-r-cyan-500', icon: 'text-cyan-400', key: 'asset.stock.market' },
  forex: { bg: 'from-blue-600/20 via-blue-600/5 to-transparent', border: 'border-r-blue-500', icon: 'text-blue-400', key: 'asset.forex' },
}
const defaultSignal = { bg: 'from-pink-600/20 via-pink-600/5 to-transparent', border: 'border-r-pink-500', icon: 'text-pink-400', key: 'asset.other' }


function getSignalColor(type: string) {
  const ct = String(type || '').toLowerCase()
  return signalLabels[ct] || defaultSignal
}

function monthKey(d: Date) {
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long' }).format(d)
}

function SignalBubble({ item, onClick, isSuggestion }: { item: any; onClick: () => void; isSuggestion?: boolean }) {
  const { t, lang } = useLang()
  const isSignal = !isSuggestion
  const type = isSignal ? String(item.type || '') : ''
  const col = getSignalColor(isSuggestion ? '' : type)
  const profit = isSuggestion ? item.profitPercent : item.actualReturn
  const profitLabel = isSuggestion ? t('sig.suggested.profit') : t('sig.actual.return')
  const date = new Date(isSuggestion ? item.createdAt : item.publishedAt || item.createdAt)

  let leftColor = col.border
  if (isSuggestion) {
    const t = ((item.title || '') + ' ' + (item.content || '')).toLowerCase()
    if (/\b(btc|bitcoin|بیت)\b/.test(t)) leftColor = 'border-r-orange-500'
    else if (/\b(eth|ethereum|اتریوم)\b/.test(t)) leftColor = 'border-r-indigo-500'
    else if (/\b(gold|طلا|سکه)\b/.test(t)) leftColor = 'border-r-yellow-500'
    else if (/\b(دلار|usd|dollar|تتر)\b/.test(t)) leftColor = 'border-r-emerald-500'
    else if (/\b(بورس|stock|سهام|فولاد|فملی|خودرو)\b/.test(t)) leftColor = 'border-r-cyan-500'
    else leftColor = 'border-r-pink-500'
  }

  return (
    <button onClick={onClick} className={`w-full text-right bg-[#1c1f2e] hover:bg-[#222636] border border-[#2a2d3a] border-r-4 ${leftColor} rounded-xl transition-all group active:scale-[0.99] p-2.5 md:p-3`}>
      <div className="flex items-start gap-2 md:gap-2.5">
        <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-white/5 shrink-0 flex items-center justify-center border border-white/5 overflow-hidden">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Crown className={`w-3.5 h-3.5 md:w-4 md:h-4 ${col.icon}`} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs md:text-[13px] font-bold text-white truncate">{item.title}</span>
            {!isSuggestion && (
              <span className={`text-[7px] md:text-[8px] px-1.5 py-0.5 rounded-full shrink-0 ${
                item.action === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>{item.action === 'buy' ? 'BUY' : 'SELL'}</span>
            )}
          </div>
          {profit !== null && profit !== undefined && profit > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[8px] md:text-[9px] text-emerald-400 font-bold">+{Number(profit).toFixed(1)}%</span>
              <span className="text-[6px] md:text-[7px] text-gray-600">{profitLabel}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-2 mt-1 pr-9 md:pr-0">
        {!isSuggestion && <span className="text-[8px] md:text-[9px] text-gray-500">{item.symbol}</span>}
        <span className="text-[8px] md:text-[9px] text-gray-600">{t(col.key)}</span>
        <span className="text-[7px] md:text-[8px] text-gray-600 mr-auto">{formatTime(date, lang)}</span>
      </div>
    </button>
  )
}

export default function PersonalPage() {
  const { t, lang } = useLang()
  const { data: session } = useSession()
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [signals, setSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [sigTab, setSigTab] = useState<'suggestions' | 'signals'>('suggestions')

  useEffect(() => {
    const userId = session?.user?.id || ''
    Promise.all([
      import('@/app/actions/admin').then(m =>
        m.getUserSuggestions().then(setSuggestions).catch(() => {})
      ),
      fetch('/api/signals' + (userId ? `?userId=${userId}` : '')).then(r => r.json()).then(d => setSignals(d.signals || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [session])

  const sorted = [...suggestions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const grouped = sorted.reduce((acc: Record<string, any[]>, s: any) => {
    const k = monthKey(new Date(s.createdAt))
    if (!acc[k]) acc[k] = []
    acc[k].push(s)
    return acc
  }, {})
  const groupEntries = Object.entries(grouped)

  return (
    <>
      {/* Tab bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-sm md:text-base font-black text-white leading-tight">{t('sig.title')}</h1>
          <span className="text-[8px] md:text-[9px] text-gray-500">{t('sig.messages').replace('{{count}}', String(sigTab === 'suggestions' ? suggestions.length : signals.length))}</span>
        </div>
        <div className="flex gap-0.5">
          <button onClick={() => setSigTab('suggestions')} className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg text-[9px] md:text-[10px] font-bold transition-all ${sigTab === 'suggestions' ? 'bg-[#2AABEE] text-white' : 'bg-[#2a2d3a] text-gray-400'}`}>{t('sig.private')}</button>
          <button onClick={() => setSigTab('signals')} className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg text-[9px] md:text-[10px] font-bold transition-all ${sigTab === 'signals' ? 'bg-[#2AABEE] text-white' : 'bg-[#2a2d3a] text-gray-400'}`}>{t('sig.public')}</button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1.5 md:space-y-2.5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-[#2AABEE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sigTab === 'signals' ? (
          signals.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 py-16">
              <Crown className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-xs md:text-sm">{t('sig.no.public')}</p>
            </div>
          ) : (
            <div className="space-y-1 md:space-y-2">
              {signals.map((s: any) => (
                <SignalBubble key={s.id} item={s} onClick={() => setSelected({ ...s, content: s.description, profitPercent: s.actualReturn })} />
              ))}
            </div>
          )
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 py-16">
            <Crown className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs md:text-sm">{t('sig.no.private')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groupEntries.map(([month, items]: [string, any[]]) => (
              <div key={month}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2a2d3a] to-transparent" />
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1c1f2e] border border-[#2a2d3a]">
                    <Calendar className="w-2.5 h-2.5 text-[#2AABEE]" />
                    <span className="text-[8px] md:text-[10px] font-bold text-white">{month}</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2a2d3a] to-transparent" />
                </div>
                <div className="space-y-1">
                  {items.map((item: any) => (
                    <SignalBubble key={item.id} item={item} onClick={() => setSelected(item)} isSuggestion />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3"
            onClick={() => { setSelected(null); setPlayingAudio(null) }}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#1c1f2e] border border-[#2a2d3a] rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-l from-[#2AABEE]/10 to-transparent border-b border-[#2a2d3a] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#2AABEE]/15 flex items-center justify-center shrink-0">
                    <Crown className="w-3.5 h-3.5 text-[#2AABEE]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[14px] font-bold text-white truncate">{selected.title}</h2>
                    <div className="flex items-center gap-2 text-[8px] text-gray-500">
                      <span>{formatTime(new Date(selected.createdAt || selected.publishedAt), lang)}</span>
                      <span>{new Date(selected.createdAt || selected.publishedAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => { setSelected(null); setPlayingAudio(null) }} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="px-4 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
                {selected.profitPercent && (
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 text-center">
                    <div className="text-[9px] text-gray-500 mb-0.5">{t('sig.profit')}</div>
                    <div className="text-xl font-black text-emerald-400">+{Number(selected.profitPercent).toFixed(1)}%</div>
                  </div>
                )}

                {selected.profitMessage && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                    <span className="text-[12px] text-emerald-400 font-bold">{selected.profitMessage}</span>
                  </div>
                )}

                {(selected.content || selected.description) && (
                  <div className="text-[13px] text-gray-300 leading-7 whitespace-pre-wrap" style={{ direction: 'rtl', textAlign: 'right' }}>
                    {(selected.content || selected.description).split('\n').map((line: string, i: number) => {
                      const t = line.trim()
                      if (!t) return <div key={i} className="h-1.5" />
                      const isHeader = /^[🟡🔵🟢🔴🟣🟠⚪✅❌⚠️⏳🎯📊📈📉💰💎🔥⭐🌟✨💡📌🔔🚀🏆🎯]/.test(t)
                      let cls = 'leading-7'
                      if (isHeader) cls += ' text-amber-300 font-bold text-[14px]'
                      else if (/[\d,]+(,\d{3})*(\.\d+)?\s*(تومان|ریال|دلار)/.test(t)) cls += ' text-emerald-400 font-medium'
                      else if (/\d+(\.\d+)?%/.test(t)) cls += ' text-amber-400 font-medium'
                      return <p key={i} className={cls}>{t}</p>
                    })}
                  </div>
                )}

                {selected.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-[#2a2d3a]">
                    <img src={selected.imageUrl} alt="" className="w-full h-auto max-h-80 object-cover" loading="lazy" />
                  </div>
                )}

                {selected.audioUrl && (
                  <div className="flex items-center gap-2.5 bg-[#0b0e17] rounded-xl px-3.5 py-3 border border-[#2a2d3a]">
                    <button onClick={() => setPlayingAudio(playingAudio === selected.audioUrl ? null : selected.audioUrl)}
                      className="w-8 h-8 rounded-full bg-[#2AABEE]/15 flex items-center justify-center hover:bg-[#2AABEE]/25 shrink-0 transition-all"
                    >
                      {playingAudio === selected.audioUrl ? <Pause className="w-4 h-4 text-[#2AABEE]" /> : <Play className="w-4 h-4 text-[#2AABEE] mr-0.5" />}
                    </button>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Mic className="w-4 h-4 text-gray-600 shrink-0" />
                      <span className="text-[11px] text-gray-400">{t('sig.voice')}</span>
                      {playingAudio === selected.audioUrl && (
                        <div className="flex gap-px items-center">
                          {[1,2,3].map(i => <div key={i} className="w-0.5 h-3 bg-[#2AABEE] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selected.expiresAt && (
                  <div className={`text-[11px] ${new Date(selected.expiresAt) < new Date() ? 'text-red-400' : 'text-gray-500'}`}>
                    {new Date(selected.expiresAt) < new Date() ? t('sig.expired') : `⏳ ${new Date(selected.expiresAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}`}
                  </div>
                )}
              </div>

              <div className="border-t border-[#2a2d3a] px-4 py-2.5">
                <button onClick={() => { setSelected(null); setPlayingAudio(null) }}
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-[#2a2d3a] text-gray-400 hover:text-white hover:border-[#2AABEE]/30 transition-all text-[12px] font-medium"
                >
                  {t('common.close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {playingAudio && <audio src={playingAudio} onEnded={() => setPlayingAudio(null)} className="hidden" />}
    </>
  )
}
