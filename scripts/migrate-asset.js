const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_7cDmedLMV9TH@ep-cool-rice-ad08tjh2-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});
async function run() {
  try {
    await pool.query(`ALTER TABLE asset ALTER COLUMN quantity TYPE real USING quantity::real`);
    await pool.query(`ALTER TABLE asset ALTER COLUMN quantity SET DEFAULT 0`);
    await pool.query(`ALTER TABLE asset ALTER COLUMN "purchasePrice" TYPE real USING "purchasePrice"::real`);
    console.log('Migration OK');
  } catch (e) {
    console.error('Migration error:', e.message);
  }
  await pool.end();
}
run();
