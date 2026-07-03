'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminSetupPage() {
  const router = useRouter()
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
        setMessage('ادمین با موفقیت تنظیم شد!')
      } else {
        setStatus('error')
        setMessage(data.error || 'خطا در تنظیم ادمین')
      }
    } catch {
      setStatus('error')
      setMessage('خطا در ارتباط با سرور')
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black">تنظیم مدیر سیستم</h1>
          <p className="text-gray-400 mt-2 text-sm">ایمیلی را وارد کنید که با آن ثبت‌نام کرده‌اید و هم‌اکنون با آن لاگین هستید.</p>
        </div>

        {status === 'success' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-emerald-400 mb-2">ادمین با موفقیت تنظیم شد</h2>
            <p className="text-gray-400 mb-6">اکنون می‌توانید وارد پنل ادمین شوید.</p>
            <button onClick={() => router.push('/admin')}
              className="px-6 py-3 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-medium transition-all"
            >ورود به پنل ادمین</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">ایمیل حساب مدیریت</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-crimson-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1.5">از حسابی که قبلاً ثبت‌نام کرده‌اید استفاده کنید.</p>
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
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> در حال تنظیم...</>
              ) : 'تنظیم به عنوان مدیر'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <button onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >بازگشت به صفحه اصلی</button>
        </div>
      </div>
    </div>
  )
}
