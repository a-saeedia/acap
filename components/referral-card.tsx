'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Users, ShoppingCart, FileText, TrendingUp, Award, Gift } from 'lucide-react'

interface ReferralCardProps {
  stats: {
    code: string
    totalInvites: number
    converted: number
    quizCompleted: number
    pending: number
    tier: { name: string; commission: number; key: string }
    inviteLink: string
    nextMilestone: { invites: number; reward: string } | null
  }
}

const TIER_COLORS: Record<string, string> = {
  partner: '#8B5CF6',
  silver: '#94A3B8',
  gold: '#F59E0B',
  ambassador: '#EF4444',
}

export function ReferralCard({ stats }: ReferralCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(stats.inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const maxVal = Math.max(stats.totalInvites, stats.quizCompleted, stats.converted, 1)

  return (
    <div className="glass border border-border rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-black text-sm text-foreground">سفیر A|CAP</h3>
            <p className="text-[10px] text-muted-foreground">{stats.tier.name} • {stats.tier.commission}% کمیسیون</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: `${TIER_COLORS[stats.tier.key] || '#8B5CF6'}20`, border: `1px solid ${TIER_COLORS[stats.tier.key] || '#8B5CF6'}40` }}>
          <Award className="w-3.5 h-3.5" style={{ color: TIER_COLORS[stats.tier.key] || '#8B5CF6' }} />
          <span className="text-[10px] font-bold" style={{ color: TIER_COLORS[stats.tier.key] || '#8B5CF6' }}>{stats.tier.name}</span>
        </div>
      </div>

      {/* Referral Code */}
      <div className="flex items-center gap-2 bg-accent/50 rounded-xl p-3 border border-border/50">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted-foreground mb-0.5">لینک معرف شما</div>
          <div className="text-xs font-mono font-bold text-foreground truncate direction-ltr">{stats.inviteLink}</div>
        </div>
        <button onClick={handleCopy}
          className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 flex items-center justify-center transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-primary" />}
        </button>
      </div>

      {/* 3 Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Users, label: 'دعوت شده', value: stats.totalInvites, color: '#3B82F6' },
          { icon: FileText, label: 'تست داده', value: stats.quizCompleted, color: '#8B5CF6' },
          { icon: ShoppingCart, label: 'خرید کرده', value: stats.converted, color: '#10B981' },
        ].map(stat => (
          <div key={stat.label} className="glass border border-border rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <stat.icon className="w-3 h-3" style={{ color: stat.color }} />
              <span className="text-[10px] text-muted-foreground">{stat.label}</span>
            </div>
            <div className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Chart bars */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>آمار دعوت‌ها</span>
          <span className="font-semibold text-foreground">{stats.totalInvites} نفر</span>
        </div>
        <div className="space-y-1.5">
          {[
            { label: 'دعوت شده', value: stats.totalInvites, color: '#3B82F6' },
            { label: 'تست داده', value: stats.quizCompleted, color: '#8B5CF6' },
            { label: 'خرید کرده', value: stats.converted, color: '#10B981' },
          ].map(bar => (
            <div key={bar.label} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-14 shrink-0">{bar.label}</span>
              <div className="flex-1 h-3 bg-accent/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(bar.value / maxVal) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full" style={{ background: bar.color, opacity: 0.7 }}
                />
              </div>
              <span className="text-[10px] font-bold text-foreground w-6 text-left">{bar.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone */}
      {stats.nextMilestone && (
        <div className="bg-accent/30 rounded-xl p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-bold text-foreground">پاداش بعدی</span>
          </div>
          <p className="text-xs text-muted-foreground">
            با {stats.nextMilestone.invites} دعوت: {stats.nextMilestone.reward}
          </p>
          <div className="mt-2 h-1.5 bg-accent rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.totalInvites / stats.nextMilestone.invites) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
            />
          </div>
        </div>
      )}
    </div>
  )
}
