'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './theme-provider'
import { Menu, X, Sun, Moon, User, LogOut, LayoutDashboard, Shield, Crown, HelpCircle } from 'lucide-react'
import { useSession, signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

const navItems: { label: string; href: string; highlight?: boolean }[] = [
  { label: 'وبلاگ', href: '/blog' },
  { label: 'آکادمی', href: '/education' },
  { label: 'درباره ما', href: '#about' },
  { label: 'تست مالی', href: '#quiz' },
  { label: 'A|CAP+', href: '#services' },
  { label: 'سفیران', href: '#ambassador' },
  { label: 'تیم', href: '#founders' },
  { label: 'سوالات', href: '#faq' },
]

export function Navbar({ onOpenAuth }: { onOpenAuth?: () => void }) {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetch('/api/admin-check').then(r => r.json()).then(d => setIsAdmin(d.admin)).catch(() => {})
    }
  }, [session])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href: string) => {
    setMenuOpen(false)
    if (href.startsWith('/')) {
      router.push(href)
    } else {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass border-b border-border shadow-lg shadow-black/20' : 'bg-transparent'
        }`}
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand wordmark — text only, no image logo in corner */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex-shrink-0 flex items-center gap-2 group"
            >
              <span className="font-black text-lg tracking-widest text-foreground group-hover:text-primary transition-colors">
                A <span className="text-primary">|</span> CAP
              </span>
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {navItems.map(item => (
                <button
                  key={item.href}
                  onClick={() => scrollTo(item.href)}
                  className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 font-semibold border ${
                    item.highlight
                      ? 'text-primary font-black border-primary/40 bg-primary/8 hover:bg-primary/15 hover:border-primary/70 shadow-sm shadow-primary/10'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border/60 hover:bg-white/4'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center glass border border-border rounded-xl hover:border-primary/40 transition-all"
                aria-label="تغییر تم"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
                  </motion.div>
                </AnimatePresence>
              </button>

              {session?.user ? (
                <div className="hidden md:flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => router.push('/admin')}
                      className="flex items-center gap-1.5 glass border border-red-500/30 hover:border-red-500/60 rounded-xl px-3 py-1.5 text-sm text-red-400 transition-all"
                    >
                      <Shield className="w-4 h-4" />
                      مدیریت
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/tickets')}
                    className="flex items-center gap-1.5 glass border border-border hover:border-blue-400/40 rounded-xl px-3 py-1.5 text-sm text-muted-foreground hover:text-blue-400 transition-all"
                  >
                    <HelpCircle className="w-4 h-4" />
                    تیکت
                  </button>
                  <button
                    onClick={() => router.push('/app/personal')}
                    className="flex items-center gap-1.5 glass border border-amber-500/30 hover:border-amber-500/60 rounded-xl px-3 py-1.5 text-sm text-amber-400 transition-all"
                  >
                    <Crown className="w-4 h-4" />
                    A|CAP+
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-1.5 glass border border-primary/30 hover:border-primary/60 rounded-xl px-3 py-1.5 text-sm text-primary transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    داشبورد
                  </button>
                  <button
                    onClick={() => signOut().then(() => window.location.reload())}
                    className="w-9 h-9 flex items-center justify-center glass border border-border hover:border-red-400/40 rounded-xl text-muted-foreground hover:text-red-400 transition-all"
                    aria-label="خروج"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="hidden md:flex btn-primary px-4 py-2 rounded-xl text-sm font-bold"
                >
                  ورود / ثبت‌نام
                </button>
              )}

              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-label={menuOpen ? 'بستن منو' : 'منو'}
                className="md:hidden w-11 h-11 flex items-center justify-center glass border border-border rounded-xl"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed top-16 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border shadow-xl"
            dir="rtl"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => scrollTo(item.href)}
                  className={`text-right py-3 text-base border-b border-border/40 last:border-0 transition-colors ${item.highlight ? 'text-primary font-black' : 'text-foreground hover:text-primary'}`}
                >
                  {item.label}
                </motion.button>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                {session?.user ? (
                  <>
                    {isAdmin && <button onClick={() => router.push('/admin')} className="btn-primary py-3 rounded-xl font-bold bg-red-600/20 text-red-400 border border-red-500/30">پنل مدیریت</button>}
                    <button onClick={() => router.push('/tickets')} className="btn-primary py-3 rounded-xl font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">تیکت‌ها</button>
                    <button onClick={() => router.push('/app/personal')} className="btn-primary py-3 rounded-xl font-bold bg-amber-600/20 text-amber-400 border border-amber-500/30">A|CAP+</button>
                    <button onClick={() => router.push('/dashboard')} className="btn-primary py-3 rounded-xl font-bold">
                      داشبورد من
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setMenuOpen(false); onOpenAuth?.() }} className="btn-primary py-3 rounded-xl font-bold">
                    ورود / ثبت‌نام
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
