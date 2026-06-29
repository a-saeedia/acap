'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '@/components/theme-provider'
import { GraduationCap, Code, Palette, ShoppingCart, TrendingUp, Globe, ArrowLeft, Sparkles, Zap, Target, Users, Rocket, BookOpen, Award, Clock, CheckCircle, ChevronLeft } from 'lucide-react'

const paths = [
  { icon: Code, title: 'توسعه‌دهندگان', desc: 'Web3, AI, React, Python — از صفر تا حرفه‌ای با پروژه‌های واقعی', color: '#2979FF', level: 'مبتدی تا پیشرفته' },
  { icon: Palette, title: 'طراحان', desc: 'UI/UX, Motion, Product Design — با استانداردهای جهانی و منتورشیپ', color: '#AA00FF', level: '0 تا 100 طراحی' },
  { icon: ShoppingCart, title: 'فروشندگان', desc: 'Digital Marketing, E-commerce, Sales Funnel — افزایش فروش تضمینی', color: '#FF6D00', level: 'پیشرفته' },
  { icon: TrendingUp, title: 'سرمایه‌گذاران', desc: 'تحلیل بازار، مدیریت ریسک، هوش مصنوعی مالی — ترید هوشمند', color: '#00C853', level: 'حرفه‌ای' },
  { icon: Users, title: 'مدیریت محصول', desc: 'Product Management, Leadership, Strategy — رهبری تیم‌های محصول', color: '#FF1744', level: 'پیشرفته' },
  { icon: Zap, title: 'هوش مصنوعی', desc: 'AI, Machine Learning, Data Science — ورود به دنیای آینده', color: '#8B5CF6', level: 'مبتدی تا پیشرفته' },
]

const stats = [
  { value: '۱۲+', label: 'مسیر تخصصی', icon: BookOpen },
  { value: '۱۰۰+', label: 'ساعت محتوا', icon: Clock },
  { value: 'گواهی', label: 'معتبر بین‌المللی', icon: Award },
  { value: 'پروژه', label: 'واقعی در هر مسیر', icon: Target },
]

const mentors = [
  { name: 'علی برهان', role: 'بنیانگذار A|CAP', desc: 'کارآفرین، تحلیلگر بازارهای مالی و متخصص سبک ICT', color: '#2979FF' },
  { name: 'آرمان سعیدی', role: 'هم‌بنیانگذار و مدیر فناوری', desc: 'متخصص هوش مصنوعی، Full-Stack و محصولات دیجیتال', color: '#60AFFF' },
  { name: 'علی رضایی', role: 'Senior Product Manager', desc: 'مدیر محصول در فین‌تک‌های برتر ایران', color: '#FF1744' },
  { name: 'مریم حسینی', role: 'AI & Data Science Lead', desc: 'پژوهشگر هوش مصنوعی و تحلیل داده', color: '#AA00FF' },
]

export default function EducationPage() {
  const router = useRouter()
  const { theme } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Nav */}
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2">
            <Image src={theme === 'light' ? '/logo-light.png' : '/logo-transparent.png'} alt="A Capital" width={140} height={42} className="h-8 w-auto object-contain" />
          </button>
          <button onClick={() => router.push('/')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            بازگشت به صفحه اصلی
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 via-amber-500/5 to-primary/5 rounded-full blur-[200px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-amber-500/80 flex items-center justify-center shadow-2xl shadow-primary/30"
          >
            <GraduationCap className="w-12 h-12 text-white" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-amber-400 text-xs font-bold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            رونمایی در آینده نزدیک — ثبت‌نام زودهنگام آغاز شد
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4"
          >
            آکادمی
            <span className="bg-gradient-to-l from-primary via-primary/80 to-amber-400 bg-clip-text text-transparent"> A|CAP </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6"
          >
            اولین دانشگاه آنلاین ایران با رویکرد هوش مصنوعی — جایی که تکنولوژی، سرمایه و آموزش در یک نقطه به هم می‌رسند
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="text-muted-foreground/60 text-sm max-w-xl mx-auto mb-8"
          >
            از برنامه‌نویسی و طراحی تا بازاریابی دیجیتال و سرمایه‌گذاری هوشمند — در کنار بهترین منتورهای ایران و جهان، از صفر تا اشتغال
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center justify-center gap-4">
            <a href="https://t.me/acapitalsbot" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-l from-primary to-primary/80 text-white px-8 py-4 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all"
            >
              <Rocket className="w-5 h-5" />
              ثبت‌نام در صف انتظار
            </a>
            <button onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 glass border border-border px-8 py-4 rounded-2xl text-base font-bold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              اطلاعات بیشتر
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="glass border border-border rounded-2xl p-5 text-center"
            >
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-black text-foreground mb-0.5">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why A|CAP Education */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-black text-center mb-12"
        >
          چرا آکادمی A|CAP؟
        </motion.h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: Zap, title: 'یادگیری با هوش مصنوعی', desc: 'سیستم هوشمند A|CAP مسیر یادگیری شما را بر اساس اهداف و سطح شما شخصی‌سازی می‌کند' },
            { icon: Users, title: 'منتورشیپ اختصاصی', desc: 'هر دانشجو یک منتور اختصاصی دارد — نه صرفاً یک مدرس، بلکه یک راهنما در مسیر شغلی' },
            { icon: Award, title: 'گواهی معتبر جهانی', desc: 'گواهی‌های قابل استعلام با استانداردهای بین‌المللی' },
            { icon: Target, title: 'پروژه‌های واقعی', desc: 'به جای تئوری محض، روی پروژه‌های واقعی صنعت کار می‌کنید و پورتفولیو می‌سازید' },
            { icon: TrendingUp, title: 'ارتباط با سرمایه', desc: 'دانشجویان برتر به اکوسیستم سرمایه‌گذاری A|CAP و صندوق‌های خطرپذیر متصل می‌شوند' },
            { icon: Globe, title: 'دسترسی بین‌المللی', desc: 'دوره‌ها به دو زبان فارسی و انگلیسی — آمادگی برای بازار کار جهانی' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="glass border border-border rounded-2xl p-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Paths */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-black text-center mb-3"
        >
          مسیرهای تخصصی
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
          className="text-muted-foreground text-center text-sm mb-10 max-w-xl mx-auto"
        >
          هر مسیر شامل دوره‌های ویدیویی، پروژه‌های عملی، کوئیزهای تعاملی و جلسات منتورشیپ است
        </motion.p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paths.map((path, i) => (
            <motion.div key={path.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="group glass border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ backgroundColor: `${path.color}15`, color: path.color }}>
                <path.icon className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center gap-1 bg-muted/30 rounded-full px-2.5 py-0.5 text-[10px] text-muted-foreground mb-3">{path.level}</div>
              <h3 className="font-bold text-lg mb-2">{path.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{path.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>



      {/* Mentors */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-black text-center mb-12"
        >
          منتورهای ما
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mentors.map((mentor, i) => (
            <motion.div key={mentor.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="glass border border-border rounded-2xl p-5 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl font-black" style={{ backgroundColor: `${mentor.color}15`, color: mentor.color }}>
                {mentor.name.charAt(0)}
              </div>
              <h3 className="font-bold text-base">{mentor.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">{mentor.role}</p>
              <p className="text-xs text-muted-foreground/60">{mentor.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass border border-primary/20 rounded-3xl p-10"
        >
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl sm:text-3xl font-black mb-3">آماده شروع تحول هستی؟</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed mb-8">
            اولین نفر باش. آکادمی A|CAP به زودی با ظرفیت محدود شروع به کار می‌کند. ثبت‌نام در صف انتظار را از دست نده.
          </p>
          <a href="https://t.me/acapitalsbot" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-l from-primary to-primary/80 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all"
          >
            <Rocket className="w-5 h-5" />
            ثبت‌نام در صف انتظار
          </a>
          <button onClick={() => router.push('/')}
            className="block mx-auto mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            بازگشت به صفحه اصلی
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <div className="text-center pb-8">
        <p className="text-xs text-muted-foreground/40">A|CAP Education — بخشی از اکوسیستم سرمایه‌گذاری هوشمند A|CAP</p>
      </div>
    </div>
  )
}
