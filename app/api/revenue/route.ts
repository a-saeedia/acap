import { pool } from '@/lib/db'

export async function GET() {
  try {
    const { rows: revenue } = await pool.query(`SELECT * FROM acap_revenue ORDER BY year DESC, month DESC`)
    const { rows: suggestions } = await pool.query(
      `SELECT * FROM suggestion WHERE "isBroadcast" = true ORDER BY "createdAt" DESC`
    )
    return Response.json({ revenue, suggestions })
  } catch {
    return Response.json({ revenue: [], suggestions: [] })
  }
}
