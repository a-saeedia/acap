import type { MetadataRoute } from 'next'
import { getArticles } from '@/app/actions/academy'

const BASE = 'https://a-cap.xyz'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/education`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/app/prices`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  let articleRoutes: MetadataRoute.Sitemap = []
  try {
    const articles = await getArticles() as any[]
    articleRoutes = articles.map(a => ({
      url: `${BASE}/blog/${a.slug}`,
      lastModified: a.updatedAt || a.publishedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {}

  return [...staticRoutes, ...articleRoutes]
}
