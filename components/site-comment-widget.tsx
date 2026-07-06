'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { createSiteComment } from '@/app/actions/settings'
import { MessageSquare, X, Loader2, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function SiteCommentWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    if (!content.trim()) return
    setSending(true)
    try {
      await createSiteComment({ path: pathname, content: content.trim() })
      setContent('')
      setSent(true)
      setTimeout(() => { setSent(false); setOpen(false) }, 2000)
    } catch (e) { console.error(e) }
    setSending(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl transition-colors"
        title="ثبت نظر"
      >
        <MessageSquare className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-36 right-4 z-50 w-72 bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-2xl"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">نظر شما</h3>
              <button onClick={() => { setOpen(false); setSent(false) }} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {sent ? (
              <div className="text-center py-6">
                <div className="text-green-400 text-lg mb-1">✓</div>
                <p className="text-green-400 text-sm font-bold">نظر شما ثبت شد</p>
              </div>
            ) : (
              <>
                <p className="text-[10px] text-gray-500 mb-2">صفحه: {pathname}</p>
                <textarea value={content} onChange={e => setContent(e.target.value)}
                  placeholder={pathname.includes('/app') ? 'نظر شما درباره این بخش از داشبورد...' : 'نظر یا پیشنهاد شما...'}
                  rows={3} className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs outline-none resize-none" />
                <button onClick={handleSubmit} disabled={sending || !content.trim()}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  ارسال نظر
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
