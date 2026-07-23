import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get('key')
    if (key !== 'acap_migrate_2026') return NextResponse.json({ error: 'Invalid key' }, { status: 403 })

    const cmds = req.nextUrl.searchParams.get('cmd')
    if (cmds === 'columns') {
      const { rows } = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'signal' ORDER BY ordinal_position`)
      return NextResponse.json({ columns: rows })
    }

    // Apply missing migration 0006: add imageUrl, audioUrl
    await pool.query(`ALTER TABLE signal ADD COLUMN IF NOT EXISTS "imageUrl" text`)
    await pool.query(`ALTER TABLE signal ADD COLUMN IF NOT EXISTS "audioUrl" text`)
    // Apply migration 0007: double precision
    await pool.query(`ALTER TABLE signal ALTER COLUMN "priceAtPublish" TYPE double precision`)
    await pool.query(`ALTER TABLE signal ALTER COLUMN "priceNow" TYPE double precision`)
    await pool.query(`ALTER TABLE signal ALTER COLUMN "expectedProfit" TYPE double precision`)
    await pool.query(`ALTER TABLE signal ALTER COLUMN "actualReturn" TYPE double precision`)

    return NextResponse.json({ success: true, message: 'All migrations applied' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, detail: e.stack?.substring(0, 300) }, { status: 500 })
  }
}
