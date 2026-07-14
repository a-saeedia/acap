'use client'

import { motion } from 'framer-motion'
import { BookOpen, TrendingUp, Brain, Globe } from 'lucide-react'

const posts = [
  { icon: TrendingUp, title: 'بهترین استراتژی‌های معاملاتی ۱۴۰۴', desc: 'بررسی جامع استراتژی‌های برتر معاملاتی برای بازارهای ایران', color: '#10B981' },
  { icon: Brain, title: 'هوش مصنوعی در سرمایه‌گذاری', desc: 'چگونه AI می‌تواند به تصمیمات مالی شما کمک کند', color: '#8B5CF6' },
  { icon: Globe, title: 'تحلیل بازارهای جهانی', desc: 'بررسی آخرین روندهای بازارهای مالی بین‌المللی', color: '#3B82F6' },
]

export function BlogSection() {
  return (
    <section id="blog" className="relative py-20 lg:py-28 overflow-hidden bg-background">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-1.5 mb-4">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-primary font-semibold">وبلاگ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mb-3">
            آخرین مطالب <span className="text-brand-shimmer">تحلیلی</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">مقالات آموزشی، تحلیل‌های روز و اخبار بازارهای مالی</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {posts.map((post, i) => {
            const Icon = post.icon
            return (
              <motion.a key={post.title} href="/blog"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass border border-border hover:border-primary/30 rounded-2xl p-5 transition-all duration-300 block group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${post.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: post.color }} />
                </div>
                <h3 className="text-foreground font-bold text-sm mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{post.desc}</p>
              </motion.a>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-8">
          <a href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all">
            <BookOpen className="w-4 h-4" /> همه مطالب
          </a>
        </motion.div>
      </div>
    </section>
  )
}
