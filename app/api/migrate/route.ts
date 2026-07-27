import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { randomUUID } from 'node:crypto'

export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get('key')
    if (key !== 'acap_migrate_2026') return NextResponse.json({ error: 'Invalid key' }, { status: 403 })

    const cmds = req.nextUrl.searchParams.get('cmd')

    if (cmds === 'columns') {
      const { rows } = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'signal' ORDER BY ordinal_position`)
      return NextResponse.json({ columns: rows })
    }

    if (cmds === 'retro-broadcast') {
      const { rows: suggestions } = await pool.query(
        `SELECT title, content, "profitPercent", "profitMessage", "imageUrl", "audioUrl", "expiresAt", "adminId"
         FROM suggestion WHERE "adminId" IS NOT NULL AND ("isBroadcast" IS NULL OR "isBroadcast" = false)
         GROUP BY title, content, "profitPercent", "profitMessage", "imageUrl", "audioUrl", "expiresAt", "adminId"`
      )
      let created = 0
      for (const s of suggestions) {
        const existing = await pool.query(
          `SELECT id FROM suggestion WHERE "isBroadcast" = true AND title = $1 AND content = $2`,
          [s.title, s.content]
        )
        if (existing.rows.length > 0) continue
        await pool.query(
          `INSERT INTO suggestion (id, "userId", "adminId", title, content, "profitPercent", "profitMessage", "imageUrl", "audioUrl", "expiresAt", "isBroadcast", "createdAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW())`,
          [randomUUID(), s.adminId, s.adminId, s.title, s.content, s.profitPercent, s.profitMessage, s.imageUrl, s.audioUrl, s.expiresAt]
        )
        created++
      }
      return NextResponse.json({ success: true, broadcastEntriesCreated: created })
    }

    // Full migration run
    await pool.query(`ALTER TABLE signal ADD COLUMN IF NOT EXISTS "imageUrl" text`)
    await pool.query(`ALTER TABLE signal ADD COLUMN IF NOT EXISTS "audioUrl" text`)
    await pool.query(`ALTER TABLE signal ALTER COLUMN "priceAtPublish" TYPE double precision`)
    await pool.query(`ALTER TABLE signal ALTER COLUMN "priceNow" TYPE double precision`)
    await pool.query(`ALTER TABLE signal ALTER COLUMN "expectedProfit" TYPE double precision`)
    await pool.query(`ALTER TABLE signal ALTER COLUMN "actualReturn" TYPE double precision`)
    await pool.query(`ALTER TABLE signal ADD COLUMN IF NOT EXISTS "visibility" text NOT NULL DEFAULT 'public'`)
    await pool.query(`ALTER TABLE signal ADD COLUMN IF NOT EXISTS "targetUserIds" jsonb`)
    await pool.query(`ALTER TABLE signal ADD COLUMN IF NOT EXISTS "audience" text NOT NULL DEFAULT 'general'`)
    await pool.query(`ALTER TABLE acap_revenue ADD COLUMN IF NOT EXISTS "type" text NOT NULL DEFAULT 'general'`)
    await pool.query(`ALTER TABLE suggestion ADD COLUMN IF NOT EXISTS "isBroadcast" boolean NOT NULL DEFAULT false`)

    return NextResponse.json({ success: true, message: 'All migrations applied' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, detail: e.stack?.substring(0, 300) }, { status: 500 })
  }
}
