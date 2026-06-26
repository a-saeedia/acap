'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUsers, toggleAcapPlus, sendSuggestion, getTickets, getTicketMessages, replyToTicket, closeTicket } from '@/app/actions/admin'
import { createTicket } from '@/app/actions/tickets'
import { useSession } from '@/lib/auth-client'

type User = Awaited<ReturnType<typeof getUsers>>[number]
type Ticket = Awaited<ReturnType<typeof getTickets>>[number]

export default function AdminPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<'users' | 'tickets'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [sugUser, setSugUser] = useState<string | null>(null)
  const [sugTitle, setSugTitle] = useState('')
  const [sugContent, setSugContent] = useState('')
  const [replyMsg, setReplyMsg] = useState('')
  const [msgs, setMsgs] = useState<any[]>([])

  useEffect(() => {
    if (!isPending && !session) router.push('/')
    if (!isPending && session) {
      getUsers().then(setUsers).catch(() => router.push('/'))
      loadTickets()
    }
  }, [session, isPending])

  async function loadTickets() {
    const t = await getTickets()
    setTickets(t)
  }

  async function handleToggle(userId: string, current: boolean) {
    await toggleAcapPlus(userId, !current)
    setUsers(users.map(u => u.id === userId ? {
      ...u,
      subscription: u.subscription ? { ...u.subscription, acapPlus: !current } : null,
    } : u))
  }

  async function handleSuggestion(userId: string) {
    await sendSuggestion(userId, sugTitle, sugContent)
    setSugUser(null)
    setSugTitle('')
    setSugContent('')
  }

  async function openTicket(ticketId: string) {
    setSelectedTicket(ticketId)
    const msgs = await getTicketMessages(ticketId)
    setMsgs(msgs)
  }

  async function handleReply(ticketId: string) {
    await replyToTicket(ticketId, replyMsg)
    setReplyMsg('')
    const msgs = await getTicketMessages(ticketId)
    setMsgs(msgs)
  }

  async function handleClose(ticketId: string) {
    await closeTicket(ticketId)
    setSelectedTicket(null)
    loadTickets()
  }

  if (isPending) return <div className="min-h-screen flex items-center justify-center text-white">...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">پنل مدیریت A|CAP</h1>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab('users')} className={`px-4 py-2 rounded ${tab === 'users' ? 'bg-emerald-600' : 'bg-gray-700'}`}>کاربران</button>
        <button onClick={() => setTab('tickets')} className={`px-4 py-2 rounded ${tab === 'tickets' ? 'bg-emerald-600' : 'bg-gray-700'}`}>تیکت‌ها</button>
      </div>

      {tab === 'users' && (
        <div className="space-y-4">
          {users.map(u => (
            <div key={u.id} className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-sm text-gray-400">{u.email}</p>
                  {u.profile && <p className="text-sm text-gray-400">تلفن: {u.profile.phone}</p>}
                  {u.profile?.age && <p className="text-sm text-gray-400">سن: {u.profile.age}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(u.id, u.subscription?.acapPlus ?? false)}
                    className={`px-3 py-1 rounded text-sm ${u.subscription?.acapPlus ? 'bg-amber-600' : 'bg-gray-600'}`}
                  >
                    {u.subscription?.acapPlus ? 'A|CAP+ فعال' : 'فعال‌سازی A|CAP+'}
                  </button>
                  <button onClick={() => setSugUser(sugUser === u.id ? null : u.id)} className="px-3 py-1 bg-blue-600 rounded text-sm">
                    ارسال پیشنهاد
                  </button>
                </div>
              </div>
              {sugUser === u.id && (
                <div className="mt-4 space-y-2 border-t border-gray-700 pt-4">
                  <input value={sugTitle} onChange={e => setSugTitle(e.target.value)} placeholder="عنوان پیشنهاد" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                  <textarea value={sugContent} onChange={e => setSugContent(e.target.value)} placeholder="متن پیشنهاد" rows={3} className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                  <button onClick={() => handleSuggestion(u.id)} className="px-4 py-2 bg-emerald-600 rounded">ارسال</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'tickets' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold mb-2">تیکت‌ها</h2>
            {tickets.map(t => (
              <div key={t.id} onClick={() => openTicket(t.id)} className={`bg-gray-900 p-3 rounded cursor-pointer border ${selectedTicket === t.id ? 'border-emerald-500' : 'border-gray-800'}`}>
                <p className="font-medium">{t.subject}</p>
                <p className="text-xs text-gray-400">{t.status === 'open' ? 'باز' : 'بسته شده'} - {new Date(t.createdAt).toLocaleDateString('fa-IR')}</p>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {selectedTicket && (
              <>
                <h2 className="text-lg font-semibold">پیام‌ها</h2>
                {msgs.map(m => (
                  <div key={m.id} className="bg-gray-900 p-3 rounded">
                    <p className="text-sm">{m.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(m.createdAt).toLocaleString('fa-IR')}</p>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input value={replyMsg} onChange={e => setReplyMsg(e.target.value)} placeholder="پاسخ..." className="flex-1 p-2 rounded bg-gray-800 border border-gray-700" />
                  <button onClick={() => handleReply(selectedTicket)} className="px-4 py-2 bg-emerald-600 rounded">ارسال</button>
                  <button onClick={() => handleClose(selectedTicket)} className="px-4 py-2 bg-red-600 rounded">بستن تیکت</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
