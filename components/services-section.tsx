'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Zap, Brain, BarChart2, Bell, Shield, Star, Crown } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'سیگنال‌های سرمایه‌گذاری',
    desc: 'تمامی سیگنال‌های ورود و خروج در ۶ بازار مالی با سطح ریسک مشخص',
    badge: 'لحظه‌ای',
  },
  {
    icon: Brain,
    title: 'تحلیل تخصصی بازارها',
    desc: 'تحلیل بنیادی و تکنیکال با متدولوژی ICT و جریان نقدینگی',
    badge: 'اختصاصی',
  },
  {
    icon: BarChart2,
    title: 'سبدهای پیشنهادی',
    desc: 'سبد سرمایه‌گذاری متناسب با شخصیت مالی و شرایط بازار',
    badge: 'شخصی‌سازی',
  },
  {
    icon: Brain,
    title: 'روانشناسی مالی',
    desc: 'آموزش کنترل احساسات، مدیریت ریسک و تصمیم‌گیری منطقی',
    badge: 'آموزشی',
  },
  {
    icon: Bell,
    title: 'هشدارهای لحظه‌ای',
    desc: 'آپدیت‌ها، اخبار مهم و فرصت‌های فوری در اسرع وقت',
    badge: 'فوری',
  },
  {
    icon: Shield,
    title: 'مدیریت ریسک',
    desc: 'قوانین مدیریت سرمایه — هیچ فرصتی بیش از ۲۰٪ سرمایه را درگیر نمی‌کند',
    badge: 'حیاتی',
  },
]

const plans = [
  {
    name: '۱ ماهه',
    price: '۹۵۰,۰۰۰',
    originalPrice: null,
    discount: null,
    period: 'تومان / ماه',
    popular: false,
    note: null,
  },
  {
    name: '۳ ماهه',
    price: '۲,۴۵۰,۰۰۰',
    originalPrice: '۲,۸۵۰,۰۰۰',
    discount: '۱۵٪',
    period: 'تومان',
    popular: false,
    note: null,
  },
  {
    name: '۶ ماهه',
    price: '۴,۹۵۰,۰۰۰',
    originalPrice: '۶,۶۰۰,۰۰۰',
    discount: '۲۵٪',
    period: 'تومان',
    popular: true,
    note: 'محبوب‌ترین',
  },
  {
    name: '۱۲ ماهه',
    price: '۹,۲۴۰,۰۰۰',
    originalPrice: '۱۳,۲۰۰,۰۰۰',
    discount: '۳۰٪',
    period: 'تومان',
    popular: false,
    note: '۳ ماه رایگان',
  },
]

const plusFeatures = [
  'تمامی سیگنال‌های سرمایه‌گذاری',
  'تحلیل‌های تخصصی تمامی بازارها',
  'سبدهای پیشنهادی متناسب با شرایط بازار',
  'بخش روانشناسی مالی و شخصیت سرمایه‌گذاری',
  'آپدیت‌ها و هشدارهای لحظه‌ای',
  'دسترسی بدون محدودیت به تمامی محتواها',
]

export function ServicesSection() {
  const [selectedPlan, setSelectedPlan] = useState(2)

  return (
    <>
      {/* Services */}
      <section id="services" className="relative py-24 lg:py-32 overflow-hidden bg-background">
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs text-primary font-semibold">ACAP Plus</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4 text-balance">
              دسترسی کامل به{' '}
              <span className="text-brand-shimmer">اکوسیستم هوشمند</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              با اشتراک ACAP Plus به تمامی امکانات و تحلیل‌های اختصاصی دسترسی خواهید داشت
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat, i) => {
              const Icon = feat.icon
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="glass border border-border rounded-2xl p-6 hover-glow transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute top-3 left-3">
                    <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 font-semibold">
                      {feat.badge}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 mt-2 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-foreground font-black text-base mb-2">{feat.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24 lg:py-32 overflow-hidden bg-card">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-1.5 mb-6">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-xs text-primary font-semibold">پلن‌های اشتراک</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4 text-balance">
              سرمایه‌گذاری روی{' '}
              <span className="text-brand-shimmer">آینده‌ات</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              هر چه مدت اشتراک بیشتر، تخفیف بیشتر. اشتراک سالانه معادل ۳ ماه رایگان است.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedPlan(i)}
                className={`relative glass rounded-3xl p-6 cursor-pointer transition-all duration-300 border ${
                  selectedPlan === i
                    ? 'border-primary shadow-xl shadow-primary/20 scale-105'
                    : 'border-border hover:border-primary/40 hover-glow'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-black px-4 py-1 rounded-full whitespace-nowrap">
                      {plan.note}
                    </span>
                  </div>
                )}
                {plan.note && !plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white text-xs font-black px-4 py-1 rounded-full whitespace-nowrap">
                      {plan.note}
                    </span>
                  </div>
                )}

                <div className="text-center">
                  {plan.discount && (
                    <div className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-xs font-bold mb-3">
                      {plan.discount} تخفیف
                    </div>
                  )}
                  <div className="text-foreground font-black text-lg mb-2">{plan.name}</div>
                  {plan.originalPrice && (
                    <div className="text-muted-foreground text-sm line-through mb-1">
                      {plan.originalPrice} تومان
                    </div>
                  )}
                  <div className="text-primary font-black text-2xl mb-1">{plan.price}</div>
                  <div className="text-muted-foreground text-xs">{plan.period}</div>
                </div>

                {selectedPlan === i && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 left-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                  >
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass border border-border rounded-3xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-6 h-6 text-primary" />
              <h3 className="text-foreground font-black text-lg">شامل تمام امکانات ACAP Plus</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plusFeatures.map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground text-sm">{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.a
              href="https://t.me/a_cap_support"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(240,180,41,0.5)' }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-black text-lg transition-all duration-300 mb-4"
            >
              خرید اشتراک {plans[selectedPlan].name}
            </motion.a>
            <div className="text-muted-foreground text-sm">
              برای مشاوره خرید:{' '}
              <a
                href="https://t.me/a_cap_support"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @a_cap_support
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
