'use client'

import { useSession } from '@/lib/auth-client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'
import { PortfolioDashboard } from '@/components/portfolio-dashboard'

export default function AssetsPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [loading, setLoading] = useState(true)
  const [isPlus, setIsPlus] = useState(false)
  const [investorType, setInvestorType] = useState<string | null>(null)
  const [quizTaken, setQuizTaken] = useState(false)

  useEffect(() => {
    if (isPending) return
    if (!session) { setLoading(false); router.push('/'); return }
    import('@/app/actions/profile').then(m =>
      m.getDashboardData().then(data => {
        if (!data) { setLoading(false); router.push('/'); return }
        setIsPlus(data.subscription?.acapPlus ?? false)
        const latest = data.quizResults?.[data.quizResults.length - 1]
        setInvestorType(latest?.investorType ?? null)
        setQuizTaken(data.quizResults.length > 0)
        setLoading(false)
      })
    ).catch(() => { setLoading(false); router.push('/') })
  }, [session, isPending, router])

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به داشبورد
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">مدیریت سبد سرمایه</span>
          </div>
        </div>
      </header>

      {/* Full Portfolio Dashboard */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <PortfolioDashboard isPlus={isPlus} investorType={investorType} quizTaken={quizTaken} />
      </main>
    </div>
  )
}
