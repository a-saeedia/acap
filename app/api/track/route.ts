import { pool } from '@/lib/db'
import { randomUUID } from 'node:crypto'

export async function POST(request: Request) {
  try {
    const { event, path, metadata } = await request.json()
    if (!event) {
      return Response.json({ error: 'event is required' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
    const userAgent = request.headers.get('user-agent') || ''

    await pool.query(
      `INSERT INTO user_event (id, "userId", event, path, metadata, ip, "userAgent", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [randomUUID(), null, event, path || '', metadata ? JSON.stringify(metadata) : null, ip, userAgent]
    )

    return Response.json({ ok: true })
  } catch (e) {
    console.error('track error:', e)
    return Response.json({ error: 'tracking failed' }, { status: 500 })
  }
}
