const {Pool} = require('pg');
const p = new Pool({connectionString: process.env.DATABASE_URL});
(async()=>{
try{await p.query('ALTER TABLE subscription ADD COLUMN IF NOT EXISTS "scannerActive" BOOLEAN DEFAULT true');console.log('OK')}catch(e){console.error('ERR',e.message)}
await p.end()
})()
