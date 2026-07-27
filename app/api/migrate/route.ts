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
      // Step 1: Mark ALL existing admin-created suggestions as isBroadcast
      const updateRes = await pool.query(
        `UPDATE suggestion SET "isBroadcast" = true WHERE "adminId" IS NOT NULL AND ("isBroadcast" IS NULL OR "isBroadcast" = false)`
      )
      // Step 2: Deduplicate — for each unique (title, content), keep one broadcast entry, delete duplicates
      const { rows: dupes } = await pool.query(
        `SELECT id FROM suggestion WHERE "isBroadcast" = true AND id NOT IN (
           SELECT MIN(id) FROM suggestion WHERE "isBroadcast" = true GROUP BY title, content
         )`
      )
      if (dupes.length > 0) {
        const ids = dupes.map((r: any) => `'${r.id}'`).join(',')
        await pool.query(`DELETE FROM suggestion WHERE id IN (${ids})`)
      }
      return NextResponse.json({ success: true, markedAsBroadcast: updateRes.rowCount, duplicatesRemoved: dupes.length })
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
