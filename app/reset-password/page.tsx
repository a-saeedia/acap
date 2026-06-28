'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleReset = async () => {
    if (!password || password.length < 8) { setError('رمز عبور باید حداقل ۸ کاراکتر باشد'); return }
    if (password !== confirm) { setError('رمز عبور با تکرار آن مطابقت ندارد'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
    } catch {
      setError('لینک منقضی شده یا نامعتبر است')
    }
    setLoading(false)
  }

  if (!token) return <p className="text-red-400">لینک نامعتبر است</p>
  if (done) return (
    <div className="text-center">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-xl font-bold mb-2">رمز عبور با موفقیت تغییر کرد</h2>
      <button onClick={() => router.push('/')} className="mt-4 btn-primary px-6 py-3 rounded-xl font-bold">ورود به حساب</button>
    </div>
  )

  return (
    <form onSubmit={e => { e.preventDefault(); handleReset() }} className="space-y-4">
      <h2 className="text-xl font-black text-center">تنظیم رمز عبور جدید</h2>
      <div className="relative">
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="رمز عبور جدید *" type={showPass ? 'text' : 'password'} autoComplete="new-password" className="input-field w-full pl-10" />
        <button type="button" onClick={() => setShowPass(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="تکرار رمز عبور *" type="password" autoComplete="new-password" className="input-field w-full" />
      {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">{error}</div>}
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        type="submit" disabled={loading}
        className="btn-primary w-full py-3 rounded-xl font-black text-base flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        تغییر رمز عبور
      </motion.button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm glass border border-border rounded-2xl p-6"
      >
        <Suspense fallback={<div>...</div>}>
          <ResetForm />
        </Suspense>
      </motion.div>
    </div>
  )
}
