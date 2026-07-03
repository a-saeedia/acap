'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTheme } from './theme-provider'

// ─────────────────────────────────────────────────────────────────────────────
// Connected-A Chart Background
// Several A letters of different heights are arranged side-by-side like bars on
// a chart. A bright neon light pulse travels continuously across all of them,
// illuminating each A as it passes — like current flowing through a circuit board.
// ─────────────────────────────────────────────────────────────────────────────
function ConnectedAChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Use willReadFrequently=false; we never read pixels — pure draw
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Declare cache vars before resize() so the closure can reference them
    let cachedPts:    { x: number; y: number }[] = []
    let cachedSegLen: number[] = []
    let cachedTotal  = 0
    let lastW = 0, lastH = 0

    // ── Size to CSS pixels (never multiply by devicePixelRatio — saves GPU fill)
    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      cachedTotal = 0   // force path rebuild on next frame
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const letters = [
      { cx: 0.08, scale: 0.30 },
      { cx: 0.22, scale: 0.46 },
      { cx: 0.36, scale: 0.38 },
      { cx: 0.50, scale: 0.58 },
      { cx: 0.64, scale: 0.44 },
      { cx: 0.78, scale: 0.34 },
      { cx: 0.92, scale: 0.24 },
    ]

    // ── Draw A skeletons once onto a static offscreen canvas
    // Re-drawn only on resize, never on every frame
    const staticCanvas = document.createElement('canvas')
    const sCtx = staticCanvas.getContext('2d')!

    function buildStaticLayer(W: number, H: number) {
      staticCanvas.width  = W
      staticCanvas.height = H
      sCtx.clearRect(0, 0, W, H)
      const baseY = H * 0.92
      const maxH  = H * 0.42
      // Baseline
      sCtx.strokeStyle = 'rgba(192,192,192,0.04)'
      sCtx.lineWidth = 0.8
      sCtx.beginPath(); sCtx.moveTo(0, baseY); sCtx.lineTo(W, baseY); sCtx.stroke()
      // Each A — single batched path per pass
      sCtx.strokeStyle = 'rgba(192,192,192,0.045)'
      sCtx.lineWidth = 0.8
      sCtx.beginPath()
      letters.forEach(({ cx: cxF, scale }) => {
        const cx    = cxF * W
        const h     = scale * maxH
        const hw    = h * 0.32
        const apexY = baseY - h
        const crossY = baseY - h * 0.40
        sCtx.moveTo(cx, apexY);           sCtx.lineTo(cx - hw, baseY)
        sCtx.moveTo(cx, apexY);           sCtx.lineTo(cx + hw, baseY)
        sCtx.moveTo(cx - hw * 0.44, crossY); sCtx.lineTo(cx + hw * 0.44, crossY)
      })
      sCtx.stroke()
    }

    // ── Comet path (polyline through A apexes)
    function buildPath(W: number, H: number) {
      const baseY = H * 0.92
      const maxH  = H * 0.42
      const allPts = [
        { x: 0, y: baseY },
        ...letters.map(({ cx: cxF, scale }) => ({ x: cxF * W, y: baseY - scale * maxH })),
        { x: W, y: baseY },
      ]
      const lens: number[] = [0]
      for (let i = 1; i < allPts.length; i++) {
        const dx = allPts[i].x - allPts[i-1].x
        const dy = allPts[i].y - allPts[i-1].y
        lens.push(lens[i-1] + Math.sqrt(dx*dx + dy*dy))
      }
      cachedPts    = allPts
      cachedSegLen = lens
      cachedTotal  = lens[lens.length - 1]
      buildStaticLayer(W, H)
    }

    function pointAt(d: number) {
      const c = Math.max(0, Math.min(cachedTotal, d))
      for (let i = 1; i < cachedSegLen.length; i++) {
        if (cachedSegLen[i] >= c) {
          const t = (c - cachedSegLen[i-1]) / (cachedSegLen[i] - cachedSegLen[i-1])
          return {
            x: cachedPts[i-1].x + t * (cachedPts[i].x - cachedPts[i-1].x),
            y: cachedPts[i-1].y + t * (cachedPts[i].y - cachedPts[i-1].y),
          }
        }
      }
      return cachedPts[cachedPts.length - 1]
    }

    const TRAIL_FRAC = 0.20
    const SPEED      = 0.00038
    const SAMPLES    = 28
    let progress     = 0

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      if (cachedTotal === 0 || W !== lastW || H !== lastH) {
        buildPath(W, H)
        lastW = W; lastH = H
      }

      // Stamp static layer — one drawImage call, zero vector ops
      ctx.drawImage(staticCanvas, 0, 0)

      progress = (progress + SPEED) % 1
      const headDist  = progress * cachedTotal
      const trailDist = Math.max(0, headDist - TRAIL_FRAC * cachedTotal)

      // ── Trail: single gradient-stroked path, zero blur
      // Use a linear gradient along the path direction for the fade effect
      const tail = pointAt(trailDist)
      const head = pointAt(headDist)
      const grad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y)
      grad.addColorStop(0,   'rgba(47,125,255,0)')
      grad.addColorStop(0.6, 'rgba(47,125,255,0.12)')
      grad.addColorStop(1,   'rgba(200,220,255,0.50)')

      // Build trail as one continuous path (cheap)
      ctx.beginPath()
      for (let s = 0; s <= SAMPLES; s++) {
        const d = trailDist + (s / SAMPLES) * (headDist - trailDist)
        const p = pointAt(d)
        s === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      }
      ctx.strokeStyle = grad
      ctx.lineWidth   = 1.8
      ctx.lineCap     = 'round'
      ctx.stroke()

      // ── Comet head: a soft radial gradient circle — NO ctx.filter (huge perf win)
      const headGrad = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 14)
      headGrad.addColorStop(0,   'rgba(255,255,255,0.90)')
      headGrad.addColorStop(0.3, 'rgba(140,190,255,0.55)')
      headGrad.addColorStop(1,   'rgba(47,125,255,0)')
      ctx.beginPath()
      ctx.arc(head.x, head.y, 14, 0, Math.PI * 2)
      ctx.fillStyle = headGrad
      ctx.fill()

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      ro.disconnect()
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ opacity: 0.80 }}
      aria-hidden
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Horizontal Route Chart
// A thin silver/blue line that runs horizontally across the FULL viewport width.
// As the user scrolls, the line's vertical position changes — routing between
// section titles like a live market chart changing direction.
// ────────────────────────���────────────────────────────────────────────────────
function HorizontalRouteChart() {
  const [mounted, setMounted] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [vpH, setVpH] = useState(800)

  useEffect(() => {
    setMounted(true)
    setVpH(window.innerHeight)
    let rafId: number | undefined
    const onScroll = () => {
      if (rafId !== undefined) return          // already queued — skip
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY)
        rafId = undefined
      })
    }
    const onResize = () => setVpH(window.innerHeight)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafId !== undefined) cancelAnimationFrame(rafId)
    }
  }, [])

  const W = 1000    // reduced from 1400 — fewer SVG units to render
  const H = 80      // reduced from 120
  const N = 70      // reduced from 200 — plenty smooth, much cheaper
  const phase = scrollY * 0.006

  // Market-style price action that changes based on scroll position
  const prices = Array.from({ length: N }, (_, i) => {
    const progress = i / N
    // Base vertical position oscillates with scroll phase
    const baseY = H * 0.5
    const noise =
      Math.sin(i * 1.3 + phase) * 0.28 +
      Math.sin(i * 0.51 + phase * 0.7) * 0.22 +
      Math.sin(i * 4.1 + phase * 1.5) * 0.08 +
      Math.sin(i * 0.22 + phase * 0.4) * 0.38 +
      (Math.sin(i * 0.31) > 0.88 ? Math.sin(i * 2.1 + phase) * 0.5 : 0)
    return baseY + noise * H * 0.44 + Math.sin(progress * Math.PI) * H * 0.06
  })

  const linePath = prices.map((y, i) => {
    const x = (i / (N - 1)) * W
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  const areaPath = `${linePath} L${W},${H} L0,${H} Z`

  // Vertical position follows scroll — routes between sections
  const scrollFraction = Math.min(scrollY / (vpH * 4), 1)
  const topPercent = 20 + scrollFraction * 60

  if (!mounted) return null

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 z-[2] overflow-visible"
      style={{ top: `${topPercent}%`, transform: 'translateY(-50%)', opacity: 0.08, willChange: 'top' }}
      aria-hidden
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: H }}>
        <defs>
          <linearGradient id="hRouteGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="8%" stopColor="#C0C0C0" />
            <stop offset="35%" stopColor="#5a8fc8" />
            <stop offset="65%" stopColor="#C0C0C0" />
            <stop offset="92%" stopColor="#5a8fc8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="hAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5a8fc8" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#5a8fc8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#hAreaGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#hRouteGrad)"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Cursor silver/blue wave ripple
// ─────────────────────────────────────────────────────────────────────────────
function CursorWave() {
  const divRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let rafId: number | undefined
    let px = -500, py = -500
    const move = (e: MouseEvent) => {
      px = e.clientX; py = e.clientY
      if (rafId !== undefined) return
      rafId = requestAnimationFrame(() => {
        if (divRef.current) {
          divRef.current.style.transform = `translate(${px - 180}px, ${py - 180}px)`
        }
        rafId = undefined
      })
    }
    window.addEventListener('mousemove', move, { passive: true })
    return () => {
      window.removeEventListener('mousemove', move)
      if (rafId !== undefined) cancelAnimationFrame(rafId)
    }
  }, [])

  if (!mounted) return null

  return (
    <div
      ref={divRef}
      className="pointer-events-none fixed z-[1] top-0 left-0"
      style={{
        width: 360, height: 360,
        transform: 'translate(-500px,-500px)',
        willChange: 'transform',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(192,192,192,0.04) 0%, rgba(47,125,255,0.025) 45%, transparent 72%)',
      }}
      aria-hidden
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────
export function Hero({ onOpenAuth }: { onOpenAuth?: () => void }) {
  const { theme } = useTheme()
  const scrollTo = (id: string) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <CursorWave />
      <HorizontalRouteChart />

      <section id="home" className="relative min-h-screen flex flex-col overflow-hidden bg-background" dir="rtl">

        {/* Connected-A chart background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden>
          <ConnectedAChart />
          {/* Radial center glow overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_50%,rgba(47,125,255,0.05)_0%,transparent_70%)]" />
          {/* Top edge */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          {/* Bottom fade so content reads clearly */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Main content — fully centered */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="w-full max-w-3xl mx-auto px-6 pt-24 pb-12 flex flex-col items-center text-center gap-6">

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
            >
              <Image
                src={theme === 'light' ? '/logo-light.png' : '/logo-transparent.png'}
                alt="A Capital"
                width={420}
                height={126}
                className="object-contain w-64 sm:w-80 md:w-[420px]"
                style={{ height: 'auto' }}
                priority
                loading="eager"
              />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18 }}
            >
              <span className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-5 py-1.5 text-sm text-primary font-semibold tracking-wide backdrop-blur-sm bg-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                اولین دستیار مدیریت سرمایه مبتنی بر شخصیت مالی
              </span>
            </motion.div>

            {/* Headline — single line */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.65 }}
            >
              <h1
                className="font-black text-foreground"
                style={{ fontSize: 'clamp(1.5rem, 4.5vw, 3.6rem)', lineHeight: 1.3, letterSpacing: '-0.02em' }}
              >
                سرمایه‌ات را <span className="text-brand-shimmer whitespace-nowrap">هوشمند مدیریت کن</span>
              </h1>
            </motion.div>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto"
              style={{ lineHeight: 2.0 }}
            >
              A | CAP با تحلیل شخصیت مالی شما، نقشه سرمایه‌گذاری اختصاصی طراحی می‌کند.
              نه بر پایه هیجان، بلکه بر پایه اطلاعات.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <motion.button
                onClick={() => scrollTo('#quiz')}
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(47,125,255,0.5)' }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary px-8 py-3.5 rounded-2xl font-black text-base tracking-wide"
              >
                تست شخصیت مالی — رایگان
              </motion.button>
              <motion.button
                onClick={onOpenAuth}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="glass border border-primary/25 hover:border-primary/55 text-foreground px-8 py-3.5 rounded-2xl font-bold text-base transition-all"
              >
                ورود / ثبت‌نام
              </motion.button>
            </motion.div>

            {/* Stats row — centered */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex flex-wrap justify-center gap-3 mt-2"
            >
              {[
                { v: '+۲۰۰۰', l: 'کاربر فعال' },
                { v: '۶', l: 'بازار پوشش داده‌شده' },
                { v: '۴', l: 'تیپ شخصیت مالی' },
                { v: '۹۸٪', l: 'رضایت کاربران' },
              ].map(s => (
                <div key={s.l} className="glass border border-border/50 rounded-xl px-5 py-3 text-center min-w-[96px]">
                  <div className="text-primary font-black text-xl">{s.v}</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5 whitespace-nowrap">{s.l}</div>
                </div>
              ))}
            </motion.div>

            {/* Brand tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground/35 font-mono"
            >
              PRECISION · TRUST · PERFORMANCE
            </motion.p>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className="relative z-10 flex justify-center pb-8 cursor-pointer"
          onClick={() => scrollTo('#about')}
          aria-label="اسکرول پایین"
        >
          <div className="w-5 h-8 border border-muted-foreground/20 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-primary/50 rounded-full" />
          </div>
        </motion.div>
      </section>
    </>
  )
}
