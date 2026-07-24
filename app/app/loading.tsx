'use client'

import { useLang } from '@/components/lang-provider'

export default function AppLoading() {
  const { t, lang } = useLang()
  return (
    <div dir={lang === 'fa' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-crimson-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">{t('common.loading')}</span>
      </div>
    </div>
  )
}
