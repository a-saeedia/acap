'use client'

import Link from 'next/link'
import { useLang } from '@/components/lang-provider'

export default function NotFound() {
  const { t, lang } = useLang()
  return (
    <div dir={lang === 'fa' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-8xl font-black text-crimson-600/30 mb-4">{t('notfound.title')}</div>
        <h1 className="text-2xl font-bold mb-2">{t('notfound.subtitle')}</h1>
        <p className="text-gray-400 mb-8">{t('notfound.desc')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="px-6 py-3 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-medium transition-all">
            {t('notfound.home')}
          </Link>
          <Link href="/blog" className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-all">
            {t('notfound.blog')}
          </Link>
        </div>
      </div>
    </div>
  )
}
