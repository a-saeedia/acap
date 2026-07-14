'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Clock, User, Calendar, Eye, Hash, ArrowLeft, Loader2, Share2, Star, Sparkles, Quote, BookMarked, Layers, Lightbulb, AlertTriangle, CheckCircle, Zap, TrendingUp, Brain, Shield, DollarSign, BarChart3 } from 'lucide-react'
import { getArticleImage } from '@/lib/article-images'

const crimson = '#A51C30'

function formatDate(dateStr: string | Date) {
  try {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateStr))
  } catch { return String(dateStr) }
}

function renderContent(text: string | null | undefined) {
  if (!text) return <p className="text-gray-400 text-center py-8">بدون محتوا</p>
  const hasHtml = /<\/?[a-z][a-z0-9]*[^>]*>/i.test(text)
  if (hasHtml) {
    return <div className="text-gray-200 leading-relaxed space-y-4 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:border-r-4 [&_h2]:border-[#A51C30] [&_h2]:pr-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-gray-200 [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-justify [&_li]:text-gray-200 [&_li]:mr-4 [&_ul]:space-y-2 [&_ul]:my-4 [&_img]:rounded-2xl [&_img]:my-6 [&_img]:shadow-lg [&_blockquote]:border-r-4 [&_blockquote]:border-[#A51C30] [&_blockquote]:pr-4 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:text-gray-300 [&_blockquote]:italic [&_blockquote]:bg-[#A51C30]/5 [&_blockquote]:rounded-l-xl [&_a]:text-blue-400 [&_a]:underline [&_a:hover]:text-blue-300 [&_code]:bg-gray-800 [&_code]:px-2 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_pre]:bg-gray-900 [&_pre]:p-4 [&_pre]:rounded-2xl [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-gray-800 [&_pre]:my-4 [&_pre]:text-sm [&_hr]:border-gray-800 [&_hr]:my-8" dangerouslySetInnerHTML={{ __html: text }} />
  }
  const lines = text.split('\n')
  const elements: React.ReactElement[] = []
  let listItems: string[] = []
  let listKey = 0
  let key = 0
  let inSection = false
  let sectionKey = 0
  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${listKey++}`} className="space-y-2 my-4 pr-5">
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-200 leading-relaxed list-disc marker:text-[#A51C30] flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A51C30] mt-2 shrink-0" />
              <span>{item}</span>
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
      if (elements.length > 0 && !inSection) {
        elements.push(<div key={`divider-${sectionKey++}`} className="h-px bg-gradient-to-l from-[#A51C30]/30 via-transparent to-transparent my-8" />)
      }
      elements.push(
        <h2 key={`h2-${key++}`} className="text-2xl font-black text-white mt-8 mb-4 border-r-4 border-[#A51C30] pr-4">
          {trimmed.slice(3)}
        </h2>
      )
      inSection = true
    } else if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.slice(2))
    } else if (trimmed.startsWith('### ')) {
      flushList()
      elements.push(
        <h3 key={`h3-${key++}`} className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-sm bg-[#A51C30] shrink-0" />
          {trimmed.slice(4)}
        </h3>
      )
    } else {
      flushList()
      elements.push(
        <p key={`p-${key++}`} className="text-gray-200 leading-relaxed mb-4 text-justify">
          {trimmed}
        </p>
      )
    }
  }
  flushList()
  if (elements.length === 0 && text.trim()) {
    return <p className="text-gray-200 leading-relaxed mb-4">{text}</p>
  }
  return elements.length > 0 ? elements : <p className="text-gray-400 text-center py-8">بدون محتوا</p>
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function ArticleClient({ article, category }: { article: any; category: any }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const tags: string[] = (() => { try { return Array.isArray(article.tags) ? article.tags : typeof article.tags === 'string' ? JSON.parse(article.tags) : [] } catch { return [] } })()

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

  const breadcrumbItems = [
    { position: 1, name: 'خانه', url: 'https://a-cap.xyz' },
    { position: 2, name: 'وبلاگ', url: 'https://a-cap.xyz/blog' },
    ...(category ? [{ position: 3, name: category.name, url: `https://a-cap.xyz/blog?cat=${category.slug}` }] : []),
    { position: category ? 4 : 3, name: article.title, url: `https://a-cap.xyz/blog/${article.slug}` },
  ]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.url,
    })),
  }

  const catColor = category?.color || crimson

  return (
    <motion.div className="min-h-screen bg-gray-950 text-white" dir="rtl" variants={containerVariants} initial="hidden" animate="visible">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero Banner */}
      <motion.div variants={itemVariants} className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border-b border-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#A51C30]/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl" style={{ backgroundColor: `${catColor}08` }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ backgroundColor: `${catColor}05` }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">خانه</Link>
            <span className="text-gray-600">/</span>
            <Link href="/blog" className="hover:text-white transition-colors">وبلاگ</Link>
            {category && <><span className="text-gray-600">/</span><span style={{ color: catColor }}>{category.name}</span></>}
            <span className="text-gray-600">/</span>
            <span className="text-white truncate max-w-[200px]">{article.title}</span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Article Header */}
        <motion.div variants={itemVariants} className="relative mb-8">
          <div className="absolute -top-4 -right-4 text-6xl opacity-5 select-none" style={{ color: catColor }}>{'"'}</div>
          {category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: `${catColor}15`, color: catColor, borderColor: `${catColor}30`, borderWidth: 1 }}
            >
              <BookMarked className="w-3.5 h-3.5" />
              {category.name}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 bg-gradient-to-l from-white via-white to-gray-300 bg-clip-text text-transparent">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${catColor}, ${catColor}aa)` }}>
                {article.author?.charAt(0) ?? '?'}
              </div>
              <div>
                <div className="text-white font-medium text-sm">{article.author}</div>
                {article.authorRole && <div className="text-xs text-gray-500">{article.authorRole}</div>}
              </div>
            </div>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(article.publishedAt)}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> زمان مطالعه: {article.readingTime} دقیقه</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {(article.views ?? 0).toLocaleString('fa-IR')} بازدید</span>
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.div variants={itemVariants}
          className="rounded-3xl h-64 md:h-80 bg-cover bg-center relative overflow-hidden mb-10 shadow-2xl"
          style={{ backgroundImage: `url(${getArticleImage(article.title, catColor)})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <Sparkles className="w-3.5 h-3.5" style={{ color: catColor }} />
            <span className="text-xs text-white/80">مقاله آموزشی</span>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants} className="prose prose-invert max-w-none mb-12 relative">
          <div className="absolute -top-8 -left-8 text-6xl opacity-5 select-none rotate-180" style={{ color: catColor }}>{'"'}</div>
          {renderContent(article.content)}
        </motion.div>

        {/* Tags */}
        {tags.length > 0 && (
          <motion.div variants={itemVariants} className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-4 h-4" style={{ color: catColor }} />
              <span className="text-sm font-medium text-gray-300">برچسب‌ها:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:border-[#A51C30]/30 transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Share */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-12 p-5 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50">
          <Share2 className="w-5 h-5" style={{ color: catColor }} />
          <span className="text-sm font-medium ml-2" style={{ color: catColor }}>اشتراک‌گذاری:</span>
          <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 hover:text-white transition-all border border-gray-700">
            {copied ? 'کپی شد!' : 'کپی لینک'}
          </button>
          <button onClick={handleShareTelegram} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-sm text-blue-400 hover:text-blue-300 transition-all border border-blue-500/20">
            <Zap className="w-3.5 h-3.5" /> تلگرام
          </button>
          <button onClick={handleShareTwitter} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sm text-sky-400 hover:text-sky-300 transition-all border border-sky-500/20">
            توییتر
          </button>
        </motion.div>

        {/* Back */}
        <motion.div variants={itemVariants} className="text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-l from-[#8B1A2A] to-[#6B1420] hover:from-[#A51C30] hover:to-[#8B1A2A] text-white font-medium transition-all shadow-lg shadow-[#4A0D16]/30">
            <ArrowLeft className="w-4 h-4" /> بازگشت به وبلاگ
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
