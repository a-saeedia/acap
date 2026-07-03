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
    bio: 'بیش از ۱۵ سال سابقه در بازارهای مالی بین‌المللی. بنیان‌گذار آکادمی سرمایه‌گذاری هوشمند A|CAP و مدرس تخصصی ICT، پرایس اکشن و مدیریت سرمایه.',
    image: 'AB',
    gradient: 'from-blue-600 to-indigo-900',
    stats: { courses: 8, students: 2400, rating: 4.9 },
  },
  {
    id: 'arman-saeedi',
    name: 'آرمان سعیدی',
    title: 'تحلیلگر بازارهای مالی | مدرس ارز دیجیتال',
    bio: 'تحلیلگر حرفه‌ای بازارهای مالی با تخصص در ارزهای دیجیتال، تکنیکال پیشرفته و هوش مصنوعی در معاملات. مدرس دوره‌های تخصصی تریدینگ.',
    image: 'AS',
    gradient: 'from-purple-600 to-pink-900',
    stats: { courses: 6, students: 1800, rating: 4.8 },
  },
]

const statItems = [
  { icon: Users, value: 4200, label: 'تعداد دانشجویان', suffix: '+' },
  { icon: BookOpen, value: 14, label: 'دوره‌های تخصصی', suffix: '' },
  { icon: Clock, value: 280, label: 'ساعت آموزش', suffix: '+' },
  { icon: Star, value: 97, label: 'نرخ رضایت', suffix: '%' },
]

const levelConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'مبتدی', color: 'bg-emerald-500/20 text-emerald-400' },
  intermediate: { label: 'متوسط', color: 'bg-amber-500/20 text-amber-400' },
  advanced: { label: 'پیشرفته', color: 'bg-red-500/20 text-red-400' },
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
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border border-gray-800 p-8 md:p-16"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-crimson-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-crimson-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-crimson-500/10 border border-crimson-500/20 text-crimson-400 text-sm font-medium mb-6"
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
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-crimson-400 via-amber-300 to-crimson-400">
              A|CAP
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 font-light mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            دانشگاه سرمایه‌گذاری هوشمند
          </motion.p>

          <motion.p
            className="text-gray-400 max-w-2xl mb-8 text-lg"
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
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && router.push(`/app/academy/catalog?q=${encodeURIComponent(search)}`)}
                placeholder="دوره، استاد یا موضوع مورد نظر خود را جستجو کنید..."
                className="w-full bg-gray-800/80 border border-gray-700 rounded-xl py-3.5 pr-12 pl-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-crimson-500/50 focus:ring-1 focus:ring-crimson-500/20 transition-all"
              />
            </div>
            <button
              onClick={() => router.push(`/app/academy/catalog?q=${encodeURIComponent(search)}`)}
              className="px-6 py-3.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold transition-all flex items-center gap-2"
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
              { icon: Users, value: 4200, label: 'دانشجو', suffix: '+' },
              { icon: BookOpen, value: 14, label: 'دوره', suffix: '' },
              { icon: Clock, value: 280, label: 'ساعت آموزش', suffix: '+' },
              { icon: Star, value: 97, label: 'رضایت', suffix: '%' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-crimson-400" />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
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
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/60 border border-gray-700/50 hover:border-gray-600 text-sm text-gray-300 hover:text-white transition-all"
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
            <p className="text-gray-400 text-sm mt-1">پرطرفدارترین دوره‌های آکادمی</p>
          </div>
          <button
            onClick={() => router.push('/app/academy/catalog')}
            className="flex items-center gap-1 text-crimson-400 hover:text-crimson-300 transition-colors text-sm font-medium"
          >
            مشاهده همه
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 rounded-2xl bg-gray-800/50 animate-pulse" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
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
                className="group cursor-pointer rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-crimson-500/30 overflow-hidden transition-all duration-300"
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
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                      جدید
                    </span>
                  )}
                  {course.isBestseller && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/20">
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
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${levelConfig[course.level]?.color || 'bg-gray-500/20 text-gray-400'}`}>
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

                  <h3 className="font-bold text-white group-hover:text-crimson-400 transition-colors leading-snug">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{course.instructorName}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
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

                  <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                    <div className="flex items-center gap-2">
                      {course.originalPrice && course.originalPrice > course.price ? (
                        <>
                          <span className="text-lg font-bold text-crimson-400">
                            {(course.price || 0).toLocaleString('fa-IR')} تومان
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            {(course.originalPrice || 0).toLocaleString('fa-IR')}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-white">
                          {(course.price || 0).toLocaleString('fa-IR')} تومان
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 group-hover:text-crimson-400 transition-colors">
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
          <p className="text-gray-400 text-sm mt-1">یادگیری از بهترین‌های بازارهای مالی</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {instructors.map((inst, i) => (
            <motion.div
              key={inst.id}
              variants={itemVariants}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 p-6 group"
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
                  <p className="text-sm text-gray-400 mb-2">{inst.title}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{inst.bio}</p>
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
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
            <p className="text-gray-400 text-sm mt-1">دوره‌های هدفمند برای رسیدن به درآمد</p>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-gray-800/50 animate-pulse" />
            ))}
          </div>
        ) : paths.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Compass className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>هنوز مسیر یادگیری تعریف نشده است</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paths.map((path, i) => {
              const PathIcon = getIcon(path.icon)
              const diffConfig: Record<string, { label: string; color: string }> = {
                beginner: { label: 'مبتدی', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' },
                intermediate: { label: 'متوسط', color: 'bg-amber-500/20 text-amber-400 border-amber-500/20' },
                advanced: { label: 'پیشرفته', color: 'bg-red-500/20 text-red-400 border-red-500/20' },
              }
              const dc = diffConfig[path.difficulty] || diffConfig.intermediate

              return (
                <motion.div
                  key={path.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  onClick={() => router.push(`/app/academy/catalog?path=${path.slug}`)}
                  className="group cursor-pointer rounded-2xl bg-gray-800/40 border border-gray-700/50 p-6 hover:border-crimson-500/30 transition-all duration-300"
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
                        <h3 className="font-bold text-white group-hover:text-crimson-400 transition-colors">{path.title}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${dc.color}`}>
                          {dc.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{path.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    {path.incomePotential && (
                      <div className="p-2 rounded-lg bg-gray-800/60">
                        <DollarSign className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                        <span className="text-gray-400">{path.incomePotential}</span>
                      </div>
                    )}
                    {path.timeToFirstIncome && (
                      <div className="p-2 rounded-lg bg-gray-800/60">
                        <Clock className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                        <span className="text-gray-400">{path.timeToFirstIncome}</span>
                      </div>
                    )}
                    {path.requiredCapital && (
                      <div className="p-2 rounded-lg bg-gray-800/60">
                        <Target className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                        <span className="text-gray-400">{path.requiredCapital}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>{path.courses?.length || 0} دوره</span>
                    <span className="text-crimson-400 group-hover:gap-2 transition-all flex items-center gap-1">
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
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 p-8 md:p-12"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-crimson-500/5 via-transparent to-transparent" />
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {statItems.map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="text-center"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-crimson-400" />
              <div className="text-3xl md:text-4xl font-black text-white">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-crimson-900/30 via-gray-950 to-gray-950 border border-crimson-500/20 p-8 md:p-16 text-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-crimson-500/10 via-transparent to-transparent" />
        <div className="relative z-10">
          <Award className="w-16 h-16 mx-auto mb-6 text-crimson-400" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            آماده شروع سفر سرمایه‌گذاری هوشمند هستید؟
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8 text-lg">
            به جمع هزاران دانشجوی آکادمی A|CAP بپیوندید و از صفر تا صد بازارهای مالی را حرفه‌ای یاد بگیرید
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push('/app/academy/catalog')}
              className="px-8 py-3.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-lg transition-all shadow-lg shadow-crimson-500/20"
            >
              شروع یادگیری
            </button>
            <button
              onClick={() => router.push('/app/academy/dashboard')}
              className="px-8 py-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-lg transition-all border border-gray-700"
            >
              داشبورد من
            </button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}

