"""GET-only local asset checks and pure/mock reproductions, never connect to DB."""
import hashlib,json,os,shutil,subprocess,time,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent/'evidence'
info=json.loads((OUT/'isolated-workspace.json').read_text())
base=Path(info['directory']);app=base/'dashboard_admin'
env={k:v for k,v in os.environ.items() if k.upper() in {'PATH','SYSTEMROOT','WINDIR','TEMP','TMP','COMSPEC','PATHEXT','PROCESSOR_ARCHITECTURE','NUMBER_OF_PROCESSORS','USERPROFILE','APPDATA','LOCALAPPDATA'}}
env.update({'NODE_ENV':'production','NEXT_TELEMETRY_DISABLED':'1','API_PROXY_TARGET':'http://127.0.0.1:9','NODE_OPTIONS':f'--require="{Path(info["guard"]).as_posix()}"'})
node=shutil.which('node'); port=49731
record=[]
with (OUT/'local-next-server.log').open('w',encoding='utf-8') as log:
    proc=subprocess.Popen([node,str(app/'node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',str(port)],cwd=app,env=env,stdout=log,stderr=subprocess.STDOUT)
    try:
        for attempt in range(60):
            try:
                urllib.request.urlopen(f'http://127.0.0.1:{port}/sign-in',timeout=1).read();break
            except Exception:
                if proc.poll() is not None:raise RuntimeError('Isolated server stopped; inspect local-next-server.log')
                time.sleep(.25)
        bundles=json.loads((OUT/'isolated-bundle-formulas.json').read_text())
        chosen=[b for b in bundles if 'tonnagePerGrt' in b['signatures']]
        for bundle in chosen:
            asset='/' + bundle['path'].replace('.next/static/','_next/static/')
            req=urllib.request.Request(f'http://127.0.0.1:{port}{asset}',headers={'User-Agent':'SeatransLocalReadOnlyAudit'})
            with urllib.request.urlopen(req,timeout=5) as res:
                body=res.read()
                record.append({'asset':asset,'http_status':res.status,'sent_cookie':False,'sent_authorization':False,'sha256_matches_build':hashlib.sha256(body).hexdigest()==bundle['sha256'],'signatures':bundle['signatures'],'headers':{k:res.headers.get(k) for k in ['Content-Type','Cache-Control','Content-Security-Policy','X-Content-Type-Options']},'target':'isolated loopback build, not production'})
    finally:
        proc.terminate()
        try:proc.wait(timeout=10)
        except subprocess.TimeoutExpired:proc.kill();proc.wait()
(OUT/'local-unauthenticated-formula-assets.json').write_text(json.dumps(record,indent=2),encoding='utf-8')

dist=base/'backend2.0/dist'
prefix=dist/'src' if (dist/'src').exists() else dist
script="""
const fs=require('node:fs'); const path=require('node:path');
const prefix=process.argv[1],out=process.argv[2];
const {CloudinaryService}=require(path.join(prefix,'shared/services/cloudinary.service.js'));
const service=new CloudinaryService({get:k=>({CLOUDINARY_CLOUD_NAME:'audit-local',CLOUDINARY_API_KEY:'dummy-key',CLOUDINARY_API_SECRET:'dummy-secret'}[k])});
const a=service.buildSignedRawUrl('audit-document.pdf',60,'audit.pdf');
const b=service.buildSignedRawUrl('audit-document.pdf',3600,'audit.pdf');
const {InquiryIdempotencyService}=require(path.join(prefix,'features/inquiry/services/inquiry-idempotency.service.js'));
const idem=new InquiryIdempotencyService({});
const dto={serviceTypeId:1};
const fileA={originalname:'audit.pdf',size:4,buffer:Buffer.from('AAAA')};
const fileB={originalname:'audit.pdf',size:4,buffer:Buffer.from('BBBB')};
const {InquiryDocumentService}=require(path.join(prefix,'features/inquiry/services/inquiry-document.service.js'));
const doc=new InquiryDocumentService({}, {}, {}, {}, {}, {}, {findOne:async()=>({id:1})},{});
const {PortOperationReportService}=require(path.join(prefix,'features/port-operations/services/port-operation-report.service.js'));
const csvExport=new PortOperationReportService({}).toCsv([{Vessel:'=1+1'}]);
const bcrypt=require(path.join(prefix,'../node_modules/bcrypt'));
const Module=require('node:module');
const ts=require(path.join(prefix,'../node_modules/typescript'));
const dashboardSource=process.argv[3];
const originalResolve=Module._resolveFilename;
Module._resolveFilename=function(request,parent,...rest){
 if(request.startsWith('@/'))request=path.join(dashboardSource,request.slice(2));
 return originalResolve.call(this,request,parent,...rest);
};
Module._extensions['.ts']=function(module,filename){
 const text=fs.readFileSync(filename,'utf8');
 const output=ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 module._compile(output,filename);
};
const frontendParams=require(path.join(dashboardSource,'modules/inquiries/components/common/quoteParameters.ts'));
const backendParams=require(path.join(prefix,'features/epda-parameters/epda-parameter-resolution.js'));
function differences(a,b,p=''){
 if(JSON.stringify(a)===JSON.stringify(b))return [];
 if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b))return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>differences(a[k],b[k],p?p+'.'+k:k));
 return [p];
}
const defaultParity=['HCM','QN','HN'].map(variant=>({variant,different_field_paths:differences(frontendParams.defaultParameterValues(variant),backendParams.defaultValuesForArea(variant==='QN'?'2':variant==='HN'?'1':'3'))}));
const events=[];
doc.uploadResolved=async(_slug,_target,_type,file)=>{
  if(file.originalname==='fail.pdf')throw new Error('synthetic failure');
  await new Promise(r=>setTimeout(r,30));events.push('late-upload-persisted');return {id:101};
};
doc.deleteDocument=async()=>{events.push('rollback-delete');};
(async()=>{
  const commonPassword='Aa1'+'x'.repeat(69);
  const passwordHash=await bcrypt.hash(commonPassword+'A',10);
  const bcryptTruncates=await bcrypt.compare(commonPassword+'B',passwordHash);
  await doc.saveAttachmentsForInquiry({id:1,serviceType:{name:'SHIPPING AGENCY'}},[{originalname:'fail.pdf'},{originalname:'slow.pdf'}],1).catch(()=>events.push('submission-rejected'));
  await new Promise(r=>setTimeout(r,60));
  fs.writeFileSync(out,JSON.stringify({cloudinary:{different_ttl_same_url:a===b,url_contains_expiry:/expires|exp=|__cld_token__/.test(a),url_delivery_type_authenticated:a.includes('/authenticated/'),method:'Actual compiled service + SDK, dummy credentials; no network'},idempotency:{different_file_content_same_request_hash:idem.hashSubmitRequest(dto,[fileA])===idem.hashSubmitRequest(dto,[fileB]),method:'Actual compiled pure hash method, no repository calls'},attachment_rollback:{events,late_success_after_rejection:events.indexOf('late-upload-persisted')>events.indexOf('submission-rejected'),rollback_deleted_late_success:events.includes('rollback-delete'),method:'Actual compiled orchestrator; uploadResolved/deleteDocument mocked in memory; no DB or Cloudinary calls'},csv_export:{formula_prefix_preserved:csvExport.includes('"=1+1"'),method:'Actual compiled CSV serializer with harmless synthetic cell; no spreadsheet launched'},password:{different_73_byte_passwords_compare_equal:bcryptTruncates,method:'Installed bcrypt with dummy passwords; no accounts or DB'},formula_default_parity:{comparisons:defaultParity,method:'Actual pure default functions, source-vs-compiled; no tariff values copied into report. Differences are not proof that either rate is incorrect.'}},null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1});
"""
env['NODE_ENV']='test'
result=subprocess.run([node,'-e',script,str(prefix),str(OUT/'pure-reproductions.json'),str(app/'src')],cwd=base/'backend2.0',env=env,capture_output=True,text=True,timeout=30)
if result.returncode:raise RuntimeError('Pure reproduction failed: '+result.stderr[:500])
print(json.dumps({'unauthenticated_formula_assets':len(record),'pure_reproductions':'completed','database_connections':0,'external_api_calls':0}))
