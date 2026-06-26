'use client'

import { motion } from 'framer-motion'
import { Shield, Target, Brain, BarChart2, Users, Zap, TrendingUp, Gem, DollarSign, Bitcoin, Globe, Building2 } from 'lucide-react'

const markets = [
  { name: 'بورس', Icon: TrendingUp, desc: 'تحلیل سهام و اوراق بهادار' },
  { name: 'طلا', Icon: Gem, desc: 'فرصت‌های بازار طلا' },
  { name: 'ارز و دلار', Icon: DollarSign, desc: 'تحلیل نرخ ارز' },
  { name: 'ارز دیجیتال', Icon: Bitcoin, desc: 'سیگنال‌های کریپتو' },
  { name: 'فارکس', Icon: Globe, desc: 'بازار جهانی فارکس' },
  { name: 'صندوق‌های سرمایه', Icon: Building2, desc: 'صندوق‌های درآمد ثابت و کالا' },
]

const values = [
  { icon: Brain, title: 'هوشمند', desc: 'ساخت سبد سرمایه‌گذاری بر اساس شخصیت مالی شما به کمک هوش مصنوعی' },
  { icon: Shield, title: 'امن', desc: 'مدیریت ریسک حرفه‌ای. هیچ فرصتی بیش از ۲۰٪ سرمایه را درگیر نمی‌کند' },
  { icon: Target, title: 'دقیق', desc: 'تحلیل جریان نقدینگی و رفتار بازار با متدولوژی ICT' },
  { icon: BarChart2, title: 'شفاف', desc: 'سیگنال‌های واضح با سطح ریسک مشخص: کم‌ریسک، متعادل، پرریسک' },
  { icon: Zap, title: 'لحظه‌ای', desc: 'آپدیت‌ها و هشدارهای لحظه‌ای در همه بازارها' },
  { icon: Users, title: 'اجتماعی', desc: 'اکوسیستم سفیران با درآمد پایدار از معرفی' },
]

export function AboutSection() {
  return (
    <section id="about" className="relative py-24 lg:py-32 overflow-hidden bg-background">
      <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />
      {/* Giant decorative A */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[32rem] font-black pointer-events-none select-none"
        style={{ color: 'var(--primary)', opacity: 0.015, lineHeight: 1 }}
        aria-hidden
      >
        A
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs text-primary font-semibold">ما که هستیم؟</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4 text-balance">
            یک اکوسیستم کامل{' '}
            <span className="text-brand-shimmer">مدیریت ثروت</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            در A | CAP باور داریم که هیچ نسخه یکسانی برای همه سرمایه‌گذاران وجود ندارد. ما برای شما نقشه مدیریت ثروت شخصی می‌سازیم.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="glass border border-border rounded-3xl p-6 sm:p-8 lg:p-12 mb-16 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg sm:text-xl text-foreground font-bold leading-relaxed mb-4">
                «A | CAP جایی است برای کسانی که می‌خواهند سرمایه‌گذاری را نه بر پایه هیجان، بلکه بر پایه تحلیل، مدیریت ریسک و برنامه‌ریزی بلندمدت دنبال کنند.»
              </p>
              <p className="text-muted-foreground leading-relaxed">
                ماموریت ما ایجاد شفافیت در تصمیمات مالی، ارتقای سواد سرمایه‌گذاری و کمک به ساخت سبدهای سرمایه‌گذاری متعادل و هوشمند است.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'بازارهای تحلیل‌شده', value: '۶', sub: 'بازار فعال' },
                { label: 'نوع شخصیت مالی', value: '۴', sub: 'تیپ سرمایه‌گذار' },
                { label: 'کمیسیون سفیران', value: '۴۵٪', sub: 'حداکثر' },
                { label: 'اشتراک پریمیوم', value: 'Plus', sub: 'ACAP' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="glass border border-border rounded-2xl p-4 text-center"
                >
                  <div className="text-primary font-black text-2xl sm:text-3xl">{stat.value}</div>
                  <div className="text-foreground text-xs font-semibold mt-1">{stat.sub}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Markets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <h3 className="text-xl font-black text-foreground mb-6 text-center">بازارهایی که پوشش می‌دهیم</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {markets.map((market, i) => (
              <motion.div
                key={market.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.05 }}
                className="glass border border-border hover:border-primary/60 rounded-2xl p-4 text-center cursor-default transition-all duration-300 hover-glow"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <market.Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-foreground font-bold text-sm mb-1">{market.name}</div>
                <div className="text-muted-foreground text-xs">{market.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02 }}
              className="glass border border-border rounded-2xl p-6 hover-glow transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <v.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-foreground font-black text-lg mb-2">{v.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
