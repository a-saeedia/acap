import { pool } from '@/lib/db'

export async function GET() {
  try {
    await pool.query('ALTER TABLE suggestion ADD COLUMN IF NOT EXISTS "imageUrl" text')
    await pool.query('ALTER TABLE suggestion ADD COLUMN IF NOT EXISTS "audioUrl" text')
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
