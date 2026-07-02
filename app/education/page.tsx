'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EducationPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/app/academy') }, [])
  return null
}
