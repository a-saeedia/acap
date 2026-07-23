import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { SelfDestructGuard } from '@/components/self-destruct-guard'
import { Tracker } from '@/components/tracker'

const SITE_NAME = 'A | CAP'
const SITE_DESCRIPTION = 'پلتفرم هوشمند مدیریت سرمایه بر اساس شخصیت مالی در ایران. تحلیل بازار طلا، ارز، رمز ارز و بورس با هوش مصنوعی.'
const BASE_URL = 'https://a-cap.xyz'

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — دستیار هوشمند مدیریت سرمایه`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(BASE_URL),
  alternates: { canonical: BASE_URL },
  keywords: ['مدیریت سرمایه', 'سرمایه‌گذاری', 'تحلیل بازار', 'قیمت طلا', 'قیمت دلار', 'قیمت بیت‌کوین', 'شخصیت مالی', 'پرتفوی', 'بورس ایران', 'TGJU', 'A|CAP'],
  authors: { name: 'A|CAP' },
  openGraph: {
    title: `${SITE_NAME} — مدیریت سرمایه هوشمند`,
    description: SITE_DESCRIPTION,
    url: BASE_URL,
    siteName: SITE_NAME,
    locale: 'fa_IR',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — مدیریت سرمایه هوشمند`,
    description: SITE_DESCRIPTION,
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
  verification: { google: '' }, // Set this after verifying in Google Search Console
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#040D21' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preload" href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" as="style" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'A|CAP',
              url: BASE_URL,
              logo: `${BASE_URL}/logo.png`,
              description: SITE_DESCRIPTION,
              foundingDate: '2025',
              knowsLanguage: 'fa',
              areaServed: 'IR',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE_NAME,
              url: BASE_URL,
              inLanguage: 'fa-IR',
              description: SITE_DESCRIPTION,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${BASE_URL}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('acap-theme');if(t==='light')document.documentElement.classList.add('light')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased" style={{ fontFamily: 'Vazirmatn, sans-serif' }}>
        <ThemeProvider><ErrorBoundary><SelfDestructGuard><Tracker>{children}</Tracker></SelfDestructGuard></ErrorBoundary></ThemeProvider>
      </body>
    </html>
  )
}
