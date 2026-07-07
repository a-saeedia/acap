'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, TrendingUp, Shield, Target, Flame, Loader2 } from 'lucide-react'
import { saveQuizResult } from '@/app/actions/quiz'
import { useSession } from '@/lib/auth-client'
import { ensureReferralCode } from '@/app/actions/referral'

// ─── Question bank — 14 questions across 5 sections ───────────────────────
// Each option has: { text, risk, emotional, maturity }
// risk: ریسک‌پذیری (0–4), emotional: کنترل هیجان (0–4), maturity: بلوغ مالی (0–4)

const QUESTIONS = [
  // Section 1: وضعیت مالی
  {
    section: 'وضعیت مالی',
    q: 'اگر امروز ۱۰۰ میلیون تومان پول نقد داشته باشید، چه می‌کنید؟',
    opts: [
      { text: 'همه را سرمایه‌گذاری می‌کنم', risk: 4, emotional: 2, maturity: 3 },
      { text: 'بخش زیادی را سرمایه‌گذاری می‌کنم', risk: 3, emotional: 3, maturity: 3 },
      { text: 'بخشی سرمایه‌گذاری، بخشی نگه‌داری', risk: 2, emotional: 3, maturity: 4 },
      { text: 'بیشتر آن را نقد نگه می‌دارم', risk: 1, emotional: 3, maturity: 2 },
      { text: 'ترجیح می‌دهم در بانک بماند', risk: 0, emotional: 4, maturity: 1 },
    ],
  },
  {
    section: 'وضعیت مالی',
    q: 'منبع درآمد شما چقدر پایدار است؟',
    opts: [
      { text: 'کاملاً پایدار', risk: 4, emotional: 4, maturity: 4 },
      { text: 'نسبتاً پایدار', risk: 3, emotional: 3, maturity: 3 },
      { text: 'متوسط', risk: 2, emotional: 2, maturity: 2 },
      { text: 'ناپایدار', risk: 1, emotional: 1, maturity: 1 },
      { text: 'بسیار ناپایدار', risk: 0, emotional: 0, maturity: 0 },
    ],
  },
  {
    section: 'وضعیت مالی',
    q: 'اگر ۶ ماه درآمد نداشته باشید، وضعیت شما چگونه است؟',
    opts: [
      { text: 'هیچ مشکلی ندارم', risk: 4, emotional: 4, maturity: 4 },
      { text: 'به سختی مدیریت می‌کنم', risk: 3, emotional: 3, maturity: 3 },
      { text: 'بخشی از سرمایه را مصرف می‌کنم', risk: 2, emotional: 2, maturity: 2 },
      { text: 'دچار مشکل جدی می‌شوم', risk: 1, emotional: 1, maturity: 1 },
      { text: 'بحران مالی خواهم داشت', risk: 0, emotional: 0, maturity: 0 },
    ],
  },
  // Section 2: تحمل ریسک
  {
    section: 'تحمل ریسک',
    q: 'اگر سبد سرمایه‌گذاری شما در یک ماه ۱۰٪ افت کند، واکنش شما چیست؟',
    opts: [
      { text: 'خرید بیشتری انجام می‌دهم', risk: 4, emotional: 4, maturity: 3 },
      { text: 'نگهداری می‌کنم', risk: 3, emotional: 3, maturity: 3 },
      { text: 'کمی نگران می‌شوم ولی صبر می‌کنم', risk: 2, emotional: 2, maturity: 2 },
      { text: 'بخشی را می‌فروشم', risk: 1, emotional: 1, maturity: 1 },
      { text: 'سریع از بازار خارج می‌شوم', risk: 0, emotional: 0, maturity: 1 },
    ],
  },
  {
    section: 'تحمل ریسک',
    q: 'بیشترین ضرر قابل تحمل شما در یک سرمایه‌گذاری چقدر است؟',
    opts: [
      { text: 'بیش از ۳۰٪', risk: 4, emotional: 3, maturity: 3 },
      { text: '۳۰٪', risk: 3, emotional: 3, maturity: 3 },
      { text: '۲۰٪', risk: 2, emotional: 3, maturity: 2 },
      { text: '۱۰٪', risk: 1, emotional: 2, maturity: 2 },
      { text: '۵٪', risk: 0, emotional: 2, maturity: 1 },
    ],
  },
  {
    section: 'تحمل ریسک',
    q: 'کدام گزینه به دیدگاه شما نزدیک‌تر است؟',
    opts: [
      { text: 'سود بالا مهم‌تر از ریسک است', risk: 4, emotional: 1, maturity: 2 },
      { text: 'ریسک و بازده باید متعادل باشند', risk: 2, emotional: 3, maturity: 4 },
      { text: 'حفظ سرمایه از سود مهم‌تر است', risk: 0, emotional: 4, maturity: 3 },
    ],
  },
  // Section 3: رفتار روان‌شناختی
  {
    section: 'رفتار روان‌شناختی',
    q: 'وقتی دیگران از سودهای بزرگ در یک بازار صحبت می‌کنند، شما چه می‌کنید؟',
    opts: [
      { text: 'سریع وارد آن بازار می‌شوم', risk: 4, emotional: 0, maturity: 0 },
      { text: 'بررسی می‌کنم و تصمیم می‌گیرم', risk: 2, emotional: 3, maturity: 4 },
      { text: 'بی‌تفاوت هستم', risk: 1, emotional: 4, maturity: 3 },
      { text: 'محتاط‌تر از قبل می‌شوم', risk: 0, emotional: 4, maturity: 3 },
    ],
  },
  {
    section: 'رفتار روان‌شناختی',
    q: 'چند بار بر اساس احساسات (ترس یا هیجان) تصمیم مالی گرفته‌اید؟',
    opts: [
      { text: 'تقریباً همیشه', risk: 3, emotional: 0, maturity: 0 },
      { text: 'زیاد', risk: 2, emotional: 1, maturity: 1 },
      { text: 'گاهی', risk: 2, emotional: 2, maturity: 2 },
      { text: 'کم', risk: 1, emotional: 3, maturity: 3 },
      { text: 'تقریباً هیچ‌وقت', risk: 1, emotional: 4, maturity: 4 },
    ],
  },
  {
    section: 'رفتار روان‌شناختی',
    q: 'در بازار نزولی معمولاً چه موضعی می‌گیرید؟',
    opts: [
      { text: 'فرصت خرید می‌بینم', risk: 4, emotional: 4, maturity: 4 },
      { text: 'صبر می‌کنم تا وضع روشن شود', risk: 2, emotional: 3, maturity: 3 },
      { text: 'مضطرب می‌شوم', risk: 1, emotional: 1, maturity: 1 },
      { text: 'سرمایه را از بازار خارج می‌کنم', risk: 0, emotional: 0, maturity: 1 },
    ],
  },
  // Section 4: افق سرمایه‌گذاری
  {
    section: 'افق سرمایه‌گذاری',
    q: 'هدف اصلی شما از سرمایه‌گذاری چیست؟',
    opts: [
      { text: 'حفظ ارزش سرمایه در برابر تورم', risk: 0, emotional: 3, maturity: 3 },
      { text: 'درآمد ثابت و پایدار', risk: 1, emotional: 3, maturity: 3 },
      { text: 'رشد سرمایه در میان‌مدت', risk: 2, emotional: 3, maturity: 3 },
      { text: 'ثروت‌سازی بلندمدت', risk: 3, emotional: 3, maturity: 4 },
      { text: 'بازدهی حداکثری', risk: 4, emotional: 2, maturity: 3 },
    ],
  },
  {
    section: 'افق سرمایه‌گذاری',
    q: 'افق زمانی سرمایه‌گذاری شما چقدر است؟',
    opts: [
      { text: 'کمتر از ۶ ماه', risk: 1, emotional: 1, maturity: 1 },
      { text: '۶ تا ۱۲ ماه', risk: 2, emotional: 2, maturity: 2 },
      { text: '۱ تا ۳ سال', risk: 2, emotional: 3, maturity: 3 },
      { text: '۳ تا ۵ سال', risk: 3, emotional: 3, maturity: 4 },
      { text: 'بیش از ۵ سال', risk: 4, emotional: 4, maturity: 4 },
    ],
  },
  // Section 5: دانش مالی
  {
    section: 'دانش مالی',
    q: 'سطح دانش مالی خود را چگونه ارزیابی می‌کنید؟',
    opts: [
      { text: 'مبتدی', risk: 0, emotional: 2, maturity: 0 },
      { text: 'متوسط', risk: 1, emotional: 2, maturity: 2 },
      { text: 'خوب', risk: 2, emotional: 3, maturity: 3 },
      { text: 'پیشرفته', risk: 3, emotional: 3, maturity: 4 },
      { text: 'حرفه‌ای', risk: 4, emotional: 4, maturity: 4 },
    ],
  },
  {
    section: 'دانش مالی',
    q: 'در کدام بازارها تجربه فعال دارید؟',
    opts: [
      { text: 'هیچ تجربه‌ای ندارم', risk: 0, emotional: 2, maturity: 0 },
      { text: 'یک بازار (مثلاً بورس یا طلا)', risk: 1, emotional: 2, maturity: 2 },
      { text: 'دو یا سه بازار', risk: 2, emotional: 3, maturity: 3 },
      { text: 'چهار بازار یا بیشتر', risk: 3, emotional: 3, maturity: 4 },
      { text: 'تمام بازارها را دنبال می‌کنم', risk: 4, emotional: 3, maturity: 4 },
    ],
  },
  {
    section: 'دانش مالی',
    q: 'چند سال سابقه سرمایه‌گذاری دارید؟',
    opts: [
      { text: 'کمتر از ۱ سال', risk: 1, emotional: 2, maturity: 0 },
      { text: '۱ تا ۳ سال', risk: 2, emotional: 2, maturity: 2 },
      { text: '۳ تا ۵ سال', risk: 3, emotional: 3, maturity: 3 },
      { text: 'بیش از ۵ سال', risk: 3, emotional: 3, maturity: 4 },
    ],
  },
]

// ─── Scoring ───────────────────────────────────────────────────────────────
// risk: Q4,Q5,Q6,Q7 most weighted | emotional: Q7,Q8,Q9 | maturity: Q1,Q3,Q12,Q13
// Simple sum → normalize to 0–100

interface ScoreBreakdown { risk: number; emotional: number; maturity: number }

function calcScores(answers: Record<number, { risk: number; emotional: number; maturity: number }>): ScoreBreakdown {
  const totals = { risk: 0, emotional: 0, maturity: 0 }
  Object.values(answers).forEach(a => {
    totals.risk += a.risk
    totals.emotional += a.emotional
    totals.maturity += a.maturity
  })
  const n = QUESTIONS.length
  return {
    risk: Math.round((totals.risk / (n * 4)) * 100),
    emotional: Math.round((totals.emotional / (n * 4)) * 100),
    maturity: Math.round((totals.maturity / (n * 4)) * 100),
  }
}

// ─── Personality types (4) ────────────────────────────────────────────────
const PERSONALITY_TYPES = [
  {
    key: 'conservative', name: 'محافظ سرمایه', Icon: Shield, color: '#10B981',
    tagline: 'ثبات و امنیت، اولویت شماست',
    desc: 'شما ثبات مالی را بر سود کوتاه‌مدت ترجیح می‌دهید. حفظ اصل سرمایه برای‌تان مقدم است و بازارهای کم‌ریسک بهترین گزینه برای شما هستند.',
    alloc: [{ l: 'صندوق درآمد ثابت', p: 40, c: '#10B981' }, { l: 'طلا', p: 30, c: '#F59E0B' }, { l: 'سپرده بانکی', p: 20, c: '#6B7280' }, { l: 'بورس', p: 10, c: '#3B82F6' }],
    riskLabel: 'کم‌ریسک',
  },
  {
    key: 'balanced', name: 'سرمایه‌گذار متعادل', Icon: Target, color: '#3B82F6',
    tagline: 'تعادل هوشمندانه میان سود و امنیت',
    desc: 'شما رویکرد متعادلی دارید. به دنبال رشد معقول با ریسک قابل‌قبول هستید و ترکیب متنوعی از دارایی‌ها برای‌تان ایده‌آل است.',
    alloc: [{ l: 'طلا', p: 35, c: '#F59E0B' }, { l: 'صندوق درآمد ثابت', p: 30, c: '#10B981' }, { l: 'بورس', p: 25, c: '#3B82F6' }, { l: 'ارز دیجیتال', p: 10, c: '#8B5CF6' }],
    riskLabel: 'ریسک متوسط',
  },
  {
    key: 'growth', name: 'رشدگرا', Icon: TrendingUp, color: '#F97316',
    tagline: 'رشد سرمایه، هدف اصلی شماست',
    desc: 'شما نوسانات را می‌پذیرید و دیدگاه بلندمدت دارید. به تحلیل اعتماد می‌کنید و بازارهای رشدی با پتانسیل بالا را ترجیح می‌دهید.',
    alloc: [{ l: 'بورس', p: 35, c: '#3B82F6' }, { l: 'ارز دیجیتال', p: 25, c: '#8B5CF6' }, { l: 'طلا', p: 25, c: '#F59E0B' }, { l: 'صندوق', p: 15, c: '#10B981' }],
    riskLabel: 'ریسک بالا',
  },
  {
    key: 'aggressive', name: 'فرصت‌جو', Icon: Flame, color: '#EF4444',
    tagline: 'به دنبال معاملات فعال و سود حداکثری',
    desc: 'شما ریسک‌پذیری بالایی دارید و از فرصت‌های کوتاه‌مدت بهره می‌برید. تجربه و تسلط بر تحلیل تکنیکال برای موفقیت شما ضروری است.',
    alloc: [{ l: 'ارز دیجیتال', p: 40, c: '#8B5CF6' }, { l: 'بورس', p: 30, c: '#3B82F6' }, { l: 'فارکس', p: 20, c: '#EF4444' }, { l: 'طلا', p: 10, c: '#F59E0B' }],
    riskLabel: 'ریسک بسیار بالا',
  },
]

function getPersonality(scores: ScoreBreakdown) {
  const { risk, emotional, maturity } = scores
  const avg = (risk + emotional + maturity) / 3
  if (risk >= 68) return PERSONALITY_TYPES[3]
  if (risk >= 48 && avg >= 46) return PERSONALITY_TYPES[2]
  if (risk >= 28 && avg >= 32) return PERSONALITY_TYPES[1]
  return PERSONALITY_TYPES[0]
}

const TERMS_TEXT = `تحلیل‌ها و پیشنهادات A Capital جنبه آموزشی و اطلاع‌رسانی دارند و به عنوان توصیه سرمایه‌گذاری قطعی تلقی نمی‌شوند. بازارهای مالی ذاتاً پرریسک هستند و هیچ سودی تضمین‌شده نیست. اطلاعات شخصی شما نزد A Capital کاملاً محفوظ و رمزنگاری‌شده است.`

export function QuizSection({ onOpenAuth }: { onOpenAuth?: () => void }) {
  const [step, setStep] = useState<'intro' | 'auth-gate' | 'terms' | 'quiz' | 'result'>('intro')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, { risk: number; emotional: number; maturity: number }>>({})
  const [agreed, setAgreed] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<(typeof PERSONALITY_TYPES)[0] | null>(null)
  const [scores, setScores] = useState<ScoreBreakdown>({ risk: 0, emotional: 0, maturity: 0 })
  const [referralCode, setReferralCode] = useState('')
  const [copiedRef, setCopiedRef] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if (step === 'result' && resultRef.current) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
    }
  }, [step, result])

  const handleAnswer = (opt: { risk: number; emotional: number; maturity: number }, idx: number) => {
    setSelected(idx)
    setTimeout(() => {
      const next = { ...answers, [current]: opt }
      setAnswers(next)
      if (current < QUESTIONS.length - 1) {
        setCurrent(c => c + 1)
        setSelected(null)
      } else {
        const computed = calcScores(next)
        const personality = getPersonality(computed)
        setScores(computed)
        setResult(personality)
        setStep('result')
        setSelected(null)
        setSaving(true)
        saveQuizResult({
          name: session?.user?.name ?? '',
          phone: '',
          score: computed.risk,
          investorType: personality.key,
          answers: Object.fromEntries(Object.entries(next).map(([k, v]) => [k, v.risk])),
        }).catch(() => {}).finally(() => setSaving(false))
        if (session?.user) {
          ensureReferralCode().then(code => { if (code) setReferralCode(code) }).catch(() => {})
        }
      }
    }, 380)
  }

  const restart = () => {
    setSaving(false)
    setStep('intro'); setCurrent(0); setAnswers({})
    setAgreed(false); setSelected(null); setResult(null)
    setScores({ risk: 0, emotional: 0, maturity: 0 })
  }

  return (
    <section id="quiz" className="relative py-24 overflow-hidden bg-card" dir="rtl">
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      {/* Giant minimal A in background */}
      <div className="pointer-events-none select-none absolute left-0 top-1/2 -translate-y-1/2" aria-hidden>
        <svg viewBox="0 0 160 200" className="w-[340px] opacity-[0.025]" fill="none">
          <line x1="80" y1="8" x2="14" y2="192" stroke="#2F7DFF" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="80" y1="8" x2="146" y2="192" stroke="#2F7DFF" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="42" y1="118" x2="118" y2="118" stroke="#2F7DFF" strokeWidth="1" strokeLinecap="round" />
          <path d="M24 168 Q80 136 136 160" stroke="#2F7DFF" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 glass border border-primary/25 rounded-full px-4 py-1.5 text-sm text-primary font-semibold mb-6">
            تست رایگان — کمتر از ۵ دقیقه
          </div>
          <h2 className="font-black text-foreground text-balance mb-4" style={{ fontSize: 'clamp(1.9rem,5vw,3.2rem)', lineHeight: 1.4 }}>
            شخصیت مالی‌ات را{' '}
            <span className="text-brand-shimmer">کشف کن</span>
          </h2>
          <p className="text-muted-foreground text-base leading-loose">
            ۱۴ سوال تخصصی — تحلیل ۳ بعد — ۴ تیپ سرمایه‌گذاری — سبد اختصاصی
          </p>
        </motion.div>

        {step === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {PERSONALITY_TYPES.map(p => (
                <div key={p.key} className="glass border border-border rounded-2xl p-4 text-center group hover:border-primary/40 transition-all flex flex-col items-center" style={{ minWidth: 120, flex: '1 1 120px', maxWidth: 160 }}>
                  <div className="w-10 h-10 rounded-xl mb-2 flex items-center justify-center" style={{ background: `${p.color}18`, border: `1px solid ${p.color}30` }}>
                    <p.Icon className="w-5 h-5" style={{ color: p.color }} />
                  </div>
                  <div className="font-black text-foreground text-xs">{p.name}</div>
                  <div className="text-muted-foreground text-[10px] mt-0.5 leading-snug">{p.riskLabel}</div>
                </div>
              ))}
            </div>
            <div className="glass border border-border rounded-2xl p-5 mb-5">
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { v: '۱۴', l: 'سوال تخصصی' },
                  { v: '۵ دقیقه', l: 'زمان تقریبی' },
                  { v: '۴ تیپ', l: 'شخصیت مالی' },
                  { v: '۳ امتیاز', l: 'تحلیل دقیق' },
                ].map(s => (
                  <div key={s.l}>
                    <div className="text-primary font-black text-base">{s.v}</div>
                    <div className="text-muted-foreground text-[11px] mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            {session?.user ? (
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(47,125,255,0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep('terms')}
                className="w-full btn-primary py-4 rounded-2xl font-black text-lg"
              >
                شروع تست شخصیت مالی
              </motion.button>
            ) : (
              <div className="glass border border-primary/25 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-primary/10 border border-primary/20">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-black text-foreground text-lg mb-2">برای شروع تست، ابتدا ثبت‌نام کن</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                  نتیجه تست و سبد پیشنهادی‌ات در داشبورد شخصی‌ات ذخیره می‌شود تا همیشه دسترسی داشته باشی.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 0 28px rgba(47,125,255,0.45)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onOpenAuth}
                  className="w-full btn-primary py-3.5 rounded-xl font-black text-base"
                >
                  ثبت‌نام رایگان — شروع تست
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {step === 'terms' && (
          <motion.div key="terms" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass border border-border rounded-2xl p-8"
          >
            <h3 className="text-xl font-black text-foreground mb-4">پیش از شروع</h3>
            <div className="bg-muted/40 border border-border rounded-xl p-4 text-sm text-muted-foreground leading-loose mb-5">
              {TERMS_TEXT}
            </div>
            <label htmlFor="quiz-terms" className="flex items-start gap-3 mb-6 cursor-pointer">
              <input id="quiz-terms" type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-1 accent-primary w-4 h-4 cursor-pointer flex-shrink-0" />
              <span className="text-sm text-muted-foreground leading-relaxed">
                قوانین و مقررات A Capital را مطالعه کردم و با آن‌ها موافقم
              </span>
            </label>
            <div className="flex gap-3">
              <button onClick={() => setStep('intro')} className="flex-1 glass border border-border rounded-xl py-3 text-sm text-muted-foreground hover:text-foreground transition-all">
                بازگشت
              </button>
              <button
                onClick={() => agreed && setStep('quiz')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${agreed ? 'btn-primary' : 'bg-muted/50 text-muted-foreground cursor-not-allowed'}`}
              >
                موافقم — شروع تست
              </button>
            </div>
          </motion.div>
        )}

        {step === 'quiz' && (
          <motion.div key={`q${current}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28 }}
            className="glass border border-border rounded-2xl p-6 sm:p-8"
          >
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span className="font-semibold text-primary">{QUESTIONS[current].section}</span>
                <span>سوال {current + 1} از {QUESTIONS.length}</span>
              </div>
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(to left, #2F7DFF, #C0C0C0)' }}
                  animate={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} transition={{ duration: 0.4 }} />
              </div>
              <div className="flex justify-center gap-1 mt-3">
                {QUESTIONS.map((_, i) => (
                  <div key={i} className={`rounded-full transition-all duration-300 ${
                    i < current ? 'w-4 h-1.5 bg-primary' : i === current ? 'w-6 h-1.5 bg-primary' : 'w-2 h-1.5 bg-muted'
                  }`} />
                ))}
              </div>
            </div>

            <h3 className="font-black text-foreground mb-7 leading-loose text-balance" style={{ fontSize: 'clamp(1.05rem,3vw,1.35rem)' }}>
              {QUESTIONS[current].q}
            </h3>

            <div className="space-y-3">
              {QUESTIONS[current].opts.map((opt, i) => {
                const labels = ['الف', 'ب', 'ج', 'د', 'ه']
                return (
                  <motion.button key={i}
                    whileHover={{ scale: 1.015, x: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(opt, i)}
                    className={`w-full text-right glass border rounded-xl px-5 py-4 text-sm transition-all duration-250 flex items-center gap-3 ${
                      selected === i
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/35 hover:bg-primary/4 text-foreground'
                    }`}
                  >
                    <span className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border text-xs font-black transition-all ${
                      selected === i ? 'border-primary bg-primary text-white' : 'border-muted-foreground/35 text-muted-foreground'
                    }`}>
                      {labels[i]}
                    </span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }} ref={resultRef}
          >
              <div className="glass border rounded-2xl overflow-hidden mb-4" style={{ borderColor: `${result.color}35` }}>
                {/* Header */}
                <div className="p-8 text-center relative overflow-hidden" style={{ background: `${result.color}0E` }}>
                  <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 50% 50%, ${result.color}, transparent 70%)` }} />
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: `${result.color}20`, border: `1px solid ${result.color}40` }}
                  >
                    <result.Icon className="w-8 h-8" style={{ color: result.color }} />
                  </motion.div>
                  <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-2">شخصیت مالی شما</div>
                  <h3 className="text-2xl md:text-3xl font-black mb-1.5" style={{ color: result.color }}>{result.name}</h3>
                  <p className="text-muted-foreground text-sm font-semibold">{result.tagline}</p>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <p className="text-foreground leading-loose text-sm">{result.desc}</p>

                  {/* Three score bars */}
                  <div className="space-y-4">
                    {[
                      { label: 'ریسک‌پذیری', val: scores.risk, color: '#2F7DFF' },
                      { label: 'کنترل هیجانات', val: scores.emotional, color: '#10B981' },
                      { label: 'بلوغ مالی', val: scores.maturity, color: '#C0C0C0' },
                    ].map(sc => (
                      <div key={sc.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground font-semibold">{sc.label}</span>
                          <span className="font-black text-foreground">{sc.val} / ۱۰۰</span>
                        </div>
                        <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                            animate={{ width: `${sc.val}%` }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                            style={{ background: sc.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Portfolio allocation */}
                  <div>
                    <p className="text-sm font-black text-foreground mb-3">سبد پیشنهادی:</p>
                    <div className="flex rounded-xl overflow-hidden h-3 gap-px mb-3">
                      {result.alloc.map(a => (
                        <motion.div key={a.l} initial={{ width: 0 }} animate={{ width: `${a.p}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                          style={{ background: a.c }} />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {result.alloc.map(a => (
                        <div key={a.l} className="flex items-center gap-2 text-xs glass border border-border rounded-lg px-3 py-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: a.c }} />
                          <span className="text-muted-foreground flex-1">{a.l}</span>
                          <span className="font-black text-foreground">{a.p}٪</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk badge */}
                  <div className="flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 px-4 text-xs font-semibold text-muted-foreground glass">
                    <div className="w-2 h-2 rounded-full" style={{ background: result.color }} />
                    سطح ریسک: {result.riskLabel}
                  </div>

                  {/* Referral invite */}
                  {session?.user && referralCode && (
                    <div className="glass border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">کد معرف اختصاصی تو</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        لینک اختصاصی تو ساخته شد. هر کی با این لینک بیاد، توی لیست معرفی‌های تو ثبت می‌شه.
                      </p>
                      <div className="flex items-center gap-2 bg-accent/50 rounded-xl p-2.5 border border-border/50">
                        <span className="text-xs font-mono font-bold text-foreground flex-1 truncate direction-ltr">
                          {`https://a-cap.xyz?ref=${referralCode}`}
                        </span>
                        <button onClick={async () => {
                          try { await navigator.clipboard.writeText(`https://a-cap.xyz?ref=${referralCode}`); setCopiedRef(true); setTimeout(() => setCopiedRef(false), 2000) } catch {}
                        }}
                          className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold transition-colors"
                        >
                          {copiedRef ? 'کپی شد ✓' : 'کپی کن'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.a href="https://t.me/acapitalsbot" target="_blank" rel="noopener noreferrer"
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="flex-1 py-3.5 rounded-xl font-black text-center text-sm text-white"
                      style={{ background: `linear-gradient(135deg, ${result.color}, ${result.color}bb)` }}
                    >
                      دریافت مشاوره در تلگرام
                    </motion.a>
                    <button onClick={restart}
                      className="glass border border-border hover:border-primary/30 text-muted-foreground hover:text-foreground py-3 px-5 rounded-xl text-sm transition-all flex items-center gap-1.5 justify-center">
                      <RotateCcw className="w-3.5 h-3.5" />
                      تکرار تست
                    </button>
                  </div>

                  {saving && (
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      در حال ذخیره نتیجه...
                    </div>
                  )}
                </div>
              </div>

              <p className="text-center text-muted-foreground text-xs leading-relaxed opacity-60">
                این تست جنبه اطلاعاتی و آموزشی دارد. توصیه سرمایه‌گذاری محسوب نمی‌شود.
              </p>
            </motion.div>
          )}

      </div>
    </section>
  )
}
