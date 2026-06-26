'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    q: 'تست شخصیت مالی چیست و چگونه کار می‌کند؟',
    a: 'تست شخصیت مالی A Capital یک پرسشنامه ۵ سوالی است که در کمتر از ۳ دقیقه، میزان ریسک‌پذیری، افق زمانی سرمایه‌گذاری، و اهداف مالی شما را تعیین می‌کند. بر اساس نتایج، پرتفوی کاملاً شخصی‌سازی‌شده مخصوص شما طراحی می‌شود.',
  },
  {
    q: 'اشتراک A | CAP Plus چه مزایایی دارد؟',
    a: 'با اشتراک Plus، دسترسی کامل به سیگنال‌های لحظه‌ای خرید و فروش، تحلیل روزانه بازارها، پرتفوی پیشنهادی شخصی‌سازی‌شده، روان‌شناسی سرمایه‌گذاری، هشدارهای مهم بازار، و آرشیو کامل تحلیل‌ها دارید.',
  },
  {
    q: 'کمیسیون سفیران چگونه محاسبه می‌شود؟',
    a: 'کمیسیون بر اساس تعداد فروش ماهانه شما تعیین می‌شود. از ۳۰٪ برای ۰ تا ۱۰ فروش شروع شده و تا ۴۵٪ برای بیش از ۲۰۰ فروش افزایش می‌یابد. هر چه بیشتر معرفی کنی، درصد کمیسیون بالاتر می‌رود.',
  },
  {
    q: 'آیا امکان بازگشت وجه وجود دارد؟',
    a: 'بله، در صورت عدم رضایت، تا ۷ روز پس از خرید اشتراک می‌توانید درخواست بازگشت وجه کامل دهید. کافیست از طریق تلگرام پشتیبانی با ما ارتباط بگیرید.',
  },
  {
    q: 'چگونه می‌توانم با پشتیبانی A Capital تماس بگیرم؟',
    a: 'پشتیبانی A Capital از طریق تلگرام در دسترس است. برای ارتباط سریع‌تر، کانال و گروه پشتیبانی ما در تلگرام همیشه فعال است. پاسخ‌دهی ۷ روز هفته، حتی آخر هفته‌ها.',
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="relative py-24 lg:py-32 overflow-hidden bg-card">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-1.5 mb-6">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-primary font-semibold">سوالات رایج</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3 text-balance">سوال داری؟</h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
            پاسخ سوالات رایج درباره A Capital را اینجا پیدا کن
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass border border-border rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-right transition-colors hover:bg-accent/20"
              >
                <span className="text-foreground font-bold text-sm sm:text-base flex-1 text-right">{faq.q}</span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-primary" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-0 border-t border-border/50">
                      <p className="text-muted-foreground text-sm leading-relaxed mt-3">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
