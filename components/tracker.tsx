'use client'

import { useEffect, createContext, useContext, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from '@/lib/auth-client'

type TrackEvent = (event: string, metadata?: Record<string, unknown>) => void

const TrackContext = createContext<TrackEvent>(() => {})

export const useTrack = () => useContext(TrackContext)

export function Tracker({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const lastPath = useRef(pathname)

  const track: TrackEvent = (event, metadata) => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        path: pathname,
        metadata,
        userId: session?.user?.id,
      }),
    }).catch(() => {})
  }

  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    track('page_view')
  }, [pathname])

  return <TrackContext.Provider value={track}>{children}</TrackContext.Provider>
}
