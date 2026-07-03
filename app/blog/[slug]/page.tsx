import { getArticleBySlug, getCategoryById } from '@/app/actions/academy'
import type { Metadata } from 'next'
import { ArticleClient } from './article-client'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const article = await getArticleBySlug(slug) as any
    if (!article) return { title: 'مقاله یافت نشد' }
    const cat = article.categoryId ? await getCategoryById(article.categoryId) as any : null
    return {
      title: article.title,
      description: article.excerpt,
      alternates: { canonical: `https://a-cap.xyz/blog/${slug}` },
      openGraph: {
        title: article.title,
        description: article.excerpt,
        url: `https://a-cap.xyz/blog/${slug}`,
        type: 'article',
        publishedTime: article.publishedAt?.toISOString?.() || article.publishedAt,
        authors: [article.author],
        images: [{ url: `/api/og?title=${encodeURIComponent(article.title)}&color=${encodeURIComponent(cat?.color || '#A51C30')}`, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt,
        images: [`/api/og?title=${encodeURIComponent(article.title)}&color=${encodeURIComponent(cat?.color || '#A51C30')}`],
      },
      other: {
        'article:published_time': article.publishedAt?.toISOString?.() || article.publishedAt,
        'article:author': article.author,
      },
    }
  } catch {
    return { title: 'مقاله' }
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  let article: any = null
  let category: any = null
  try {
    article = await getArticleBySlug(slug)
    if (article?.categoryId) {
      category = await getCategoryById(article.categoryId)
    }
  } catch { console.error('ArticlePage: fetch failed', slug) } 

  if (!article) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-600">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">مقاله یافت نشد</h1>
          <p className="text-gray-400 mb-6">مقاله مورد نظر وجود ندارد یا حذف شده است.</p>
          <a href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-medium transition-all">بازگشت به وبلاگ</a>
        </div>
      </div>
    )
  }

  const articleUrl = `https://a-cap.xyz/blog/${slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: `/api/og?title=${encodeURIComponent(article.title)}&color=${encodeURIComponent(category?.color || '#A51C30')}`,
    datePublished: article.publishedAt?.toISOString?.() || article.publishedAt,
    author: { '@type': 'Person', name: article.author },
    publisher: { '@type': 'Organization', name: 'A|CAP', logo: { '@type': 'ImageObject', url: 'https://a-cap.xyz/og.png' } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleClient article={article} category={category} />
    </>
  )
}
