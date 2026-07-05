'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Code2, Brain, Cpu } from 'lucide-react'
import Image from 'next/image'

const founders = [
  {
    name: 'Ali Borhan',
    nameFA: 'علی برهان',
    role: 'Founder & CEO',
    roleFA: 'بنیان‌گذار و مدیرعامل',
    icon: TrendingUp,
    specialties: ['تحلیل بازارهای مالی', 'سبک ICT', 'مدیریت سرمایه', 'کارآفرینی'],
    bio: 'علی برهان تحلیلگر بازارهای مالی، مدرس سبک ICT و متخصص مدیریت سرمایه با بیش از ۵ سال سابقه است. تمرکز او بر تحلیل جریان نقدینگی، مدیریت ریسک، رفتار بازار و طراحی استراتژی‌های سرمایه‌گذاری است.',
    fullBio: 'او در حوزه کارآفرینی، ساخت و توسعه کسب‌وکار فعال است و نگاه او فراتر از تحلیل بازار، به طراحی سیستم‌های اقتصادی و تجاری مقیاس‌پذیر گسترش دارد. او ایده A | CAP را با هدف ایجاد یک سیستم هوشمند مدیریت سرمایه شخصی‌سازی‌شده بنیان‌گذاری کرد.',
    responsibility: 'طراحی استراتژی‌های سرمایه‌گذاری، توسعه مدل‌های مدیریت دارایی و هدایت چشم‌انداز مالی و تجاری مجموعه',
    color: '#2979FF',
    image: '/founder-ali-real.jpg',
  },
  {
    name: 'Arman Saeidi',
    nameFA: 'آرمان سعیدی',
    role: 'Co-Founder & CTO',
    roleFA: 'هم‌بنیان‌گذار و مدیر فناوری',
    icon: Cpu,
    specialties: ['Full-Stack Development', 'هوش مصنوعی', 'بازارهای مالی', 'محصولات دیجیتال'],
    bio: 'آرمان سعیدی هم‌بنیان‌گذار و مدیر فناوری A|CAP، مدرس بازارهای مالی و متخصص هوش مصنوعی در معاملات است. بیش از ۵ سال سابقه در تحلیل تکنیکال، ارزهای دیجیتال و توسعه سیستم‌های معاملاتی هوشمند.',
    fullBio: 'تمرکز او بر طراحی و توسعه زیرساخت‌های مقیاس‌پذیر، سیستم‌های هوشمند معاملاتی، اتوماسیون و تبدیل ایده‌های پیچیده به محصولات قابل رشد است. آرمان با ترکیب دانش فنی، تحلیل بازار و هوش مصنوعی، نقش کلیدی در شکل‌گیری اکوسیستم A | CAP ایفا می‌کند.',
    responsibility: 'معماری فنی پلتفرم، توسعه ابزارهای هوشمند معاملاتی، سیستم‌های تحلیل داده، طراحی دوره‌های آموزشی و هدایت مسیر تکنولوژی',
    color: '#60AFFF',
    image: '/founder-arman-real.jpg',
  },
]

export function FoundersSection() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <section id="founders" className="relative py-24 overflow-hidden bg-card" dir="rtl">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 glass border border-primary/25 rounded-full px-4 py-1.5 mb-5">
            <span className="text-xs text-primary font-semibold">بنیان‌گذاران</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4 text-balance">
            تیم پشت{' '}
            <span className="text-brand-shimmer">A | CAP</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            ترکیب دانش مالی، فناوری و داده — جایی که سرمایه‌گذاری و تکنولوژی در مسیر خلق ثروت هوشمند قرار می‌گیرند.
          </p>
        </motion.div>

        {/* Founders grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
          {founders.map((f, i) => {
            const Icon = f.icon
            const isExp = expanded === f.name
            return (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15 }}
                className="glass border border-border rounded-3xl overflow-hidden hover-glow transition-all duration-300"
              >
                {/* Photo */}
                <div className="relative w-full h-80 overflow-hidden">
                  <Image
                    src={f.image}
                    alt={f.nameFA}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 35%, rgba(4,13,33,0.97) 100%)' }} />
                  <div className="absolute bottom-0 right-0 left-0 p-5">
                    <div className="text-white font-black text-2xl leading-tight">{f.nameFA}</div>
                    <div className="font-semibold text-sm mt-0.5" style={{ color: f.color }}>{f.roleFA}</div>
                    <div className="text-white/50 text-xs font-mono mt-0.5">{f.role}</div>
                  </div>
                  <div className="absolute top-4 left-4 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: f.color }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap gap-2 mb-5">
                    {f.specialties.map(s => (
                      <span key={s} className="text-xs px-3 py-1 rounded-full border font-medium"
                        style={{ borderColor: `${f.color}35`, color: f.color, background: `${f.color}10` }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed mb-2 text-sm">{f.bio}</p>
                  {isExp && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="text-muted-foreground leading-relaxed mb-3 text-sm"
                    >
                      {f.fullBio}
                    </motion.p>
                  )}
                  <button onClick={() => setExpanded(isExp ? null : f.name)}
                    className="text-sm font-semibold mb-5 transition-colors" style={{ color: f.color }}
                  >
                    {isExp ? 'کمتر بخوانید' : 'بیشتر بخوانید'}
                  </button>
                  <div className="rounded-xl p-4 border" style={{ background: `${f.color}08`, borderColor: `${f.color}25` }}>
                    <div className="text-muted-foreground text-xs mb-1 font-semibold uppercase tracking-wider">مسئولیت در A | CAP</div>
                    <p className="text-foreground text-sm leading-relaxed">{f.responsibility}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Vision box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass border border-border rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-5 flex-wrap">
              {/* Finance */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold tracking-wide">مالی</span>
              </div>
              <span className="text-foreground/40 text-2xl font-light pb-5">×</span>
              {/* Tech */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold tracking-wide">فناوری</span>
              </div>
              <span className="text-foreground/40 text-2xl font-light pb-5">=</span>
              {/* Result */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-xl border flex items-center justify-center"
                  style={{ background: 'rgba(47,125,255,0.15)', borderColor: 'rgba(47,125,255,0.35)' }}>
                  <Brain className="w-5 h-5" style={{ color: '#2F7DFF' }} />
                </div>
                <span className="text-[10px] font-semibold tracking-wide" style={{ color: '#2F7DFF' }}>ثروت هوشمند</span>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3">
              مالی × فناوری = <span className="text-brand-shimmer">ثروت هوشمند</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              ترکیب دانش مالی عمیق علی و تخصص فنی آرمان، اکوسیستمی ساخته که سرمایه‌گذاری را برای همه شخصی، دقیق و قابل دسترس می‌کند.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
