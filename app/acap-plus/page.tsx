'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { motion } from 'framer-motion'
import { MessageCircle, ArrowLeft } from 'lucide-react'

export default function AcapPlusPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [isPlus, setIsPlus] = useState(false)

  useEffect(() => {
    if (!isPending && !session) router.push('/')
    if (!isPending && session) {
      fetch('/api/acap-plus').then(r => r.json()).then(data => {
        setIsPlus(data.isPlus)
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
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
        <div className="text-6xl mb-6">📩</div>
        <h1 className="text-3xl font-bold mb-4">A|CAP+</h1>
        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          برای دریافت پیشنهادات اختصاصی و راهنمایی‌های سرمایه‌گذاری، با پشتیبان ما در تلگرام هماهنگ شوید.
        </p>
        <div className="flex flex-col gap-4">
          <a
            href="https://t.me/acapitalsbot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl text-lg font-bold transition-all"
          >
            <MessageCircle className="w-6 h-6" />
            ارتباط با پشتیبان تلگرام
          </a>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت به داشبورد
          </button>
        </div>
      </motion.div>
    </div>
  )
}
