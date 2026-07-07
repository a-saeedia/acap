'use client'

import { InvitationTab } from '@/components/invitation-tab'
import { motion } from 'framer-motion'

export default function InvitePage() {
  return (
    <div dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="mb-2">
          <h1 className="text-xl sm:text-2xl font-black text-white">
            دعوت از دوستان
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            دوستان خود را به A|CAP دعوت کنید و پاداش بگیرید
          </p>
        </div>
        <InvitationTab />
      </motion.div>
    </div>
  )
}
