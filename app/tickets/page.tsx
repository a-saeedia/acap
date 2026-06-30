'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { motion } from 'framer-motion'
import { createTicket, getUserTickets, getTicketMessages, addMessage } from '@/app/actions/tickets'

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

  useEffect(() => {
    if (!isPending && !session) router.push('/')
    if (!isPending && session) loadTickets()
  }, [session, isPending])

  async function loadTickets() {
    setTickets(await getUserTickets())
  }

  async function handleCreate() {
    if (!subject.trim()) return
    await createTicket(subject)
    setSubject('')
    loadTickets()
  }

  async function openTicket(id: string) {
    setSelected(id)
    setMsgs(await getTicketMessages(id))
  }

  async function handleReply() {
    if (!newMsg.trim() || !selected) return
    await addMessage(selected, newMsg)
    setNewMsg('')
    setMsgs(await getTicketMessages(selected))
  }

  if (isPending) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-6">تیکت‌های پشتیبانی</h1>

        <div className="flex gap-2 mb-8">
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="موضوع تیکت جدید..." className="flex-1 p-2 rounded bg-gray-800 border border-gray-700" />
          <button onClick={handleCreate} className="px-4 py-2 bg-emerald-600 rounded">ایجاد تیکت</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold mb-2">تیکت‌های من</h2>
            {tickets.length === 0 ? <p className="text-gray-500">تیکتی وجود ندارد</p> : tickets.map(t => (
              <div key={t.id} onClick={() => openTicket(t.id)} className={`bg-gray-900 p-3 rounded cursor-pointer border ${selected === t.id ? 'border-emerald-500' : 'border-gray-800'}`}>
                <p className="font-medium">{t.subject}</p>
                <p className="text-xs text-gray-400">{t.status === 'open' ? 'باز' : 'بسته شده'} - {new Date(t.createdAt).toLocaleDateString('fa-IR')}</p>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {selected && (
              <>
                <h2 className="text-lg font-semibold">پیام‌ها</h2>
                {msgs.map(m => (
                  <div key={m.id} className="bg-gray-900 p-3 rounded">
                    <p className="text-sm">{m.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(m.createdAt).toLocaleString('fa-IR')}</p>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="پیام شما..." className="flex-1 p-2 rounded bg-gray-800 border border-gray-700" />
                  <button onClick={handleReply} className="px-4 py-2 bg-emerald-600 rounded">ارسال</button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
