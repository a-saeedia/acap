'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen, Clock, User, ChevronLeft, Calendar, Eye, Hash,
  ArrowLeft, Loader2, Share2, Sparkles, Star
} from 'lucide-react'
import { getArticleBySlug, getArticles, getCategoryById } from '@/app/actions/academy'

const crimson = '#A51C30'
const gold = '#D4A843'

interface Article {
  id: string; title: string; slug: string; excerpt: string; content: string;
  categoryId: string | null; author: string; authorRole: string | null;
  image: string | null; tags: unknown; readingTime: number;
  isFeatured: boolean; views: number; publishedAt: string;
}

interface Category {
  id: string; name: string; slug: string; description: string | null;
  color: string | null; icon: string | null;
}

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
    }).format(new Date(dateStr))
  } catch { return dateStr }
}

function renderContent(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactElement[] = []
  let listItems: string[] = []
  let listKey = 0
  let key = 0

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${listKey++}`} className="space-y-2 my-4 pr-5">
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-300 leading-relaxed list-disc marker:text-crimson-400">
              {item}
            </li>
          ))}
        </ul>
      )
      listItems = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { flushList(); continue }
    if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(
        <h2 key={`h2-${key++}`} className="text-2xl font-bold text-white mt-8 mb-4">
          {trimmed.slice(3)}
        </h2>
      )
    } else if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.slice(2))
    } else if (trimmed.startsWith('### ')) {
      flushList()
      elements.push(
        <h3 key={`h3-${key++}`} className="text-xl font-bold text-white mt-6 mb-3">
          {trimmed.slice(4)}
        </h3>
      )
    } else {
      flushList()
      elements.push(
        <p key={`p-${key++}`} className="text-gray-300 leading-relaxed mb-4 text-justify">
          {trimmed}
        </p>
      )
    }
  }
  flushList()
  return elements
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [related, setRelated] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const slug = params.slug as string
        const art = await getArticleBySlug(slug)
        if (!art) { setLoading(false); return }
        setArticle(art as any)

        if (art.categoryId) {
          const cat = await getCategoryById(art.categoryId)
          if (cat) setCategory(cat as any)

          const relatedArts = await getArticles(art.categoryId, 1, 4)
          setRelated((relatedArts as any[]).filter((a: any) => a.id !== art.id).slice(0, 3))
        }
      } catch { /* ignore */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.slug])

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShareTelegram() {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article?.title || '')}`, '_blank')
  }

  function handleShareTwitter() {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article?.title || '')}`, '_blank')
  }

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>در حال بارگذاری مقاله...</span>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h1 className="text-2xl font-bold mb-2">مقاله یافت نشد</h1>
          <p className="text-gray-400 mb-6">مقاله مورد نظر شما وجود ندارد یا حذف شده است.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> بازگشت به وبلاگ
          </Link>
        </div>
      </div>
    )
  }

  const tags: string[] = (Array.isArray(article.tags) ? article.tags : typeof article.tags === 'string' ? JSON.parse(article.tags) : [])

  return (
    <motion.div
      className="min-h-screen bg-gray-950 text-white"
      dir="rtl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Breadcrumb */}
      <motion.div
        variants={itemVariants}
        className="border-b border-gray-800 bg-gray-900/50"
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">خانه</Link>
            <span className="text-gray-600">/</span>
            <Link href="/blog" className="hover:text-white transition-colors">وبلاگ</Link>
            {category && (
              <>
                <span className="text-gray-600">/</span>
                <span style={{ color: category.color || crimson }}>{category.name}</span>
              </>
            )}
            <span className="text-gray-600">/</span>
            <span className="text-white truncate max-w-[200px]">{article.title}</span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Article Header */}
        <motion.div variants={itemVariants} className="mb-8">
          {category && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-4"
              style={{
                backgroundColor: `${category.color || crimson}15`,
                color: category.color || crimson,
                borderColor: `${category.color || crimson}30`,
                borderWidth: 1,
              }}
            >
              {category.name}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-crimson-500 to-crimson-800 flex items-center justify-center text-sm font-bold text-white">
                {article.author.charAt(0)}
              </div>
              <div>
                <div className="text-white font-medium text-sm">{article.author}</div>
                {article.authorRole && (
                  <div className="text-xs text-gray-500">{article.authorRole}</div>
                )}
              </div>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {formatDate(article.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> زمان مطالعه: {article.readingTime} دقیقه
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" /> {article.views.toLocaleString('fa-IR')} بازدید
            </span>
          </div>
        </motion.div>

        {/* Featured Image Placeholder */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl h-64 md:h-80 flex items-center justify-center relative overflow-hidden mb-10"
          style={{
            background: `linear-gradient(135deg, ${category?.color || crimson}22, ${category?.color || crimson}44)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{ background: `radial-gradient(circle at 50% 50%, ${category?.color || crimson}, transparent 70%)` }}
          />
          <BookOpen className="w-20 h-20 opacity-25" style={{ color: category?.color || crimson }} />
        </motion.div>

        {/* Article Content */}
        <motion.div
          variants={itemVariants}
          className="prose prose-invert max-w-none mb-12"
        >
          {renderContent(article.content)}
        </motion.div>

        {/* Tags */}
        {tags.length > 0 && (
          <motion.div variants={itemVariants} className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400 font-medium">برچسب‌ها:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-sm text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Share Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 mb-12 p-4 rounded-2xl bg-gray-800/40 border border-gray-700/50"
        >
          <Share2 className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-400 font-medium ml-2">اشتراک‌گذاری:</span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 hover:text-white transition-all border border-gray-700"
          >
            {copied ? 'کپی شد!' : 'کپی لینک'}
          </button>
          <button
            onClick={handleShareTelegram}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-sm text-blue-400 hover:text-blue-300 transition-all border border-blue-500/20"
          >
            تلگرام
          </button>
          <button
            onClick={handleShareTwitter}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sm text-sky-400 hover:text-sky-300 transition-all border border-sky-500/20"
          >
            توییتر
          </button>
        </motion.div>

        {/* Related Articles */}
        {related.length > 0 && (
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-crimson-400" />
              <h2 className="text-2xl font-bold">مقالات مرتبط</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {related.map((rel, i) => {
                const relCat = rel.categoryId ? category : null
                return (
                  <motion.div
                    key={rel.id}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    onClick={() => { setLoading(true); router.push(`/blog/${rel.slug}`) }}
                    className="group cursor-pointer rounded-2xl bg-gray-800/40 border border-gray-700/50 hover:border-crimson-500/30 overflow-hidden transition-all duration-300"
                  >
                    <div
                      className="h-28 flex items-center justify-center relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${relCat?.color || crimson}22, ${relCat?.color || crimson}44)` }}
                    >
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{ background: `radial-gradient(circle at 50% 50%, ${relCat?.color || crimson}, transparent 70%)` }}
                      />
                      <BookOpen className="w-8 h-8 opacity-30 group-hover:opacity-50 transition-opacity" style={{ color: relCat?.color || crimson }} />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-white group-hover:text-crimson-400 transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {rel.readingTime} دقیقه
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(rel.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Back to Blog */}
        <motion.div variants={itemVariants} className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-all border border-gray-700"
          >
            <ArrowLeft className="w-4 h-4" /> بازگشت به وبلاگ
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
