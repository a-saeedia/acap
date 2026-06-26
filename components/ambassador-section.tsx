'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Gift, BarChart3 } from 'lucide-react'

const tiers = [
  {
    key: 'partner',
    name: 'Partner',
    emoji: '🥉',
    sales: '۰ تا ۱۰ فروش',
    commission: '۳۰٪',
    perks: ['کمیسیون ۳۰٪'],
    color: '#CD7F32',
    bg: 'rgba(205,127,50,0.08)',
  },
  {
    key: 'silver',
    name: 'Silver Partner',
    emoji: '🥈',
    sales: '۱۰ تا ۵۰ فروش',
    commission: '۳۵٪',
    perks: ['کمیسیون ۳۵٪', 'یک ماه اشتراک رایگان'],
    color: '#C0C0C0',
    bg: 'rgba(192,192,192,0.08)',
  },
  {
    key: 'gold',
    name: 'Gold Partner',
    emoji: '🥇',
    sales: '۵۰ تا ۲۰۰ فروش',
    commission: '۴۰٪',
    perks: ['کمیسیون ۴۰٪', 'یک سال اشتراک رایگان', 'نشان ویژه سفیر طلایی'],
    color: '#1D9BF0',
    bg: 'rgba(29,155,240,0.08)',
  },
  {
    key: 'ambassador',
    name: 'Ambassador',
    emoji: '👑',
    sales: 'بیش از ۲۰۰ فروش',
    commission: '۴۵٪',
    perks: ['کمیسیون ۴۵٪', 'عضویت ویژه سفیران', 'مزایای اختصاصی', 'کمپین‌های ویژه'],
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.08)',
  },
]

const inviteRewards = [
  { count: '۵ دعوت', reward: 'یک هفته اشتراک رایگان', icon: '🎁' },
  { count: '۱۰ دعوت', reward: 'یک ماه اشتراک رایگان', icon: '💎' },
  { count: '۲۰ دعوت', reward: 'دو ماه اشتراک رایگان', icon: '💎' },
  { count: '۵۰ دعوت', reward: 'یک سال اشتراک رایگان ACAP Plus', icon: '👑' },
]

const dashboardItems = [
  'تعداد کلیک لینک',
  'تعداد ثبت‌نام',
  'تعداد تست‌های تکمیل‌شده',
  'تعداد خریدهای موفق',
  'درآمد قابل برداشت',
  'درآمد کل',
]

function CommissionCalculator() {
  const [sales, setSales] = useState(10)

  const getCommission = (s: number) => {
    if (s <= 10) return 0.30
    if (s <= 50) return 0.35
    if (s <= 200) return 0.40
    return 0.45
  }

  const pricePerSale = 2450000
  const commission = getCommission(sales)
  const earnings = Math.round(sales * pricePerSale * commission)

  const formatted = (n: number) =>
    n.toLocaleString('fa-IR') + ' تومان'

  return (
    <div className="glass border border-border rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h3 className="text-foreground font-black text-lg">ماشین‌حساب درآمد سفیران</h3>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted-foreground text-sm">
            تعداد فروش: <strong className="text-primary">{sales}</strong>
          </span>
          <span className="glass border border-primary/30 rounded-lg px-3 py-1 text-primary text-sm font-bold">
            {Math.round(commission * 100)}٪ کمیسیون
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={200}
          value={sales}
          onChange={(e) => setSales(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to left, var(--primary) ${(sales / 200) * 100}%, rgba(37,99,235,0.15) ${(sales / 200) * 100}%)`,
            accentColor: 'var(--primary)',
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>۱</span>
          <span>۵۰</span>
          <span>۱۰۰</span>
          <span>۲۰۰</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass border border-border rounded-2xl p-4 text-center">
          <div className="text-muted-foreground text-xs mb-1">کمیسیون هر فروش</div>
          <div className="text-primary font-black text-lg">{formatted(Math.round(pricePerSale * commission))}</div>
        </div>
        <div className="glass border border-primary/30 rounded-2xl p-4 text-center bg-primary/5">
          <div className="text-muted-foreground text-xs mb-1">درآمد کل شما</div>
          <div className="text-primary font-black text-lg">{formatted(earnings)}</div>
        </div>
      </div>

      <div className="text-center text-muted-foreground text-xs">
        * بر اساس اشتراک ۳ ماهه ACAP Plus به قیمت ۲,۴۵۰,۰۰۰ تومان
      </div>
    </div>
  )
}

export function AmbassadorSection() {
  return (
    <section id="ambassador" className="relative py-24 lg:py-32 overflow-hidden bg-background">
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-1.5 mb-6">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-primary font-semibold">کمپین سفیران ACAP</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4 text-balance">
            تو فقط معرفی نمی‌کنی…{' '}
            <br />
            <span className="text-brand-shimmer">یک سیستم درآمد می‌سازی</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            با لینک اختصاصی خودت معرفی کن. هر کسی که بخرد، ۳۰٪ به ۴۵٪ کمیسیون به حساب تو اضافه می‌شود.
          </p>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass border border-border rounded-3xl p-6 sm:p-8 mb-12"
        >
          <h3 className="text-foreground font-black text-xl mb-6 text-center">چگونه کار می‌کند؟</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '۱', icon: TrendingUp, title: 'تست شخصیت مالی', desc: 'اول شخصیت مالی خودت را در کمتر از ۳ دقیقه کشف کن' },
              { step: '۲', icon: Users, title: 'لینک اختصاصی بگیر', desc: 'بعد از تست، لینک منحصربه‌فرد خودت را دریافت می‌کنی' },
              { step: '۳', icon: Gift, title: 'کمیسیون بگیر', desc: 'هر خرید از طریق لینک تو = درآمد مستقیم به حساب تو' },
            ].map((step) => {
              const Icon = step.icon
              return (
                <div key={step.step} className="text-center">
                  <div className="relative inline-flex mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-black">
                      {step.step}
                    </div>
                  </div>
                  <h4 className="text-foreground font-black mb-2">{step.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Calculator + examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <CommissionCalculator />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass border border-border rounded-3xl p-6 sm:p-8"
          >
            <h3 className="text-foreground font-black text-lg mb-6">مثال درآمد واقعی</h3>
            <div className="space-y-3 mb-6">
              {[
                { sales: '۱۰ فروش', income: '۷.۳۵ میلیون', color: '#10B981' },
                { sales: '۲۰ فروش', income: '۱۴.۷ میلیون', color: '#3B82F6' },
                { sales: '۵۰ فروش', income: '۳۶.۷۵ میلیون', color: '#1D9BF0' },
                { sales: '۱۰۰ فروش', income: '+۷۳ میلیون', color: '#EF4444' },
              ].map((item) => (
                <div
                  key={item.sales}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-accent/30 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground text-sm font-semibold">{item.sales}</span>
                  </div>
                  <div className="font-black text-sm" style={{ color: item.color }}>
                    {item.income} تومان
                  </div>
                </div>
              ))}
            </div>
            <div className="glass border border-primary/20 rounded-2xl p-4 text-center">
              <div className="text-muted-foreground text-xs mb-1">کمیسیون پایه</div>
              <div className="text-primary font-black text-2xl">۳۰٪</div>
              <div className="text-muted-foreground text-xs">از هر فروش موفق</div>
            </div>
          </motion.div>
        </div>

        {/* Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <h3 className="text-foreground font-black text-2xl text-center mb-8">
            باشگاه سفیران <span className="text-brand-shimmer">ACAP</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.04, y: -4 }}
                className="glass border rounded-3xl p-6 text-center hover-glow transition-all duration-300"
                style={{ borderColor: `${tier.color}30`, background: tier.bg }}
              >
                <div className="text-4xl mb-3">{tier.emoji}</div>
                <div className="font-black text-foreground text-base mb-1">{tier.name}</div>
                <div className="text-muted-foreground text-xs mb-3">{tier.sales}</div>
                <div className="text-3xl font-black mb-4" style={{ color: tier.color }}>
                  {tier.commission}
                </div>
                <div className="space-y-2">
                  {tier.perks.map((perk) => (
                    <div key={perk} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tier.color }} />
                      {perk}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Invite rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="glass border border-border rounded-3xl p-6 sm:p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Gift className="w-6 h-6 text-primary" />
            <h3 className="text-foreground font-black text-lg">جوایز دعوت فعال</h3>
            <span className="text-muted-foreground text-sm">— علاوه بر کمیسیون فروش</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {inviteRewards.map((reward, i) => (
              <motion.div
                key={reward.count}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass border border-border rounded-2xl p-4 text-center hover:border-primary/40 transition-all duration-300"
              >
                <div className="text-3xl mb-2">{reward.icon}</div>
                <div className="text-primary font-black text-sm mb-1">{reward.count}</div>
                <div className="text-foreground text-xs">{reward.reward}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="glass border border-border rounded-3xl p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h3 className="text-foreground font-black text-lg">داشبورد اختصاصی سفیران</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {dashboardItems.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.a
            href="https://t.me/acapitalsbot?start=ref_3bCj2pqq"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(37,99,235,0.5)' }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-black text-lg transition-all duration-300 mb-4"
          >
            همین حالا سفیر شو — رایگان
          </motion.a>
          <p className="text-muted-foreground text-sm">
            ابتدا تست شخصیت مالی را انجام بده و لینک اختصاصی‌ات را دریافت کن
          </p>
        </motion.div>
      </div>
    </section>
  )
}
