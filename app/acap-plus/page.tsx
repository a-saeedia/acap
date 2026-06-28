'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'

export default function AcapPlusPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) router.push('/')
    if (!isPending && session) router.replace('/dashboard')
  }, [session, isPending, router])

  return <div className="min-h-screen flex items-center justify-center text-white">...</div>
}
