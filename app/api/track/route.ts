import { pool } from '@/lib/db'
import { randomUUID } from 'node:crypto'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getRateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

const MAX_METADATA = 2000
const MAX_EVENT = 100
const MAX_PATH = 100
const MAX_UA = 300

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
    if (!getRateLimit(`track:${ip}`, 60, 60_000)) {
      return Response.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { event, path, metadata, userId } = await request.json()
    if (!event) {
      return Response.json({ error: 'event is required' }, { status: 400 })
    }

    const userAgent = request.headers.get('user-agent') || ''

    let metadataJson: string | null = null
    if (metadata !== undefined && metadata !== null) {
      metadataJson = JSON.stringify(metadata)
      if (metadataJson.length > MAX_METADATA) metadataJson = metadataJson.slice(0, MAX_METADATA)
    }

    await pool.query(
      `INSERT INTO user_event (id, "userId", event, path, metadata, ip, "userAgent", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [randomUUID(), userId || null, String(event).slice(0, MAX_EVENT), String(path || '').slice(0, MAX_PATH), metadataJson, ip, userAgent.slice(0, MAX_UA)]
    )

    return Response.json({ ok: true })
  } catch (e) {
    console.error('track error:', e)
    return Response.json({ error: 'tracking failed' }, { status: 500 })
  }
}
