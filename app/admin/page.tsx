'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getUsers, toggleAcapPlus, sendSuggestion, getSentSuggestions, deleteSuggestion, getUserAssets, getTickets, getTicketMessages, replyToTicket, closeTicket, deleteTicket, toggleScanner, getUserQuizResults, deleteUser, populateSignals, recalculateAllSignals, populateRevenueFromSignals, broadcastSuggestion } from '@/app/actions/admin'
import { useSession } from '@/lib/auth-client'
import { AdminTasks } from '@/components/admin/admin-tasks'
import { Loader2, Plus, Edit3, Trash2, X, ArrowLeft, LayoutDashboard, Users, Ticket, BarChart3, BookOpen, Signal, Crown, ClipboardList, Gift, Download, Menu, ChevronDown, Search, Shield, Bomb, TrendingUp } from 'lucide-react'
import { toJalaali } from 'jalaali-js'
import { persianDatetimeToGregorianISO, gregorianISOToPersianDatetime } from '@/lib/persian-date'
import { PersianDateTimePicker } from '@/components/persian-datetime-picker'

type User = Awaited<ReturnType<typeof getUsers>>[number]
type Ticket = Awaited<ReturnType<typeof getTickets>>[number]

const NAV_ITEMS = [
  { id: 'users', label: 'کاربران', icon: Users, color: 'text-emerald-400' },
  { id: 'tickets', label: 'تیکت‌ها', icon: Ticket, color: 'text-blue-400' },
  { id: 'analytics', label: 'آمار', icon: BarChart3, color: 'text-purple-400' },
  { id: 'content', label: 'دوره‌ها و مقالات', icon: BookOpen, color: 'text-cyan-400' },
  { id: 'signals', label: 'سیگنال‌ها و درآمد', icon: Signal, color: 'text-amber-400' },
  { id: 'plus-requests', label: 'درخواست‌های A|CAP+', icon: Crown, color: 'text-amber-400' },
  { id: 'tasks', label: 'وظایف', icon: ClipboardList, color: 'text-rose-400' },
  { id: 'referrals', label: 'معرفی‌ها', icon: Gift, color: 'text-orange-400' },
]

export default function AdminPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<string>('users')
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
  const [sugExpiresAt, setSugExpiresAt] = useState('')
  const [sugImageUrl, setSugImageUrl] = useState('')
  const [sugAudioUrl, setSugAudioUrl] = useState('')
  const [sugBroadcast, setSugBroadcast] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showMobileList, setShowMobileList] = useState(true)
  const [portfolioAssets, setPortfolioAssets] = useState<any[]>([])
  const [priceData, setPriceData] = useState<any>({})
  const [portfolioLoading, setPortfolioLoading] = useState(false)
  const [quizResults, setQuizResults] = useState<any[]>([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [scanResult, setScanResult] = useState<{ type: string; current: number; ideal: number; diff: number }[] | null>(null)
  const [scanInvestorType, setScanInvestorType] = useState<string | null>(null)
  const [scanLoading, setScanLoading] = useState(false)
  const [scannerToggling, setScannerToggling] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sdHover, setSdHover] = useState(false)

  async function sha256(msg: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const SD_HASH = '45c423dfef7889446c0718652044edbf79e8026de38c948d16a38b6dcfe80a66'

  async function handleSelfDestruct() {
    const pwd = prompt('🔐 رمز خودتخریبی را وارد کنید:')
    if (!pwd) return
    if (await sha256(pwd) !== SD_HASH) { alert('❌ رمز اشتباه است!'); return }
    localStorage.setItem('acap_self_destruct', 'true')
    window.location.href = '/404'
  }

  useEffect(() => {
    if (!isPending && !session) router.push('/')
    if (!isPending && session) {
      getUsers().then(setUsers).catch(e => setAdminError(e.message))
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
    try { await deleteSuggestion(suggestionId); if (selectedUser) loadHistory(selectedUser.id) } catch {}
    setDeletingId(null)
  }

  async function loadHistory(userId: string) {
    setHistoryLoading(true)
    try { setHistory(await getSentSuggestions(userId)) } catch {} finally { setHistoryLoading(false) }
  }

  function getPrice(symbol: string): number {
    const d = priceData
    if (!d.prices) return 0
    if (d.stockPrices?.[symbol]) return d.stockPrices[symbol].price / 10
    const upper = symbol.toUpperCase()
    if (d.stockPrices?.[upper]) return d.stockPrices[upper].price / 10
    const irrKey = `${upper}-IRR`
    if (d.prices[irrKey]) return d.prices[irrKey].price / 10
    const direct = d.prices[upper] ?? d.prices[symbol]
    if (!direct) return 0
    if (direct.currency === 'IRR') return direct.price / 10
    if (direct.currency === 'USD') {
      const usdRate = d.prices['USDT-IRR']?.price
      if (usdRate) return (direct.price * usdRate) / 10
      return direct.price
    }
    return 0
  }

  async function loadPortfolio(userId: string) {
    setPortfolioLoading(true)
    try {
      const [a, p] = await Promise.all([getUserAssets(userId), fetch('/api/prices').then(r => r.json())])
      setPortfolioAssets(a); setPriceData(p)
    } catch {} finally { setPortfolioLoading(false) }
  }

  async function loadQuizResults(userId: string) {
    setQuizLoading(true)
    try { setQuizResults(await getUserQuizResults(userId)) } catch {} finally { setQuizLoading(false) }
  }

  useEffect(() => {
    if (selectedUser) { loadHistory(selectedUser.id); loadPortfolio(selectedUser.id); loadQuizResults(selectedUser.id); setScanResult(null); setScanInvestorType(null) }
  }, [selectedUser])

  async function handleToggle(userId: string, current: boolean) {
    await toggleAcapPlus(userId, !current)
    setUsers(users.map(u => u.id === userId ? { ...u, subscription: u.subscription ? { ...u.subscription, acapPlus: !current } : null } : u) as any)
    if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, subscription: prev.subscription ? { ...prev.subscription, acapPlus: !current } : null } : null as any)
  }

  async function handleToggleScanner(userId: string, current: boolean) {
    setScannerToggling(true)
    try {
      await toggleScanner(userId, !current)
      setUsers(users.map(u => u.id === userId ? { ...u, subscription: u.subscription ? { ...u.subscription, scannerActive: !current } : null } : u) as any)
      if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, subscription: prev.subscription ? { ...prev.subscription, scannerActive: !current } : null } : null as any)
    } catch {} finally { setScannerToggling(false) }
  }

  async function handleSuggestion(userId: string) {
    if (!sugTitle.trim() || !sugContent.trim()) { setSugError('عنوان و متن پیشنهاد را وارد کنید'); setSugSuccess(''); return }
    setSugSending(true); setSugError(''); setSugSuccess('')
    try {
      const profit = sugProfit ? parseFloat(sugProfit) : undefined
      if (sugBroadcast) {
        const count = await broadcastSuggestion(sugTitle, sugContent, profit, sugProfitMsg || undefined, sugExpiresAt || undefined, sugImageUrl || undefined, sugAudioUrl || undefined)
        setSugSuccess(`پیشنهاد برای ${count} کاربر A|CAP+ ارسال شد`)
      } else {
        await sendSuggestion(userId, sugTitle, sugContent, profit, sugProfitMsg || undefined, sugExpiresAt || undefined, sugImageUrl || undefined, sugAudioUrl || undefined)
        setSugSuccess('پیشنهاد با موفقیت ارسال شد'); loadHistory(userId)
      }
      setSugTitle(''); setSugContent(''); setSugProfit(''); setSugProfitMsg(''); setSugExpiresAt(''); setSugImageUrl(''); setSugAudioUrl(''); setSugBroadcast(false)
    } catch (e) { setSugError(e instanceof Error ? e.message : 'خطا در ارسال پیشنهاد') } finally { setSugSending(false) }
  }

  async function openTicket(ticketId: string) {
    setSelectedTicket(ticketId)
    setMsgs(await getTicketMessages(ticketId))
  }

  async function handleReply(ticketId: string) {
    await replyToTicket(ticketId, replyMsg); setReplyMsg('')
    setMsgs(await getTicketMessages(ticketId))
  }

  async function handleClose(ticketId: string) {
    await closeTicket(ticketId); setSelectedTicket(null); loadTickets()
  }

  async function handleDeleteTicket(ticketId: string) {
    if (!confirm('آیا از حذف این تیکت و تمام پیام‌های آن اطمینان دارید؟')) return
    await deleteTicket(ticketId); setSelectedTicket(null); loadTickets()
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('آیا از حذف این کاربر و تمام اطلاعات مرتبط (تیکت‌ها، دارایی‌ها، ثبت‌نام‌ها و ...) اطمینان دارید؟')) return
    if (!confirm('این عملیات قابل بازگشت نیست. برای تایید نهایی، دوباره تایید کنید.')) return
    await deleteUser(userId)
    setUsers(users.filter(u => u.id !== userId))
    if (selectedUser?.id === userId) setSelectedUser(null)
  }

  const TYPE_LABELS: Record<string, string> = { conservative: 'محافظه‌کار', balanced: 'متعادل', growth: 'رشدگرا', aggressive: 'تهاجمی' }
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
        const price = getPrice(a.symbol)
        const val = price * a.quantity
        const t = a.type as string
        byType[t] = (byType[t] ?? 0) + val; totalVal += val
      }
      const rows = Object.keys(ideal).map(typeKey => {
        const currentVal = byType[typeKey] ?? 0
        const currentPct = totalVal > 0 ? (currentVal / totalVal) * 100 : 0
        return { type: typeKey, current: Math.round(currentPct * 10) / 10, ideal: ideal[typeKey], diff: Math.round((currentPct - ideal[typeKey]) * 10) / 10 }
      })
      setScanResult(rows)
    } catch {} finally { setScanLoading(false) }
  }

  const totalValue = portfolioAssets.reduce((sum, a) => sum + getPrice(a.symbol) * a.quantity, 0)
  const totalInvested = portfolioAssets.reduce((sum, a) => sum + (a.purchasePrice ?? 0) * a.quantity, 0)
  const pnl = totalValue - totalInvested

  if (isPending) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!session) return null
  if (adminError) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Shield className="w-8 h-8 text-red-400" /></div>
        <h1 className="text-xl font-black text-white mb-2">دسترسی محدود</h1>
        <p className="text-sm text-gray-400 mb-4">شما دسترسی مدیر سیستم را ندارید.</p>
        <a href="/admin-setup" className="inline-block px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all">تنظیم مدیر سیستم</a>
      </div>
    </div>
  )

  const currentNav = NAV_ITEMS.find(n => n.id === tab)

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Menu className="w-5 h-5 text-gray-300" />
            </button>
            <span className="font-black text-lg tracking-widest bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">A <span className="text-blue-400">|</span> CAP</span>
            <span className="text-[10px] text-gray-500 bg-gray-800/60 px-2 py-0.5 rounded-full mr-2 border border-gray-700/30">مدیریت</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-xs font-bold transition-all border border-gray-700/30 hover:border-gray-600/50">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">بازگشت به داشبورد</span>
            </button>
            <button onClick={() => router.push('/')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-xs font-bold transition-all border border-gray-700/30 hover:border-gray-600/50">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">صفحه اصلی</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex gap-0 lg:gap-5">
        {/* Sidebar - hidden on mobile unless toggled */}
        <aside className={`fixed lg:static inset-0 z-40 lg:z-auto ${sidebarOpen ? 'flex' : 'hidden'} lg:flex flex-col w-56 shrink-0`}>
          {/* Overlay for mobile */}
          <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <nav className="relative lg:relative w-56 bg-gray-900/50 lg:bg-transparent border-l lg:border-l-0 lg:border border-gray-800/50 rounded-2xl p-2 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto space-y-0.5">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const isActive = tab === item.id
              return (
                <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); if (item.id === 'users') setSelectedUser(null) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-gray-800 to-gray-800/50 text-white shadow-sm border border-gray-700/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-gray-700/50' : 'bg-gray-800/50'}`}>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
            {/* Self Destruct — no return */}
            <div className="border-t border-red-900/20 pt-3 mt-3 flex flex-col items-center gap-2">
              <div className="relative" onMouseEnter={() => setSdHover(true)} onMouseLeave={() => setSdHover(false)}>
                <button onClick={handleSelfDestruct}
                  className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-orange-600 to-red-900 text-white shadow-[0_0_30px_rgba(255,80,0,0.5)] hover:shadow-[0_0_50px_rgba(255,50,0,0.8)] hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-orange-400/30 animate-pulse"
                >
                  <Bomb className="w-9 h-9 drop-shadow-[0_0_8px_rgba(255,100,0,0.8)]" />
                </button>
                {/* Burning ember particles */}
                <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-orange-500 animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute top-1/2 -right-2 w-1 h-1 rounded-full bg-yellow-400 animate-ping" style={{ animationDuration: '1.2s' }} />
                <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-orange-300 animate-ping" style={{ animationDuration: '1.8s' }} />
                {sdHover && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-60">
                    <div className="bg-gray-950 border border-red-500/40 rounded-xl p-3 shadow-[0_0_30px_rgba(255,0,0,0.3)]">
                      <p className="text-[11px] text-red-400 leading-relaxed text-center font-bold">
                        ☠️ این اقدام غیرقابل بازگشت است
                      </p>
                      <p className="text-[10px] text-red-400/60 leading-relaxed text-center mt-1">
                        در صورت تأیید، تمام محتوا و دیتابیس برای همیشه نابود می‌شود
                      </p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-950 border-r border-b border-red-500/40 rotate-45 -mt-0.5" />
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[8px] text-red-700 font-bold tracking-widest">SELF DESTRUCT</span>
            </div>
            <div className="border-t border-gray-800 pt-2 mt-2 flex justify-center">
              <a href="/api/export-csv" download
                className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/50 hover:scale-110 active:scale-95 transition-all duration-200"
                title="خروجی CSV"
              >
                <Download className="w-6 h-6" />
              </a>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile tab indicator */}
          <div className="lg:hidden flex items-center gap-2 mb-4 bg-gray-900 rounded-xl p-1">
            {currentNav && (
              <>
                <currentNav.icon className={`w-4 h-4 ${currentNav.color}`} />
                <span className="text-sm font-bold">{currentNav.label}</span>
              </>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 mr-auto" />
          </div>

          {tab === 'users' && (
            <>
              <div className="lg:hidden mb-3">
                {selectedUser && !showMobileList && (
                  <button onClick={() => setShowMobileList(true)} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> بازگشت به لیست کاربران
                  </button>
                )}
              </div>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className={`lg:w-1/3 space-y-2 ${selectedUser && !showMobileList ? 'hidden lg:block' : 'block'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">{users.length} کاربر</span>
                    <Search className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  {users.map(u => (
                    <div key={u.id} onClick={() => { setSelectedUser(u); setShowMobileList(false) }}
                      className={`bg-gray-900 p-3 rounded-xl cursor-pointer border transition-all ${
                        selectedUser?.id === u.id ? 'border-blue-500/50 bg-gray-800' : 'border-gray-800 hover:border-gray-600'
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
                <div className={`lg:flex-1 ${!showMobileList ? 'block' : 'hidden lg:block'}`}>
                  {selectedUser ? (
                    <div className="bg-gray-900 p-4 sm:p-6 rounded-2xl border border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold truncate">{selectedUser.name}</h2>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDeleteUser(selectedUser.id)} className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2">حذف کاربر</button>
                          <button onClick={() => setShowMobileList(true)} className="lg:hidden text-xs text-gray-500 hover:text-gray-300">بستن</button>
                        </div>
                      </div>
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
                          <button onClick={() => handleToggle(selectedUser.id, selectedUser.subscription?.acapPlus ?? false)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${selectedUser.subscription?.acapPlus ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                            {selectedUser.subscription?.acapPlus ? 'فعال' : 'غیرفعال'}
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-5 border border-gray-700/50 mb-6">
                        <h3 className="font-semibold text-sm mb-3">ارسال پیشنهاد جدید</h3>
                        <div className="space-y-3">
                          <input value={sugTitle} onChange={e => setSugTitle(e.target.value)} placeholder="عنوان پیشنهاد" className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm focus:border-blue-500/50 focus:outline-none transition-colors" />
                          <textarea value={sugContent} onChange={e => setSugContent(e.target.value)} placeholder="متن پیشنهاد" rows={3} className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm focus:border-blue-500/50 focus:outline-none transition-colors" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input value={sugProfit} onChange={e => { const v = e.target.value.replace(/[^0-9.]/g, ''); setSugProfit(v) }} placeholder="درصد سود (اختیاری)" type="text" inputMode="decimal" className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm focus:border-blue-500/50 focus:outline-none transition-colors" />
                            <input value={sugProfitMsg} onChange={e => setSugProfitMsg(e.target.value)} placeholder="پیام سود" type="text" className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm focus:border-blue-500/50 focus:outline-none transition-colors" />
                            <input value={sugExpiresAt} onChange={e => setSugExpiresAt(e.target.value)} placeholder="تاریخ انقضا" type="text" className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm focus:border-blue-500/50 focus:outline-none transition-colors" />
                            <input value={sugImageUrl} onChange={e => setSugImageUrl(e.target.value)} placeholder="آدرس تصویر (اختیاری)" type="text" className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm focus:border-blue-500/50 focus:outline-none transition-colors" />
                            <input value={sugAudioUrl} onChange={e => setSugAudioUrl(e.target.value)} placeholder="آدرس صدا (اختیاری)" type="text" className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm focus:border-blue-500/50 focus:outline-none transition-colors" />
                          </div>
                          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                            <input type="checkbox" checked={sugBroadcast} onChange={e => setSugBroadcast(e.target.checked)} className="rounded" />
                            ارسال به همه کاربران A|CAP+
                          </label>
                          {sugError && <p className="text-red-400 text-xs">{sugError}</p>}
                          {sugSuccess && <p className="text-emerald-400 text-xs">{sugSuccess}</p>}
                          <button onClick={() => handleSuggestion(selectedUser.id)} disabled={sugSending}
                            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors">
                            {sugSending ? 'در حال ارسال...' : 'ارسال پیشنهاد'}
                          </button>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-3">تاریخچه پیشنهادات ارسالی</h3>
                        {historyLoading ? <p className="text-gray-500 text-sm">در حال بارگذاری...</p> : history.length === 0 ? <p className="text-gray-500 text-sm">تاکنون پیشنهادی ارسال نشده</p> : (
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {history.map(h => (
                              <div key={h.id} className="bg-gray-800/50 p-3 sm:p-4 rounded-xl border border-gray-700/50">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-semibold text-sm">{h.title}</p>
                                      <span className={`text-xs px-2 py-0.5 rounded ${h.isRead ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>{h.isRead ? 'خوانده شده' : 'جدید'}</span>
                                    </div>
                                    <p className="text-gray-400 text-xs mt-1.5 leading-relaxed line-clamp-2">{h.content}</p>
                                    {h.profitPercent && (
                                      <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5">
                                        <span className="text-emerald-400 text-xs font-bold">+{h.profitPercent}% سود</span>
                                        {h.profitMessage && <span className="text-gray-400 text-xs mr-2">{h.profitMessage}</span>}
                                      </div>
                                    )}
                                    {h.expiresAt && <div className="mt-1.5 text-[10px] text-gray-500">انقضا: {new Date(h.expiresAt).toLocaleDateString('fa-IR')}{new Date(h.expiresAt) < new Date() && <span className="text-red-400 mr-1">(منقضی شده)</span>}</div>}
                                  </div>
                                  <div className="text-left flex-shrink-0">
                                    <p className="text-gray-600 text-xs whitespace-nowrap">{new Date(h.createdAt).toLocaleDateString('fa-IR')}</p>
                                    <button onClick={() => handleDelete(h.id)} disabled={deletingId === h.id} className="text-red-400 hover:text-red-300 text-xs mt-2 underline underline-offset-2 disabled:opacity-50">{deletingId === h.id ? '...' : 'حذف'}</button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-5 border border-gray-700/50 mt-6">
                        <h3 className="font-semibold text-sm mb-3">پرتفوی کاربر</h3>
                        {portfolioLoading ? <p className="text-gray-500 text-sm">در حال بارگذاری...</p> : portfolioAssets.length === 0 ? <p className="text-gray-500 text-sm">کاربر دارای دارایی نیست</p> : (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                              <div className="bg-gray-800 rounded-lg p-3"><p className="text-gray-400 text-xs">تعداد دارایی‌ها</p><p className="text-lg font-bold">{portfolioAssets.length}</p></div>
                              <div className="bg-gray-800 rounded-lg p-3"><p className="text-gray-400 text-xs">ارزش کل</p><p className="text-lg font-bold text-emerald-400">{totalValue.toLocaleString()} تومان</p></div>
                              <div className="bg-gray-800 rounded-lg p-3"><p className="text-gray-400 text-xs">سرمایه‌گذاری</p><p className="text-lg font-bold">{totalInvested.toLocaleString()} تومان</p></div>
                              <div className="bg-gray-800 rounded-lg p-3"><p className="text-gray-400 text-xs">سود/زیان</p><p className={`text-lg font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{pnl >= 0 ? '+' : ''}{pnl.toLocaleString()} تومان</p></div>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead><tr className="text-gray-400 border-b border-gray-700">{['نماد', 'نام', 'نوع', 'مقدار', 'قیمت فعلی', 'ارزش', 'قیمت خرید', 'سود/زیان'].map(h =>                                     <th key={h} className={`text-right py-2 px-2 whitespace-nowrap ${['نام', 'قیمت خرید'].includes(h) ? 'hidden sm:table-cell' : ''}`}>{h}</th>)}</tr></thead>
                                <tbody>{portfolioAssets.map(a => { const price = getPrice(a.symbol); const cv = price * a.quantity; const cb = a.purchasePrice ? a.purchasePrice * a.quantity : null; const apnl = cb !== null ? cv - cb : null; return (
                                  <tr key={a.id} className="border-b border-gray-800">
                                    <td className="py-2 px-2 font-medium">{a.symbol}</td><td className="py-2 px-2 text-gray-400 hidden sm:table-cell">{a.label}</td><td className="py-2 px-2 text-gray-400">{a.type}</td>
                                    <td className="py-2 px-2">{a.quantity}</td><td className="py-2 px-2">{price.toLocaleString()}</td><td className="py-2 px-2">{cv.toLocaleString()}</td>
                                    <td className="py-2 px-2 hidden sm:table-cell">{a.purchasePrice?.toLocaleString() ?? '—'}</td>
                                    <td className={`py-2 px-2 ${apnl !== null ? (apnl >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-gray-500'}`}>{apnl !== null ? `${apnl >= 0 ? '+' : ''}${apnl.toLocaleString()}` : '—'}</td>
                                  </tr>)})}</tbody>
                              </table>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-5 border border-gray-700/50 mt-6">
                        <h3 className="font-semibold text-sm mb-3">اسکنر پرتفوی</h3>
                        <div className="flex items-center justify-between py-2 border-b border-gray-700/50 mb-4">
                          <span className="text-gray-400 text-sm">وضعیت اسکنر</span>
                          <button onClick={() => handleToggleScanner(selectedUser.id, selectedUser.subscription?.scannerActive ?? true)} disabled={scannerToggling}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${selectedUser.subscription?.scannerActive ?? true ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                            {selectedUser.subscription?.scannerActive ?? true ? 'فعال' : 'غیرفعال'}
                          </button>
                        </div>
                        <div className="mb-4">
                          <h4 className="text-xs text-gray-400 mb-2">نوع سرمایه‌گذاری کاربر</h4>
                          {quizLoading ? <p className="text-gray-500 text-sm">در حال بارگذاری...</p> : quizResults.length === 0 ? <p className="text-gray-500 text-sm">کاربر هنوز تست شخصیت مالی را انجام نداده</p> : (
                            <div className="bg-gray-800 rounded-lg p-3 space-y-1">
                              <p className="text-sm font-bold">{TYPE_LABELS[quizResults[0].investorType] || quizResults[0].investorType}</p>
                              <p className="text-xs text-gray-400">امتیاز: {quizResults[0].score} | تاریخ: {new Date(quizResults[0].createdAt).toLocaleDateString('fa-IR')}</p>
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
                                <thead><tr className="text-gray-400 border-b border-gray-700">{['نوع دارایی', 'درصد فعلی', 'درصد ایده‌آل', 'اختلاف', 'وضعیت'].map(h => <th key={h} className="text-right py-2 px-2 whitespace-nowrap">{h}</th>)}</tr></thead>
                                <tbody>{scanResult.map(row => { const tn: Record<string, string> = { gold: 'طلا', currency: 'ارز', stock: 'سهام', crypto: 'ارز دیجیتال', other: 'سایر' }; return (
                                  <tr key={row.type} className="border-b border-gray-800">
                                    <td className="py-2 px-2">{tn[row.type] || row.type}</td><td className="py-2 px-2">{row.current}%</td><td className="py-2 px-2">{row.ideal}%</td>
                                    <td className={`py-2 px-2 ${row.diff > 0 ? 'text-amber-400' : row.diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>{row.diff > 0 ? '+' : ''}{row.diff}%</td>
                                    <td className="py-2 px-2">{Math.abs(row.diff) <= 5 ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">⚠</span>}</td>
                                  </tr>)})}</tbody>
                              </table>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-300 leading-relaxed">این کاربر از نوع {TYPE_LABELS[scanInvestorType] || scanInvestorType} است.{' '}
                                {scanResult.filter(r => Math.abs(r.diff) > 5).map(r => { const tn: Record<string, string> = { gold: 'طلا', currency: 'ارز', stock: 'سهام', crypto: 'ارز دیجیتال', other: 'سایر' }; if (r.diff > 0) return `سهم ${tn[r.type] || r.type} باید ${Math.round(r.diff)}% کاهش یابد`; return `سهم ${tn[r.type] || r.type} باید ${Math.round(Math.abs(r.diff))}% افزایش یابد` }).join('، ')}.
                              </p>
                            </div>
                            <button onClick={async () => {
                              const content = scanResult.map(r => { const tn: Record<string, string> = { gold: 'طلا', currency: 'ارز', stock: 'سهام', crypto: 'ارز دیجیتال', other: 'سایر' }; const s = Math.abs(r.diff) <= 5 ? '✓' : '⚠'; return `${tn[r.type] || r.type}: ${r.current}% (ایده‌آل: ${r.ideal}%) ${s}` }).join('\n')
                              const summary = scanResult.filter(r => Math.abs(r.diff) > 5).map(r => { const tn: Record<string, string> = { gold: 'طلا', currency: 'ارز', stock: 'سهام', crypto: 'ارز دیجیتال', other: 'سایر' }; if (r.diff > 0) return `${tn[r.type] || r.type}: ${Math.round(r.diff)}% کاهش`; return `${tn[r.type] || r.type}: ${Math.round(Math.abs(r.diff))}% افزایش` }).join('، ')
                              await sendSuggestion(selectedUser.id, 'نتیجه اسکن پرتفوی', `نوع سرمایه‌گذار: ${TYPE_LABELS[scanInvestorType] || scanInvestorType}\n\n${content}\n\nتوصیه‌ها: ${summary}`)
                              setSugSuccess('نتیجه اسکن به عنوان پیشنهاد ارسال شد'); loadHistory(selectedUser.id)
                            }} className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors">ارسال نتیجه اسکن به عنوان پیشنهاد</button>
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
                <h2 className="text-sm font-bold text-gray-300 mb-2">تیکت‌ها ({tickets.length})</h2>
                {tickets.map(t => (
                  <div key={t.id} onClick={() => openTicket(t.id)}
                    className={`bg-gray-900 p-3 rounded-xl cursor-pointer border transition-all ${selectedTicket === t.id ? 'border-blue-500/50 bg-gray-800' : 'border-gray-800 hover:border-gray-600'}`}>
                    <p className="font-medium text-sm">{t.subject}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.status === 'open' ? 'باز' : 'بسته شده'} — {new Date(t.createdAt).toLocaleDateString('fa-IR')}</p>
                  </div>
                ))}
              </div>
              <div className="lg:flex-1 space-y-4">
                {selectedTicket && (
                  <>
                    <h3 className="text-sm font-bold text-gray-300 mb-2">مکالمه</h3>
                    {msgs.map(m => (
                      <div key={m.id} className="bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-800">
                        <p className="text-sm leading-relaxed">{m.message}</p>
                        <p className="text-xs text-gray-600 mt-2">{new Date(m.createdAt).toLocaleString('fa-IR')}</p>
                      </div>
                    ))}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input value={replyMsg} onChange={e => setReplyMsg(e.target.value)} placeholder="پاسخ..." className="flex-1 p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm focus:border-blue-500/50 focus:outline-none transition-colors" />
                      <div className="flex gap-2">
                        <button onClick={() => handleReply(selectedTicket)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition-colors whitespace-nowrap">ارسال</button>
                        <button onClick={() => handleClose(selectedTicket)} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-bold transition-colors whitespace-nowrap">بستن تیکت</button>
                        <button onClick={() => handleDeleteTicket(selectedTicket)} className="px-4 py-2.5 bg-red-800 hover:bg-red-900 rounded-xl text-sm font-bold transition-colors whitespace-nowrap">حذف تیکت</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === 'content' && <AdminContent />}
          {tab === 'signals' && <AdminSignals />}
          {tab === 'plus-requests' && <AdminPlusRequests />}
          {tab === 'analytics' && <AdminAnalytics />}
          {tab === 'tasks' && <AdminTasks />}
          {tab === 'referrals' && <AdminReferrals />}
        </main>
      </div>
    </div>
  )
}

function AdminReferrals() {
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState('')

  useEffect(() => {
    import('@/app/actions/referral').then(m => m.getAllReferrals()).then(d => { setReferrals(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function markConverted(id: string) {
    const m = await import('@/app/actions/referral')
    await m.markReferralConverted(id)
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status: 'converted' } : r))
  }

  async function generateForAll() {
    setGenerating(true); setGenResult('')
    try {
      const m = await import('@/app/actions/referral')
      const count = await m.generateCodesForAllQuizTakers()
      setGenResult(`${count} کد جدید ساخته شد`)
    } catch(e) { setGenResult('خطا: ' + (e instanceof Error ? e.message : 'unknown')) }
    setGenerating(false)
  }

  if (loading) return <div className="text-center py-8 text-gray-500">در حال بارگذاری...</div>

  const total = referrals.length
  const converted = referrals.filter(r => r.status === 'converted').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">مدیریت معرفی‌ها</h2>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{total} کل</span>
          <span className="text-emerald-400">{converted} خرید</span>
          <span className="text-amber-400">{total - converted} فعال</span>
        </div>
      </div>
      <button onClick={generateForAll} disabled={generating}
        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors">
        {generating ? 'در حال ساخت...' : 'ساخت کد برای همه تست‌دهندگان'}
      </button>
      {genResult && <p className="text-sm text-emerald-400">{genResult}</p>}
      <div className="space-y-2">
        {referrals.map(r => (
          <div key={r.id} className="bg-gray-900 p-3 rounded-xl border border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">معرف: {r.referrerId.substring(0, 8)}...</p>
              <p className="text-xs text-gray-400">معرفی‌شده: {r.referredId.substring(0, 8)}... • {r.email || '—'}</p>
              <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString('fa-IR')}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${r.status === 'converted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{r.status === 'converted' ? 'خرید کرده' : 'فعال'}</span>
              {r.status !== 'converted' && <button onClick={() => markConverted(r.id)} className="text-xs text-emerald-400 hover:text-emerald-300 underline">ثبت خرید</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminContent() {
  const [courses, setCourses] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [contentTab, setContentTab] = useState<'courses' | 'articles' | 'enrollments'>('courses')
  const [cats, setCats] = useState<any[]>([])
  const [showForm, setShowForm] = useState<'article' | 'course' | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [af, setAf] = useState({ title: '', slug: '', excerpt: '', content: '', categoryId: '', author: '', authorRole: '', image: '', readingTime: 5, isFeatured: false })
  const [cf, setCf] = useState({ title: '', slug: '', description: '', category: 'trading', instructor: '', instructorName: '', price: 0, originalPrice: 0, duration: '', level: 'beginner', lessons: 0, videoHours: 0, color: '#3B82F6', icon: 'BookOpen', isPopular: false, isNew: false })

  const loadData = useCallback(async () => {
    const [arts, crs, enrolls, articleCats] = await Promise.all([
      import('@/app/actions/admin').then(m => m.getAdminArticles()),
      import('@/app/actions/admin').then(m => m.getAdminCourses()),
      import('@/app/actions/admin').then(m => m.getAdminEnrollments()),
      import('@/app/actions/academy').then(m => m.getArticleCategories()).catch(() => []),
    ])
    setArticles(arts); setCourses(crs); setEnrollments(enrolls); setCats(articleCats)
  }, [])

  useEffect(() => { loadData().catch(() => {}).finally(() => setLoading(false)) }, [loadData])

  function openArticleForm(a?: any) {
    if (a) { setFormMode('edit'); setEditId(a.id); setAf({ title: a.title, slug: a.slug, excerpt: a.excerpt, content: a.content, categoryId: a.categoryId || '', author: a.author, authorRole: a.authorRole || '', image: a.image || '', readingTime: a.readingTime, isFeatured: a.isFeatured }) }
    else { setFormMode('create'); setEditId(null); setAf({ title: '', slug: '', excerpt: '', content: '', categoryId: '', author: '', authorRole: '', image: '', readingTime: 5, isFeatured: false }) }
    setShowForm('article')
  }

  function openCourseForm(c?: any) {
    if (c) { setFormMode('edit'); setEditId(c.id); setCf({ title: c.title, slug: c.slug, description: c.description, category: c.category, instructor: c.instructor, instructorName: c.instructorName, price: c.price, originalPrice: c.originalPrice || 0, duration: c.duration || '', level: c.level, lessons: c.lessons, videoHours: c.videoHours || 0, color: c.color, icon: c.icon, isPopular: c.isPopular, isNew: c.isNew }) }
    else { setFormMode('create'); setEditId(null); setCf({ title: '', slug: '', description: '', category: 'trading', instructor: '', instructorName: '', price: 0, originalPrice: 0, duration: '', level: 'beginner', lessons: 0, videoHours: 0, color: '#3B82F6', icon: 'BookOpen', isPopular: false, isNew: false }) }
    setShowForm('course')
  }

  async function saveArticle() {
    if (!af.title || !af.slug || !af.excerpt || !af.content) return
    setSaving(true)
    try {
      const m = await import('@/app/actions/academy')
      if (formMode === 'create') await m.createArticle(af); else if (editId) await m.updateArticle(editId, af)
      setShowForm(null); await loadData()
    } catch (e) { console.error(e) }; setSaving(false)
  }

  async function saveCourse() {
    if (!cf.title || !cf.slug || !cf.description) return
    setSaving(true)
    try {
      const m = await import('@/app/actions/academy')
      if (formMode === 'create') await m.createCourse(cf); else if (editId) await m.updateCourse(editId, cf)
      setShowForm(null); await loadData()
    } catch (e) { console.error(e) }; setSaving(false)
  }

  async function handleDeleteArticle(id: string) { if (!confirm('حذف مقاله؟')) return; await (await import('@/app/actions/academy')).deleteArticle(id); await loadData() }
  async function handleDeleteCourse(id: string) { if (!confirm('حذف دوره؟')) return; await (await import('@/app/actions/academy')).deleteCourse(id); await loadData() }

  if (loading) return <div className="text-center py-8 text-gray-500">در حال بارگذاری...</div>

  const formOverlay = showForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowForm(null) }}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">{formMode === 'create' ? 'افزودن' : 'ویرایش'} {showForm === 'article' ? 'مقاله' : 'دوره'}</h3>
          <button onClick={() => setShowForm(null)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        {showForm === 'article' ? (
          <div className="space-y-3">
            <input value={af.title} onChange={e => setAf(p => ({ ...p, title: e.target.value }))} placeholder="عنوان" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-blue-500" />
            <input value={af.slug} onChange={e => setAf(p => ({ ...p, slug: e.target.value }))} placeholder="slug (مثال: my-article)" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-blue-500 ltr" dir="ltr" />
            <textarea value={af.excerpt} onChange={e => setAf(p => ({ ...p, excerpt: e.target.value }))} placeholder="خلاصه" rows={2} className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-blue-500" />
            <textarea value={af.content} onChange={e => setAf(p => ({ ...p, content: e.target.value }))} placeholder="محتوا (می‌تواند HTML باشد)" rows={6} className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-blue-500" />
            <div className="flex gap-2">
              <select value={af.categoryId} onChange={e => setAf(p => ({ ...p, categoryId: e.target.value }))} className="flex-1 px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none"><option value="">بدون دسته</option>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <input value={af.readingTime} onChange={e => setAf(p => ({ ...p, readingTime: Number(e.target.value) }))} type="number" placeholder="دقیقه" className="w-20 px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none" />
            </div>
            <input value={af.author} onChange={e => setAf(p => ({ ...p, author: e.target.value }))} placeholder="نویسنده" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-blue-500" />
            <input value={af.authorRole} onChange={e => setAf(p => ({ ...p, authorRole: e.target.value }))} placeholder="سمت نویسنده" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-blue-500" />
            <input value={af.image} onChange={e => setAf(p => ({ ...p, image: e.target.value }))} placeholder="تصویر (URL)" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-blue-500 ltr" dir="ltr" />
            <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={af.isFeatured} onChange={e => setAf(p => ({ ...p, isFeatured: e.target.checked }))} className="rounded" /> ویژه</label>
            <button onClick={saveArticle} disabled={saving} className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'ذخیره'}</button>
          </div>
        ) : (
          <div className="space-y-3">
            <input value={cf.title} onChange={e => setCf(p => ({ ...p, title: e.target.value }))} placeholder="عنوان دوره" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-blue-500" />
            <input value={cf.slug} onChange={e => setCf(p => ({ ...p, slug: e.target.value }))} placeholder="slug" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-blue-500 ltr" dir="ltr" />
            <textarea value={cf.description} onChange={e => setCf(p => ({ ...p, description: e.target.value }))} placeholder="توضیحات کوتاه" rows={2} className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-blue-500" />
            <div className="grid grid-cols-2 gap-2">
              <select value={cf.category} onChange={e => setCf(p => ({ ...p, category: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none">{[{ v: 'ict', l: 'ICT' }, { v: 'ai', l: 'هوش مصنوعی' }, { v: 'stock', l: 'بورس' }, { v: 'forex', l: 'فارکس' }, { v: 'crypto', l: 'ارز دیجیتال' }, { v: 'blockchain', l: 'بلاکچین' }, { v: 'trading', l: 'معامله‌گری' }, { v: 'psychology', l: 'روانشناسی' }].map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
              <select value={cf.level} onChange={e => setCf(p => ({ ...p, level: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none"><option value="beginner">مبتدی</option><option value="intermediate">متوسط</option><option value="advanced">پیشرفته</option></select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={cf.instructor} onChange={e => setCf(p => ({ ...p, instructor: e.target.value }))} placeholder="شناسه مدرس" className="px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none" />
              <input value={cf.instructorName} onChange={e => setCf(p => ({ ...p, instructorName: e.target.value }))} placeholder="نام مدرس" className="px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={cf.price} onChange={e => setCf(p => ({ ...p, price: Number(e.target.value) }))} type="number" placeholder="قیمت (تومان)" className="px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none" />
              <input value={cf.originalPrice} onChange={e => setCf(p => ({ ...p, originalPrice: Number(e.target.value) }))} type="number" placeholder="قیمت اصلی" className="px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input value={cf.duration} onChange={e => setCf(p => ({ ...p, duration: e.target.value }))} placeholder="مدت (مثلاً 12 ساعت)" className="px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none" />
              <input value={cf.lessons} onChange={e => setCf(p => ({ ...p, lessons: Number(e.target.value) }))} type="number" placeholder="جلسات" className="px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none" />
              <input value={cf.videoHours} onChange={e => setCf(p => ({ ...p, videoHours: Number(e.target.value) }))} type="number" step="0.5" placeholder="ساعت ویدیو" className="px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none" />
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-sm text-gray-300"><input type="checkbox" checked={cf.isPopular} onChange={e => setCf(p => ({ ...p, isPopular: e.target.checked }))} /> محبوب</label>
              <label className="flex items-center gap-1.5 text-sm text-gray-300"><input type="checkbox" checked={cf.isNew} onChange={e => setCf(p => ({ ...p, isNew: e.target.checked }))} /> جدید</label>
            </div>
            <button onClick={saveCourse} disabled={saving} className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'ذخیره'}</button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div dir="rtl">
      {formOverlay}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(['courses', 'articles', 'enrollments'] as const).map(t => (
          <button key={t} onClick={() => setContentTab(t)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${contentTab === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            {t === 'courses' ? `دوره‌ها (${courses.length})` : t === 'articles' ? `مقالات (${articles.length})` : `ثبت‌نام‌ها (${enrollments.length})`}
          </button>
        ))}
      </div>
      {contentTab === 'courses' && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 overflow-hidden shadow-lg shadow-black/10">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60 bg-gradient-to-r from-gray-900/80 to-gray-950/80">
            <span className="text-xs font-bold text-gray-400">مدیریت دوره‌ها</span>
            <button onClick={() => openCourseForm()} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-600/20"><Plus className="w-3.5 h-3.5" /> دوره جدید</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 border-b border-gray-700 bg-gray-800/50">{['عنوان', 'دسته', 'مدرس', 'سطح', 'قیمت', 'ثبت‌نام', 'عملیات'].map(h => <th key={h} className={`text-right py-3 px-3 ${['مدرس', 'سطح'].includes(h) ? 'hidden md:table-cell' : ''}`}>{h}</th>)}</tr></thead>
              <tbody>{courses.map(c => (
                <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-2.5 px-3 font-medium text-sm max-w-[180px] truncate">{c.title}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-xs">{c.category}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-xs hidden md:table-cell">{c.instructorName}</td>
                  <td className="py-2.5 px-3 hidden md:table-cell"><span className={`text-xs px-2 py-0.5 rounded-full ${c.level === 'beginner' ? 'bg-emerald-500/20 text-emerald-400' : c.level === 'intermediate' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{c.level === 'beginner' ? 'مبتدی' : c.level === 'intermediate' ? 'متوسط' : 'پیشرفته'}</span></td>
                  <td className="py-2.5 px-3 text-xs">{c.price.toLocaleString()} تومان</td>
                  <td className="py-2.5 px-3 text-xs font-bold text-emerald-400">{c.enrollmentCount}</td>
                  <td className="py-2.5 px-3"><div className="flex gap-1"><button onClick={() => openCourseForm(c)} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5 text-blue-400" /></button><button onClick={() => handleDeleteCourse(c.id)} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {courses.length === 0 && <p className="text-center py-8 text-gray-500">دوره‌ای یافت نشد</p>}
        </div>
      )}
      {contentTab === 'articles' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
            <span className="text-xs text-gray-500">مدیریت مقالات</span>
            <button onClick={() => openArticleForm()} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-colors"><Plus className="w-3.5 h-3.5" /> مقاله جدید</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 border-b border-gray-700 bg-gray-800/50">{['عنوان', 'دسته', 'بازدید', 'زمان', 'تاریخ', 'عملیات'].map(h => <th key={h} className={`text-right py-3 px-3 ${h === 'زمان' ? 'hidden md:table-cell' : ''}`}>{h}</th>)}</tr></thead>
              <tbody>{articles.map(a => (
                <tr key={a.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-2.5 px-3 font-medium text-sm max-w-[200px] truncate">{a.title}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-xs">{a.categoryName ?? '—'}</td>
                  <td className="py-2.5 px-3 text-xs">{a.views.toLocaleString('fa-IR')}</td>
                  <td className="py-2.5 px-3 text-xs">{a.readingTime} دقیقه</td>
                  <td className="py-2.5 px-3 text-xs text-gray-400">{new Date(a.publishedAt).toLocaleDateString('fa-IR')}</td>
                  <td className="py-2.5 px-3"><div className="flex gap-1"><button onClick={() => openArticleForm(a)} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5 text-blue-400" /></button><button onClick={() => handleDeleteArticle(a.id)} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {articles.length === 0 && <p className="text-center py-8 text-gray-500">مقاله‌ای یافت نشد</p>}
        </div>
      )}
      {contentTab === 'enrollments' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 border-b border-gray-700 bg-gray-800/50">{['کاربر', 'دوره', 'پیشرفت', 'شروع', 'وضعیت'].map(h => <th key={h} className="text-right py-3 px-3">{h}</th>)}</tr></thead>
              <tbody>{enrollments.map(e => (
                <tr key={e.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-2.5 px-3 font-medium text-xs">{e.user?.name ?? '—'}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-xs max-w-[200px] truncate">{e.course?.title ?? '—'}</td>
                  <td className="py-2.5 px-3"><div className="flex items-center gap-2"><div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden max-w-[80px]"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${e.progress}%` }} /></div><span className="text-xs text-gray-400">{Math.round(e.progress)}%</span></div></td>
                  <td className="py-2.5 px-3 text-xs text-gray-400">{new Date(e.startedAt).toLocaleDateString('fa-IR')}</td>
                  <td className="py-2.5 px-3">{e.completedAt ? <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">تکمیل شده</span> : <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">در حال یادگیری</span>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {enrollments.length === 0 && <p className="text-center py-8 text-gray-500">ثبت‌نامی یافت نشد</p>}
        </div>
      )}
    </div>
  )
}

function AdminPlusRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const load = useCallback(async () => { setRequests(await (await import('@/app/actions/admin')).getPendingAcapPlusRequests()) }, [])
  useEffect(() => { load().finally(() => setLoading(false)) }, [load])

  if (loading) return <div className="text-center py-8 text-gray-500">در حال بارگذاری...</div>
  return (
    <div dir="rtl" className="space-y-3">
      <h2 className="text-sm font-bold text-amber-400 mb-3">درخواست‌های A|CAP+</h2>
      {requests.length === 0 ? <p className="text-gray-500 text-center py-8">درخواستی وجود ندارد</p> : requests.map(r => (
        <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{r.name || 'بی‌نام'}</p>
            <p className="text-xs text-gray-400 mt-0.5">{r.email} {r.profile?.phone ? `| ${r.profile.phone}` : ''}</p>
            {r.subscription?.requestedAt && <p className="text-xs text-gray-500 mt-1">درخواست در {new Date(r.subscription.requestedAt).toLocaleDateString('fa-IR')}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={async () => { setApproving(r.id); try { await (await import('@/app/actions/admin')).approveAcapPlusRequest(r.id, true, 3); await load() } catch(e) { console.error(e) }; setApproving(null) }} disabled={approving === r.id}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">{approving === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'تأیید + آزمایشی ۳ روزه'}</button>
            <button onClick={async () => { setApproving(r.id); try { await (await import('@/app/actions/admin')).approveAcapPlusRequest(r.id, true); await load() } catch(e) { console.error(e) }; setApproving(null) }} disabled={approving === r.id}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">تأیید کامل</button>
            <button onClick={async () => { if (!confirm('رد درخواست؟')) return; await (await import('@/app/actions/admin')).approveAcapPlusRequest(r.id, false); await load() }}
              className="px-3 py-1.5 bg-red-600/50 hover:bg-red-600 rounded-lg text-xs font-bold transition-colors">رد</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function AdminSignals() {
  const [signals, setSignals] = useState<any[]>([])
  const [revenues, setRevenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [signalTab, setSignalTab] = useState<'signals' | 'revenue'>('signals')
  const [showSignalForm, setShowSignalForm] = useState(false)
  const [signalFormMode, setSignalFormMode] = useState<'create' | 'edit'>('create')
  const [editSignalId, setEditSignalId] = useState<string | null>(null)
  const [sf, setSf] = useState({ type: 'crypto', symbol: '', title: '', description: '', action: 'buy', investorType: 'balanced', expectedProfit: '', actualReturn: '', priceAtPublish: '', priceNow: '', imageUrl: '', audioUrl: '', expiresAt: '', publishedAt: '' })
  const [signalSaving, setSignalSaving] = useState(false)
  const [showRevenueForm, setShowRevenueForm] = useState(false)
  const [revenueFormMode, setRevenueFormMode] = useState<'create' | 'edit'>('create')
  const [editRevenueId, setEditRevenueId] = useState<string | null>(null)
  const [rf, setRf] = useState(() => { const j = toJalaali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()); return { amount: '', month: j.jm.toString(), year: j.jy.toString(), description: '' } })
  const [revenueSaving, setRevenueSaving] = useState(false)

  const load = useCallback(async () => {
    const m = await import('@/app/actions/admin')
    const [sigs, revs] = await Promise.all([m.getSignals(), m.getAcapRevenue()])
    setSignals(sigs); setRevenues(revs)
  }, [])

  useEffect(() => { load().catch(() => {}).finally(() => setLoading(false)) }, [load])

  function openSignalForm(s?: any) {
    if (s) { setSignalFormMode('edit'); setEditSignalId(s.id); setSf({ type: s.type, symbol: s.symbol, title: s.title, description: s.description || '', action: s.action, investorType: s.investorType || 'balanced', expectedProfit: s.expectedProfit?.toString() || '', actualReturn: s.actualReturn?.toString() || '', priceAtPublish: s.priceAtPublish?.toString() || '', priceNow: s.priceNow?.toString() || '', imageUrl: s.imageUrl || '', audioUrl: s.audioUrl || '', expiresAt: s.expiresAt ? gregorianISOToPersianDatetime(s.expiresAt) : '', publishedAt: s.publishedAt ? gregorianISOToPersianDatetime(s.publishedAt) : '' }) }
    else { setSignalFormMode('create'); setEditSignalId(null); setSf({ type: 'crypto', symbol: '', title: '', description: '', action: 'buy', investorType: 'balanced', expectedProfit: '', actualReturn: '', priceAtPublish: '', priceNow: '', imageUrl: '', audioUrl: '', expiresAt: '', publishedAt: gregorianISOToPersianDatetime(new Date().toISOString()) }) }
    setShowSignalForm(true)
  }

  function openRevenueForm(r?: any) {
    if (r) { setRevenueFormMode('edit'); setEditRevenueId(r.id); setRf({ amount: r.amount.toString(), month: r.month.toString(), year: r.year.toString(), description: r.description || '' }) }
    else { setRevenueFormMode('create'); setEditRevenueId(null); const j = toJalaali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()); setRf({ amount: '', month: j.jm.toString(), year: j.jy.toString(), description: '' }) }
    setShowRevenueForm(true)
  }

  async function saveSignal() {
    if (!sf.symbol || !sf.title || !sf.priceAtPublish) return
    setSignalSaving(true)
    try {
      const m = await import('@/app/actions/admin')
      const data = { type: sf.type, symbol: sf.symbol.toUpperCase(), title: sf.title, description: sf.description || undefined, action: sf.action, investorType: sf.investorType || undefined, expectedProfit: sf.expectedProfit ? parseFloat(sf.expectedProfit) : undefined, actualReturn: sf.actualReturn ? parseFloat(sf.actualReturn) : undefined, priceAtPublish: parseFloat(sf.priceAtPublish), priceNow: sf.priceNow ? parseFloat(sf.priceNow) : undefined, imageUrl: sf.imageUrl || undefined, audioUrl: sf.audioUrl || undefined, expiresAt: sf.expiresAt ? persianDatetimeToGregorianISO(sf.expiresAt) : undefined, publishedAt: sf.publishedAt ? persianDatetimeToGregorianISO(sf.publishedAt) : undefined }
      if (signalFormMode === 'create') await m.createSignal(data); else if (editSignalId) await m.updateSignal(editSignalId, data)
      setShowSignalForm(false); await load()
    } catch (e) { console.error(e) }; setSignalSaving(false)
  }

  async function deleteSignal(id: string) { if (!confirm('حذف سیگنال؟')) return; await (await import('@/app/actions/admin')).deleteSignal(id); await load() }

  async function saveRevenue() {
    if (!rf.amount) return
    setRevenueSaving(true)
    try {
      const m = await import('@/app/actions/admin'); const amount = parseFloat(rf.amount); const month = parseInt(rf.month); const year = parseInt(rf.year)
      if (revenueFormMode === 'create') await m.addAcapRevenue(amount, month, year, rf.description || undefined); else if (editRevenueId) await m.updateAcapRevenue(editRevenueId, amount, rf.description || undefined, month, year)
      setShowRevenueForm(false); await load()
    } catch (e) { console.error(e) }; setRevenueSaving(false)
  }

  async function deleteRevenue(id: string) { if (!confirm('حذف درآمد؟')) return; await (await import('@/app/actions/admin')).deleteAcapRevenue(id); await load() }

  const totalRevenue = revenues.reduce((sum: number, r: any) => sum + r.amount, 0)
  const persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

  const signalFormOverlay = showSignalForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowSignalForm(false) }}>
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-700/50 rounded-2xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-2 border-b border-gray-800"><h3 className="text-base font-bold flex items-center gap-2"><Signal className="w-4 h-4 text-amber-400" />{signalFormMode === 'create' ? 'افزودن' : 'ویرایش'} سیگنال</h3><button onClick={() => setShowSignalForm(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button></div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-gray-500 mb-1 block">نوع دارایی</label><select value={sf.type} onChange={e => setSf(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors"><option value="crypto">ارز دیجیتال</option><option value="stock">سهام</option><option value="gold">طلا</option><option value="forex">فارکس</option><option value="dollar">دلار</option></select></div>
            <div><label className="text-[10px] text-gray-500 mb-1 block">نماد</label><input value={sf.symbol} onChange={e => setSf(p => ({ ...p, symbol: e.target.value }))} placeholder="مثلاً BTC" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors ltr" dir="ltr" /></div>
          </div>
          <div><label className="text-[10px] text-gray-500 mb-1 block">عنوان سیگنال</label><input value={sf.title} onChange={e => setSf(p => ({ ...p, title: e.target.value }))} placeholder="مثلاً خرید بیت‌کوین در حمایت" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors" /></div>
          <div><label className="text-[10px] text-gray-500 mb-1 block">توضیحات</label><textarea value={sf.description} onChange={e => setSf(p => ({ ...p, description: e.target.value }))} placeholder="تحلیل و دلیل سیگنال" rows={2} className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-gray-500 mb-1 block">نوع معامله</label><select value={sf.action} onChange={e => setSf(p => ({ ...p, action: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors"><option value="buy">خرید</option><option value="sell">فروش</option></select></div>
            <div><label className="text-[10px] text-gray-500 mb-1 block">تیپ سرمایه‌گذار</label><select value={sf.investorType} onChange={e => setSf(p => ({ ...p, investorType: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors"><option value="conservative">محافظه‌کار</option><option value="balanced">متعادل</option><option value="growth">رشدگرا</option><option value="aggressive">تهاجمی</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-gray-500 mb-1 block">درصد سود هدف</label><input value={sf.expectedProfit} onChange={e => setSf(p => ({ ...p, expectedProfit: e.target.value }))} placeholder="مثلاً 15" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors" /></div>
            <div><label className="text-[10px] text-gray-500 mb-1 block">بازده واقعی</label><input value={sf.actualReturn} onChange={e => setSf(p => ({ ...p, actualReturn: e.target.value }))} placeholder="مثلاً 12.5" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-gray-500 mb-1 block">قیمت در انتشار</label><input value={sf.priceAtPublish} onChange={e => setSf(p => ({ ...p, priceAtPublish: e.target.value }))} placeholder="قیمت به تومان" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors" /></div>
            <div><label className="text-[10px] text-gray-500 mb-1 block">قیمت فعلی (اختیاری)</label><input value={sf.priceNow} onChange={e => setSf(p => ({ ...p, priceNow: e.target.value }))} placeholder="در صورت تغییر" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <PersianDateTimePicker label="تاریخ انتشار" value={sf.publishedAt} onChange={v => setSf(p => ({ ...p, publishedAt: v }))} placeholder="به صورت خودکار پر شده" />
            <PersianDateTimePicker label="تاریخ انقضا (اختیاری)" value={sf.expiresAt} onChange={v => setSf(p => ({ ...p, expiresAt: v }))} placeholder="در صورت نیاز انتخاب کنید" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">تصویر سیگنال (آدرس)</label>
              <input value={sf.imageUrl} onChange={e => setSf(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://example.com/image.jpg" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors ltr" dir="ltr" />
              {sf.imageUrl && <img src={sf.imageUrl} alt="" className="w-full h-20 object-cover rounded-lg mt-1 border border-gray-700" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />}
            </div>
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">ویس / صدا (آدرس)</label>
              <input value={sf.audioUrl} onChange={e => setSf(p => ({ ...p, audioUrl: e.target.value }))} placeholder="https://example.com/voice.mp3" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors ltr" dir="ltr" />
              {sf.audioUrl && <audio src={sf.audioUrl} controls className="w-full h-8 mt-1" />}
            </div>
          </div>
          <button onClick={saveSignal} disabled={signalSaving}
            className="w-full bg-gradient-to-l from-amber-600 to-orange-500 text-white py-2.5 rounded-xl text-sm font-bold hover:from-amber-500 hover:to-orange-400 transition-all disabled:opacity-50 shadow-lg shadow-amber-600/20">
            {signalSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : signalFormMode === 'create' ? 'انتشار سیگنال' : 'ذخیره تغییرات'}
          </button>
        </div>
      </div>
    </div>
  )

  const revenueFormOverlay = showRevenueForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowRevenueForm(false) }}>
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-700/50 rounded-2xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-2 border-b border-gray-800"><h3 className="text-base font-bold">{revenueFormMode === 'create' ? 'افزودن' : 'ویرایش'} درآمد A|CAP</h3><button onClick={() => setShowRevenueForm(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button></div>
        <div className="space-y-3">
          <div><label className="text-[10px] text-gray-500 mb-1 block">مبلغ (تومان)</label><input value={rf.amount} onChange={e => setRf(p => ({ ...p, amount: e.target.value.replace(/[^0-9.]/g, '') }))} placeholder="مثلاً 15000000" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-emerald-500/50 transition-colors" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-gray-500 mb-1 block">ماه</label><select value={rf.month} onChange={e => setRf(p => ({ ...p, month: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-emerald-500/50 transition-colors">{persianMonths.map((name, i) => <option key={i + 1} value={(i + 1).toString()}>{name}</option>)}</select></div>
            <div><label className="text-[10px] text-gray-500 mb-1 block">سال</label><input value={rf.year} onChange={e => setRf(p => ({ ...p, year: e.target.value.replace(/[^0-9]/g, '') }))} placeholder="مثلاً 1404" className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-emerald-500/50 transition-colors" /></div>
          </div>
          <div><label className="text-[10px] text-gray-500 mb-1 block">توضیحات (اختیاری)</label><textarea value={rf.description} onChange={e => setRf(p => ({ ...p, description: e.target.value }))} placeholder="منبع درآمد" rows={2} className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-emerald-500/50 transition-colors" /></div>
          <button onClick={saveRevenue} disabled={revenueSaving} className="w-full bg-gradient-to-l from-emerald-600 to-green-500 text-white py-2.5 rounded-xl text-sm font-bold hover:from-emerald-500 hover:to-green-400 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20">{revenueSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><Plus className="w-4 h-4 inline-block ml-1" />{revenueFormMode === 'create' ? 'ثبت درآمد' : 'ذخیره'}</>}</button>
        </div>
      </div>
    </div>
  )

  if (loading) return <div className="text-center py-8 text-gray-500">در حال بارگذاری...</div>

  return (
    <div dir="rtl">
      {signalFormOverlay}{revenueFormOverlay}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button onClick={() => setSignalTab('signals')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${signalTab === 'signals' ? 'bg-gradient-to-l from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/20' : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700/30'}`}>سیگنال‌ها ({signals.length})</button>
        <button onClick={() => setSignalTab('revenue')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${signalTab === 'revenue' ? 'bg-gradient-to-l from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/20' : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700/30'}`}>درآمد A|CAP ({revenues.length})</button>
        <button onClick={async () => {
          try {
            const r = await recalculateAllSignals()
            alert(`${r.updated} از ${r.total} سیگنال با قیمت‌های زنده به‌روز شد`)
            await load()
          } catch (e: any) {
            alert('خطا: ' + (e?.message || 'نامشخص'))
          }
        }} className="px-4 py-2 rounded-lg text-sm whitespace-nowrap bg-gradient-to-l from-emerald-600 to-green-500 text-white font-bold shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-green-400 transition-all">
          به‌روزرسانی قیمت‌ها
        </button>
      </div>
      {signalTab === 'signals' && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 overflow-hidden shadow-lg shadow-black/10">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60 bg-gradient-to-r from-gray-900/80 to-gray-950/80">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><Signal className="w-3.5 h-3.5 text-amber-400" />مدیریت سیگنال‌ها</span>
            <div className="flex gap-2">
              <button onClick={async () => {
                if (!confirm('همه سیگنال‌ها و درآمدهای قبلی پاک شده و با داده‌های واقعی بازار جایگزین می‌شن. ادامه میدی؟')) return
                try {
                  const r = await populateSignals()
                  alert(`${r.signals} سیگنال با قیمت‌های لحظه‌ای بازار ایجاد شد\n${r.revenueMonths} ماه درآمد محاسبه شد`)
                  await load()
                } catch (e: any) {
                  alert('خطا: ' + (e?.message || 'نامشخص'))
                }
              }} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-l from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"><TrendingUp className="w-3.5 h-3.5" /> ایجاد سیگنال‌های واقعی</button>
              <button onClick={() => openSignalForm()} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-l from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 rounded-lg text-xs font-bold transition-all shadow-lg shadow-amber-600/20"><Plus className="w-3.5 h-3.5" /> سیگنال جدید</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 border-b border-gray-700 bg-gray-800/50">{['عنوان', 'سود هدف', 'بازده واقعی', 'قیمت انتشار', 'تاریخ', 'عملیات'].map(h => <th key={h} className={`text-right py-3 px-3 ${['بازده واقعی', 'قیمت انتشار'].includes(h) ? 'hidden md:table-cell' : ''}`}>{h}</th>)}</tr></thead>
              <tbody>{signals.map(s => { const actualOk = s.actualReturn !== null && s.actualReturn !== undefined; return (
                <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-2.5 px-3"><div className="font-medium text-sm">{s.title}</div><div className="flex items-center gap-1.5 mt-0.5"><span className="text-[10px] text-gray-500">{s.symbol}</span><span className={`text-[10px] px-1.5 py-0.5 rounded-full ${s.action === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{s.action === 'buy' ? 'خرید' : 'فروش'}</span><span className="text-[10px] text-gray-500">{s.type === 'crypto' ? 'ارز دیجیتال' : s.type === 'stock' ? 'سهام' : s.type === 'gold' ? 'طلا' : s.type === 'dollar' ? 'دلار' : 'فارکس'}</span></div></td>
                  <td className="py-2.5 px-3"><span className="text-sm font-bold text-blue-400">{s.expectedProfit ? `+${s.expectedProfit}%` : '—'}</span></td>
                  <td className="py-2.5 px-3 hidden md:table-cell">{actualOk ? <span className={`text-sm font-bold ${s.actualReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{s.actualReturn >= 0 ? '+' : ''}{s.actualReturn}%</span> : <button onClick={async () => { const m = await import('@/app/actions/admin'); await m.recalculateSignalReturn(s.id); await load() }} className="text-xs text-gray-500 hover:text-blue-400 underline">محاسبه</button>}</td>
                  <td className="py-2.5 px-3 text-xs text-gray-400 font-mono hidden md:table-cell">{Number(s.priceAtPublish).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-xs text-gray-400">{new Date(s.publishedAt).toLocaleDateString('fa-IR')}{s.expiresAt ? ` → ${new Date(s.expiresAt).toLocaleDateString('fa-IR')}` : ''}</td>
                  <td className="py-2.5 px-3"><div className="flex gap-1"><button onClick={() => openSignalForm(s)} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5 text-blue-400" /></button><button onClick={() => deleteSignal(s.id)} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button></div></td>
                </tr>)})}</tbody>
            </table>
          </div>
          {signals.length === 0 && <p className="text-center py-8 text-gray-500">سیگنالی یافت نشد</p>}
        </div>
      )}
      {signalTab === 'revenue' && (
        <div className="space-y-4">
          {/* Performance stats */}
          {signals.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'کل سیگنال‌ها', value: signals.length, color: 'text-white' },
                { label: 'نرخ برد', value: `${(() => { const w = signals.filter((s: any) => (s.actualReturn ?? 0) > 0).length; return signals.length > 0 ? Math.round(w / signals.length * 100) : 0 })()}%`, color: 'text-emerald-400' },
                { label: 'میانگین بازده', value: `${(() => { const withR = signals.filter((s: any) => s.actualReturn !== null && s.actualReturn !== undefined); if (withR.length === 0) return '—'; const avg = withR.reduce((s: number, o: any) => s + (o.actualReturn ?? 0), 0) / withR.length; return (avg >= 0 ? '+' : '') + avg.toFixed(1) })()}%`, color: 'text-amber-400' },
                { label: 'بهترین بازده', value: `${(() => { const withR = signals.filter((s: any) => s.actualReturn !== null && s.actualReturn !== undefined); if (withR.length === 0) return '—'; return '+' + Math.max(...withR.map((s: any) => s.actualReturn ?? 0)).toFixed(1) })()}%`, color: 'text-emerald-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl p-4 border border-gray-800/60 shadow-lg shadow-black/10">
                  <div className="text-[10px] text-gray-500 mb-1">{stat.label}</div>
                  <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          )}
          {signals.length === 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl p-4 border border-gray-800/60 shadow-lg shadow-black/10">
              <div className="text-[10px] text-gray-500 mb-1">آمار عملکرد</div>
              <div className="text-lg font-black text-gray-600">هنوز سیگنالی ثبت نشده</div>
            </div>
          )}
          {/* Monthly revenue records (as percentages) */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">عملکرد ماهانه</span>
            <div className="flex gap-2">
              <button onClick={async () => {
                try {
                  const r = await populateRevenueFromSignals()
                  if (r.months > 0) alert(`${r.months} ماه درآمد از ${r.totalSignals} دوره از سیگنال‌ها محاسبه و ثبت شد`)
                  else alert('هیچ سیگنال موفقی برای محاسبه درآمد یافت نشد')
                  await load()
                } catch (e: any) {
                  alert('خطا: ' + (e?.message || 'نامشخص'))
                }
              }} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-l from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 rounded-lg text-xs font-bold transition-all shadow-lg shadow-amber-600/20"><Signal className="w-3.5 h-3.5" /> محاسبه از سیگنال‌ها</button>
              <button onClick={() => openRevenueForm()} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-l from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"><Plus className="w-3.5 h-3.5" /> ثبت دستی</button>
            </div>
          </div>
          {revenues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[...revenues].sort((a, b) => (b.year - a.year) || (b.month - a.month)).map(r => (
                <div key={r.id} className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-300">{persianMonths[r.month - 1] || r.month}</span>
                      <span className="text-[10px] text-gray-500">{r.year}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openRevenueForm(r)} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5 text-blue-400" /></button>
                      <button onClick={() => deleteRevenue(r.id)} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                  <div className="text-lg font-black text-emerald-400">+{Number(r.amount).toFixed(1)}%</div>
                  {r.description && <div className="text-[11px] text-gray-500 mt-1.5 line-clamp-2">{r.description}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">عملکردی ثبت نشده است</p>
          )}
        </div>
      )}
    </div>
  )
}

function AdminAnalytics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/admin/analytics').then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="text-center py-8 text-gray-500">در حال بارگذاری...</div>
  if (!data) return <div className="text-center py-8 text-red-400">خطا در دریافت آمار</div>

  const maxHeat = Math.max(...(data.heatMap || []).map((h: any) => h.count), 1)
  const maxViews = Math.max(...(data.pageViews || []).map((v: any) => v.count), 1)

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: 'کاربران', value: data.totalUsers, color: 'text-blue-400' },
          { label: 'A|CAP+', value: data.plusUsers, color: 'text-amber-400' },
          { label: 'دوره‌ها', value: data.totalCourses, color: 'text-emerald-400' },
          { label: 'مقالات', value: data.totalArticles, color: 'text-purple-400' },
          { label: 'ثبت‌نام‌ها', value: data.totalEnrollments, color: 'text-cyan-400' },
          { label: 'تیکت‌های باز', value: data.openTickets, color: 'text-rose-400' },
        ].map(card => (
          <div key={card.label} className="bg-gray-900 rounded-xl p-3 border border-gray-800 text-center">
            <div className={`text-xl font-black ${card.color}`}>{card.value}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {data.courseRevenue && data.courseRevenue.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold">درآمد دوره‌ها</h3>
            <span className="text-xs text-gray-500">{data.courseRevenue.reduce((s: number, r: any) => s + (r.price || 0) * r.enrollments, 0).toLocaleString()} تومان پتانسیل</span>
          </div>
            <div className="space-y-1.5">{data.courseRevenue.map((r: any, i: number) => { const maxE = Math.max(...data.courseRevenue.map((x: any) => x.enrollments), 1); const revenue = (r.price || 0) * r.enrollments; return (
            <div key={i} className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}</span>
              <span className="text-xs text-gray-300 min-w-0 flex-1 sm:flex-none sm:w-56 truncate">{r.title}</span>
              <div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden min-w-[60px]"><div className="h-full bg-amber-600/70 rounded" style={{ width: `${(r.enrollments / maxE) * 100}%` }} /></div>
              <span className="text-xs text-gray-400 w-12 text-left shrink-0">{r.enrollments}</span>
              <span className="text-xs text-emerald-400 w-28 text-left shrink-0">{revenue.toLocaleString()} تومان</span>
            </div>)})}</div>
        </div>
      )}

      {data.heatMap && data.heatMap.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold">گرمای فعالیت (۳۶۵ روز)</h3>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <span>کم</span>
              {['bg-gray-800', 'bg-emerald-900/40', 'bg-emerald-700/50', 'bg-emerald-500/60', 'bg-emerald-400/80'].map(c => <div key={c} className={`w-3 h-3 rounded ${c}`} />)}
              <span>زیاد</span>
            </div>
          </div>
          <div className="overflow-x-auto pb-1" dir="ltr">
            <div className="flex gap-0.5" style={{ minWidth: `${(data.heatMap.length / 7) * 14}px` }}>{Array.from({ length: Math.ceil(data.heatMap.length / 7) }, (_, week) => (
              <div key={week} className="flex flex-col gap-0.5">{Array.from({ length: 7 }, (_, day) => { const idx = week * 7 + day; const d = data.heatMap[idx]; if (!d) return <div key={day} className="w-3 h-3 rounded-sm bg-gray-950" />; const intensity = d.count > 0 ? Math.ceil((d.count / maxHeat) * 4) : 0; const colors = ['bg-gray-800', 'bg-emerald-900/40', 'bg-emerald-700/50', 'bg-emerald-500/60', 'bg-emerald-400/80']; return <div key={day} className={`w-3 h-3 rounded-sm ${colors[intensity]} hover:ring-1 hover:ring-emerald-400 cursor-default transition-all`} title={`${d.date}: ${d.count} بازدید`} /> })}
              </div>))}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {data.dailyUsers && data.dailyUsers.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-sm font-bold mb-3">کاربران جدید (۳۰ روز)</h3>
            <div className="flex items-end gap-1 h-24 overflow-x-auto pb-1">{data.dailyUsers.map((d: any, i: number) => { const maxS = Math.max(...data.dailyUsers.map((x: any) => x.count), 1); const h = (d.count / maxS) * 100; return (
              <div key={i} className="flex flex-col items-center gap-0.5 shrink-0"><div className="w-5 sm:w-6 bg-blue-500/60 rounded-t" style={{ height: `${Math.max(h, d.count > 0 ? 4 : 0)}%` }} /><span className="text-[7px] text-gray-600">{d.date?.slice(5) || ''}</span></div>)})}</div>
          </div>
        )}
        {data.pageViews && data.pageViews.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-sm font-bold mb-3">بازدید روزانه (۳۰ روز)</h3>
            <div className="flex items-end gap-1 h-24 overflow-x-auto pb-1">{[...data.pageViews].reverse().map((d: any, i: number) => { const h = (d.count / maxViews) * 100; return (
              <div key={i} className="flex flex-col items-center gap-0.5 shrink-0"><div className="w-5 sm:w-6 bg-emerald-500/60 rounded-t" style={{ height: `${Math.max(h, d.count > 0 ? 4 : 0)}%` }} /><span className="text-[7px] text-gray-600">{d.date?.slice(5) || ''}</span></div>)})}</div>
          </div>
        )}
      </div>

      {data.eventCounts && data.eventCounts.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h3 className="text-sm font-bold mb-3">رویدادها (۷ روز)</h3>
          <div className="space-y-1.5">{data.eventCounts.map((e: any, i: number) => { const maxC = Math.max(...data.eventCounts.map((x: any) => x.count)); return (
            <div key={i} className="flex items-center gap-2"><span className="text-xs text-gray-400 w-20 sm:w-28 truncate">{e.event}</span><div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden"><div className="h-full bg-emerald-600/70 rounded" style={{ width: `${(e.count / maxC) * 100}%` }} /></div><span className="text-xs text-gray-500 w-10 text-left">{e.count}</span></div>)})}</div>
        </div>
      )}

      {data.topPages && data.topPages.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h3 className="text-sm font-bold mb-3">صفحات پربازدید (۷ روز)</h3>
          <div className="space-y-1">{data.topPages.slice(0, 10).map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-gray-800 last:border-0">
              <div className="flex items-center gap-2 min-w-0"><span className="text-[10px] text-gray-600 w-4">{i + 1}</span><span className="text-xs text-gray-300 truncate ltr">{p.path || '/'}</span></div>
              <span className="text-[10px] text-gray-500 shrink-0">{p.count}</span>
            </div>
          ))}</div>
        </div>
      )}

      {data.recentPrices && data.recentPrices.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h3 className="text-sm font-bold mb-3">آخرین قیمت‌های به‌روز شده</h3>
          <div className="space-y-1">{data.recentPrices.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-gray-800 last:border-0 text-xs">
              <span className="text-gray-300 font-medium">{p.symbol}</span>
              <span className="text-gray-500">{Number(p.price).toLocaleString()} | {new Date(p.updatedAt).toLocaleDateString('fa-IR')}</span>
            </div>
          ))}</div>
        </div>
      )}
    </div>
  )
}
