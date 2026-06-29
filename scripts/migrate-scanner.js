const {Pool} = require('pg');
const p = new Pool({connectionString: 'postgresql://neondb_owner:npg_7cDmedLMV9TH@ep-cool-rice-ad08tjh2-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'});
(async()=>{
try{await p.query('ALTER TABLE subscription ADD COLUMN IF NOT EXISTS "scannerActive" BOOLEAN DEFAULT true');console.log('OK')}catch(e){console.error('ERR',e.message)}
await p.end()
})()
