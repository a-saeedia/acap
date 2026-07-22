'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, FileText, ShoppingCart, Calculator, Trophy, Medal, Crown, Star, ChevronUp, Gift, DollarSign } from 'lucide-react'

const TOP_AMBASSADORS = [
  { rank: 1, name: 'امیرحسین رضایی', invites: 20, reward: '۲۴۰,۰۰۰,۰۰۰ تومان', badge: 'طلایی', color: '#F59E0B' },
  { rank: 2, name: 'سارا محمدی', invites: 10, reward: '۱۲۰,۰۰۰,۰۰۰ تومان', badge: 'نقره‌ای', color: '#94A3B8' },
  { rank: 3, name: 'علی کریمی', invites: 5, reward: '۶۰,۰۰۰,۰۰۰ تومان', badge: 'برنزی', color: '#B45309' },
]

function AmbassadorCalculator() {
  const [referrals, setReferrals] = useState(10)
  const [avgInvestment, setAvgInvestment] = useState(30000000)
  const commissionPct = 20
  const totalInvestment = referrals * avgInvestment
  const totalEarning = Math.round(totalInvestment * commissionPct / 100)

  return (
    <div className="glass border border-border rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="text-foreground font-black text-lg">محاسبه درآمد سفیران</h3>
      </div>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-muted-foreground">تعداد دعوت</label>
            <span className="text-lg font-black text-foreground tabular-nums ltr">{referrals} <span className="text-xs font-medium text-muted-foreground">نفر</span></span>
          </div>
          <input type="range" min={0} max={100} value={referrals} onChange={e => setReferrals(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-accent/50 accent-emerald-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-emerald-400 [&::-webkit-slider-thumb]:to-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/20"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>۰</span><span>۲۵</span><span>۵۰</span><span>۷۵</span><span>۱۰۰</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-muted-foreground">میانگین سرمایه‌گذاری هر نفر</label>
            <span className="text-sm font-black text-foreground tabular-nums ltr">{avgInvestment.toLocaleString('fa-IR')} <span className="text-xs font-medium text-muted-foreground">تومان</span></span>
          </div>
          <input type="range" min={1000000} max={200000000} step={1000000} value={avgInvestment} onChange={e => setAvgInvestment(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-accent/50 accent-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-blue-400 [&::-webkit-slider-thumb]:to-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-blue-500/30 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/20"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>۱ میلیون</span><span>۵۰ میلیون</span><span>۱۰۰ میلیون</span><span>۲۰۰ میلیون</span>
          </div>
        </div>

        <div className="bg-accent/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">مجموع سرمایه‌گذاری دعوت‌شوندگان</span>
            <span className="font-bold text-foreground tabular-nums">{totalInvestment.toLocaleString('fa-IR')} تومان</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">درصد پاداش</span>
            <span className="font-bold text-emerald-400">{commissionPct}%</span>
          </div>
          <div className="border-t border-border pt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">درآمد کل تخمینی</span>
            <span className="text-lg font-black text-emerald-400 tabular-nums">{totalEarning.toLocaleString('fa-IR')} تومان</span>
          </div>
        </div>

        <div className="bg-accent/30 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>پیشرفت به سوی سطح بعدی</span>
            <span>{Math.min(referrals, 50)}/۵۰ نفر</span>
          </div>
          <div className="h-2 rounded-full bg-accent/50 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(referrals / 50 * 100, 100)}%` }}
              className="h-full rounded-full bg-gradient-to-l from-primary to-emerald-400"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {referrals >= 50 ? '🎉 به حداکثر سطح رسیده‌ای!' : `${50 - Math.min(referrals, 50)} نفر دیگر تا سطح بعدی`}
          </p>
        </div>
      </div>
    </div>
  )
}

function TopAmbassadors() {
  const [expanded, setExpanded] = useState(false)
  const display = expanded ? TOP_AMBASSADORS : TOP_AMBASSADORS.slice(0, 3)

  return (
    <div className="glass border border-border rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-foreground font-black text-lg">برترین سفیران</h3>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          {expanded ? 'کمتر' : 'بیشتر'}
          <ChevronUp className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <div className="space-y-3">
        {display.map((a, i) => (
          <motion.div key={a.rank} layout
            className={`relative rounded-2xl p-4 border transition-all ${
              a.rank === 1
                ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30'
                : a.rank === 2
                ? 'bg-gradient-to-br from-slate-400/10 to-slate-400/5 border-slate-500/20'
                : 'bg-gradient-to-br from-orange-600/10 to-orange-600/5 border-orange-700/20'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  a.rank === 1 ? 'bg-amber-500/20' : a.rank === 2 ? 'bg-slate-400/20' : 'bg-orange-600/20'
                }`}>
                  {a.rank === 1 ? <Crown className="w-5 h-5 text-amber-400" /> :
                   a.rank === 2 ? <Medal className="w-5 h-5 text-slate-300" /> :
                   <Medal className="w-5 h-5 text-orange-400" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{a.name}</div>
                  <div className="text-[10px] text-muted-foreground">{a.badge}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black text-foreground">{a.invites}</span>
                  <span className="text-[10px] text-muted-foreground">دعوت</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">{a.reward}</div>
              </div>
            </div>
            <div className="mt-2 h-1 rounded-full bg-accent/50 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-l from-primary to-emerald-400"
                style={{ width: `${(3 - a.rank + 1) / 3 * 100}%` }} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function AmbassadorSection() {
  return (
    <section id="ambassador" className="relative py-24 lg:py-32 overflow-hidden bg-background">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/3 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '30px 30px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-1.5 mb-6">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-primary font-semibold">برنامه سفیران ACAP</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4 text-balance">
            با لینک اختصاصی خودت،
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-primary bg-clip-text text-transparent">ACAP را به دیگران معرفی کن</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            پس از انجام تست شخصیت مالی، یک لینک اختصاصی می‌گیری. هرکس با لینک تو بیاد، توی آمارت ثبت می‌شه و درآمد کسب می‌کنی.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <AmbassadorCalculator />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            <TopAmbassadors />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="glass border border-border rounded-3xl p-6 sm:p-8 mb-12"
        >
          <h3 className="text-foreground font-black text-xl mb-6 text-center">چگونه کار می‌کند؟</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '۱', icon: TrendingUp, title: 'تست شخصیت مالی', desc: 'اول شخصیت مالی خودت را در کمتر از ۳ دقیقه کشف کن' },
              { step: '۲', icon: Gift, title: 'لینک اختصاصی بگیر', desc: 'بعد از تست، لینک منحصربه‌فرد خودت را دریافت می‌کنی' },
              { step: '۳', icon: DollarSign, title: 'درآمد کسب کن', desc: 'به ازای هر نفری که از لینک تو ثبت‌نام کند، پاداش می‌گیری' },
            ].map((step) => {
              const Icon = step.icon
              return (
                <div key={step.step} className="text-center">
                  <div className="relative inline-flex mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-black">
                      {step.step}
                    </div>
                  </div>
                  <h4 className="text-foreground font-black mb-2">{step.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center"
        >
          <motion.a href="/#quiz"
            whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(37,99,235,0.5)' }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-3 bg-gradient-to-l from-primary to-emerald-500 text-white px-6 sm:px-10 py-4 rounded-2xl font-black text-base sm:text-lg transition-all duration-300 mb-4 shadow-lg shadow-primary/25"
          >
            <Star className="w-5 h-5" />
            همین حالا سفیر شو — رایگان
          </motion.a>
          <p className="text-muted-foreground text-sm">
            ابتدا تست شخصیت مالی را انجام بده و لینک اختصاصی‌ات را دریافت کن
          </p>
        </motion.div>
      </div>
    </section>
  )
}
