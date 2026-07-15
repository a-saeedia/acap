'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, FileText, ShoppingCart } from 'lucide-react'

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
            <span className="text-xs text-primary font-semibold">برنامه سفیران ACAP</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4 text-balance">
            با لینک اختصاصی خودت،
            <br />
            <span className="text-brand-shimmer">ACAP را به دیگران معرفی کن</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            پس از انجام تست شخصیت مالی، یک لینک اختصاصی می‌گیری. هرکس با لینک تو بیاد، توی آمارت ثبت می‌شه.
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
              { step: '۳', icon: FileText, title: 'آمار رو پیگیری کن', desc: 'ببین چند نفر بازدید کردند، چند نفر تست دادند، چند نفر خریدند' },
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

        {/* Stats preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="glass border border-border rounded-3xl p-6 sm:p-8 mb-8"
        >
          <h3 className="text-foreground font-black text-lg mb-6 text-center">محاسبه درآمد سفیران</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: Users, label: 'وارد سایت شدند', value: '—', color: '#3B82F6' },
              { icon: FileText, label: 'تست دادند', value: '—', color: '#8B5CF6' },
              { icon: ShoppingCart, label: 'خرید کردند', value: '—', color: '#10B981' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass border border-border rounded-2xl p-5 text-center hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-2xl font-black text-foreground">{stat.value}</div>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-xs mt-4">
            بعد از دریافت لینک اختصاصی، آمار واقعی تو رو اینجا می‌بینی
          </p>
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
            href="/#quiz"
            whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(37,99,235,0.5)' }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 sm:px-10 py-4 rounded-2xl font-black text-base sm:text-lg transition-all duration-300 mb-4"
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
