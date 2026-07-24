'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'

const LS_KEY = 'acap_last_signal_check'

export function SignalNotifier({ userId }: { userId?: string }) {
  const router = useRouter()
  const [hasNew, setHasNew] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!userId) return
    const uid = `_${userId}`
    const lastCheck = localStorage.getItem(LS_KEY + uid)
    fetch(`/api/signals?userId=${userId}`)
      .then(r => r.json())
      .then(d => {
        const sigs: any[] = d?.signals || []
        if (!sigs.length) return
        const latest = new Date(sigs[0].publishedAt || sigs[0].createdAt).getTime()
        const check = lastCheck ? parseInt(lastCheck) : 0
        const newSigs = sigs.filter((s: any) => new Date(s.publishedAt || s.createdAt).getTime() > check)
        if (newSigs.length > 0) {
          setHasNew(true)
          setCount(newSigs.length)
        }
      })
      .catch(() => {})
  }, [userId])

  if (!hasNew) return null

  return (
    <button onClick={() => { localStorage.setItem(LS_KEY + '_' + userId, Date.now().toString()); router.push('/app/personal'); setHasNew(false) }}
      className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold hover:bg-amber-500/15 transition-all group"
    >
      <Zap className="w-4 h-4 shrink-0" />
      <span>{count} سیگنال جدید</span>
      <span className="text-[10px] text-amber-400/60 group-hover:text-amber-400/80 mr-auto">مشاهده</span>
    </button>
  )
}
