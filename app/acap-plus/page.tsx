'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { motion } from 'framer-motion'

type Suggestion = { id: string; title: string; content: string; createdAt: string }

export default function AcapPlusPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isPlus, setIsPlus] = useState(false)

  useEffect(() => {
    if (!isPending && !session) router.push('/')
    if (!isPending && session) {
      fetch('/api/acap-plus').then(r => r.json()).then(data => {
        setIsPlus(data.isPlus)
        setSuggestions(data.suggestions || [])
      })
    }
  }, [session, isPending])

  if (isPending) return <div className="min-h-screen flex items-center justify-center text-white">...</div>
  if (!session) return null

  if (!isPlus) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">A|CAP+</h1>
          <p className="text-gray-400 mb-6">این بخش ویژه کاربران A|CAP+ می‌باشد</p>
          <p className="text-gray-500">برای استفاده از این بخش، با مدیر سیستم تماس بگیرید</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">A|CAP+</h1>
        <p className="text-gray-400 mb-8">پیشنهادات و راهنمایی‌های اختصاصی شما</p>

        {suggestions.length === 0 ? (
          <p className="text-gray-500">هنوز پیشنهادی برای شما ثبت نشده است</p>
        ) : (
          <div className="space-y-4">
            {suggestions.map(s => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 p-6 rounded-lg border border-emerald-900/30">
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">{s.title}</h3>
                <p className="text-gray-300 whitespace-pre-line">{s.content}</p>
                <p className="text-xs text-gray-500 mt-3">{new Date(s.createdAt).toLocaleDateString('fa-IR')}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
