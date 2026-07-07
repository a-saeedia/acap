import { readFileSync } from 'fs';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_7cDmedLMV9TH@ep-cool-rice-ad08tjh2-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' });

try {
  const sql = readFileSync('drizzle/0003_jittery_mother_askani.sql', 'utf-8');
  const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

  for (const stmt of statements) {
    console.log('Executing:', stmt.substring(0, 80) + '...');
    try {
      await pool.query(stmt);
      console.log('  OK');
    } catch(e) {
      if (e.message.includes('already exists')) {
        console.log('  Skipped (already exists)');
      } else {
        throw e;
      }
    }
  }
  console.log('\nMigration 0003 applied!');
} catch(e) {
  console.error('Error:', e.message);
}
await pool.end();
