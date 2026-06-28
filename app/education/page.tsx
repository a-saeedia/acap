'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '@/components/theme-provider'
import { GraduationCap, Code, Palette, ShoppingCart, TrendingUp, Globe, ArrowLeft, Sparkles, Zap, Target, Users, Rocket, Star } from 'lucide-react'

const paths = [
  { icon: Code, title: 'توسعه‌دهندگان', desc: 'Web3, AI, React, Python — از صفر تا حرفه‌ای', color: '#2979FF' },
  { icon: Palette, title: 'طراحان', desc: 'UI/UX, Motion, Product Design — با استانداردهای جهانی', color: '#AA00FF' },
  { icon: ShoppingCart, title: 'فروشندگان', desc: 'Digital Marketing, E-commerce, Sales Funnel', color: '#FF6D00' },
  { icon: TrendingUp, title: 'سرمایه‌گذاران', desc: 'تحلیل بازار، مدیریت ریسک، هوش مالی', color: '#00C853' },
  { icon: Globe, title: 'مسیر Google', desc: 'Google Ads, SEO, Analytics, Cloud — گواهی رسمی', color: '#FFD600' },
  { icon: Users, title: 'رهبران تیم', desc: 'Product Management, Leadership, Strategy', color: '#FF1744' },
]

export default function EducationPage() {
  const router = useRouter()
  const { theme } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-16 pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30"
          >
            <GraduationCap className="w-10 h-10 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-amber-400 text-xs font-bold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            به زودی...
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4"
          >
            آکادمی
            <span className="bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent"> A|CAP </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4"
          >
            اولین دانشگاه آنلاین هوش مصنوعی و سرمایه‌گذاری در ایران
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-muted-foreground/60 text-sm max-w-xl mx-auto mb-10"
          >
            مسیرهای یادگیری اختصاصی از مبتدی تا حرفه‌ای، با منتورشیپ مستقیم و گواهی معتبر بین‌المللی
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-3 mb-12"
          >
            <Rocket className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-bold text-sm">در حال راه‌اندازی — به جمع اولین دانشجویان بپیوندید</span>
          </motion.div>
        </div>
      </section>

      {/* Paths */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-black text-center mb-12"
        >
          مسیرهای یادگیری
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paths.map((path, i) => (
            <motion.div
              key={path.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass border border-border rounded-2xl p-6 hover:border-primary/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: `${path.color}15`, color: path.color }}>
                <path.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{path.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{path.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass border border-amber-500/20 rounded-3xl p-8 text-center"
        >
          <Star className="w-8 h-8 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-black mb-3">"+ مسیر ویژه Google"</h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed mb-6">
            دوره‌های رسمی گوگل شامل Google Ads, SEO, Analytics, Cloud Computing — با امکان دریافت گواهی رسمی و ورود به بازار کار بین‌المللی
          </p>
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-amber-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            به زودی اطلاعات کامل اعلام می‌شود
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <div className="text-center pb-12">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          بازگشت به صفحه اصلی
        </button>
      </div>
    </div>
  )
}
