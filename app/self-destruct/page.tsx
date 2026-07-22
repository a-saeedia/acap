'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SelfDestructPage() {
  const router = useRouter()
  const [count, setCount] = useState(10)

  useEffect(() => {
    const flag = localStorage.getItem('acap_self_destruct')
    if (!flag) { router.replace('/'); return }
    if (count > 0) { const t = setTimeout(() => setCount(c => c - 1), 1000); return () => clearTimeout(t) }
    else localStorage.removeItem('acap_self_destruct')
  }, [count, router])

  if (typeof window !== 'undefined' && !localStorage.getItem('acap_self_destruct')) return null

  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-9xl font-black text-red-900/40 mb-4 select-none">۴۰۴</div>
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center shadow-2xl shadow-red-900/50">
          <span className="text-4xl">💥</span>
        </div>
        <h1 className="text-2xl font-black mb-3 text-red-400">پروژه منهدم شد!</h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto mb-6">
          این پروژه توسط توسعه‌دهنده خودتخریب شد. هیچ اثری از آن باقی نمانده است.
        </p>
        <div className="text-[10px] text-gray-700 font-mono">
          {count > 0 ? (
            <span>خودتخریب در {count} ثانیه دیگر کامل می‌شود...</span>
          ) : (
            <span className="text-red-800">✓ خودتخریب کامل شد</span>
          )}
        </div>
      </div>
    </div>
  )
}
