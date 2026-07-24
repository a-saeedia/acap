'use client'

'use client'

import { InvitationTab } from '@/components/invitation-tab'
import { useLang } from '@/components/lang-provider'
import { motion } from 'framer-motion'

export default function InvitePage() {
  const { t, lang } = useLang()
  return (
    <div dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="mb-2">
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            {t('invite.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('invite.desc')}
          </p>
        </div>
        <InvitationTab />
      </motion.div>
    </div>
  )
}
