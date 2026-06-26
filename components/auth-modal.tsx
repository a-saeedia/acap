'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn, signUp } from '@/lib/auth-client'
import { saveProfile } from '@/app/actions/profile'
import { useRouter } from 'next/navigation'

const TERMS_SUMMARY = `با ثبت‌نام در A Capital، شما تأیید می‌کنید که اطلاعات واقعی وارد کرده‌اید و با قوانین و مقررات سرویس موافقت می‌کنید. اطلاعات شما نزد ما کاملاً محفوظ است.`

interface AuthModalProps {
  open: boolean
  onClose: () => void
  initialMode?: 'sign-in' | 'sign-up'
}

export function AuthModal({ open, onClose, initialMode = 'sign-up' }: AuthModalProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>(initialMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  // sign-up fields
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [capital, setCapital] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const reset = () => {
    setError(''); setLoading(false)
    setName(''); setLastName(''); setPhone(''); setAge(''); setCapital('')
    setEmail(''); setPassword(''); setAgreed(false)
  }

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
    if (!name || !lastName || !phone || !email || !password) { setError('لطفاً همه فیلدهای ضروری را پر کنید'); return }
    if (!agreed) { setError('برای ثبت‌نام باید با قوانین موافقت کنید'); return }
    if (password.length < 8) { setError('رمز عبور باید حداقل ۸ کاراکتر باشد'); return }
    setLoading(true); setError('')
    const { error } = await signUp.email({ email, password, name: `${name} ${lastName}` })
    if (error) {
      setError(error.message?.includes('unique') ? 'این ایمیل قبلاً ثبت‌نام کرده' : 'خطایی رخ داد، دوباره تلاش کنید')
      setLoading(false)
      return
    }
    await saveProfile({ phone, age: age ? parseInt(age) : undefined, investmentCapital: capital ? parseInt(capital) : undefined })
    reset(); onClose()
    router.push('/dashboard')
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
            {/* Close */}
            <button onClick={onClose} className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-all">
              <X className="w-4 h-4" />
            </button>

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <span className="text-primary font-black text-2xl" style={{ fontFamily: 'serif' }}>A</span>
              </div>
            </div>

            {/* Toggle */}
            <div className="flex gap-1 bg-muted/40 rounded-xl p-1 mb-5">
              {(['sign-up', 'sign-in'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === m ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {m === 'sign-up' ? 'ثبت‌نام' : 'ورود'}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {mode === 'sign-up' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="نام *" className="input-field" />
                    <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="نام خانوادگی *" className="input-field" />
                  </div>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="شماره موبایل *" type="tel" className="input-field w-full" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={age} onChange={e => setAge(e.target.value)} placeholder="سن" type="number" className="input-field" />
                    <input value={capital} onChange={e => setCapital(e.target.value)} placeholder="سرمایه (تومان)" type="number" className="input-field" />
                  </div>
                </>
              )}
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="ایمیل *" type="email" className="input-field w-full" />
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="رمز عبور *" type={showPass ? 'text' : 'password'} className="input-field w-full pl-10" />
                <button onClick={() => setShowPass(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {mode === 'sign-up' && (
                <div className="flex items-start gap-2 pt-1">
                  <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 accent-primary cursor-pointer" />
                  <label htmlFor="agree" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                    با{' '}
                    <button onClick={() => setShowTerms(true)} className="text-primary underline underline-offset-2">
                      قوانین و مقررات
                    </button>
                    {' '}موافقم
                  </label>
                </div>
              )}

              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={mode === 'sign-in' ? handleSignIn : handleSignUp}
                disabled={loading}
                className="btn-primary w-full py-3 rounded-xl font-black text-base flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'sign-in' ? 'ورود به حساب' : 'ایجاد حساب رایگان'}
              </motion.button>

              <p className="text-center text-xs text-muted-foreground pt-1">
                اطلاعات شما کاملاً نزد ما محفوظ و رمزنگاری‌شده است 🔒
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Terms modal */}
      {showTerms && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          onClick={() => setShowTerms(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 w-full max-w-lg glass border border-border rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
            dir="rtl"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowTerms(false)} className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-black text-foreground mb-4">قوانین و مقررات A Capital</h2>
            <TermsContent />
            <button onClick={() => { setAgreed(true); setShowTerms(false) }} className="btn-primary w-full py-3 rounded-xl font-bold mt-4">
              موافقم
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function TermsContent() {
  return (
    <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
      <p>کاربر گرامی A Capital، لطفاً قوانین زیر را با دقت مطالعه فرمایید:</p>
      <p><strong className="text-foreground">۱. مسئولیت سرمایه‌گذاری:</strong> تمام تحلیل‌ها و پیشنهادات A Capital جنبه آموزشی و اطلاع‌رسانی دارند و به عنوان توصیه سرمایه‌گذاری قطعی تلقی نمی‌شوند. تصمیم نهایی با شما است.</p>
      <p><strong className="text-foreground">۲. ریسک بازار:</strong> بازارهای مالی ذاتاً پرریسک هستند. هیچ سودی تضمین‌شده نیست. A Capital مسئولیت زیان‌های احتمالی ناشی از تصمیمات سرمایه‌گذاری را نمی‌پذیرد.</p>
      <p><strong className="text-foreground">۳. حفاظت از داده:</strong> اطلاعات شخصی شما نزد A Capital کاملاً محفوظ و رمزنگاری‌شده است و هرگز به اشخاص ثالث فروخته نمی‌شود.</p>
      <p><strong className="text-foreground">۴. اشتراک:</strong> خدمات اشتراکی طبق شرایط اعلام‌شده ارائه می‌گردد. امکان لغو اشتراک در هر زمان وجود دارد.</p>
      <p><strong className="text-foreground">۵. سفیران:</strong> کمیسیون سفیران طبق جدول اعلام‌شده محاسبه و پرداخت می‌شود. تقلب یا سوءاستفاده از سیستم منجر به مسدود شدن حساب خواهد شد.</p>
      <p><strong className="text-foreground">۶. بازگشت وجه:</strong> در صورت عدم رضایت، تا ۷ روز پس از خرید امکان بازگشت وجه کامل وجود دارد.</p>
      <p className="text-xs pt-2">با کلیک روی «موافقم» تأیید می‌کنید که قوانین فوق را خوانده و پذیرفته‌اید.</p>
    </div>
  )
}
