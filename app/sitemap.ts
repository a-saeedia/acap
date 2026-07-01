import type { MetadataRoute } from 'next'

const BASE = 'https://a-cap.xyz'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/education`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/app`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/app/prices`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE}/app/signals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/app/assets`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${BASE}/app/personal`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/dashboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.5 },
    { url: `${BASE}/acap-plus`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE}/tickets`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.3 },
  ]
}
