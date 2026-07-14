'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search, BookOpen, Clock, User, ChevronLeft,
  TrendingUp, BarChart3, Brain, LineChart, Shield, DollarSign,
  Target, Award, Sparkles, BookMarked, Compass,
  Calendar, Eye, Loader2, Star, ArrowLeft
} from 'lucide-react'
import { getArticles, getFeaturedArticles, getArticleCategories } from '@/app/actions/academy'
import { getArticleImage } from '@/lib/article-images'

const crimson = '#A51C30'
const gold = '#D4A843'

const iconMap: Record<string, React.ElementType> = {
  Compass, TrendingUp, BarChart3, Brain, LineChart, Shield, DollarSign, Target, Award, Sparkles, BookMarked, BookOpen,
}

function getIcon(name: string) {
  return iconMap[name] || BookOpen
}

interface Article {
  id: string; title: string; slug: string; excerpt: string; content: string;
  categoryId: string | null; author: string; authorRole: string | null;
  image: string | null; tags: unknown; readingTime: number;
  isFeatured: boolean; views: number; publishedAt: string;
}

interface Category {
  id: string; name: string; slug: string; description: string | null;
  color: string | null; icon: string | null; order: number;
}

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateStr))
  } catch { return dateStr }
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-gray-800/40 border border-gray-700/50 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-20 bg-gray-700 rounded" />
        <div className="h-5 w-full bg-gray-700 rounded" />
        <div className="h-4 w-3/4 bg-gray-700 rounded" />
        <div className="flex gap-4">
          <div className="h-3 w-16 bg-gray-700 rounded" />
          <div className="h-3 w-16 bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function BlogPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [featured, setFeatured] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const featuredRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      try {
        const [feat, cats] = await Promise.all([
          getFeaturedArticles().catch(() => []),
          getArticleCategories().catch(() => []),
        ])
        setFeatured(feat as any[])
        setCategories(cats as any[])
      } catch { /* ignore */ }
    }
    init()
  }, [])

  useEffect(() => {
    setLoading(true)
    setPage(1)
    setArticles([])
    loadArticles(1, selectedCategory, true)
  }, [selectedCategory])

  async function loadArticles(p: number, cat?: string, reset?: boolean) {
    try {
      if (reset) setLoading(true)
      else setLoadingMore(true)
      const data = await getArticles(cat, p, 12)
      const items = data as any[]
      if (reset) setArticles(items)
      else setArticles(prev => [...prev, ...items])
      setHasMore(items.length === 12)
      setPage(p)
    } catch { /* ignore */ } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  function handleLoadMore() {
    if (!loadingMore && hasMore) loadArticles(page + 1, selectedCategory)
  }

  const categoryMap = useCallback(() => {
    const map: Record<string, Category> = {}
    categories.forEach(c => { map[c.id] = c })
    return map
  }, [categories])

  function scrollFeatured(dir: 'left' | 'right') {
    if (!featuredRef.current) return
    const amount = 320
    featuredRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-950 text-white pb-20"
      dir="rtl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border-b border-gray-800"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-crimson-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-crimson-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-crimson-500/10 border border-crimson-500/20 text-crimson-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              دانشنامه سرمایه‌گذاری هوشمند
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4">
              وبلاگ{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-crimson-400 via-amber-300 to-crimson-400">
                A|CAP
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              مقالات تخصصی در زمینه مدیریت سرمایه، تحلیل بازارهای مالی، شخصیت‌شناسی مالی
              و معرفی ابزارهای هوشمند سرمایه‌گذاری
            </p>

            <div className="flex w-full max-w-xl mx-auto gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && router.push(`/blog?q=${encodeURIComponent(search)}`)}
                  placeholder="جستجوی مقاله..."
                  className="w-full bg-gray-800/80 border border-gray-700 rounded-xl py-3.5 pr-12 pl-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-crimson-500/50 focus:ring-1 focus:ring-crimson-500/20 transition-all"
                />
              </div>
              <button
                onClick={() => router.push(`/blog?q=${encodeURIComponent(search)}`)}
                className="px-6 py-3.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold transition-all"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Featured Articles */}
        {featured.length > 0 && (
          <motion.section variants={itemVariants} className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  مقالات ویژه
                </h2>
                <p className="text-gray-400 text-sm mt-1">پرطرفدارترین و جدیدترین مطالب</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollFeatured('right')} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scrollFeatured('left')} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
            <div
              ref={featuredRef}
              className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {featured.map((article, i) => {
                const cat = article.categoryId ? categoryMap()[article.categoryId] : null
                const CatIcon = cat ? getIcon(cat.icon || 'BookOpen') : BookOpen
                return (
                  <motion.div
                    key={article.id}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    onClick={() => router.push(`/blog/${article.slug}`)}
                    className="group cursor-pointer rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-crimson-500/30 overflow-hidden transition-all duration-300 flex-shrink-0 w-[280px] sm:w-[340px]"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div
                      className="h-44 bg-cover bg-center relative overflow-hidden"
                      style={{ backgroundImage: `url(${getArticleImage(article.title, cat?.color || crimson)})` }}
                    >
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-crimson-500/20 text-crimson-400 text-xs font-medium border border-crimson-500/20">
                        ویژه
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-white group-hover:text-crimson-400 transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {article.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {article.readingTime} دقیقه
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(article.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.section>
        )}

        {/* Category Filter */}
        <motion.section variants={itemVariants} className="mt-10">
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                !selectedCategory
                  ? 'bg-crimson-600 text-white'
                  : 'bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              همه مقالات
            </button>
            {categories.map(cat => {
              const CatIcon = getIcon(cat.icon || 'BookOpen')
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'text-white'
                      : 'bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  style={selectedCategory === cat.id ? { backgroundColor: `${cat.color || crimson}30`, borderColor: `${cat.color || crimson}50`, color: cat.color || crimson } : {}}
                >
                  <CatIcon className="w-4 h-4" style={{ color: cat.color || crimson }} />
                  {cat.name}
                </button>
              )
            })}
          </div>
        </motion.section>

        {/* Article Grid */}
        <motion.section variants={itemVariants} className="mt-2">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-crimson-500/20 to-crimson-500/5 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-crimson-400/60" />
              </div>
              <h3 className="text-xl font-bold mb-2">هنوز مقاله‌ای منتشر نشده</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                به زودی مقالات آموزشی جدید در این بخش منتشر خواهد شد. برای اطلاع از آخرین مطالب، ما را دنبال کنید.
              </p>
              <button
                onClick={() => { setSelectedCategory(undefined); setSearch('') }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-medium transition-all"
              >
                مشاهده همه مقالات
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, i) => {
                  const cat = article.categoryId ? categoryMap()[article.categoryId] : null
                  const CatIcon = cat ? getIcon(cat.icon || 'BookOpen') : BookOpen
                  return (
                    <motion.div
                      key={article.id}
                      variants={itemVariants}
                      whileHover={{ y: -4 }}
                      onClick={() => router.push(`/blog/${article.slug}`)}
                      className="group cursor-pointer rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-crimson-500/30 overflow-hidden transition-all duration-300"
                    >
                      <div
                        className="h-40 bg-cover bg-center relative overflow-hidden"
                        style={{ backgroundImage: `url(${getArticleImage(article.title, cat?.color || crimson)})` }}
                      >
                        {article.isFeatured && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/20 flex items-center gap-1">
                            <Star className="w-3 h-3" /> ویژه
                          </span>
                        )}
                      </div>
                      <div className="p-5 space-y-3">
                        {cat && (
                          <span
                            className="inline-block px-2 py-0.5 rounded-md text-xs font-medium"
                            style={{
                              backgroundColor: `${cat.color || crimson}15`,
                              color: cat.color || crimson,
                            }}
                          >
                            {cat.name}
                          </span>
                        )}
                        <h3 className="font-bold text-white group-hover:text-crimson-400 transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-700/30">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {article.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {article.readingTime} دقیقه
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(article.publishedAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Eye className="w-3 h-3" />
                          <span>{(article.views ?? 0).toLocaleString('fa-IR')} بازدید</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-all border border-gray-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> در حال بارگذاری...</>
                    ) : (
                      <><BookOpen className="w-5 h-5" /> مقالات بیشتر</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.section>

        {/* Back to Dashboard */}
        <motion.div variants={itemVariants} className="mt-10 text-center">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> بازگشت به داشبورد
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
