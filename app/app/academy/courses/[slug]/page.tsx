'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Star, Users, Clock, ChevronLeft, Check, Play,
  GraduationCap, BarChart3, Award, Target, ChevronDown, Share2,
  Sparkles, Shield, AlertCircle, Monitor, FileText, MessageCircle,
} from 'lucide-react'
import { getCourseBySlug, getCourses, enrollInCourse } from '@/app/actions/academy'
import { useSession } from '@/lib/auth-client'

const crimson = '#A51C30'
const gold = '#D4A843'

const categories: Record<string, { label: string; color: string }> = {
  ict: { label: 'ICT', color: '#3B82F6' },
  ai: { label: 'هوش مصنوعی', color: '#8B5CF6' },
  stock: { label: 'بورس', color: '#10B981' },
  forex: { label: 'فارکس', color: '#F59E0B' },
  crypto: { label: 'ارز دیجیتال', color: '#EF4444' },
  blockchain: { label: 'بلاکچین', color: '#6366F1' },
  trading: { label: 'معامله‌گری', color: '#EC4899' },
  psychology: { label: 'روانشناسی', color: '#14B8A6' },
}

const levelConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'مبتدی', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' },
  intermediate: { label: 'متوسط', color: 'bg-amber-500/20 text-amber-400 border-amber-500/20' },
  advanced: { label: 'پیشرفته', color: 'bg-red-500/20 text-red-400 border-red-500/20' },
}

interface SyllabusItem {
  title?: string
  module?: string
  lessons?: Array<{ title?: string; duration?: string }>
  duration?: string
}

interface Course {
  id: string; title: string; slug: string; description: string; longDescription?: string | null;
  category: string; instructor: string; instructorName: string;
  price: number; originalPrice?: number | null; duration?: string | null;
  level: string; lessons: number; videoHours?: number | null;
  color: string; icon: string; rating?: number | null;
  studentsCount?: number | null; prerequisites?: string | null;
  whatYouLearn?: SyllabusItem[] | null; syllabus?: SyllabusItem[] | null;
  isPopular: boolean; isNew: boolean; isBestseller: boolean;
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const slug = params.slug as string

  const [course, setCourse] = useState<Course | null>(null)
  const [related, setRelated] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [openModule, setOpenModule] = useState<number | null>(0)

  useEffect(() => {
    async function load() {
      try {
        const c = await getCourseBySlug(slug)
        if (!c) {
          setLoading(false)
          return
        }
        setCourse(c as Course)
        const all = await getCourses(c.category).catch(() => [])
        setRelated((all as Course[]).filter(r => r.id !== c.id).slice(0, 3))
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const handleEnroll = async () => {
    if (!course || !session) return
    setEnrolling(true)
    try {
      await enrollInCourse(course.id)
      setEnrolled(true)
    } catch {
      // ignore
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 rounded-3xl bg-gray-800/50 animate-pulse" />
        <div className="h-48 rounded-3xl bg-gray-800/50 animate-pulse" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-20 text-gray-500">
        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium">دوره مورد نظر یافت نشد</p>
        <button onClick={() => router.push('/app/academy/catalog')} className="mt-4 text-crimson-400 hover:underline">
          بازگشت به کاتالوگ
        </button>
      </div>
    )
  }

  const catInfo = categories[course.category] || { label: course.category, color: '#6B7280' }
  const lvlInfo = levelConfig[course.level] || { label: course.level, color: 'bg-gray-500/20 text-gray-400 border-gray-500/20' }
  const whatYouLearn: string[] = course.whatYouLearn
    ? (Array.isArray(course.whatYouLearn)
      ? course.whatYouLearn.map((w: SyllabusItem) => typeof w === 'string' ? w : w.title || '')
      : [])
    : []
  const syllabus: SyllabusItem[] = course.syllabus ? (Array.isArray(course.syllabus) ? course.syllabus : []) : []
  const prerequisites: string[] = typeof course.prerequisites === 'string'
    ? course.prerequisites.split('\n').filter(Boolean)
    : []

  const discountPercent = course.originalPrice && course.originalPrice > course.price
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : 0

  return (
    <motion.div
      className="space-y-8 pb-16"
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border border-gray-800">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ background: `linear-gradient(135deg, ${course.color}, transparent 60%)` }}
        />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: course.color }} />

        <div className="relative z-10 p-6 md:p-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <button onClick={() => router.push('/app/academy')} className="hover:text-gray-300 transition-colors">آکادمی</button>
            <ChevronLeft className="w-3 h-3" />
            <button onClick={() => router.push('/app/academy/catalog')} className="hover:text-gray-300 transition-colors">دوره‌ها</button>
            <ChevronLeft className="w-3 h-3" />
            <span className="text-gray-300 truncate">{course.title}</span>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${lvlInfo.color}`}>{lvlInfo.label}</span>
                <span
                  className="px-3 py-1 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: `${catInfo.color}15`, color: catInfo.color }}
                >
                  {catInfo.label}
                </span>
                {course.isBestseller && (
                  <span className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/20">پرفروش</span>
                )}
                {course.isNew && (
                  <span className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">جدید</span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-black leading-tight">{course.title}</h1>

              <p className="text-gray-400 leading-relaxed">{course.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {course.instructorName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {course.rating?.toFixed(1) || '۰'} <span className="text-gray-600">({(course.studentsCount || 0).toLocaleString('fa-IR')} دانشجو)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {course.duration || 'متغیر'}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  {course.lessons} درس
                </span>
                {course.videoHours && (
                  <span className="flex items-center gap-1.5">
                    <Play className="w-4 h-4" />
                    {course.videoHours} ساعت ویدیو
                  </span>
                )}
              </div>
            </div>

            {/* Price Card */}
            <div className="md:col-span-1">
              <div className="rounded-2xl bg-gray-800/60 border border-gray-700/50 p-6 text-center space-y-4">
                <div>
                  {discountPercent > 0 && (
                    <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium mb-2">
                      {discountPercent}% تخفیف ویژه
                    </span>
                  )}
                  <div className="text-3xl font-black">
                    <span className="text-crimson-400">{(course.price || 0).toLocaleString('fa-IR')}</span>
                    <span className="text-sm font-normal text-gray-400 mr-1">تومان</span>
                  </div>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <div className="text-sm text-gray-500 line-through mt-1">
                      {(course.originalPrice || 0).toLocaleString('fa-IR')} تومان
                    </div>
                  )}
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={enrolling || enrolled}
                  className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    enrolled
                      ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                      : 'bg-crimson-600 hover:bg-crimson-700 text-white shadow-lg shadow-crimson-500/20'
                  }`}
                >
                  {enrolling ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : enrolled ? (
                    <>
                      <Check className="w-5 h-5" />
                      ثبت نام شدید
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-5 h-5" />
                      شروع دوره
                    </>
                  )}
                </button>

                <div className="text-xs text-gray-500 space-y-2">
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>دسترسی مادام العمر</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Monitor className="w-3.5 h-3.5 text-blue-400" />
                    <span>آموزش آنلاین و آفلاین</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>پشتیبانی اختصاصی</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* What You'll Learn */}
          {whatYouLearn.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gray-800/40 border border-gray-700/50 p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-crimson-400" />
                در این دوره چه یاد می‌گیرید؟
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {whatYouLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Prerequisites */}
          {prerequisites.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gray-800/40 border border-gray-700/50 p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                پیش‌نیازها
              </h2>
              <ul className="space-y-2">
                {prerequisites.map((pr, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    <span>{pr}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {/* Syllabus Accordion */}
          {syllabus.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gray-800/40 border border-gray-700/50 p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-crimson-400" />
                سرفصل‌های دوره
              </h2>
              <div className="space-y-2">
                {syllabus.map((mod, i) => {
                  const isOpen = openModule === i
                  const lessons = mod.lessons || []
                  return (
                    <div key={i} className="rounded-xl border border-gray-700/50 overflow-hidden">
                      <button
                        onClick={() => setOpenModule(isOpen ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-right bg-gray-800/60 hover:bg-gray-800 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-crimson-500/10 text-crimson-400 flex items-center justify-center text-sm font-bold">
                            {i + 1}
                          </span>
                          <div>
                            <span className="font-medium text-sm">{mod.title || mod.module || `ماژول ${i + 1}`}</span>
                            {lessons.length > 0 && (
                              <span className="text-xs text-gray-500 mr-2">{lessons.length} درس</span>
                            )}
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-3 space-y-1">
                              {lessons.length > 0 ? lessons.map((lesson, j) => (
                                <div key={j} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/40 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Play className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="text-gray-300">{lesson.title || `درس ${j + 1}`}</span>
                                  </div>
                                  {lesson.duration && (
                                    <span className="text-xs text-gray-500">{lesson.duration}</span>
                                  )}
                                </div>
                              )) : (
                                <div className="py-2 px-3 text-sm text-gray-500">در حال بروزرسانی</div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </motion.section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructor Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gray-800/40 border border-gray-700/50 p-6"
          >
            <h3 className="text-sm font-bold text-gray-400 mb-3">مدرس دوره</h3>
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                style={{
                  background: course.instructor === 'ali-borhan'
                    ? 'linear-gradient(135deg, #3B82F6, #1E3A5F)'
                    : 'linear-gradient(135deg, #8B5CF6, #4C1D95)',
                }}
              >
                {course.instructor === 'ali-borhan' ? 'AB' : 'AS'}
              </div>
              <div>
                <div className="font-bold">{course.instructorName}</div>
                <div className="text-xs text-gray-400">
                  {course.instructor === 'ali-borhan' ? 'بنیان‌گذار A|CAP' : 'تحلیلگر بازارهای مالی'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Course Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gray-800/40 border border-gray-700/50 p-6 space-y-3"
          >
            <h3 className="text-sm font-bold text-gray-400 mb-2">اطلاعات دوره</h3>
            {[
              { icon: Users, label: 'تعداد دانشجویان', value: (course.studentsCount || 0).toLocaleString('fa-IR') },
              { icon: Clock, label: 'مدت زمان', value: course.duration || 'متغیر' },
              { icon: FileText, label: 'تعداد دروس', value: (course.lessons ?? 0).toLocaleString('fa-IR') },
              { icon: Play, label: 'ساعت ویدیو', value: course.videoHours ? `${course.videoHours} ساعت` : '-' },
              { icon: BarChart3, label: 'سطح دوره', value: lvlInfo.label },
              { icon: Target, label: 'دسته‌بندی', value: catInfo.label },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <stat.icon className="w-4 h-4" />
                  <span>{stat.label}</span>
                </div>
                <span className="text-gray-200 font-medium">{stat.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Share */}
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="w-full py-2.5 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            اشتراک‌گذاری دوره
          </button>
        </div>
      </div>

      {/* Related Courses */}
      {related.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">دوره‌های مرتبط</h2>
            <button
              onClick={() => router.push('/app/academy/catalog')}
              className="text-sm text-crimson-400 hover:text-crimson-300 transition-colors flex items-center gap-1"
            >
              مشاهده همه <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {related.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                onClick={() => router.push(`/app/academy/courses/${r.slug}`)}
                className="group cursor-pointer rounded-2xl bg-gray-800/40 border border-gray-700/50 hover:border-crimson-500/30 p-4 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${r.color}20` }}
                  >
                    <BookOpen className="w-5 h-5" style={{ color: r.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate group-hover:text-crimson-400 transition-colors">{r.title}</div>
                    <div className="text-xs text-gray-500">{r.instructorName}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{r.rating?.toFixed(1) || '-'}</span>
                  <span className="font-medium text-crimson-400">{(r.price || 0).toLocaleString('fa-IR')} تومان</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </motion.div>
  )
}
