const fs = require('node:fs');
const path = require('node:path');
const {Client} = require('../../backend2.0/node_modules/pg');
require('../../backend2.0/node_modules/pg').types.setTypeParser(1082,v=>v);
const root = path.resolve(__dirname,'../..');
const env = {};
for (const line of fs.readFileSync(path.join(root,'backend2.0/.env'),'utf8').split(/\r?\n/)) {
  const m=line.match(/^([A-Z0-9_]+)=(.*)$/); if(m) env[m[1]]=m[2].trim().replace(/^(['"])(.*)\1$/,'$2');
}
const truth = v=>['true','1','yes','on','require','verify-ca','verify-full'].includes(String(v).toLowerCase());
const u=env.DB_URL?new URL(env.DB_URL):null;
const config=u?{host:u.hostname,port:Number(u.port)||5432,user:decodeURIComponent(u.username),password:decodeURIComponent(u.password),database:u.pathname.slice(1)}:{host:env.DB_HOST,port:Number(env.DB_PORT)||5432,user:env.DB_USERNAME,password:env.DB_PASSWORD,database:env.DB_DATABASE};
if(truth(env.DB_SSL)||(u?.searchParams.get('sslmode')&&u.searchParams.get('sslmode')!=='disable'))config.ssl={rejectUnauthorized:truth(env.DB_SSL_REJECT_UNAUTHORIZED)};
config.connectionTimeoutMillis=15000;
config.options='-c statement_timeout=30000';

const mappings=[
 {bookingId:66,bookingNumber:'A59GX18786',portId:35984,code:'VNTCI',type:'PORT',name:'CAI MEP, VN (VNTCI)'},
 {bookingId:67,bookingNumber:'A59GX18837',portId:35984,code:'VNTCI',type:'PORT',name:'CAI MEP, VN (VNTCI)'},
 {bookingId:435,bookingNumber:'A59GX07103',portId:35988,code:'VNCLI',type:'TERMINAL',name:'CAT LAI TERMINAL, VN (VNCLI)'}
];
async function main(){
 const client=new Client(config);await client.connect();const apply=process.argv.includes('--apply');
 try{
 await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ'+(apply?'':' READ ONLY'));
 const summary=async()=> (await client.query("SELECT count(*)::int AS bookings,sum(planned_teu)::text AS booked,sum(actual_teu)::text AS actual FROM booking_reporting_v1 WHERE etd >= '2026-04-01' AND etd < '2026-07-01'")).rows[0];
 const before=await summary();const changes=[];
 for(const m of mappings){
 const port=(await client.query('SELECT id,name,code,type,country_code,is_active FROM ports WHERE id=$1',[m.portId])).rows[0];
 if(!port||port.code!==m.code||port.type!==m.type||port.country_code!=='VN'||!port.is_active)throw Error('Port identity changed: '+m.portId);
 const b=(await client.query('SELECT id,booking_number,version,place_of_issue_port_id,place_of_issue_name FROM booking_records WHERE id=$1 AND deleted_at IS NULL',[m.bookingId])).rows[0];
 if(!b||b.booking_number!==m.bookingNumber)throw Error('Booking identity changed');
 if(Number(b.place_of_issue_port_id)===m.portId && b.place_of_issue_name===m.name)continue;
 if(b.place_of_issue_port_id!==null)throw Error('Existing port ID requires review for '+m.bookingNumber);
 if(apply){const updated=await client.query('UPDATE booking_records SET place_of_issue_port_id=$1,place_of_issue_name=$2,version=version+1,updated_at=now() WHERE id=$3 AND version=$4 AND deleted_at IS NULL AND place_of_issue_port_id IS NULL RETURNING version',[m.portId,m.name,m.bookingId,b.version]);if(updated.rowCount!==1)throw Error('Concurrent booking update');}
 changes.push({bookingId:m.bookingId,bookingNumber:m.bookingNumber,field:'place_of_issue_port_id',before:b,after:{place_of_issue_port_id:m.portId,place_of_issue_name:m.name,version:apply?b.version+1:b.version},catalog:port});
 }
 const after=await summary();if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Quarter totals changed');
 const report={mode:apply?'applied':'dry-run',capturedAt:new Date().toISOString(),authorization:'User-specified CAT LAI TERMINAL/VNCLI and CAI MEP/VNTCI mappings',before,after,changes};
 fs.writeFileSync(path.join(root,'docs/reports/logistics-q2-2026/port-id-explicit-'+(apply?'applied':'audit')+'.json'),JSON.stringify(report,null,2));
 await client.query(apply?'COMMIT':'ROLLBACK');console.log(JSON.stringify(report));
 }catch(error){await client.query('ROLLBACK');throw error;}finally{await client.end();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
