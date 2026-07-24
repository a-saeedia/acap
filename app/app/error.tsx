'use client'

import { useLang } from '@/components/lang-provider'

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  const { t, lang } = useLang()
  return (
    <div dir={lang === 'fa' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h1 className="text-xl font-black text-white mb-2">{t('common.error')}</h1>
        <p className="text-sm text-gray-400 mb-6">{error.message || t('common.error.desc')}</p>
        <button onClick={reset}
          className="px-6 py-3 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-medium transition-colors"
        >{t('common.retry')}</button>
      </div>
    </div>
  )
}
