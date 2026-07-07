'use client'
import { useState } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SUGGESTIONS = [
  'چطور می‌تونم سبد سرمایه‌ام رو متعادل کنم؟',
  'بهترین استراتژی برای شروع سرمایه‌گذاری چیه؟',
  'تحلیل پرتفوی من چطوره؟',
  'چطور می‌تونم اشتراک A|CAP+ بگیرم؟',
]

export function AISupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{role: 'user'|'bot', content: string}[]>([{role: 'bot', content: 'سلام! چطور می‌تونم در مدیریت سرمایه‌تون بهتون کمک کنم؟'}])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async (text?: string) => {
    const msg = text ?? input
    if (!msg.trim()) return
    setMessages(prev => [...prev, {role: 'user', content: msg}])
    setInput('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: msg})
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setMessages(prev => [...prev, {role: 'bot', content: data.response}])
    } catch {
      setMessages(prev => [...prev, {role: 'bot', content: 'متاسفانه در حال حاضر امکان پاسخگویی نیست.'}])
    }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} aria-label="چت با پشتیبان هوشمند" className="fixed bottom-4 left-4 z-50 p-3 bg-primary text-white rounded-full shadow-lg hover:scale-105 transition-all" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <MessageCircle className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{opacity:0, scale:0.95, y:10}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:10}}
            className="fixed bottom-20 left-4 z-50 w-80 h-96 rounded-2xl flex flex-col shadow-2xl border border-border/50"
            style={{ background: '#0A1420', backdropFilter: 'blur(20px)' }}
          >
            <div className="p-3 border-b border-border/50 flex justify-between items-center shrink-0 bg-[#0D1B2A] rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm text-foreground">پشتیبان هوشمند ACAP</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-2" style={{ background: '#0A1420' }}>
              {messages.map((m, i) => (
                <div key={i} className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                  m.role === 'user'
                    ? 'bg-primary/20 text-foreground mr-auto'
                    : 'bg-[#1A3350] text-foreground ml-auto'
                }`}>
                  {m.content}
                </div>
              ))}
              {loading && <div className="text-xs text-muted-foreground text-center py-2">در حال نوشتن...</div>}
            </div>
            {messages.length <= 1 && (
              <div className="px-2 pb-1 flex flex-wrap gap-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)} disabled={loading}
                    className="text-[9px] bg-[#1A3350] hover:bg-[#254060] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="p-2 border-t border-border/50 flex gap-1 bg-[#0D1B2A] rounded-b-2xl">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                className="flex-1 rounded-xl px-3 py-2 text-xs text-foreground border border-border/30 outline-none transition-colors"
                style={{ background: '#0A1420' }}
                placeholder="سوال خود را بپرسید..."
              />
              <button onClick={() => sendMessage()} className="p-2 bg-primary text-white rounded-xl hover:opacity-90 transition-all shrink-0">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}