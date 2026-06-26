import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'A | CAP — اولین دستیار مدیریت سرمایه بر اساس شخصیت مالی',
  description:
    'A | CAP پلتفرم هوشمند مدیریت سرمایه و تحلیل بازارهای مالی. با شناخت شخصیت مالی خود، سرمایه‌گذاری بهتری داشته باشید.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
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
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: 'Vazirmatn, sans-serif' }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
