'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search, SlidersHorizontal, Star, Users, Clock, BookOpen, ChevronLeft,
  Play, GraduationCap, X, ArrowUpDown, Filter, Grid3X3, List,
} from 'lucide-react'
import { getCourses } from '@/app/actions/academy'
import { useSession } from '@/lib/auth-client'

const crimson = '#A51C30'
const gold = '#D4A843'

const categories = [
  { id: 'all', label: 'همه دوره‌ها', color: '#6B7280' },
  { id: 'ict', label: 'ICT', color: '#3B82F6' },
  { id: 'ai', label: 'هوش مصنوعی', color: '#8B5CF6' },
  { id: 'stock', label: 'بورس', color: '#10B981' },
  { id: 'forex', label: 'فارکس', color: '#F59E0B' },
  { id: 'crypto', label: 'ارز دیجیتال', color: '#EF4444' },
  { id: 'blockchain', label: 'بلاکچین', color: '#6366F1' },
  { id: 'trading', label: 'معامله‌گری', color: '#EC4899' },
  { id: 'psychology', label: 'روانشناسی', color: '#14B8A6' },
]

const levels = [
  { id: 'all', label: 'همه سطوح' },
  { id: 'beginner', label: 'مبتدی' },
  { id: 'intermediate', label: 'متوسط' },
  { id: 'advanced', label: 'پیشرفته' },
]

const levelStyle: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-400',
  intermediate: 'bg-amber-500/20 text-amber-400',
  advanced: 'bg-red-500/20 text-red-400',
}

const sortOptions = [
  { id: 'popular', label: 'محبوب‌ترین' },
  { id: 'newest', label: 'جدیدترین' },
  { id: 'price-asc', label: 'قیمت: کم به زیاد' },
  { id: 'price-desc', label: 'قیمت: زیاد به کم' },
]

interface Course {
  id: string; title: string; slug: string; description: string; category: string;
  instructor: string; instructorName: string; price: number; originalPrice?: number | null;
  duration?: string | null; level: string; lessons: number; rating?: number | null;
  studentsCount?: number | null; color: string; icon: string; isPopular: boolean;
  isNew: boolean; isBestseller: boolean; createdAt: string;
}

export default function CatalogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [level, setLevel] = useState('all')
  const [instructor, setInstructor] = useState('all')
  const [sort, setSort] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const cat = category === 'all' ? undefined : category
        const data = await getCourses(cat).catch(() => [])
        setCourses(data as Course[])
      } catch {
        setCourses([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [category])

  const instructors = useMemo(() => {
    const names = new Set(courses.map(c => c.instructorName))
    return [{ id: 'all', name: 'همه اساتید' }, ...Array.from(names).map(n => ({ id: n, name: n }))]
  }, [courses])

  const filtered = useMemo(() => {
    let result = [...courses]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      )
    }

    if (level !== 'all') {
      result = result.filter(c => c.level === level)
    }

    if (instructor !== 'all') {
      result = result.filter(c => c.instructorName === instructor)
    }

    switch (sort) {
      case 'popular':
        result.sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0))
        break
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
    }

    return result
  }, [courses, search, level, instructor, sort])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      className="space-y-6 pb-16"
      dir="rtl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-black">دوره‌های آموزشی</h1>
        <p className="text-gray-400 mt-1">
          مرور و جستجوی تمام دوره‌های آکادمی A|CAP
        </p>
      </motion.div>

      {/* Search & Controls */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجوی دوره..."
            className="w-full bg-gray-800/60 border border-gray-700 rounded-xl py-2.5 pr-10 pl-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-crimson-500/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-crimson-500/50"
        >
          {sortOptions.map(o => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-2 ${
            showFilters ? 'bg-crimson-600/20 border-crimson-500/30 text-crimson-400' : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:border-gray-600'
          }`}
        >
          <Filter className="w-4 h-4" />
          فیلترها
        </button>

        <div className="flex border border-gray-700 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'bg-gray-800/60 text-gray-500 hover:text-gray-300'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'bg-gray-800/60 text-gray-500 hover:text-gray-300'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl bg-gray-800/40 border border-gray-700/50 p-5 space-y-4"
        >
          {/* Category Tabs */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-2 block">دسته‌بندی</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    category === cat.id
                      ? 'bg-crimson-600/20 border-crimson-500/30 text-crimson-400'
                      : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Level Filter */}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-2 block">سطح دوره</label>
              <div className="flex flex-wrap gap-2">
                {levels.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      level === l.id
                        ? 'bg-crimson-600/20 border-crimson-500/30 text-crimson-400'
                        : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Instructor Filter */}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-2 block">استاد</label>
              <div className="flex flex-wrap gap-2">
                {instructors.map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => setInstructor(inst.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      instructor === inst.id
                        ? 'bg-crimson-600/20 border-crimson-500/30 text-crimson-400'
                        : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {inst.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results count */}
      <motion.div variants={itemVariants} className="text-sm text-gray-500">
        {filtered.length.toLocaleString('fa-IR')} دوره پیدا شد
      </motion.div>

      {/* Course Grid / List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`rounded-2xl bg-gray-800/50 animate-pulse ${viewMode === 'grid' ? 'h-72' : 'h-28'}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">دوره‌ای یافت نشد</p>
          <p className="text-sm text-gray-600">متن جستجو یا فیلترهای خود را تغییر دهید</p>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
          {filtered.map(course => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              onClick={() => router.push(`/app/academy/courses/${course.slug}`)}
              className="group cursor-pointer rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-crimson-500/30 overflow-hidden transition-all duration-300"
            >
              <div
                className="h-32 flex items-center justify-center relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${course.color}22, ${course.color}44)` }}
              >
                <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 50% 50%, ${course.color}, transparent 70%)` }} />
                {course.isNew && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/20">جدید</span>
                )}
                {course.isBestseller && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/20">پرفروش</span>
                )}
                <BookOpen className="w-12 h-12 opacity-30 group-hover:opacity-50 transition-opacity" style={{ color: course.color }} />
              </div>

              <div className="p-4 space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${levelStyle[course.level] || 'bg-gray-500/20 text-gray-400'}`}>
                    {course.level === 'beginner' ? 'مبتدی' : course.level === 'intermediate' ? 'متوسط' : 'پیشرفته'}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-md text-xs font-medium"
                    style={{ backgroundColor: `${categories.find(c => c.id === course.category)?.color}15`, color: categories.find(c => c.id === course.category)?.color || '#6B7280' }}
                  >
                    {categories.find(c => c.id === course.category)?.label || course.category}
                  </span>
                </div>

                <h3 className="font-bold text-sm leading-snug group-hover:text-crimson-400 transition-colors line-clamp-2">{course.title}</h3>

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Users className="w-3 h-3" />
                  <span>{course.instructorName}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{course.rating?.toFixed(1) || '-'}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(course.studentsCount || 0).toLocaleString('fa-IR')}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration || '-'}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                  <div className="flex items-center gap-2">
                    {course.originalPrice && course.originalPrice > course.price ? (
                      <>
                        <span className="font-bold text-crimson-400">{(course.price || 0).toLocaleString('fa-IR')} تومان</span>
                        <span className="text-xs text-gray-500 line-through">{(course.originalPrice || 0).toLocaleString('fa-IR')}</span>
                      </>
                    ) : (
                      <span className="font-bold text-white">{(course.price || 0).toLocaleString('fa-IR')} تومان</span>
                    )}
                  </div>
                  <Play className="w-4 h-4 text-gray-500 group-hover:text-crimson-400 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* List View */
        <motion.div className="space-y-3" variants={containerVariants}>
          {filtered.map(course => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              onClick={() => router.push(`/app/academy/courses/${course.slug}`)}
              className="group cursor-pointer rounded-2xl bg-gray-800/40 border border-gray-700/50 hover:border-crimson-500/30 p-4 flex items-center gap-4 transition-all duration-300"
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${course.color}22, ${course.color}44)` }}
              >
                <BookOpen className="w-6 h-6 opacity-50" style={{ color: course.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm group-hover:text-crimson-400 transition-colors truncate">{course.title}</h3>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${levelStyle[course.level] || ''}`}>
                    {course.level === 'beginner' ? 'مبتدی' : course.level === 'intermediate' ? 'متوسط' : 'پیشرفته'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{course.instructorName}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{course.rating?.toFixed(1) || '-'}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(course.studentsCount || 0).toLocaleString('fa-IR')}</span>
                  <span>{course.duration || '-'}</span>
                </div>
              </div>
              <div className="text-left flex-shrink-0">
                <div className="font-bold text-sm">{(course.price || 0).toLocaleString('fa-IR')} <span className="text-xs font-normal text-gray-500">تومان</span></div>
                {course.originalPrice && course.originalPrice > course.price && (
                  <div className="text-xs text-gray-500 line-through">{(course.originalPrice || 0).toLocaleString('fa-IR')} تومان</div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
