'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search, GraduationCap, BookOpen, Clock, Star, Users, ChevronLeft,
  TrendingUp, BarChart3, Award, Target, Compass, ArrowLeft, Play,
  Shield, DollarSign, Brain, LineChart, Sparkles, BookMarked
} from 'lucide-react'
import { getFeaturedCourses, getLearningPaths } from '@/app/actions/academy'
import { useSession } from '@/lib/auth-client'

const crimson = '#A51C30'
const gold = '#D4A843'
const goldLight = '#F0D68A'

const categories = [
  { id: 'ict', label: 'ICT', color: '#3B82F6' },
  { id: 'ai', label: 'هوش مصنوعی', color: '#8B5CF6' },
  { id: 'stock', label: 'بورس', color: '#10B981' },
  { id: 'forex', label: 'فارکس', color: '#F59E0B' },
  { id: 'crypto', label: 'ارز دیجیتال', color: '#EF4444' },
  { id: 'blockchain', label: 'بلاکچین', color: '#6366F1' },
  { id: 'trading', label: 'معامله‌گری', color: '#EC4899' },
  { id: 'psychology', label: 'روانشناسی', color: '#14B8A6' },
]

const instructors = [
  {
    id: 'ali-borhan',
    name: 'علی برهان',
    title: 'بنیان‌گذار A|CAP | مدرس بازارهای مالی',
    bio: 'تحلیلگر بازارهای مالی، مدرس سبک ICT و متخصص مدیریت سرمایه با بیش از ۵ سال سابقه در بازارهای مالی بین‌المللی. بنیان‌گذار آکادمی سرمایه‌گذاری هوشمند A|CAP و مدرس تخصصی ICT و پرایس اکشن.',
    image: 'AB',
    gradient: 'from-blue-600 to-indigo-900',
    stats: { courses: 8, students: 100, rating: 4.9 },
  },
  {
    id: 'arman-saeedi',
    name: 'آرمان سعیدی',
    title: 'هم‌بنیان‌گذار A|CAP | مدرس ارز دیجیتال و هوش مصنوعی',
    bio: 'هم‌بنیان‌گذار و مدیر فناوری A|CAP، مدرس ارزهای دیجیتال، تحلیل تکنیکال پیشرفته و هوش مصنوعی در معاملات. بیش از ۵ سال سابقه در توسعه محصولات مالی و آموزش تریدینگ.',
    image: 'AS',
    gradient: 'from-purple-600 to-pink-900',
    stats: { courses: 6, students: 100, rating: 4.8 },
  },
]

const statItems = [
  { icon: Users, value: 200, label: 'تعداد دانشجویان', suffix: '+' },
  { icon: BookOpen, value: 14, label: 'دوره‌های تخصصی', suffix: '' },
  { icon: Clock, value: 280, label: 'ساعت آموزش', suffix: '+' },
  { icon: Star, value: 87, label: 'نرخ رضایت', suffix: '%' },
]

const levelConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'مبتدی', color: 'bg-primary/20 text-primary' },
  intermediate: { label: 'متوسط', color: 'bg-primary/20 text-primary' },
  advanced: { label: 'پیشرفته', color: 'bg-primary/20 text-primary' },
}

const iconMap: Record<string, React.ElementType> = {
  Compass, TrendingUp, BarChart3, Brain, LineChart, Shield, DollarSign, Target, Award, Sparkles, BookMarked,
}

function getIcon(name: string) {
  const Icon = iconMap[name] || Compass
  return Icon
}

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const duration = 2000
    const step = Math.ceil(value / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <>{count.toLocaleString('fa-IR')}{suffix}</>
}

interface Course {
  id: string; title: string; slug: string; description: string; category: string;
  instructor: string; instructorName: string; price: number; originalPrice?: number | null;
  duration?: string | null; level: string; lessons: number; rating?: number | null;
  studentsCount?: number | null; color: string; icon: string; isPopular: boolean;
  isNew: boolean; isBestseller: boolean;
}

interface Path {
  id: string; title: string; slug: string; description: string; icon: string;
  color: string; difficulty: string; incomePotential?: string | null;
  timeToFirstIncome?: string | null; requiredCapital?: string | null;
  courses?: Course[];
}

export default function AcademyPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [featured, setFeatured] = useState<Course[]>([])
  const [paths, setPaths] = useState<Path[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [feat, p] = await Promise.all([
          getFeaturedCourses().catch(() => []),
          getLearningPaths().catch(() => []),
        ])
        setFeatured(feat as Course[])
        setPaths(p as Path[])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div
      className="space-y-8 pb-16"
      dir="rtl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background via-background to-background border border-border p-8 md:p-16"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            پلتفرم آموزش سرمایه‌گذاری هوشمند
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            آکادمی{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-amber-300 to-primary">
              A|CAP
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-foreground/80 font-light mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            دانشگاه سرمایه‌گذاری هوشمند
          </motion.p>

          <motion.p
            className="text-muted-foreground max-w-2xl mb-8 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            از مبتدی تا حرفه‌ای، مسیر موفقیت در بازارهای مالی را با اساتید برتر ایران طی کنید
          </motion.p>

          <motion.div
            className="flex w-full max-w-xl gap-2 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && router.push(`/app/academy/catalog?q=${encodeURIComponent(search)}`)}
                placeholder="دوره، استاد یا موضوع مورد نظر خود را جستجو کنید..."
                className="w-full bg-muted border border-border rounded-xl py-3.5 pr-12 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
            <button
              onClick={() => router.push(`/app/academy/catalog?q=${encodeURIComponent(search)}`)}
              className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-foreground font-semibold transition-all flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              جستجو
            </button>
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full"
            variants={containerVariants}
          >
            {[
              { icon: Users, value: 200, label: 'دانشجو', suffix: '+' },
              { icon: BookOpen, value: 14, label: 'دوره', suffix: '' },
              { icon: Clock, value: 280, label: 'ساعت آموزش', suffix: '+' },
              { icon: Star, value: 87, label: 'رضایت', suffix: '%' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="text-center p-4 rounded-2xl bg-muted border border-border backdrop-blur-sm"
              >
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Category Pills */}
      <motion.section variants={itemVariants}>
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(cat => {
            const CatIcon = iconMap[cat.id] || BookOpen
            return (
              <button
                key={cat.id}
                onClick={() => router.push(`/app/academy/catalog?category=${cat.id}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border hover:border-primary/30 text-sm text-foreground/80 hover:text-foreground transition-all"
              >
                <CatIcon className="w-4 h-4" style={{ color: cat.color }} />
                {cat.label}
              </button>
            )
          })}
        </div>
      </motion.section>

      {/* Featured Courses */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">دوره‌های محبوب</h2>
            <p className="text-muted-foreground text-sm mt-1">پرطرفدارترین دوره‌های آکادمی</p>
          </div>
          <button
            onClick={() => router.push('/app/academy/catalog')}
            className="flex items-center gap-1 text-primary hover:text-primary transition-colors text-sm font-medium"
          >
            مشاهده همه
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>هنوز دوره‌ای ثبت نشده است</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((course, i) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                onClick={() => router.push(`/app/academy/courses/${course.slug}`)}
                className="group cursor-pointer rounded-2xl bg-card border border-border hover:border-primary/30 overflow-hidden transition-all duration-300"
              >
                {/* Thumbnail */}
                <div
                  className="h-32 flex items-center justify-center relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${course.color}22, ${course.color}44)` }}
                >
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${course.color}, transparent 70%)` }}
                  />
                  {course.isNew && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-primary/20 text-primary text-xs font-medium border border-primary/20">
                      جدید
                    </span>
                  )}
                  {course.isBestseller && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-primary/20 text-primary text-xs font-medium border border-primary/20">
                      پرفروش
                    </span>
                  )}
                  {React.createElement(getIcon(course.icon), {
                    className: 'w-12 h-12 opacity-40 group-hover:opacity-60 transition-opacity',
                    style: { color: course.color },
                  })}
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${levelConfig[course.level]?.color || 'bg-muted text-muted-foreground'}`}>
                      {levelConfig[course.level]?.label || course.level}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{
                        backgroundColor: `${categories.find(c => c.id === course.category)?.color}15`,
                        color: categories.find(c => c.id === course.category)?.color || '#6B7280',
                      }}
                    >
                      {categories.find(c => c.id === course.category)?.label || course.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{course.instructorName}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{course.rating?.toFixed(1) || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{(course.studentsCount || 0).toLocaleString('fa-IR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.duration || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      {course.originalPrice && course.originalPrice > course.price ? (
                        <>
                          <span className="text-lg font-bold text-primary">
                            {(course.price || 0).toLocaleString('fa-IR')} تومان
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            {(course.originalPrice || 0).toLocaleString('fa-IR')}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-foreground">
                          {(course.price || 0).toLocaleString('fa-IR')} تومان
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground group-hover:text-primary transition-colors">
                      <Play className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Instructors Section */}
      <motion.section variants={itemVariants}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">اساتید آکادمی</h2>
          <p className="text-muted-foreground text-sm mt-1">یادگیری از بهترین‌های بازارهای مالی</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {instructors.map((inst, i) => (
            <motion.div
              key={inst.id}
              variants={itemVariants}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card border border-border p-6 group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${inst.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className="relative z-10 flex gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${inst.gradient} flex items-center justify-center text-xl font-bold text-white flex-shrink-0`}
                >
                  {inst.image}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold">{inst.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{inst.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{inst.bio}</p>
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{inst.stats.courses} دوره</span>
                    <span>{inst.stats.students.toLocaleString('fa-IR')} دانشجو</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {inst.stats.rating}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Learning Paths */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">مسیرهای یادگیری</h2>
            <p className="text-muted-foreground text-sm mt-1">دوره‌های هدفمند برای رسیدن به درآمد</p>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : paths.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Compass className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>هنوز مسیر یادگیری تعریف نشده است</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paths.map((path, i) => {
              const PathIcon = getIcon(path.icon)
              const diffConfig: Record<string, { label: string; color: string }> = {
                beginner: { label: 'مبتدی', color: 'bg-primary/20 text-primary border-primary/20' },
                intermediate: { label: 'متوسط', color: 'bg-primary/20 text-primary border-primary/20' },
                advanced: { label: 'پیشرفته', color: 'bg-primary/20 text-primary border-primary/20' },
              }
              const dc = diffConfig[path.difficulty] || diffConfig.intermediate

              return (
                <motion.div
                  key={path.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  onClick={() => router.push(`/app/academy/catalog?path=${path.slug}`)}
                  className="group cursor-pointer rounded-2xl bg-muted border border-border p-6 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${path.color}20` }}
                    >
                      <PathIcon className="w-6 h-6" style={{ color: path.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{path.title}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${dc.color}`}>
                          {dc.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{path.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    {path.incomePotential && (
                      <div className="p-2 rounded-lg bg-muted">
                        <DollarSign className="w-4 h-4 mx-auto mb-1 text-primary" />
                        <span className="text-muted-foreground">{path.incomePotential}</span>
                      </div>
                    )}
                    {path.timeToFirstIncome && (
                      <div className="p-2 rounded-lg bg-muted">
                        <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
                        <span className="text-muted-foreground">{path.timeToFirstIncome}</span>
                      </div>
                    )}
                    {path.requiredCapital && (
                      <div className="p-2 rounded-lg bg-muted">
                        <Target className="w-4 h-4 mx-auto mb-1 text-primary" />
                        <span className="text-muted-foreground">{path.requiredCapital}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{path.courses?.length || 0} دوره</span>
                    <span className="text-primary group-hover:gap-2 transition-all flex items-center gap-1">
                      مشاهده دوره‌ها <ChevronLeft className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.section>

      {/* Stats Section */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-background border border-border p-8 md:p-12"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {statItems.map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="text-center"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl md:text-4xl font-black text-foreground">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/30 via-background to-background border border-primary/20 p-8 md:p-16 text-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative z-10">
          <Award className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            آماده شروع سفر سرمایه‌گذاری هوشمند هستید؟
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
            به جمع دانشجویان آکادمی A|CAP بپیوندید و از صفر تا صد بازارهای مالی را حرفه‌ای یاد بگیرید
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push('/app/academy/catalog')}
              className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-foreground font-bold text-lg transition-all shadow-lg shadow-primary/20"
            >
              شروع یادگیری
            </button>
            <button
              onClick={() => router.push('/app/academy/dashboard')}
              className="px-8 py-3.5 rounded-xl bg-card hover:bg-accent text-foreground font-semibold text-lg transition-all border border-border"
            >
              داشبورد من
            </button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
