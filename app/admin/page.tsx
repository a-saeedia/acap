'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUsers, toggleAcapPlus, sendSuggestion, getSentSuggestions, deleteSuggestion, getTickets, getTicketMessages, replyToTicket, closeTicket } from '@/app/actions/admin'
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
  const [sugProfitMsg, setSugProfitMsg] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showMobileList, setShowMobileList] = useState(true)

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

  async function handleDelete(suggestionId: string) {
    if (!confirm('آیا از حذف این پیشنهاد اطمینان دارید؟')) return
    setDeletingId(suggestionId)
    try {
      await deleteSuggestion(suggestionId)
      if (selectedUser) loadHistory(selectedUser.id)
    } catch { }
    setDeletingId(null)
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
      const profit = sugProfit ? parseFloat(sugProfit) : undefined
      await sendSuggestion(userId, sugTitle, sugContent, profit, sugProfitMsg || undefined)
      setSugTitle('')
      setSugContent('')
      setSugProfit('')
      setSugProfitMsg('')
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
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">پنل مدیریت A|CAP</h1>

        {/* Tab bar - horizontal scroll on mobile */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
          <button onClick={() => { setTab('users'); setSelectedUser(null); setShowMobileList(true) }}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${tab === 'users' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            کاربران
          </button>
          <button onClick={() => { setTab('tickets'); setSelectedTicket(null) }}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${tab === 'tickets' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            تیکت‌ها
          </button>
          <a href="/api/export-csv" download
            className="px-4 py-2 rounded-lg text-sm whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            خروجی CSV
          </a>
        </div>

        {tab === 'users' && (
          <>
            {/* Mobile: toggle between list and detail */}
            <div className="lg:hidden mb-3">
              {selectedUser && !showMobileList && (
                <button onClick={() => setShowMobileList(true)}
                  className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  ← بازگشت به لیست کاربران
                </button>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              {/* User list - hidden on mobile when detail is shown */}
              <div className={`lg:w-1/3 space-y-2 ${selectedUser && !showMobileList ? 'hidden lg:block' : 'block'}`}>
                <div className="text-xs text-gray-500 mb-2">{users.length} کاربر</div>
                {users.map(u => (
                  <div key={u.id} onClick={() => { setSelectedUser(u); setShowMobileList(false) }}
                    className={`bg-gray-900 p-3 rounded-xl cursor-pointer border transition-all ${
                      selectedUser?.id === u.id ? 'border-emerald-500/50 bg-gray-800' : 'border-gray-800 hover:border-gray-600'
                    }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      {u.subscription?.acapPlus && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full whitespace-nowrap">A|CAP+</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{u.profile?.phone || '—'}</p>
                  </div>
                ))}
              </div>

              {/* User detail - full width on mobile */}
              <div className={`lg:flex-1 ${!showMobileList ? 'block' : 'hidden lg:block'}`}>
                {selectedUser ? (
                  <div className="bg-gray-900 p-4 sm:p-6 rounded-2xl border border-gray-800">
                    {/* Mobile back button */}
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg sm:text-xl font-bold truncate">{selectedUser.name}</h2>
                      <button onClick={() => setShowMobileList(true)}
                        className="lg:hidden text-xs text-gray-500 hover:text-gray-300">
                        بستن
                      </button>
                    </div>

                    {/* User info */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between py-2 border-b border-gray-800 text-sm">
                        <span className="text-gray-400">ایمیل</span>
                        <span dir="ltr" className="text-left">{selectedUser.email}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800 text-sm">
                        <span className="text-gray-400">موبایل</span>
                        <span>{selectedUser.profile?.phone || '—'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800 text-sm">
                        <span className="text-gray-400">A|CAP+</span>
                        <button
                          onClick={() => handleToggle(selectedUser.id, selectedUser.subscription?.acapPlus ?? false)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            selectedUser.subscription?.acapPlus ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-400'
                          }`}>
                          {selectedUser.subscription?.acapPlus ? 'فعال' : 'غیرفعال'}
                        </button>
                      </div>
                    </div>

                    {/* Send suggestion form */}
                    <div className="bg-gray-800/50 rounded-xl p-4 sm:p-5 border border-gray-700/50 mb-6">
                      <h3 className="font-semibold text-sm mb-3">ارسال پیشنهاد جدید</h3>
                      <div className="space-y-3">
                        <input value={sugTitle} onChange={e => setSugTitle(e.target.value)}
                          placeholder="عنوان پیشنهاد"
                          className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm focus:border-emerald-500/50 focus:outline-none transition-colors" />
                        <textarea value={sugContent} onChange={e => setSugContent(e.target.value)}
                          placeholder="متن پیشنهاد" rows={3}
                          className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm focus:border-emerald-500/50 focus:outline-none transition-colors" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input value={sugProfit} onChange={e => { const v = e.target.value.replace(/[^0-9.]/g, ''); setSugProfit(v) }}
                            placeholder="درصد سود (اختیاری)" type="text" inputMode="decimal"
                            className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm focus:border-emerald-500/50 focus:outline-none transition-colors" />
                          <input value={sugProfitMsg} onChange={e => setSugProfitMsg(e.target.value)}
                            placeholder="پیام سود (مثلاً: ۱۲٪ سود برای سرمایه‌گذاران)" type="text"
                            className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm focus:border-emerald-500/50 focus:outline-none transition-colors" />
                        </div>
                        {sugError && <p className="text-red-400 text-xs">{sugError}</p>}
                        {sugSuccess && <p className="text-emerald-400 text-xs">{sugSuccess}</p>}
                        <button onClick={() => handleSuggestion(selectedUser.id)} disabled={sugSending}
                          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors">
                          {sugSending ? 'در حال ارسال...' : 'ارسال پیشنهاد'}
                        </button>
                      </div>
                    </div>

                    {/* Suggestion history */}
                    <div>
                      <h3 className="font-semibold text-sm mb-3">تاریخچه پیشنهادات ارسالی</h3>
                      {historyLoading ? (
                        <p className="text-gray-500 text-sm">در حال بارگذاری...</p>
                      ) : history.length === 0 ? (
                        <p className="text-gray-500 text-sm">تاکنون پیشنهادی ارسال نشده</p>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {history.map(h => (
                            <div key={h.id} className="bg-gray-800/50 p-3 sm:p-4 rounded-xl border border-gray-700/50">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-sm">{h.title}</p>
                                    {h.isRead ? (
                                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">خوانده شده</span>
                                    ) : (
                                      <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">جدید</span>
                                    )}
                                  </div>
                                  <p className="text-gray-400 text-xs mt-1.5 leading-relaxed line-clamp-2">{h.content}</p>
                                  {h.profitPercent && (
                                    <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-emerald-400 text-xs font-bold">+{h.profitPercent}% سود</span>
                                        {h.profitMessage && (
                                          <span className="text-gray-400 text-xs">{h.profitMessage}</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="text-left flex-shrink-0">
                                  <p className="text-gray-600 text-xs whitespace-nowrap">{new Date(h.createdAt).toLocaleDateString('fa-IR')}</p>
                                  <button
                                    onClick={() => handleDelete(h.id)}
                                    disabled={deletingId === h.id}
                                    className="text-red-400 hover:text-red-300 text-xs mt-2 underline underline-offset-2 disabled:opacity-50">
                                    {deletingId === h.id ? '...' : 'حذف'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center justify-center h-64 text-gray-500">روی یک کاربر کلیک کنید</div>
                )}
              </div>
            </div>
          </>
        )}

        {tab === 'tickets' && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:w-2/5 space-y-2">
              {tickets.map(t => (
                <div key={t.id} onClick={() => openTicket(t.id)}
                  className={`bg-gray-900 p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedTicket === t.id ? 'border-emerald-500/50 bg-gray-800' : 'border-gray-800 hover:border-gray-600'
                  }`}>
                  <p className="font-medium text-sm">{t.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t.status === 'open' ? 'باز' : 'بسته شده'} — {new Date(t.createdAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              ))}
            </div>
            <div className="lg:flex-1 space-y-4">
              {selectedTicket && (
                <>
                  {msgs.map(m => (
                    <div key={m.id} className="bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-800">
                      <p className="text-sm leading-relaxed">{m.message}</p>
                      <p className="text-xs text-gray-600 mt-2">{new Date(m.createdAt).toLocaleString('fa-IR')}</p>
                    </div>
                  ))}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input value={replyMsg} onChange={e => setReplyMsg(e.target.value)}
                      placeholder="پاسخ..." className="flex-1 p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm focus:border-emerald-500/50 focus:outline-none transition-colors" />
                    <div className="flex gap-2">
                      <button onClick={() => handleReply(selectedTicket)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-bold transition-colors whitespace-nowrap">
                        ارسال
                      </button>
                      <button onClick={() => handleClose(selectedTicket)}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-bold transition-colors whitespace-nowrap">
                        بستن تیکت
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}