const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('C:/Users/User/Desktop/a cap/acap/.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
}
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
  await c.connect();
  const r = await c.query(`
    WITH ranked AS (
      SELECT symbol, price, "updatedAt",
             ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY "updatedAt" DESC, id DESC) AS rn
      FROM asset_price WHERE price > 0
    )
    SELECT curr.symbol, curr.price AS curr_price, prev.price AS prev_price,
           curr."updatedAt" AS curr_at, prev."updatedAt" AS prev_at
    FROM ranked curr LEFT JOIN ranked prev ON prev.symbol = curr.symbol AND prev.rn = 2
    WHERE curr.rn = 1 AND prev.price IS NOT NULL AND prev.price <> curr.price
    LIMIT 8
  `);
  console.log('symbols with genuine price history (prev != curr):', r.rows.length);
  for (const row of r.rows) console.log('  ', row.symbol, 'curr=' + row.curr_price, 'prev=' + row.prev_price, '|', row.curr_at, 'vs', row.prev_at);
  await c.end();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
