'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from './theme-provider'

export function CursorGlow() {
  const { isBinance } = useTheme()
  const [mounted, setMounted] = useState(false)
  const elRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const currentRef = useRef({ x: -500, y: -500 })
  const targetRef = useRef({ x: -500, y: -500 })

  useEffect(() => {
    setMounted(true)
    const move = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', move, { passive: true })

    const tick = () => {
      const el = elRef.current
      if (!el) { rafRef.current = requestAnimationFrame(tick); return }
      const cx = currentRef.current.x + (targetRef.current.x - currentRef.current.x) * 0.12
      const cy = currentRef.current.y + (targetRef.current.y - currentRef.current.y) * 0.12
      currentRef.current = { x: cx, y: cy }
      el.style.transform = `translate(${cx - 70}px, ${cy - 70}px)`
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', move)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (!mounted || !isBinance) return null

  return (
    <div
      ref={elRef}
      className="pointer-events-none fixed z-[9999] top-0 left-0"
      style={{
        width: 140,
        height: 140,
        transform: 'translate(-500px, -500px)',
        willChange: 'transform',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,140,0,0.10) 0%, rgba(255,100,0,0.03) 40%, transparent 60%)',
      }}
      aria-hidden
    />
  )
}
