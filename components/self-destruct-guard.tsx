'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export function SelfDestructGuard({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const restoreKey = params.get('restore')
    if (restoreKey) {
      import('@/app/admin/page').then(() => {})
      const enc = new TextEncoder()
      crypto.subtle.digest('SHA-256', enc.encode(restoreKey)).then(buf => {
        const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
        const SD_HASH = '45c423dfef7889446c0718652044edbf79e8026de38c948d16a38b6dcfe80a66'
        if (hash === SD_HASH) {
          localStorage.removeItem('acap_self_destruct')
          window.location.href = window.location.origin
        }
      })
      return
    }
    if (path === '/self-destruct') return
    if (path.startsWith('/admin') || path.startsWith('/api')) return
    try {
      if (localStorage.getItem('acap_self_destruct') === 'true') {
        router.replace('/self-destruct')
      }
    } catch {}
  }, [path, router])

  return <>{children}</>
}
