import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get('key')
    if (key !== 'acap_migrate_2026') return NextResponse.json({ error: 'Invalid key' }, { status: 403 })

    await pool.query(`ALTER TABLE signal ALTER COLUMN "priceAtPublish" TYPE double precision`)
    await pool.query(`ALTER TABLE signal ALTER COLUMN "priceNow" TYPE double precision`)
    await pool.query(`ALTER TABLE signal ALTER COLUMN "expectedProfit" TYPE double precision`)
    await pool.query(`ALTER TABLE signal ALTER COLUMN "actualReturn" TYPE double precision`)
    
    return NextResponse.json({ success: true, message: 'Migration complete' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, detail: e.stack }, { status: 500 })
  }
}
