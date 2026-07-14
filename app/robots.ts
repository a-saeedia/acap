import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin', '/admin-setup', '/app/', '/dashboard', '/tickets', '/reset-password', '/vc-proposal'] },
    ],
    sitemap: 'https://a-cap.xyz/sitemap.xml',
  }
}
