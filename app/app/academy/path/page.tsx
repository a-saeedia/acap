'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PathPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/app/academy') }, [router])
  return null
}
