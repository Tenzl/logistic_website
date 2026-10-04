const norm = v => String(v ?? '').normalize('NFC').trim().replace(/\s+/g,' ').toUpperCase();
function matchPort(value, ports) {
 const raw=norm(value); const code=raw.match(/\(([^()]+)\)$/)?.[1];
 const base=raw.replace(/\s*\([^()]+\)$/,''); const country=base.match(/,\s*([A-Z]{2})$/)?.[1];
 const name=base.replace(/,\s*[A-Z]{2}$/,'').trim();
 let candidates=ports.filter(p=>p.is_active && (!country || norm(p.country_code)===country));
 candidates=code ? candidates.filter(p=>norm(p.code)===code) : candidates.filter(p=>norm(p.code)===raw || [p.name,p.sub_name_1,p.sub_name_2].some(n=>norm(n)===name));
 if(code && candidates.length>1) candidates=candidates.filter(p=>[p.name,p.sub_name_1,p.sub_name_2].some(n=>norm(n)===name));
 return {id:candidates.length===1?candidates[0].id:null,reason:candidates.length===1?'unique match':candidates.length?'ambiguous match':'no exact match',candidates:candidates.map(p=>({id:p.id,name:p.name,code:p.code}))};
}
module.exports={matchPort};
