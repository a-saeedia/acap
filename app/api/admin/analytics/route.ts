import { pool } from '@/lib/db'
import { getRecentAnomalies } from '@/lib/ml'

export async function GET() {
  try {
    const [pageViews, eventCount, topPages, uniqueUsers, anomalies] = await Promise.all([
      pool.query(`
        SELECT DATE("createdAt") as date, COUNT(*) as count
        FROM user_event WHERE event = 'page_view'
        AND "createdAt" > NOW() - INTERVAL '30 days'
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
      `),
      pool.query(`
        SELECT event, COUNT(*) as count
        FROM user_event
        WHERE "createdAt" > NOW() - INTERVAL '7 days'
        GROUP BY event ORDER BY count DESC
      `),
      pool.query(`
        SELECT path, COUNT(*) as count
        FROM user_event WHERE event = 'page_view'
        AND "createdAt" > NOW() - INTERVAL '7 days'
        AND path IS NOT NULL
        GROUP BY path ORDER BY count DESC LIMIT 20
      `),
      pool.query(`
        SELECT COUNT(DISTINCT "userId") as count
        FROM user_event
        WHERE "userId" IS NOT NULL
        AND "createdAt" > NOW() - INTERVAL '7 days'
      `),
      getRecentAnomalies(10),
    ])

    const totalEvents = await pool.query(
      `SELECT COUNT(*) as count FROM user_event WHERE "createdAt" > NOW() - INTERVAL '7 days'`
    )

    return Response.json({
      pageViews: pageViews.rows,
      eventCounts: eventCount.rows,
      topPages: topPages.rows,
      uniqueUsers: uniqueUsers.rows[0]?.count || 0,
      totalEvents: totalEvents.rows[0]?.count || 0,
      anomalies,
    })
  } catch (e) {
    console.error('analytics error:', e)
    return Response.json({ error: 'failed to load analytics' }, { status: 500 })
  }
}
