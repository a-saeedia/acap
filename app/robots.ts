import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin', '/reset-password'] },
    ],
    sitemap: 'https://a-cap.xyz/sitemap.xml',
  }
}
