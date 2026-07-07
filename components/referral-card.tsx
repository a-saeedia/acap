'use client'

import { useState } from 'react'
import { Copy, Check, Users, FileText, ShoppingCart } from 'lucide-react'

interface ReferralCardProps {
  stats: {
    code: string
    totalInvites: number
    converted: number
    quizCompleted: number
    inviteLink: string
  }
}

export function ReferralCard({ stats }: ReferralCardProps) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="glass border border-border rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-black text-sm text-foreground">کد معرف من</h3>
        </div>
      </div>

      {/* Code + Copy */}
      <div className="flex items-center gap-2 bg-accent/50 rounded-xl p-3 border border-border/50">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted-foreground mb-0.5">لینک اختصاصی</div>
          <div className="text-xs font-mono font-bold text-foreground truncate direction-ltr">{stats.inviteLink}</div>
        </div>
        <button onClick={async () => {
          try { await navigator.clipboard.writeText(stats.inviteLink); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
        }}
          className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 flex items-center justify-center transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-primary" />}
        </button>
      </div>

      {/* 3 clean stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Users, label: 'وارد سایت شدند', value: stats.totalInvites, color: '#3B82F6' },
          { icon: FileText, label: 'تست دادند', value: stats.quizCompleted, color: '#8B5CF6' },
          { icon: ShoppingCart, label: 'خرید کردند', value: stats.converted, color: '#10B981' },
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
    </div>
  )
}
