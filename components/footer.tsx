'use client'

import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from './theme-provider'

export function Footer() {
  const { theme } = useTheme()
  const scrollTo = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const navLinks = [
    { label: 'درباره ما', href: '#about' },
    { label: 'تست مالی', href: '#quiz' },
    { label: 'خدمات', href: '#services' },
    { label: 'سفیران', href: '#ambassador' },
    { label: 'تیم', href: '#founders' },
    { label: 'سوالات', href: '#faq' },
  ]

  const channels = [
    {
      name: 'تلگرام بات',
      handle: '@acapitalsbot',
      url: 'https://t.me/acapitalsbot',
      logo: '/telegram-logo.svg',
      color: '#2AABEE',
      label: 'Telegram',
    },
    {
      name: 'بله (Bale) بات',
      handle: '@acapitals_bot',
      url: 'https://bale.ai/acapitals_bot',
      logo: '/bale-logo.png',
      color: '#00C896',
      label: 'Bale',
    },
    {
      name: 'پشتیبانی تلگرام',
      handle: '@a_cap_support',
      url: 'https://t.me/a_cap_support',
      logo: '/telegram-logo.svg',
      color: '#2AABEE',
      label: 'Telegram',
    },
  ]

  return (
    <footer className="relative bg-background border-t border-border overflow-hidden" dir="rtl">
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Disclaimer */}
      <div className="relative z-10 border-b border-border bg-destructive/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-destructive font-black text-sm mb-1">افشای ریسک و سلب مسئولیت</div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                سرمایه‌گذاری در بازارهای مالی با ریسک ذاتی همراه است. تمام مطالب و تحلیل‌های ارائه‌شده توسط A | CAP جنبه اطلاعاتی و آموزشی دارند و توصیه سرمایه‌گذاری قطعی نیستند. تمام مسئولیت تصمیمات مالی برعهده شخص سرمایه‌گذار است.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Large centered logo hero band */}
      <div className="relative z-10 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 flex flex-col items-center text-center gap-6">

          {/* Big A|CAP logo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Glow behind logo */}
            <div
              className="absolute inset-0 -m-8 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(47,125,255,0.12) 0%, transparent 70%)',
                filter: 'blur(12px)',
              }}
            />
            <Image
              src={theme === 'light' ? '/logo-light.png' : '/logo-transparent.png'}
              alt="A Capital"
              width={480}
              height={144}
              className="object-contain w-64 sm:w-80 md:w-96 lg:w-[420px] relative z-10"
              priority={false}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm leading-relaxed max-w-md"
          >
            اولین دستیار مدیریت سرمایه مبتنی بر شخصیت مالی — نقشه ثروت اختصاصی شما
          </motion.p>

          {/* Brand wordmark */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground/40 font-mono"
          >
            PRECISION · TRUST · PERFORMANCE
          </motion.p>

          {/* Social channel badges — Telegram + Bale prominently */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-2"
          >
            {channels.map(ch => (
              <a
                key={ch.handle}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 glass border rounded-2xl px-4 py-2.5 transition-all duration-200 group"
                style={{ borderColor: `${ch.color}30` }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.borderColor = `${ch.color}70`
                  el.style.boxShadow = `0 0 18px ${ch.color}22`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.borderColor = `${ch.color}30`
                  el.style.boxShadow = ''
                }}
              >
                <Image
                  src={ch.logo}
                  alt={ch.label}
                  width={28}
                  height={28}
                  className="rounded-lg flex-shrink-0"
                />
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground leading-none mb-0.5">{ch.name}</div>
                  <div className="text-sm font-black leading-none" style={{ color: ch.color, direction: 'ltr' }}>{ch.handle}</div>
                </div>
              </a>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Nav links */}
          <div>
            <div className="text-foreground font-black text-sm mb-5 tracking-wide">بخش‌ها</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
              {navLinks.map(link => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="text-right text-muted-foreground text-sm hover:text-primary transition-colors py-1.5 font-medium"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div>
            <div className="text-foreground font-black text-sm mb-5 tracking-wide">شروع کن</div>
            <div className="flex flex-col gap-3">
              <motion.button
                onClick={() => scrollTo('#quiz')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="glass border border-border hover:border-primary/50 text-foreground hover:text-primary py-3 px-4 rounded-xl text-sm font-bold transition-all text-right"
              >
                تست شخصیت مالی رایگان
              </motion.button>
              <motion.a
                href="https://t.me/acapitalsbot"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary py-3 px-4 rounded-xl text-sm font-black text-center"
              >
                اشتراک ACAP Plus
              </motion.a>
              <motion.a
                href="https://t.me/acapitalsbot?start=ref_3bCj2pqq"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="glass border border-border hover:border-primary/30 text-muted-foreground hover:text-primary py-3 px-4 rounded-xl text-sm font-bold text-center transition-all"
              >
                عضویت در برنامه سفیران
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-muted-foreground text-xs text-center sm:text-right">
            © ۱۴۰۴ A | CAP — تمامی حقوق محفوظ است
          </div>

          {/* Platform logos inline */}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs">در دسترس روی:</span>
            <a href="https://t.me/acapitalsbot" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
              <Image src="/telegram-logo.svg" alt="Telegram" width={22} height={22} className="rounded-md" />
            </a>
            <a href="https://bale.ai/acapitals_bot" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
              <Image src="/bale-logo.png" alt="Bale" width={22} height={22} className="rounded-md" />
            </a>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            سیستم فعال
          </div>
        </div>
      </div>
    </footer>
  )
}
