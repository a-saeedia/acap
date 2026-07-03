import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'وبلاگ آموزشی A|CAP — مقالات مدیریت سرمایه و تحلیل بازار',
  description: 'جدیدترین مقالات آموزشی در زمینه مدیریت سرمایه، تحلیل بازارهای مالی، شخصیت‌شناسی سرمایه‌گذاری، و آموزش بورس، طلا، ارز و رمز ارزها.',
  alternates: { canonical: 'https://a-cap.xyz/blog' },
  openGraph: {
    title: 'وبلاگ آموزشی A|CAP | مقالات مدیریت سرمایه',
    description: 'جدیدترین مقالات آموزشی در زمینه مدیریت سرمایه، تحلیل بازارهای مالی و شخصیت‌شناسی سرمایه‌گذاری.',
    url: 'https://a-cap.xyz/blog',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'وبلاگ آموزشی A|CAP | مقالات مدیریت سرمایه',
    description: 'جدیدترین مقالات آموزشی در زمینه مدیریت سرمایه، تحلیل بازارهای مالی و شخصیت‌شناسی سرمایه‌گذاری.',
    images: ['/og.png'],
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
