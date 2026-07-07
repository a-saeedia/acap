'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { motion } from 'framer-motion'
import { createTicket, getUserTickets, getTicketMessages, addMessage } from '@/app/actions/tickets'
import { MessageSquare, Loader2, Send, Plus } from 'lucide-react'

type Ticket = Awaited<ReturnType<typeof getUserTickets>>[number]
type Message = Awaited<ReturnType<typeof getTicketMessages>>[number]

export default function TicketsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [subject, setSubject] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [msgs, setMsgs] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)

  useEffect(() => {
    if (!isPending && !session) router.push('/')
    if (!isPending && session) loadTickets()
  }, [session, isPending])

  async function loadTickets() {
    setLoading(true)
    try { setTickets(await getUserTickets() || []) } catch {}
    setLoading(false)
  }

  async function handleCreate() {
    if (!subject.trim()) return
    setSending(true)
    try {
      await createTicket(subject)
      setSubject('')
      loadTickets()
    } catch {}
    setSending(false)
  }

  async function openTicket(id: string) {
    setSelected(id)
    setLoadingMsgs(true)
    try { setMsgs(await getTicketMessages(id) || []) } catch {}
    setLoadingMsgs(false)
  }

  async function handleReply() {
    if (!newMsg.trim() || !selected) return
    setSending(true)
    try {
      await addMessage(selected, newMsg)
      setNewMsg('')
      setMsgs(await getTicketMessages(selected) || [])
    } catch {}
    setSending(false)
  }

  if (isPending) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!session) return null

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-black mb-6">تیکت‌های پشتیبانی</h1>

        <div className="flex gap-2 mb-8">
          <input value={subject} onChange={e => setSubject(e.target.value)}
            placeholder="موضوع تیکت جدید..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <button onClick={handleCreate} disabled={sending || !subject.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-sm font-bold transition-colors"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            ایجاد تیکت
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-bold mb-3">تیکت‌های من</h2>
            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-gray-800/50 animate-pulse" />)}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-2xl">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/70" />
                <p className="text-muted-foreground text-sm">تیکتی وجود ندارد</p>
                <p className="text-muted-foreground/70 text-xs mt-1">با نوشتن موضوع تیکت جدید، اولین تیکت را ایجاد کنید</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map(t => (
                  <div key={t.id} onClick={() => openTicket(t.id)}
                    className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                      selected === t.id ? 'bg-primary/15 border-primary/30' : 'bg-card border-border hover:border-border'
                    }`}
                  >
                    <p className="font-semibold text-sm">{t.subject}</p>
                    <p className="text-xs mt-1">
                        <span className={`${t.status === 'open' ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                        {t.status === 'open' ? 'باز' : 'بسته شده'}
                      </span>
                      <span className="text-muted-foreground/70 mr-2">{new Date(t.createdAt).toLocaleDateString('fa-IR')}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {selected && (
              <>
                <h2 className="text-lg font-bold mb-3">پیام‌ها</h2>
                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {msgs.map(m => (
                      <div key={m.id} className="bg-card border border-border rounded-xl p-3.5">
                        <p className="text-sm leading-relaxed">{m.message}</p>
                        <p className="text-xs text-muted-foreground/70 mt-2">{new Date(m.createdAt).toLocaleString('fa-IR')}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                    placeholder="پیام شما..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
                    onKeyDown={e => e.key === 'Enter' && handleReply()}
                  />
                  <button onClick={handleReply} disabled={sending || !newMsg.trim()}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-sm font-bold transition-colors"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    ارسال
                  </button>
                </div>
              </>
            )}
            {!selected && !loading && tickets.length > 0 && (
              <div className="text-center py-16 text-muted-foreground text-sm">
                یک تیکت را برای مشاهده پیام‌ها انتخاب کنید
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
