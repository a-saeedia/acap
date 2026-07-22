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
        const SD_HASH = 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b'
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
