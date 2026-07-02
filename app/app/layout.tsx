'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import Link from 'next/link'
import { BarChart3, Wallet, TrendingUp, Zap, Crown, GraduationCap, BookOpen, LogOut, Menu, X } from 'lucide-react'
import { AISupport } from '@/components/ai-support'

const navItems = [
  { href: '/app', label: 'خلاصه Portfolio', icon: BarChart3 },
  { href: '/app/assets', label: 'دارایی‌ها', icon: Wallet },
  { href: '/app/prices', label: 'قیمت‌ها', icon: TrendingUp },
  { href: '/app/signals', label: 'درآمد A|CAP', icon: Zap },
  { href: '/app/personal', label: 'سیگنال‌های شخصی', icon: Crown },
  { href: '/app/academy', label: 'آکادمی', icon: GraduationCap },
  { href: '/blog', label: 'وبلاگ', icon: BookOpen },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isPending && !session) router.push('/')
  }, [session, isPending])

  if (isPending) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900/80 border-l border-gray-800 hidden md:flex flex-col p-4 fixed h-full z-30">
        <div className="text-2xl font-black mb-8 text-center tracking-widest">
          A <span className="text-blue-400">|</span> CAP
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="pt-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-2 truncate">{session.user.name}</div>
          <button onClick={() => signOut().then(() => router.push('/'))}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> خروج
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800 p-4 flex items-center justify-between">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">{mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
        <div className="font-bold">A | CAP</div>
        <div className="w-8" />
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-10 bg-gray-950/95 pt-16 md:hidden" onClick={() => setMobileOpen(false)}>
          <nav className="p-4 space-y-2">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-semibold ${
                  pathname === item.href ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <button onClick={() => signOut().then(() => router.push('/'))}
              className="w-full flex items-center gap-2 px-4 py-4 rounded-xl text-base text-red-400 mt-4"
            >
              <LogOut className="w-5 h-5" /> خروج
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:mr-64 pt-16 md:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <AISupport />
    </div>
  )
}
