const {Pool} = require('pg');
const p = new Pool({connectionString: process.env.DATABASE_URL});
(async()=>{
try{await p.query('ALTER TABLE asset_price ALTER COLUMN price TYPE real USING price::numeric::real');console.log('OK')}catch(e){console.error('ERR',e.message)}
await p.end()
})()
