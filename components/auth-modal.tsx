'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { signIn, signUp } from '@/lib/auth-client'
import { saveProfile } from '@/app/actions/profile'
import { useRouter } from 'next/navigation'

type Mode = 'sign-in' | 'sign-up' | 'forgot-password'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  initialMode?: 'sign-in' | 'sign-up'
}

export function AuthModal({ open, onClose, initialMode = 'sign-up' }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [sent, setSent] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const reset = () => {
    setError(''); setLoading(false); setSent(false)
    setName(''); setPhone(''); setEmail(''); setPassword('')
  }

  const switchMode = (m: Mode) => { setMode(m); setError(''); setSent(false) }

  const validateName = (n: string) => n.trim().length >= 2
  const validatePhone = (p: string) => /^0\d{10}$/.test(p) || p === ''
  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSignIn = async () => {
    if (!email || !password) { setError('لطفاً ایمیل و رمز عبور را وارد کنید'); return }
    setLoading(true); setError('')
    const { error } = await signIn.email({ email, password })
    if (error) {
      setError('ایمیل یا رمز عبور اشتباه است')
      setLoading(false)
      return
    }
    reset(); onClose()
    router.push('/dashboard')
  }

  const handleSignUp = async () => {
    if (!name || !email || !password) { setError('لطفاً نام، ایمیل و رمز عبور را وارد کنید'); return }
    if (!validateName(name)) { setError('نام باید حداقل ۲ کاراکتر باشد'); return }
    if (password.length < 8) { setError('رمز عبور باید حداقل ۸ کاراکتر باشد'); return }
    if (!validateEmail(email)) { setError('ایمیل معتبر وارد کنید'); return }
    if (!phone) { setError('شماره موبایل الزامی است'); return }
    if (!validatePhone(phone)) { setError('شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد'); return }
    setLoading(true); setError('')
    const { error } = await signUp.email({ email, password, name: name.trim() })
    if (error) {
      setError(error.message?.includes('unique') ? 'این ایمیل قبلاً ثبت‌نام کرده' : 'خطایی رخ داد، دوباره تلاش کنید')
      setLoading(false)
      return
    }
    await saveProfile({ phone }).catch(() => {})
    reset(); onClose()
    router.push('/dashboard')
  }

  const handleForgotPassword = async () => {
    if (!email || !validateEmail(email)) { setError('لطفاً یک ایمیل معتبر وارد کنید'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'خطایی رخ داد')
      setSent(true)
    } catch (e: any) {
      setError(e.message || 'خطایی رخ داد، دوباره تلاش کنید')
    }
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-md glass border border-border rounded-2xl p-6 shadow-2xl"
            dir="rtl"
          >
            <button onClick={onClose} className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-all">
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <span className="text-primary font-black text-2xl" style={{ fontFamily: 'serif' }}>A</span>
              </div>
            </div>

            {mode === 'forgot-password' ? (
              <div className="space-y-3">
                <button onClick={() => switchMode('sign-in')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                  <ArrowRight className="w-3 h-3" /> بازگشت به ورود
                </button>
                <h2 className="text-lg font-black text-center">بازیابی رمز عبور</h2>
                <p className="text-sm text-muted-foreground text-center">ایمیل خود را وارد کنید، لینک بازیابی برای شما ارسال می‌شود</p>
                {sent ? (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3">📧</div>
                    <p className="text-emerald-400 font-semibold">ایمیل بازیابی ارسال شد</p>
                    <p className="text-sm text-muted-foreground mt-1">لطفاً صندوق ورودی خود را بررسی کنید</p>
                    <button onClick={() => switchMode('sign-in')} className="mt-4 text-primary text-sm underline">
                      بازگشت به ورود
                    </button>
                  </div>
                ) : (
                  <>
                    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="ایمیل *" type="email" className="input-field w-full" />
                    {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">{error}</div>}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleForgotPassword} disabled={loading}
                      className="btn-primary w-full py-3 rounded-xl font-black text-base flex items-center justify-center gap-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      ارسال لینک بازیابی
                    </motion.button>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="flex gap-1 bg-muted/40 rounded-xl p-1 mb-5">
                  {(['sign-up', 'sign-in'] as const).map(m => (
                    <button key={m} onClick={() => switchMode(m)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === m ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {m === 'sign-up' ? 'ثبت‌نام' : 'ورود'}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {mode === 'sign-up' && (
                    <>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="نام و نام خانوادگی *" className="input-field w-full" />
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="شماره موبایل *" type="tel" className="input-field w-full" />
                      {phone && !validatePhone(phone) && <p className="text-xs text-red-400">شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد</p>}
                    </>
                  )}
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="ایمیل *" type="email" className="input-field w-full" />
                  <div className="relative">
                    <input value={password} onChange={e => setPassword(e.target.value)} placeholder="رمز عبور *" type={showPass ? 'text' : 'password'} className="input-field w-full pl-10" />
                    <button onClick={() => setShowPass(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">{error}</div>}

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={mode === 'sign-in' ? handleSignIn : handleSignUp} disabled={loading}
                    className="btn-primary w-full py-3 rounded-xl font-black text-base flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {mode === 'sign-in' ? 'ورود به حساب' : 'ایجاد حساب رایگان'}
                  </motion.button>

                  {mode === 'sign-in' && (
                    <button onClick={() => switchMode('forgot-password')} className="block w-full text-center text-sm text-primary/80 hover:text-primary underline underline-offset-2">
                      فراموشی رمز عبور؟
                    </button>
                  )}

                  <p className="text-center text-xs text-muted-foreground pt-1">
                    اطلاعات شما کاملاً نزد ما محفوظ و رمزنگاری‌شده است 🔒
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
