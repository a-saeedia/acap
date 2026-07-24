'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/lang-provider'

export default function AdminSetupPage() {
  const router = useRouter()
  const { t, lang } = useLang()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/admin-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(t('setup.success.title'))
      } else {
        setStatus('error')
        setMessage(data.error || t('setup.error.generic'))
      }
    } catch {
      setStatus('error')
      setMessage(t('setup.error.server'))
    }
  }

  return (
    <div dir={lang === 'fa' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black">{t('setup.title')}</h1>
          <p className="text-gray-400 mt-2 text-sm">{t('setup.desc')}</p>
        </div>

        {status === 'success' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-emerald-400 mb-2">{t('setup.success.title')}</h2>
            <p className="text-gray-400 mb-6">{t('setup.success.desc')}</p>
            <button onClick={() => router.push('/admin')}
              className="px-6 py-3 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-medium transition-all"
            >{t('setup.go.admin')}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('setup.email.label')}</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder={t('setup.email.placeholder')}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-crimson-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1.5">{t('setup.email.hint')}</p>
            </div>

            {message && (
              <div className={`text-sm p-3 rounded-xl ${status === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}`}>
                {message}
              </div>
            )}

            <button type="submit" disabled={status === 'loading'}
              className="w-full py-3 rounded-xl bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 text-white font-medium transition-all flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('setup.loading')}</>
              ) : t('setup.submit')}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <button onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >{t('setup.back')}</button>
        </div>
      </div>
    </div>
  )
}
