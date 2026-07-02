'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingTasksProps {
  profile: { phone?: string | null; age?: number | null; investmentCapital?: number | null } | null
  quizResults: any[]
  assetsCount: number
}

const TASKS = [
  {
    key: 'phone',
    label: 'ثبت شماره موبایل',
    description: 'اضافه کردن شماره تلفن به حساب کاربری',
    check: (props: OnboardingTasksProps) => !!props.profile?.phone,
  },
  {
    key: 'quiz',
    label: 'تست شخصیت مالی',
    description: 'شناسایی سبک سرمایه‌گذاری شما',
    check: (props: OnboardingTasksProps) => props.quizResults.length > 0,
  },
  {
    key: 'profile',
    label: 'تکمیل پروفایل سرمایه‌گذاری',
    description: 'ثبت سن و سرمایه اولیه',
    check: (props: OnboardingTasksProps) => !!props.profile?.investmentCapital && !!props.profile?.age,
  },
  {
    key: 'asset',
    label: 'ثبت اولین دارایی در پرتفوی',
    description: 'افزودن یک دارایی به سبد سرمایه‌گذاری',
    check: (props: OnboardingTasksProps) => props.assetsCount > 0,
  },
  {
    key: 'subscription',
    label: 'عضویت در A|CAP+',
    description: 'ارتقا به حساب ویژه برای امکانات بیشتر',
    check: (_props: OnboardingTasksProps, subscription?: { acapPlus: boolean }) => !!subscription?.acapPlus,
  },
]

const CIRCUMFERENCE = 2 * Math.PI * 54

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <circle cx="10" cy="10" r="9" fill="#10B981" />
      <path d="M6 10.5L8.5 13L14 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RadioIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" className="text-gray-600" />
      <circle cx="10" cy="10" r="3" fill="currentColor" className="text-gray-600" />
    </svg>
  )
}

const easeOutExpo: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

const containerVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.4, ease: easeOutExpo },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: easeOutExpo },
  },
}

const itemVariants: any = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: 'easeOut' },
  }),
}

function Confetti() {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 0.8 + Math.random() * 0.6,
      color: ['#2979FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][i % 6],
      rotation: Math.random() * 360,
    })),
  [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{ left: `${p.x}%`, top: '-5%', backgroundColor: p.color }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: 120,
            opacity: 0,
            rotate: p.rotation * 2,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  )
}

export function OnboardingTasks({
  profile,
  quizResults,
  assetsCount,
  subscription,
}: OnboardingTasksProps & { subscription?: { acapPlus: boolean } }) {
  const [open, setOpen] = useState(false)

  const completedCount = TASKS.reduce((sum, t) => {
    if (t.key === 'subscription') return sum + (t.check({ profile, quizResults, assetsCount }, subscription) ? 1 : 0)
    return sum + (t.check({ profile, quizResults, assetsCount }) ? 1 : 0)
  }, 0)

  const progress = (completedCount / TASKS.length) * 100
  const allDone = completedCount === TASKS.length
  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE

  return (
    <div className="relative" dir="rtl">
      {/* Clickable progress circle */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="relative flex flex-col items-center gap-1.5 group cursor-pointer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="relative w-[56px] h-[56px] sm:w-[64px] sm:h-[64px]">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(107,141,181,0.15)" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none" stroke="url(#g)"
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
            <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2979FF" /><stop offset="100%" stopColor="#10B981" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className="text-sm sm:text-base font-black text-foreground tabular-nums leading-none" key={Math.round(progress)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>{Math.round(progress)}%</motion.span>
          </div>
        </div>

        <span className="text-[10px] text-muted-foreground">{allDone ? 'تکمیل شد' : `${completedCount}/${TASKS.length}`}</span>
      </motion.button>

      {/* Expandable task list */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 z-50 overflow-hidden"
          >
            <div className="glass rounded-2xl border border-border p-3.5 shadow-xl relative bg-gray-900/95 backdrop-blur-xl">
              {allDone && <Confetti />}

              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black text-foreground">مراحل تکمیل</h4>
                <span className="text-[10px] font-semibold text-muted-foreground bg-accent/30 px-2 py-0.5 rounded-full">{Math.round(progress)}%</span>
              </div>

              <div className="h-1 rounded-full bg-accent/50 mb-2.5 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #2979FF, #10B981)' }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
              </div>

              <div className="space-y-0.5">
                {TASKS.map((task, i) => {
                  let done: boolean
                  if (task.key === 'subscription') done = task.check({ profile, quizResults, assetsCount }, subscription)
                  else done = task.check({ profile, quizResults, assetsCount })
                  return (
                    <motion.div key={task.key} custom={i} variants={itemVariants} initial="hidden" animate="visible" className={`flex items-center gap-2 p-2 rounded-xl transition-colors ${done ? 'bg-emerald-500/8' : ''}`}>
                      {done ? <CheckIcon /> : <RadioIcon />}
                      <span className={`text-xs font-semibold ${done ? 'text-emerald-400' : 'text-gray-100'}`}>{task.label}</span>
                    </motion.div>
                  )
                })}
              </div>

              {allDone && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-2.5 pt-2.5 border-t border-border/50 text-center">
                  <p className="text-xs font-bold text-emerald-400">🎉 همه مراحل تکمیل شد</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
