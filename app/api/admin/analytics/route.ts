import { pool } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalUsers, plusUsers, totalAssets, totalSignals,
      totalSuggestions, openTickets,
      dailyUsers, pageViews, eventCount, topPages,
      heatMap, anomalies,
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int FROM "user"`),
      pool.query(`SELECT COUNT(*)::int FROM subscription WHERE "acapPlus" = true`),
      pool.query(`SELECT COUNT(*)::int FROM asset`),
      pool.query(`SELECT COUNT(*)::int FROM signal`),
      pool.query(`SELECT COUNT(*)::int FROM suggestion`),
      pool.query(`SELECT COUNT(*)::int FROM ticket WHERE status != 'closed'`),
      pool.query(`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "user" WHERE "createdAt" > NOW() - INTERVAL '30 days'
        GROUP BY DATE("createdAt") ORDER BY date
      `),
      pool.query(`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM user_event WHERE event = 'page_view'
        AND "createdAt" > NOW() - INTERVAL '30 days'
        GROUP BY DATE("createdAt") ORDER BY date DESC
      `),
      pool.query(`
        SELECT event, COUNT(*)::int as count
        FROM user_event WHERE "createdAt" > NOW() - INTERVAL '7 days'
        GROUP BY event ORDER BY count DESC
      `),
      pool.query(`
        SELECT path, COUNT(*)::int as count
        FROM user_event WHERE event = 'page_view'
        AND "createdAt" > NOW() - INTERVAL '7 days' AND path IS NOT NULL
        GROUP BY path ORDER BY count DESC LIMIT 20
      `),
      pool.query(`
        SELECT date, COALESCE(COUNT(*)::int, 0) as count
        FROM (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '364 days',
            CURRENT_DATE,
            '1 day'
          )::date AS date
        ) AS d
        LEFT JOIN user_event ON
          DATE(user_event."createdAt") = d.date
          AND user_event.event = 'page_view'
        GROUP BY d.date ORDER BY d.date
      `),
      pool.query(`
        SELECT symbol, price, "updatedAt"
        FROM asset_price WHERE "updatedAt" > NOW() - INTERVAL '1 day'
        ORDER BY "updatedAt" DESC
      `),
    ])

    return Response.json({
      totalUsers: totalUsers.rows[0]?.count || 0,
      plusUsers: plusUsers.rows[0]?.count || 0,
      totalAssets: totalAssets.rows[0]?.count || 0,
      totalSignals: totalSignals.rows[0]?.count || 0,
      totalSuggestions: totalSuggestions.rows[0]?.count || 0,
      openTickets: openTickets.rows[0]?.count || 0,
      dailyUsers: dailyUsers.rows,
      pageViews: pageViews.rows,
      eventCounts: eventCount.rows,
      topPages: topPages.rows,
      heatMap: heatMap.rows,
      recentPrices: anomalies.rows.slice(0, 10),
    })
  } catch (e) {
    console.error('analytics error:', e)
    return Response.json({ error: 'failed to load analytics' }, { status: 500 })
  }
}
