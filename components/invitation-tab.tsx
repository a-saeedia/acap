'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Users, FileText, ShoppingCart, Share2, Gift, Medal, RefreshCw, TrendingUp, Trophy, Crown, Star, ChevronLeft, UserPlus, Link2, ExternalLink, Award, Sparkles } from 'lucide-react'
import { getMyReferralStats, getReferralLeaderboard, applyReferralCode } from '@/app/actions/referral'
import { motion } from 'framer-motion'

type ReferralData = {
  code: string; inviteLink: string; totalInvites: number; active: number
  converted: number; quizCompleted: number; totalRewards: number
  level: number; nextLevelThreshold: number
  referrals: Array<{ id: string; email: string | null; name: string | null; phone: string | null; status: string; rewardAmount: number | null; convertedAt: Date | null; createdAt: Date }>
}

type LeaderboardEntry = { rank: number; userId: string; name: string; image: string | null; code: string | null; totalInvites: number; totalRewards: number; level: number }

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: 'فعال', color: 'text-blue-400 bg-blue-500/15' },
  converted: { label: 'خرید کرده', color: 'text-emerald-400 bg-emerald-500/15' },
}

export function InvitationTab() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [refInput, setRefInput] = useState('')
  const [refMsg, setRefMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [refLoading, setRefLoading] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const load = async () => {
    setLoading(true)
    const [s, l] = await Promise.all([getMyReferralStats(), getReferralLeaderboard()])
    if (s) setData(s)
    setLeaderboard(l)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const copyLink = async () => {
    if (!data) return
    try { await navigator.clipboard.writeText(data.inviteLink); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }

  const shareLink = async () => {
    if (!data) return
    if (navigator.share) {
      try { await navigator.share({ title: 'دعوت به A|CAP', text: `با کد معرف من ${data.code} ثبت‌نام کن!`, url: data.inviteLink }) } catch {}
    } else { copyLink() }
  }

  const handleApplyCode = async () => {
    if (!refInput.trim()) return
    setRefLoading(true)
    setRefMsg(null)
    try {
      await applyReferralCode(refInput)
      setRefMsg({ text: '✓ کد معرف با موفقیت ثبت شد!', ok: true })
      setRefInput('')
      load()
    } catch (e: any) {
      setRefMsg({ text: e.message || 'خطا در ثبت کد', ok: false })
    }
    setRefLoading(false)
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-5 h-5 animate-spin text-primary" />
      </div>
    )
  }

  const formatDate = (d: Date | string | null) => {
    if (!d) return '—'
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d))
  }

  return (
    <div className="space-y-5">
      {/* Hero — referral link */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)',
          boxShadow: '0 8px 40px rgba(124,58,237,0.25)',
        }}
      >
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-5 h-5 text-white/90" />
            <h2 className="text-lg font-black text-white">دعوت از دوستان</h2>
          </div>
          <p className="text-sm text-white/70 mb-4">لینک اختصاصی خود را با دوستانتان به اشتراک بگذارید</p>

          <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/15">
            <div className="flex-1 min-w-0 flex items-center px-3 py-2 sm:py-0">
              <span className="text-xs text-white/50 ml-2 shrink-0"><Link2 className="w-3.5 h-3.5 inline" /></span>
              {data && <span className="text-xs sm:text-sm font-mono font-bold text-white truncate direction-ltr">{data.inviteLink}</span>}
            </div>
            <div className="flex gap-1 px-1 pb-1 sm:pb-0">
              <button onClick={copyLink} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-bold transition-colors shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'کپی شد' : 'کپی'}
              </button>
              <button onClick={shareLink} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-bold transition-colors shrink-0">
                <Share2 className="w-4 h-4" />
                اشتراک
              </button>
            </div>
          </div>

          {data && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-white/60">کد شما:</span>
              <span className="text-sm font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-lg">{data.code}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats cards */}
      {data && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { icon: Users, label: 'دعوت‌ها', value: data.totalInvites, color: '#3B82F6', sub: 'تعداد کل' },
            { icon: FileText, label: 'تست داده', value: data.quizCompleted, color: '#8B5CF6', sub: 'تکمیل تست' },
            { icon: ShoppingCart, label: 'خرید کرده', value: data.converted, color: '#10B981', sub: 'تبدیل شده' },
            { icon: Award, label: 'پاداش', value: `${data.totalRewards.toLocaleString()}`, color: '#F59E0B', sub: `سطح ${data.level}` },
          ].map(stat => (
            <div key={stat.label} className="glass border border-border rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              {stat.sub && <div className="text-[9px] text-muted-foreground mt-0.5">{stat.sub}</div>}
            </div>
          ))}
        </motion.div>
      )}

      {/* Level progress */}
      {data && data.totalInvites > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass border border-border rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Medal className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold">سطح دعوت {data.level}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{data.totalInvites} / {data.nextLevelThreshold} برای سطح بعدی</span>
          </div>
          <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (data.totalInvites / data.nextLevelThreshold) * 100)}%` }} />
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Referrals list */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass border border-border rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-black text-sm">دعوت‌های اخیر</h3>
            </div>
            <span className="text-[10px] text-muted-foreground">{data?.referrals.length ?? 0} نفر</span>
          </div>
          {data && data.referrals.length > 0 ? (
            <div className="space-y-1 max-h-[320px] overflow-y-auto">
              {data.referrals.map(r => {
                const st = STATUS_MAP[r.status] || STATUS_MAP.active
                return (
                  <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <UserPlus className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{r.name || r.email || 'کاربر'}</div>
                        <div className="text-[10px] text-muted-foreground">{formatDate(r.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.rewardAmount != null && <span className="text-[10px] font-bold text-amber-400">+{r.rewardAmount}</span>}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">هنوز کسی را دعوت نکرده‌اید</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">لینک خود را با دوستانتان به اشتراک بگذارید</p>
            </div>
          )}
        </motion.div>

        {/* Enter referral code + Leaderboard */}
        <div className="space-y-4">
          {/* Enter code */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass border border-border rounded-2xl p-4"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <Star className="w-4 h-4 text-amber-400" />
              <h3 className="font-black text-sm">ثبت کد معرف</h3>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">اگر کد معرف دوست خود را دارید، اینجا وارد کنید</p>
            <div className="flex gap-2">
              <input value={refInput} onChange={e => setRefInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleApplyCode()} placeholder="مثلاً ACAP-X7F3K2" className="flex-1 px-3 py-2.5 rounded-xl bg-accent border border-border text-xs outline-none font-mono" />
              <button onClick={handleApplyCode} disabled={refLoading || !refInput.trim()} className="px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-xl text-xs font-bold transition-colors shrink-0">
                {refLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'ثبت'}
              </button>
            </div>
            {refMsg && (
              <p className={`text-xs mt-2 ${refMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{refMsg.text}</p>
            )}
          </motion.div>

          {/* Leaderboard */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass border border-border rounded-2xl p-4"
          >
            <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-sm">برترین دعوت‌کنندگان</h3>
              </div>
              <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform ${showLeaderboard ? 'rotate-90' : ''}`} />
            </button>
            {showLeaderboard && (
              <div className="mt-3 space-y-1 max-h-[240px] overflow-y-auto">
                {leaderboard.length > 0 ? leaderboard.map(entry => (
                  <div key={entry.userId} className="flex items-center justify-between px-3 py-2 rounded-xl bg-accent/30">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${entry.rank === 1 ? 'bg-amber-500/20 text-amber-400' : entry.rank === 2 ? 'bg-gray-400/20 text-gray-300' : entry.rank === 3 ? 'bg-orange-700/20 text-orange-600' : 'bg-accent text-muted-foreground'}`}>
                        {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{entry.name}</div>
                        <div className="text-[9px] text-muted-foreground font-mono">{entry.code}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-blue-400 font-bold">{entry.totalInvites} دعوت</span>
                      <span className="text-amber-400 font-bold">{entry.totalRewards.toLocaleString()}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-4">هنوز رتبه‌بندی تشکیل نشده</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* How it works */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="glass border border-border rounded-2xl p-4"
      >
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-black text-sm">چگونه کار می‌کند؟</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Share2, step: '۱', title: 'اشتراک لینک', desc: 'لینک اختصاصی خود را با دوستانتان به اشتراک بگذارید' },
            { icon: Users, step: '۲', title: 'ثبت‌نام دوستان', desc: 'دوستانتان با لینک شما ثبت‌نام می‌کنند و وارد سایت می‌شوند' },
            { icon: Gift, step: '۳', title: 'دریافت پاداش', desc: 'با دعوت هر دوست، سطح شما بالاتر رفته و پاداش دریافت می‌کنید' },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-2.5 p-3 rounded-xl bg-accent/30">
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <item.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground mb-0.5">مرحله {item.step}: {item.title}</div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
