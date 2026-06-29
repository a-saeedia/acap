'use client'
import { useState } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function AISupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{role: 'user'|'bot', content: string}[]>([{role: 'bot', content: 'سلام! چطور می‌تونم در مدیریت سرمایه‌تون بهتون کمک کنم؟'}])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = input
    setMessages(prev => [...prev, {role: 'user', content: userMsg}])
    setInput('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: userMsg})
      })
      const data = await res.json()
      setMessages(prev => [...prev, {role: 'bot', content: data.response}])
    } catch {
      setMessages(prev => [...prev, {role: 'bot', content: 'متاسفانه در حال حاضر امکان پاسخگویی نیست.'}])
    }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 z-50 p-3 bg-primary text-white rounded-full shadow-lg hover:scale-105 transition-all">
        <MessageCircle />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="fixed bottom-20 right-4 z-50 w-80 h-96 glass border border-border rounded-2xl flex flex-col shadow-2xl">
            <div className="p-3 border-b border-border flex justify-between items-center">
              <div className='flex items-center gap-2'><Bot className='text-primary'/> <span className='font-bold text-sm'>پشتیبان هوشمند ACAP</span></div>
              <button onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {messages.map((m, i) => (
                <div key={i} className={`p-2 rounded-lg text-xs ${m.role === 'user' ? 'bg-primary/20 text-right' : 'bg-accent text-left'}`}>
                  {m.content}
                </div>
              ))}
              {loading && <div className='text-xs text-muted-foreground'>در حال نوشتن...</div>}
            </div>
            <div className="p-2 border-t border-border flex gap-1">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} className="flex-1 input-field text-xs" placeholder="سوال خود را بپرسید..." />
              <button onClick={sendMessage} className="p-2 bg-primary text-white rounded-lg"><Send className="w-3 h-3" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
