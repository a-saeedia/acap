'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import Link from 'next/link'
import { LayoutDashboard, Wallet, TrendingUp, Zap, Crown, GraduationCap, BookOpen, Gift, LogOut, Menu, X, ChevronLeft, ArrowRight } from 'lucide-react'


const navItems = [
  { href: '/app', label: 'خلاصه من', icon: LayoutDashboard },
  { href: '/app/assets', label: 'دارایی‌ها', icon: Wallet },
  { href: '/app/prices', label: 'قیمت‌ها', icon: TrendingUp },
  { href: '/app/personal', label: 'پیام‌های شخصی', icon: Crown },
  { href: '/app/personal', label: 'سیگنال‌های شخصی', icon: Crown },
  { href: '/app/academy', label: 'آکادمی', icon: GraduationCap },
  { href: '/app/invite', label: 'دعوت از دوستان', icon: Gift },
  { href: '/blog', label: 'وبلاگ', icon: BookOpen },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isPending && !session) router.push('/')
  }, [session, isPending])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  if (isPending) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white flex overflow-x-hidden" dir="rtl">
      {/* Sidebar */}
      <aside className={`w-64 bg-gray-900/95 border-l border-gray-800 hidden md:flex flex-col fixed h-full z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 pb-0">
          <Link href="/" className="text-2xl font-black tracking-widest hover:opacity-80 transition-opacity">
            A <span className="text-blue-400">|</span> CAP
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5 min-w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 pt-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-2 truncate">{session.user.name}</div>
          <button onClick={() => signOut().then(() => router.push('/'))}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> خروج
          </button>
        </div>
      </aside>

      {/* Sidebar reopen button (when collapsed) */}
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)}
          className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 p-2 rounded-l-xl bg-gray-900/95 border border-gray-800 border-r-0 text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
        >
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
      )}

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800 px-4 h-14 flex items-center justify-between">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-800 transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/" className="font-bold text-base hover:opacity-80 transition-opacity">A | CAP</Link>
        <div className="w-10" />
      </div>

      {/* Mobile slide-in drawer */}
      <div className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
        <nav className={`absolute top-0 bottom-0 right-0 w-72 bg-gray-900 border-l border-gray-800 overflow-y-auto transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="pt-16 px-4 pb-4">
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-gray-800/50">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {session.user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">{session.user.name}</div>
                <div className="text-xs text-gray-400 truncate">{session.user.email}</div>
              </div>
            </div>
            <div className="space-y-1">
              {navItems.map(item => (
                <Link key={item.href} href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5 min-w-5" />
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-800">
              <button onClick={() => signOut().then(() => router.push('/'))}
                className="w-full flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-all"
              >
                <LogOut className="w-5 h-5 min-w-5" /> خروج از حساب
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <main className={`flex-1 pt-16 md:pt-0 min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:mr-64' : 'md:mr-0'}`}>
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {pathname !== '/app' && pathname !== '/app/assets' && (
            <button onClick={() => router.push('/app')}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-4 md:mb-6"
            >
              <ArrowRight className="w-4 h-4" /> بازگشت
            </button>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
