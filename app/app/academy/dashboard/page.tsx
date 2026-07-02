'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen, Star, Users, Clock, ChevronLeft, Play, Check,
  GraduationCap, BarChart3, Award, Target, Compass, TrendingUp,
  LineChart, Shield, DollarSign, Brain, Trophy, Sparkles,
  BookMarked, ArrowLeft, FileText, MessageCircle, AlertCircle,
} from 'lucide-react'
import { getMyEnrollments, getLearningPaths, getPathRecommendations } from '@/app/actions/academy'
import { useSession } from '@/lib/auth-client'

const crimson = '#A51C30'
const gold = '#D4A843'

const levelStyle: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/20',
}

const levelLabel: Record<string, string> = {
  beginner: 'مبتدی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
}

const iconMap: Record<string, React.ElementType> = {
  Compass, TrendingUp, BarChart3, Brain: Brain, LineChart, Shield, DollarSign, Target, Award, Sparkles, BookMarked,
}

function getIcon(name: string) {
  return iconMap[name] || Compass
}

interface Course {
  id: string; title: string; slug: string; description: string; category: string;
  instructor: string; instructorName: string; price: number; originalPrice?: number | null;
  duration?: string | null; level: string; lessons: number; rating?: number | null;
  studentsCount?: number | null; color: string; icon: string; videoHours?: number | null;
  isPopular: boolean; isNew: boolean; isBestseller: boolean;
}

interface Enrollment {
  id: string; userId: string; courseId: string; progress: number;
  completedLessons: number; startedAt: string; completedAt?: string | null;
  course: Course;
}

interface Path {
  id: string; title: string; slug: string; description: string; icon: string;
  color: string; difficulty: string; incomePotential?: string | null;
  timeToFirstIncome?: string | null; requiredCapital?: string | null;
  courses?: Course[];
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [paths, setPaths] = useState<Path[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [enr, p] = await Promise.all([
          getMyEnrollments().catch(() => []),
          getLearningPaths().catch(() => []),
        ])
        setEnrollments(enr as Enrollment[])
        setPaths(p as Path[])
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const inProgress = enrollments.filter(e => !e.completedAt && e.progress < 100)
  const completed = enrollments.filter(e => e.completedAt || e.progress >= 100)

  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0
  const totalHours = enrollments.reduce((sum, e) => sum + (e.course.videoHours || 0), 0)
  const watchedHours = Math.round(totalHours * (totalProgress / 100))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      className="space-y-8 pb-16"
      dir="rtl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border border-gray-800 p-6 md:p-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-crimson-500/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-crimson-600 to-crimson-900 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">
                خوش آمدید، {session?.user?.name || 'کاربر'}
              </h1>
              <p className="text-gray-400 text-sm mt-1">به داشبورد آموزشی خود خوش آمدید</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { icon: BookOpen, label: 'دوره‌های ثبت نامی', value: enrollments.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: Trophy, label: 'دوره‌های تکمیل شده', value: completed.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: Clock, label: 'ساعت تماشا', value: watchedHours, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { icon: BarChart3, label: 'پیشرفت کلی', value: `${totalProgress}%`, color: 'text-crimson-400', bg: 'bg-crimson-500/10' },
            ].map((stat, i) => (
              <div key={i} className={`rounded-xl ${stat.bg} border border-gray-700/50 p-3 text-center`}>
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <div className={`text-lg font-bold ${stat.color}`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString('fa-IR') : stat.value}
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-48 rounded-3xl bg-gray-800/50 animate-pulse" />
          <div className="h-48 rounded-3xl bg-gray-800/50 animate-pulse" />
        </div>
      ) : enrollments.length === 0 ? (
        /* Empty State */
        <motion.div
          variants={itemVariants}
          className="rounded-3xl bg-gray-800/40 border border-gray-700/50 p-12 text-center"
        >
          <GraduationCap className="w-20 h-20 mx-auto mb-6 text-gray-600" />
          <h2 className="text-2xl font-bold mb-2">هنوز در دوره‌ای ثبت نام نکرده‌اید</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            با ثبت نام در دوره‌های آکادمی A|CAP، مسیر یادگیری سرمایه‌گذاری هوشمند را آغاز کنید
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push('/app/academy/catalog')}
              className="px-8 py-3.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-bold transition-all shadow-lg shadow-crimson-500/20"
            >
              مرور دوره‌ها
            </button>
            <button
              onClick={() => router.push('/app/academy')}
              className="px-8 py-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold border border-gray-700 transition-all"
            >
              صفحه اصلی آکادمی
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Continue Learning */}
          {inProgress.length > 0 && (
            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Play className="w-5 h-5 text-crimson-400" />
                    ادامه یادگیری
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">دوره‌هایی که در حال گذراندن هستید</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {inProgress.slice(0, 4).map((enr, i) => (
                  <motion.div
                    key={enr.id}
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    onClick={() => router.push(`/app/academy/courses/${enr.course.slug}`)}
                    className="group cursor-pointer rounded-2xl bg-gray-800/40 border border-gray-700/50 hover:border-crimson-500/30 p-5 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${enr.course.color}20` }}
                      >
                        <BookOpen className="w-6 h-6" style={{ color: enr.course.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm group-hover:text-crimson-400 transition-colors truncate">
                          {enr.course.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{enr.course.instructorName}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{enr.course.duration || '-'}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">پیشرفت</span>
                            <span className="text-crimson-400 font-medium">{Math.round(enr.progress)}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-l from-crimson-500 to-crimson-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${enr.progress}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Completed Courses */}
          {completed.length > 0 && (
            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    دوره‌های تکمیل شده
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">تبریک! این دوره‌ها را با موفقیت به پایان رسانده‌اید</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map((enr, i) => (
                  <motion.div
                    key={enr.id}
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    onClick={() => router.push(`/app/academy/courses/${enr.course.slug}`)}
                    className="group cursor-pointer rounded-2xl bg-gray-800/30 border border-emerald-500/20 hover:border-emerald-500/40 p-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate group-hover:text-emerald-400 transition-colors">
                          {enr.course.title}
                        </div>
                        <div className="text-xs text-gray-500">{enr.course.instructorName}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      تکمیل شده
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* All Enrollments */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">همه دوره‌های من</h2>
              <span className="text-xs text-gray-500">{enrollments.length} دوره</span>
            </div>

            <div className="space-y-3">
              {enrollments.map((enr, i) => (
                <motion.div
                  key={enr.id}
                  variants={itemVariants}
                  onClick={() => router.push(`/app/academy/courses/${enr.course.slug}`)}
                  className="group cursor-pointer rounded-2xl bg-gray-800/30 border border-gray-700/50 hover:border-crimson-500/30 p-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${enr.course.color}20` }}
                    >
                      <BookOpen className="w-5 h-5" style={{ color: enr.course.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm group-hover:text-crimson-400 transition-colors truncate">
                          {enr.course.title}
                        </h3>
                        {enr.completedAt && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                            تکمیل شده
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{enr.course.instructorName}</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{enr.course.rating?.toFixed(1) || '-'}</span>
                        <span>{enr.course.duration || '-'}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-24 text-left">
                      <div className="text-xs text-gray-500 mb-1">پیشرفت</div>
                      <div className="text-sm font-bold text-crimson-400">{Math.round(enr.progress)}%</div>
                      <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full bg-gradient-to-l from-crimson-500 to-crimson-400 transition-all duration-700"
                          style={{ width: `${enr.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </>
      )}

      {/* Learning Path Recommendations */}
      {paths.length > 0 && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Compass className="w-5 h-5 text-crimson-400" />
                مسیرهای یادگیری پیشنهادی
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">بر اساس علاقه‌مندی‌های شما</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {paths.slice(0, 3).map((path, i) => {
              const PathIcon = getIcon(path.icon)
              return (
                <motion.div
                  key={path.id}
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  onClick={() => router.push(`/app/academy/catalog?path=${path.slug}`)}
                  className="group cursor-pointer rounded-2xl bg-gray-800/40 border border-gray-700/50 hover:border-crimson-500/30 p-5 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${path.color}20` }}
                    >
                      <PathIcon className="w-5 h-5" style={{ color: path.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold group-hover:text-crimson-400 transition-colors truncate">{path.title}</div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium border ${levelStyle[path.difficulty] || levelStyle.intermediate}`}>
                        {levelLabel[path.difficulty] || path.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{path.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                    {path.incomePotential && (
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-400" />{path.incomePotential}</span>
                    )}
                    {path.timeToFirstIncome && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" />{path.timeToFirstIncome}</span>
                    )}
                    {path.requiredCapital && (
                      <span className="flex items-center gap-1"><Target className="w-3 h-3 text-blue-400" />{path.requiredCapital}</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* CTA */}
      {enrollments.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-3xl bg-gradient-to-br from-crimson-900/20 via-gray-950 to-gray-950 border border-crimson-500/20 p-6 md:p-8 text-center"
        >
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-crimson-400" />
          <h2 className="text-xl font-bold mb-2">به یادگیری ادامه دهید</h2>
          <p className="text-gray-400 text-sm mb-4">دوره‌های جدید را کاوش کنید و مهارت‌های خود را ارتقا دهید</p>
          <button
            onClick={() => router.push('/app/academy/catalog')}
            className="px-6 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold transition-all"
          >
            مرور دوره‌ها
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
