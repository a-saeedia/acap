'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Compass, TrendingUp, BarChart3, Brain, LineChart, Shield, DollarSign,
  Target, Award, Sparkles, BookMarked, BookOpen, Clock, ChevronLeft,
  ArrowLeft, Loader2, Zap, GraduationCap, Route, MapPin, Flag
} from 'lucide-react'
import { getPathRecommendations, getLearningPaths } from '@/app/actions/academy'
import { getDashboardData } from '@/app/actions/profile'
import { useSession } from '@/lib/auth-client'

const crimson = '#A51C30'
const gold = '#D4A843'

const iconMap: Record<string, React.ElementType> = {
  Compass, TrendingUp, BarChart3, Brain, LineChart, Shield, DollarSign,
  Target, Award, Sparkles, BookMarked, BookOpen,
}

function getIcon(name: string) {
  return iconMap[name] || Compass
}

interface Course {
  id: string; title: string; slug: string; description: string; category: string;
  instructor: string; instructorName: string; price: number;
  level: string; lessons: number; color: string; icon: string;
}

interface PathResult {
  id: string; title: string; slug: string; description: string; icon: string;
  color: string; difficulty: string; incomePotential?: string | null;
  timeToFirstIncome?: string | null; requiredCapital?: string | null;
  investorType?: string | null; courseIds?: string[];
  courses: Course[];
}

interface QuizInfo {
  id: string; name: string; phone: string; score: number;
  investorType: string; createdAt: string;
}

const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'مبتدی', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' },
  intermediate: { label: 'متوسط', color: 'bg-amber-500/20 text-amber-400 border-amber-500/20' },
  advanced: { label: 'پیشرفته', color: 'bg-red-500/20 text-red-400 border-red-500/20' },
}

const investorTypeLabels: Record<string, string> = {
  conservative: 'سرمایه‌گذار محافظه‌کار',
  moderate: 'سرمایه‌گذار متعادل',
  aggressive: 'سرمایه‌گذار تهاجمی',
  strategic: 'سرمایه‌گذار استراتژیک',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function PathPage() {
  const router = useRouter()
  const { data: session, isPending: sessionLoading } = useSession()
  const [quizResults, setQuizResults] = useState<any[]>([])
  const [paths, setPaths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const dashData = await getDashboardData()
        if (dashData?.quizResults?.length) {
          setQuizResults(dashData.quizResults as any[])
          const latest = dashData.quizResults[dashData.quizResults.length - 1]
          const recs = await getPathRecommendations(latest.investorType)
          setPaths(recs as any[])
        } else {
          const allPaths = await getLearningPaths()
          setPaths(allPaths.map(p => ({ ...p, courses: [] })) as any[])
        }
      } catch { /* ignore */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const latestQuiz = quizResults.length > 0 ? quizResults[quizResults.length - 1] : null

  return (
    <motion.div
      className="space-y-8 pb-16"
      dir="rtl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
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
            <Route className="w-4 h-4" />
            مسیر یادگیری هوشمند
          </motion.div>

          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            کشف مسیر درآمدی{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-crimson-400 via-amber-300 to-crimson-400">
              شما
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            بر اساس شخصیت مالی و اهداف شما، بهترین مسیر یادگیری را پیدا کنید
          </motion.p>

          {latestQuiz && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-l from-crimson-500/10 to-amber-500/10 border border-crimson-500/20 mt-2"
            >
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-gray-300">
                تیپ شخصیتی شما:{' '}
                <span className="text-white font-bold">{investorTypeLabels[latestQuiz.investorType] || latestQuiz.investorType}</span>
              </span>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-52 rounded-2xl bg-gray-800/40 animate-pulse" />
          ))}
        </div>
      )}

      {/* No Quiz Taken */}
      {!loading && !latestQuiz && (
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 p-8 md:p-12 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-crimson-500/5 via-transparent to-transparent" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-crimson-500/20 to-crimson-500/5 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-3">
              هنوز تست شخصیت مالی را انجام نداده‌اید
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8 text-lg leading-relaxed">
              با انجام تست شخصیت مالی A|CAP، تیپ سرمایه‌گذاری خود را شناسایی کنید
              و مسیر یادگیری متناسب با شخصیت و اهداف مالی خود را دریافت نمایید.
            </p>
            <button
              onClick={() => router.push('/#quiz')}
              className="px-8 py-3.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-lg transition-all shadow-lg shadow-crimson-500/20 inline-flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              شروع تست شخصیت مالی
            </button>
          </div>
        </motion.section>
      )}

      {/* Path Recommendations */}
      {!loading && paths.length > 0 && (
        <>
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-6 h-6 text-crimson-400" />
              <h2 className="text-2xl font-bold">
                {latestQuiz ? 'مسیرهای پیشنهادی برای شما' : 'همه مسیرهای یادگیری'}
              </h2>
            </div>
            <p className="text-gray-400 text-sm mr-9">
              {latestQuiz
                ? 'بر اساس تیپ شخصیتی شما، این مسیرها بیشترین تطابق را دارند'
                : 'مسیرهای یادگیری مختلف را بررسی کنید و مناسب‌ترین را انتخاب نمایید'
              }
            </p>
          </motion.div>

          <div className="space-y-6">
            {paths.map((path, i) => {
              const PathIcon = getIcon(path.icon)
              const diff = difficultyConfig[path.difficulty] || difficultyConfig.intermediate
              const showConnector = i < paths.length - 1

              return (
                <motion.div
                  key={path.id}
                  variants={itemVariants}
                  className="relative"
                >
                  {/* Connector line */}
                  {showConnector && (
                    <div className="absolute right-8 top-full h-6 w-0.5 bg-gradient-to-b from-crimson-500/40 to-transparent z-0" />
                  )}

                  <motion.div
                    whileHover={{ x: -4 }}
                    className="relative z-10 rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-crimson-500/30 overflow-hidden transition-all duration-300 p-6 md:p-8"
                  >
                    <div className="flex items-start gap-5">
                      {/* Icon */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${path.color}20` }}
                      >
                        <PathIcon className="w-7 h-7" style={{ color: path.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Title Row */}
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{path.title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${diff.color}`}>
                            {diff.label}
                          </span>
                        </div>

                        <p className="text-gray-400 leading-relaxed mb-5">
                          {path.description}
                        </p>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                          {path.incomePotential && (
                            <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/30 text-center">
                              <DollarSign className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                              <div className="text-xs text-gray-500">پتانسیل درآمد</div>
                              <div className="text-sm font-medium text-emerald-400">{path.incomePotential}</div>
                            </div>
                          )}
                          {path.timeToFirstIncome && (
                            <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/30 text-center">
                              <Clock className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                              <div className="text-xs text-gray-500">زمان تا اولین درآمد</div>
                              <div className="text-sm font-medium text-amber-400">{path.timeToFirstIncome}</div>
                            </div>
                          )}
                          {path.requiredCapital && (
                            <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/30 text-center">
                              <Target className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                              <div className="text-xs text-gray-500">سرمایه مورد نیاز</div>
                              <div className="text-sm font-medium text-blue-400">{path.requiredCapital}</div>
                            </div>
                          )}
                          <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/30 text-center">
                            <BookOpen className="w-5 h-5 mx-auto mb-1 text-crimson-400" />
                            <div className="text-xs text-gray-500">تعداد دوره‌ها</div>
                            <div className="text-sm font-medium text-crimson-400">{path.courses?.length || 0} دوره</div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                          <button
                            onClick={() => router.push(`/app/academy/catalog?path=${path.slug}`)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-medium text-sm transition-all"
                          >
                            <GraduationCap className="w-4 h-4" />
                            مشاهده دوره‌های مسیر
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          {path.investorType && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-amber-400/60" />
                              مناسب {investorTypeLabels[path.investorType] || path.investorType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

          {/* Bottom CTA */}
          {!latestQuiz && (
            <motion.div
              variants={itemVariants}
              className="text-center p-8 rounded-2xl bg-gray-800/30 border border-gray-700/50"
            >
              <p className="text-gray-400 mb-4">
                برای دریافت پیشنهاد شخصی، تست شخصیت مالی را انجام دهید
              </p>
              <button
                onClick={() => router.push('/#quiz')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold transition-all"
              >
                <Zap className="w-5 h-5" />
                انجام تست شخصیت مالی
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && paths.length === 0 && latestQuiz && (
        <motion.div
          variants={itemVariants}
          className="text-center py-16"
        >
          <Compass className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-bold mb-2">مسیری یافت نشد</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            متاسفانه مسیر یادگیری متناسب با تیپ شخصیتی شما یافت نشد. به زودی مسیرهای جدید اضافه خواهد شد.
          </p>
          <button
            onClick={() => router.push('/app/academy')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-all border border-gray-700"
          >
            <ArrowLeft className="w-4 h-4" /> بازگشت به آکادمی
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
