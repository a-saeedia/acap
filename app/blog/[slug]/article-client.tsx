'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Clock, User, Calendar, Eye, Hash, ArrowLeft, Loader2, Share2, Star } from 'lucide-react'
import { getArticleImage } from '@/lib/article-images'

const crimson = '#A51C30'

function formatDate(dateStr: string | Date) {
  try {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateStr))
  } catch { return String(dateStr) }
}

function markdownToHtml(text: string) {
  const lines = text.split('\n')
  const html: string[] = []
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (inList) { html.push('</ul>'); inList = false }
      continue
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push(`<h2 class="text-2xl font-bold text-white mt-8 mb-4">${trimmed.slice(3)}</h2>`)
    } else if (trimmed.startsWith('### ')) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push(`<h3 class="text-xl font-bold text-white mt-6 mb-3">${trimmed.slice(4)}</h3>`)
    } else if (trimmed.startsWith('- ')) {
      if (!inList) { html.push('<ul class="space-y-2 my-4 pr-5 list-disc marker:text-crimson-400">'); inList = true }
      html.push(`<li class="text-gray-300 leading-relaxed">${trimmed.slice(2)}</li>`)
    } else {
      if (inList) { html.push('</ul>'); inList = false }
      html.push(`<p class="text-gray-300 leading-relaxed mb-4 text-justify">${trimmed}</p>`)
    }
  }
  if (inList) html.push('</ul>')
  return html.join('\n')
}

function renderContent(text: string) {
  const hasHtml = /<[a-z][\s>]/i.test(text)
  if (hasHtml) {
    return <div className="article-content" dangerouslySetInnerHTML={{ __html: text }} />
  }
  const html = markdownToHtml(text)
  return <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />
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

  const tags: string[] = (Array.isArray(article.tags) ? article.tags : typeof article.tags === 'string' ? JSON.parse(article.tags) : [])

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

  return (
    <motion.div className="min-h-screen bg-gray-950 text-white" dir="rtl" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">خانه</Link>
            <span className="text-gray-600">/</span>
            <Link href="/blog" className="hover:text-white transition-colors">وبلاگ</Link>
            {category && <><span className="text-gray-600">/</span><span style={{ color: category.color || crimson }}>{category.name}</span></>}
            <span className="text-gray-600">/</span>
            <span className="text-white truncate max-w-[200px]">{article.title}</span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <motion.div variants={itemVariants} className="mb-8">
          {category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: `${category.color || crimson}15`, color: category.color || crimson, borderColor: `${category.color || crimson}30`, borderWidth: 1 }}
            >{category.name}</span>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-crimson-500 to-crimson-800 flex items-center justify-center text-sm font-bold text-white">{article.author.charAt(0)}</div>
              <div>
                <div className="text-white font-medium text-sm">{article.author}</div>
                {article.authorRole && <div className="text-xs text-gray-500">{article.authorRole}</div>}
              </div>
            </div>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(article.publishedAt)}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> زمان مطالعه: {article.readingTime} دقیقه</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {article.views.toLocaleString('fa-IR')} بازدید</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}
          className="rounded-3xl h-64 md:h-80 bg-cover bg-center relative overflow-hidden mb-10"
          style={{ backgroundImage: `url(${getArticleImage(article.title, category?.color || crimson)})` }}
        />

        <motion.div variants={itemVariants} className="prose prose-invert max-w-none mb-12">
          {renderContent(article.content)}
        </motion.div>

        {tags.length > 0 && (
          <motion.div variants={itemVariants} className="mb-10">
            <div className="flex items-center gap-2 mb-3"><Hash className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-400 font-medium">برچسب‌ها:</span></div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-sm text-gray-300">{tag}</span>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-12 p-4 rounded-2xl bg-gray-800/40 border border-gray-700/50">
          <Share2 className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-400 font-medium ml-2">اشتراک‌گذاری:</span>
          <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 hover:text-white transition-all border border-gray-700">
            {copied ? 'کپی شد!' : 'کپی لینک'}
          </button>
          <button onClick={handleShareTelegram} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-sm text-blue-400 hover:text-blue-300 transition-all border border-blue-500/20">تلگرام</button>
          <button onClick={handleShareTwitter} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sm text-sky-400 hover:text-sky-300 transition-all border border-sky-500/20">توییتر</button>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-all border border-gray-700">
            <ArrowLeft className="w-4 h-4" /> بازگشت به وبلاگ
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
