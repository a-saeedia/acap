'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getUsers, toggleAcapPlus, sendSuggestion, getSentSuggestions, deleteSuggestion, getUserAssets, getTickets, getTicketMessages, replyToTicket, closeTicket, toggleScanner, getUserQuizResults } from '@/app/actions/admin'
import { useSession } from '@/lib/auth-client'

type User = Awaited<ReturnType<typeof getUsers>>[number]
type Ticket = Awaited<ReturnType<typeof getTickets>>[number]

export default function AdminPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<'users' | 'tickets' | 'analytics'>('users')
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
  const [portfolioAssets, setPortfolioAssets] = useState<any[]>([])
  const [prices, setPrices] = useState<Record<string, { price: number; currency: string }>>({})
  const [portfolioLoading, setPortfolioLoading] = useState(false)
  const [quizResults, setQuizResults] = useState<any[]>([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [scanResult, setScanResult] = useState<{ type: string; current: number; ideal: number; diff: number }[] | null>(null)
  const [scanInvestorType, setScanInvestorType] = useState<string | null>(null)
  const [scanLoading, setScanLoading] = useState(false)
  const [scannerToggling, setScannerToggling] = useState(false)

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

  async function loadPortfolio(userId: string) {
    setPortfolioLoading(true)
    try {
      const [a, p] = await Promise.all([
        getUserAssets(userId),
        fetch('/api/prices').then(r => r.json()),
      ])
      setPortfolioAssets(a)
      setPrices(p)
    } catch { } finally {
      setPortfolioLoading(false)
    }
  }

  async function loadQuizResults(userId: string) {
    setQuizLoading(true)
    try {
      const r = await getUserQuizResults(userId)
      setQuizResults(r)
    } catch { } finally {
      setQuizLoading(false)
    }
  }

  useEffect(() => {
    if (selectedUser) { loadHistory(selectedUser.id); loadPortfolio(selectedUser.id); loadQuizResults(selectedUser.id); setScanResult(null); setScanInvestorType(null) }
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

  async function handleToggleScanner(userId: string, current: boolean) {
    setScannerToggling(true)
    try {
      await toggleScanner(userId, !current)
      setUsers(users.map(u => u.id === userId ? {
        ...u,
        subscription: u.subscription ? { ...u.subscription, scannerActive: !current } : null,
      } : u))
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, subscription: prev.subscription ? { ...prev.subscription, scannerActive: !current } : null } : null)
      }
    } catch { } finally {
      setScannerToggling(false)
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

  const TYPE_LABELS: Record<string, string> = {
    conservative: 'محافظه‌کار',
    balanced: 'متعادل',
    growth: 'رشدگرا',
    aggressive: 'تهاجمی',
  }

  const IDEAL_ALLOCATIONS: Record<string, Record<string, number>> = {
    conservative: { gold: 40, currency: 30, stock: 20, crypto: 10, other: 0 },
    balanced: { gold: 25, currency: 20, stock: 35, crypto: 20, other: 0 },
    growth: { gold: 10, currency: 10, stock: 40, crypto: 40, other: 0 },
    aggressive: { gold: 5, currency: 5, stock: 30, crypto: 60, other: 0 },
  }

  function handleScan() {
    setScanLoading(true)
    try {
      const latest = quizResults[0]
      if (!latest) { setScanLoading(false); return }
      const type = latest.investorType as string
      setScanInvestorType(type)
      const ideal = IDEAL_ALLOCATIONS[type] ?? IDEAL_ALLOCATIONS.balanced
      const byType: Record<string, number> = {}
      let totalVal = 0
      for (const a of portfolioAssets) {
        const price = (prices[a.symbol]?.price ?? 0) / 10
        const val = price * a.quantity
        const t = a.type as string
        byType[t] = (byType[t] ?? 0) + val
        totalVal += val
      }
      const rows = Object.keys(ideal).map(typeKey => {
        const currentVal = byType[typeKey] ?? 0
        const currentPct = totalVal > 0 ? (currentVal / totalVal) * 100 : 0
        const idealPct = ideal[typeKey]
        return {
          type: typeKey,
          current: Math.round(currentPct * 10) / 10,
          ideal: idealPct,
          diff: Math.round((currentPct - idealPct) * 10) / 10,
        }
      })
      setScanResult(rows)
    } catch { } finally {
      setScanLoading(false)
    }
  }

  const totalValue = portfolioAssets.reduce((sum, a) => sum + ((prices[a.symbol]?.price ?? 0) / 10) * a.quantity, 0)
  const totalInvested = portfolioAssets.reduce((sum, a) => sum + (a.purchasePrice ?? 0) * a.quantity, 0)
  const pnl = totalValue - totalInvested

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
          <button onClick={() => setTab('analytics')}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${tab === 'analytics' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            آمار و رویدادها
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
                    <div className="bg-gray-800/50 rounded-xl p-4 sm:p-5 border border-gray-700/50">
                      <h3 className="font-semibold text-sm mb-3">پرتفوی کاربر</h3>
                      {portfolioLoading ? (
                        <p className="text-gray-500 text-sm">در حال بارگذاری...</p>
                      ) : portfolioAssets.length === 0 ? (
                        <p className="text-gray-500 text-sm">کاربر دارای دارایی نیست</p>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            <div className="bg-gray-800 rounded-lg p-3">
                              <p className="text-gray-400 text-xs">تعداد دارایی‌ها</p>
                              <p className="text-lg font-bold">{portfolioAssets.length}</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-3">
                              <p className="text-gray-400 text-xs">ارزش کل</p>
                              <p className="text-lg font-bold text-emerald-400">{totalValue.toLocaleString()} تومان</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-3">
                              <p className="text-gray-400 text-xs">سرمایه‌گذاری</p>
                              <p className="text-lg font-bold">{totalInvested.toLocaleString()} تومان</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-3">
                              <p className="text-gray-400 text-xs">سود/زیان</p>
                              <p className={`text-lg font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {pnl >= 0 ? '+' : ''}{pnl.toLocaleString()} تومان
                              </p>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-gray-400 border-b border-gray-700">
                                  <th className="text-right py-2 px-2 whitespace-nowrap">نماد</th>
                                  <th className="text-right py-2 px-2 whitespace-nowrap">نام</th>
                                  <th className="text-right py-2 px-2 whitespace-nowrap">نوع</th>
                                  <th className="text-right py-2 px-2 whitespace-nowrap">مقدار</th>
                                  <th className="text-right py-2 px-2 whitespace-nowrap">قیمت فعلی</th>
                                  <th className="text-right py-2 px-2 whitespace-nowrap">ارزش</th>
                                  <th className="text-right py-2 px-2 whitespace-nowrap">قیمت خرید</th>
                                  <th className="text-right py-2 px-2 whitespace-nowrap">سود/زیان</th>
                                </tr>
                              </thead>
                              <tbody>
                                {portfolioAssets.map(a => {
                                  const price = (prices[a.symbol]?.price ?? 0) / 10
                                  const currentValue = price * a.quantity
                                  const costBasis = a.purchasePrice ? a.purchasePrice * a.quantity : null
                                  const assetPnl = costBasis !== null ? currentValue - costBasis : null
                                  return (
                                    <tr key={a.id} className="border-b border-gray-800">
                                      <td className="py-2 px-2 font-medium">{a.symbol}</td>
                                      <td className="py-2 px-2 text-gray-400">{a.label}</td>
                                      <td className="py-2 px-2 text-gray-400">{a.type}</td>
                                      <td className="py-2 px-2">{a.quantity}</td>
                                      <td className="py-2 px-2">{price.toLocaleString()}</td>
                                      <td className="py-2 px-2">{currentValue.toLocaleString()}</td>
                                      <td className="py-2 px-2">{a.purchasePrice?.toLocaleString() ?? '—'}</td>
                                      <td className={`py-2 px-2 ${assetPnl !== null ? (assetPnl >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-gray-500'}`}>
                                        {assetPnl !== null ? `${assetPnl >= 0 ? '+' : ''}${assetPnl.toLocaleString()}` : '—'}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Scanner section */}
                    <div className="bg-gray-800/50 rounded-xl p-4 sm:p-5 border border-gray-700/50 mt-6">
                      <h3 className="font-semibold text-sm mb-3">اسکنر پرتفوی</h3>

                      <div className="flex items-center justify-between py-2 border-b border-gray-700/50 mb-4">
                        <span className="text-gray-400 text-sm">وضعیت اسکنر</span>
                        <button
                          onClick={() => handleToggleScanner(selectedUser.id, selectedUser.subscription?.scannerActive ?? true)}
                          disabled={scannerToggling}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            selectedUser.subscription?.scannerActive ?? true ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400'
                          }`}>
                          {selectedUser.subscription?.scannerActive ?? true ? 'فعال' : 'غیرفعال'}
                        </button>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-xs text-gray-400 mb-2">نوع سرمایه‌گذاری کاربر</h4>
                        {quizLoading ? (
                          <p className="text-gray-500 text-sm">در حال بارگذاری...</p>
                        ) : quizResults.length === 0 ? (
                          <p className="text-gray-500 text-sm">کاربر هنوز تست شخصیت مالی را انجام نداده است</p>
                        ) : (
                          <div className="bg-gray-800 rounded-lg p-3 space-y-1">
                            <p className="text-sm font-bold">{TYPE_LABELS[quizResults[0].investorType] || quizResults[0].investorType}</p>
                            <p className="text-xs text-gray-400">امتیاز: {quizResults[0].score}</p>
                            <p className="text-xs text-gray-400">تاریخ: {new Date(quizResults[0].createdAt).toLocaleDateString('fa-IR')}</p>
                          </div>
                        )}
                      </div>

                      <button onClick={handleScan} disabled={scanLoading || quizResults.length === 0 || portfolioAssets.length === 0}
                        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors mb-4">
                        {scanLoading ? 'در حال اسکن...' : 'اسکن پرتفوی کاربر'}
                      </button>

                      {scanResult && scanInvestorType && (
                        <>
                          <div className="overflow-x-auto mb-3">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-gray-400 border-b border-gray-700">
                                  <th className="text-right py-2 px-2 whitespace-nowrap">نوع دارایی</th>
                                  <th className="text-right py-2 px-2 whitespace-nowrap">درصد فعلی</th>
                                  <th className="text-right py-2 px-2 whitespace-nowrap">درصد ایده‌آل</th>
                                  <th className="text-right py-2 px-2 whitespace-nowrap">اختلاف</th>
                                  <th className="text-right py-2 px-2 whitespace-nowrap">وضعیت</th>
                                </tr>
                              </thead>
                              <tbody>
                                {scanResult.map(row => {
                                  const typeNames: Record<string, string> = {
                                    gold: 'طلا', currency: 'ارز', stock: 'سهام', crypto: 'ارز دیجیتال', other: 'سایر',
                                  }
                                  return (
                                    <tr key={row.type} className="border-b border-gray-800">
                                      <td className="py-2 px-2">{typeNames[row.type] || row.type}</td>
                                      <td className="py-2 px-2">{row.current}%</td>
                                      <td className="py-2 px-2">{row.ideal}%</td>
                                      <td className={`py-2 px-2 ${row.diff > 0 ? 'text-amber-400' : row.diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                        {row.diff > 0 ? '+' : ''}{row.diff}%
                                      </td>
                                      <td className="py-2 px-2">
                                        {Math.abs(row.diff) <= 5 ? (
                                          <span className="text-emerald-400">✓</span>
                                        ) : (
                                          <span className="text-red-400">⚠</span>
                                        )}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="bg-gray-800 rounded-lg p-3 mb-3">
                            <p className="text-sm text-gray-300 leading-relaxed">
                              این کاربر از نوع {TYPE_LABELS[scanInvestorType] || scanInvestorType} است.{' '}
                              {scanResult
                                .filter(r => Math.abs(r.diff) > 5)
                                .map(r => {
                                  const typeNames: Record<string, string> = {
                                    gold: 'طلا', currency: 'ارز', stock: 'سهام', crypto: 'ارز دیجیتال', other: 'سایر',
                                  }
                                  if (r.diff > 0) return `سهم ${typeNames[r.type] || r.type} باید ${Math.round(r.diff)}% کاهش یابد`
                                  return `سهم ${typeNames[r.type] || r.type} باید ${Math.round(Math.abs(r.diff))}% افزایش یابد`
                                })
                                .join('، ')}.
                            </p>
                          </div>

                          <button onClick={async () => {
                            const content = scanResult
                              .map(r => {
                                const typeNames: Record<string, string> = {
                                  gold: 'طلا', currency: 'ارز', stock: 'سهام', crypto: 'ارز دیجیتال', other: 'سایر',
                                }
                                const status = Math.abs(r.diff) <= 5 ? '✓' : '⚠'
                                return `${typeNames[r.type] || r.type}: ${r.current}% (ایده‌آل: ${r.ideal}%) ${status}`
                              })
                              .join('\n')
                            const summary = scanResult
                              .filter(r => Math.abs(r.diff) > 5)
                              .map(r => {
                                const typeNames: Record<string, string> = {
                                  gold: 'طلا', currency: 'ارز', stock: 'سهام', crypto: 'ارز دیجیتال', other: 'سایر',
                                }
                                if (r.diff > 0) return `${typeNames[r.type] || r.type}: ${Math.round(r.diff)}% کاهش`
                                return `${typeNames[r.type] || r.type}: ${Math.round(Math.abs(r.diff))}% افزایش`
                              })
                              .join('، ')
                            await sendSuggestion(selectedUser.id, 'نتیجه اسکن پرتفوی', `نوع سرمایه‌گذار: ${TYPE_LABELS[scanInvestorType] || scanInvestorType}\n\n${content}\n\nتوصیه‌ها: ${summary}`)
                            setSugSuccess('نتیجه اسکن به عنوان پیشنهاد ارسال شد')
                            loadHistory(selectedUser.id)
                          }}
                            className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors">
                            ارسال نتیجه اسکن به عنوان پیشنهاد
                          </button>
                        </>
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

        {tab === 'analytics' && <AdminAnalytics />}
      </div>
    </div>
  )
}

function AdminAnalytics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics').then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-8 text-gray-500">در حال بارگذاری...</div>
  if (!data) return <div className="text-center py-8 text-red-400">خطا در دریافت آمار</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-2xl font-bold">{data.totalEvents}</p>
          <p className="text-xs text-gray-500">رویداد (۷ روز)</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-2xl font-bold">{data.uniqueUsers}</p>
          <p className="text-xs text-gray-500">کاربر فعال</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-2xl font-bold">{data.anomalies?.length || 0}</p>
          <p className="text-xs text-gray-500">ناهنجاری قیمت</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-2xl font-bold">{data.topPages?.length || 0}</p>
          <p className="text-xs text-gray-500">صفحات پربازدید</p>
        </div>
      </div>

      {data.eventCounts && data.eventCounts.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h3 className="text-sm font-bold mb-3">توزیع رویدادها</h3>
          <div className="space-y-2">
            {data.eventCounts.map((e: any, i: number) => {
              const maxCount = Math.max(...data.eventCounts.map((x: any) => x.count))
              const pct = (e.count / maxCount) * 100
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-24 truncate">{e.event}</span>
                  <div className="flex-1 h-5 bg-gray-800 rounded overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-left">{e.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {data.topPages && data.topPages.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h3 className="text-sm font-bold mb-3">صفحات پربازدید (۷ روز)</h3>
          <div className="space-y-1.5">
            {data.topPages.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                <span className="text-sm text-gray-300 truncate ltr">{p.path || '/'}</span>
                <span className="text-xs text-gray-500 mr-2">{p.count} بازدید</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.pageViews && data.pageViews.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h3 className="text-sm font-bold mb-3">روند بازدید روزانه (۳۰ روز)</h3>
          <div className="flex items-end gap-1 h-32 overflow-x-auto pb-1">
            {[...data.pageViews].reverse().map((d: any, i: number) => {
              const maxCount = Math.max(...data.pageViews.map((x: any) => x.count))
              const height = (d.count / maxCount) * 100
              return (
                <div key={i} className="flex flex-col items-center gap-0.5 shrink-0">
                  <div className="w-6 sm:w-8 bg-emerald-600/60 rounded-t" style={{ height: `${height}%`, minHeight: d.count > 0 ? '4px' : '0' }} />
                  <span className="text-[8px] text-gray-500">{d.date?.slice(5) || ''}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {data.anomalies && data.anomalies.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h3 className="text-sm font-bold mb-3">ناهنجاری‌های قیمتی</h3>
          <div className="space-y-1.5">
            {data.anomalies.map((a: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${a.direction === 'spike' ? 'bg-red-600/20 text-red-400' : 'bg-orange-600/20 text-orange-400'}`}>
                    {a.direction === 'spike' ? '⬆' : '⬇'}
                  </span>
                  <span className="text-sm font-medium">{a.symbol}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Z={a.zScore?.toFixed(1)} | {a.currentPrice?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}