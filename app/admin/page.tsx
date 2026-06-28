'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUsers, toggleAcapPlus, sendSuggestion, getSentSuggestions, getTickets, getTicketMessages, replyToTicket, closeTicket } from '@/app/actions/admin'
import { useSession } from '@/lib/auth-client'

type User = Awaited<ReturnType<typeof getUsers>>[number]
type Ticket = Awaited<ReturnType<typeof getTickets>>[number]

export default function AdminPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<'users' | 'tickets'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [sugTitle, setSugTitle] = useState('')
  const [sugContent, setSugContent] = useState('')
  const [replyMsg, setReplyMsg] = useState('')
  const [msgs, setMsgs] = useState<any[]>([])
  const [sugSending, setSugSending] = useState(false)
  const [sugError, setSugError] = useState('')
  const [sugSuccess, setSugSuccess] = useState('')
  const [sugProfit, setSugProfit] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

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

  async function loadHistory(userId: string) {
    setHistoryLoading(true)
    try {
      const h = await getSentSuggestions(userId)
      setHistory(h)
    } catch { } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (selectedUser) loadHistory(selectedUser.id)
  }, [selectedUser])

  async function handleToggle(userId: string, current: boolean) {
    await toggleAcapPlus(userId, !current)
    setUsers(users.map(u => u.id === userId ? {
      ...u,
      subscription: u.subscription ? { ...u.subscription, acapPlus: !current } : null,
    } : u))
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, subscription: prev.subscription ? { ...prev.subscription, acapPlus: !current } : null } : null)
    }
  }

  async function handleSuggestion(userId: string) {
    if (!sugTitle.trim() || !sugContent.trim()) {
      setSugError('عنوان و متن پیشنهاد را وارد کنید')
      setSugSuccess('')
      return
    }
    setSugSending(true)
    setSugError('')
    setSugSuccess('')
    try {
      const profit = sugProfit ? parseInt(sugProfit) : undefined
      await sendSuggestion(userId, sugTitle, sugContent, profit)
      setSugTitle('')
      setSugContent('')
      setSugProfit('')
      setSugSuccess('پیشنهاد با موفقیت ارسال شد')
      loadHistory(userId)
    } catch (e) {
      setSugError(e instanceof Error ? e.message : 'خطا در ارسال پیشنهاد')
    } finally {
      setSugSending(false)
    }
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
        <button onClick={() => { setTab('users'); setSelectedUser(null) }} className={`px-4 py-2 rounded ${tab === 'users' ? 'bg-emerald-600' : 'bg-gray-700'}`}>کاربران</button>
        <button onClick={() => { setTab('tickets'); setSelectedTicket(null) }} className={`px-4 py-2 rounded ${tab === 'tickets' ? 'bg-emerald-600' : 'bg-gray-700'}`}>تیکت‌ها</button>
        <a href="/api/export-csv" download className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition-colors">📥 خروجی CSV</a>
      </div>

      {tab === 'users' && (
        <div className="flex gap-4">
          <div className="w-1/3 space-y-2">
            {users.map(u => (
              <div key={u.id} onClick={() => setSelectedUser(u)} className={`bg-gray-900 p-3 rounded cursor-pointer border ${selectedUser?.id === u.id ? 'border-emerald-500' : 'border-gray-800 hover:border-gray-600'}`}>
                <p className="font-semibold">{u.name}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
                <p className="text-xs text-gray-500">{u.profile?.phone || '—'}</p>
              </div>
            ))}
          </div>
          <div className="flex-1">
            {selectedUser ? (
              <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                <h2 className="text-xl font-bold mb-4">{selectedUser.name}</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">ایمیل</span>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">موبایل</span>
                    <span>{selectedUser.profile?.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">سن</span>
                    <span>{selectedUser.profile?.age || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">A|CAP+</span>
                    <button
                      onClick={() => handleToggle(selectedUser.id, selectedUser.subscription?.acapPlus ?? false)}
                      className={`px-3 py-1 rounded text-sm ${selectedUser.subscription?.acapPlus ? 'bg-amber-600' : 'bg-gray-600'}`}
                    >
                      {selectedUser.subscription?.acapPlus ? 'فعال' : 'غیرفعال'}
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold mb-3">ارسال پیشنهاد جدید</h3>
                <div className="space-y-2">
                  <input value={sugTitle} onChange={e => setSugTitle(e.target.value)} placeholder="عنوان پیشنهاد" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                  <textarea value={sugContent} onChange={e => setSugContent(e.target.value)} placeholder="متن پیشنهاد" rows={3} className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                  <input value={sugProfit} onChange={e => setSugProfit(e.target.value.replace(/\D/g,''))} placeholder="سود حاصل از پیشنهاد (تومان) - اختیاری" type="text" inputMode="numeric" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                  {sugError && <p className="text-red-400 text-sm">{sugError}</p>}
                  {sugSuccess && <p className="text-emerald-400 text-sm">{sugSuccess}</p>}
                  <button onClick={() => handleSuggestion(selectedUser.id)} disabled={sugSending} className="px-4 py-2 bg-emerald-600 rounded disabled:opacity-50">{sugSending ? 'در حال ارسال...' : 'ارسال پیشنهاد'}</button>
                </div>

                <h3 className="font-semibold mt-8 mb-3">تاریخچه پیشنهادات ارسالی</h3>
                {historyLoading ? (
                  <p className="text-gray-500 text-sm">در حال بارگذاری...</p>
                ) : history.length === 0 ? (
                  <p className="text-gray-500 text-sm">تاکنون پیشنهادی ارسال نشده</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.map(h => (
                      <div key={h.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{h.title}</p>
                              {h.isRead ? (
                                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">خوانده شده</span>
                              ) : (
                                <span className="text-xs text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">ارسال شده</span>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs mt-1">{h.content}</p>
                          </div>
                          <div className="text-left flex-shrink-0">
                            <p className="text-gray-500 text-xs">{new Date(h.createdAt).toLocaleDateString('fa-IR')}</p>
                            {h.profitAmount && <p className="text-emerald-400 text-xs mt-1">+{h.profitAmount.toLocaleString('fa-IR')} تومان</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">روی یک کاربر کلیک کنید</div>
            )}
          </div>
        </div>
      )}

      {tab === 'tickets' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
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
