"""Build/test current sources without copying .env or allowing TCP connections."""
import argparse, hashlib, json, os, shutil, subprocess, tempfile, time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent/'evidence'
OUT.mkdir(exist_ok=True)

parser=argparse.ArgumentParser()
parser.add_argument('mode', choices=['prepare','dashboard-build','backend-build','dashboard-tests','backend-tests'])
args=parser.parse_args()
meta=OUT/'isolated-workspace.json'

if args.mode=='prepare':
    # Same volume as pnpm store links; Next webpack cannot resolve a cross-drive relative path.
    base=Path(tempfile.mkdtemp(prefix='seatrans-audit-20261011-',dir=str(ROOT.parent)))
    for name in ['dashboard_admin','backend2.0']:
        src=ROOT/name; dst=base/name; dst.mkdir()
        for p in src.iterdir():
            if p.is_dir() and p.name in {'src','public','scripts','tests','test'}:
                shutil.copytree(p,dst/p.name,ignore=shutil.ignore_patterns('node_modules','.git','.next*','*.log','.env*'))
            elif p.is_file() and not p.name.startswith('.env') and p.suffix in {'.json','.mjs','.cjs','.js','.ts','.yaml'}:
                shutil.copy2(p,dst/p.name)
        target=str(src/'node_modules').replace("'","''")
        link=str(dst/'node_modules').replace("'","''")
        subprocess.run(['powershell','-NoProfile','-Command',f"New-Item -ItemType Junction -Path '{link}' -Target '{target}' | Out-Null"],check=True)
    guard=base/'deny-network.cjs'
    guard.write_text("""const net=require('node:net');
const original=net.Socket.prototype.connect;
net.Socket.prototype.connect=function(...args){
  const first=args[0];
  const pipe=typeof first==='string'&&first.startsWith('\\\\\\\\.\\\\pipe\\\\');
  const pipeObj=first&&typeof first==='object'&&typeof first.path==='string';
  if(pipe||pipeObj)return original.apply(this,args);
  throw new Error('AUDIT_NETWORK_DENIED: TCP connections disabled');
};
global.fetch=async()=>{throw new Error('AUDIT_NETWORK_DENIED: fetch disabled');};
""",encoding='utf-8')
    meta.write_text(json.dumps({'directory':str(base),'guard':str(guard),'copied_env_files':0,'tcp_connections':'denied','source':'current working tree; dependencies linked, not installed'},indent=2),encoding='utf-8')
    print('Isolated source copies prepared; no .env copied; TCP denied.')
    raise SystemExit(0)

info=json.loads(meta.read_text(encoding='utf-8')); base=Path(info['directory'])
name='dashboard_admin' if args.mode.startswith('dashboard') else 'backend2.0'
cwd=base/name
# Explicit allowlist avoids inherited credentials and application env variables.
env={k:v for k,v in os.environ.items() if k.upper() in {'PATH','SYSTEMROOT','WINDIR','TEMP','TMP','COMSPEC','PATHEXT','PROCESSOR_ARCHITECTURE','NUMBER_OF_PROCESSORS','USERPROFILE','APPDATA','LOCALAPPDATA'}}
guard_arg=Path(info['guard']).as_posix()
env.update({'CI':'true','NEXT_TELEMETRY_DISABLED':'1','API_PROXY_TARGET':'http://127.0.0.1:9','NEXT_PUBLIC_API_BASE_URL':'','NEXT_PUBLIC_ENABLE_API_LOGS':'false','NODE_OPTIONS':f'--require="{guard_arg}"','NODE_ENV':'test' if 'tests' in args.mode else 'production'})
node=shutil.which('node')
if args.mode=='dashboard-build': command=[node,str(cwd/'node_modules/next/dist/bin/next'),'build']
elif args.mode=='backend-build': command=[node,str(cwd/'node_modules/@nestjs/cli/bin/nest.js'),'build']
elif args.mode=='dashboard-tests':
    command=[node,str(cwd/'node_modules/vitest/vitest.mjs'),'run','src/modules/inquiries/components/common','src/shared/utils/apiClient.test.ts','src/modules/auth/services','src/features/admin/sections/epda-editor/controller','--maxWorkers=2','--reporter=json',f'--outputFile={OUT / "dashboard-tests.json"}']
else:
    command=[node,str(cwd/'node_modules/jest/bin/jest.js'),'--config','tests/config/jest.unit.json','--runInBand','--testPathPatterns=tests/unit/features/auth|tests/unit/shared|tests/unit/features/epda-parameters|tests/unit/features/roles|tests/flows/inquiry|tests/flows/booking-documents/booking-concurrency|tests/flows/booking-documents/booking-document-copy-duplicate','--json',f'--outputFile={OUT / "backend-tests.json"}']
started=time.monotonic()
log=OUT/f'{args.mode}.log'
try:
    with log.open('w',encoding='utf-8') as handle:
        result=subprocess.run(command,cwd=cwd,env=env,stdout=handle,stderr=subprocess.STDOUT,timeout=900)
    status={'mode':args.mode,'exit_code':result.returncode,'seconds':round(time.monotonic()-started,2),'isolated':True,'network':'TCP denied','env':'allowlist + dummy API origin'}
except subprocess.TimeoutExpired:
    status={'mode':args.mode,'exit_code':None,'timeout_seconds':900,'isolated':True}
(OUT/f'{args.mode}-status.json').write_text(json.dumps(status,indent=2),encoding='utf-8')
if args.mode=='dashboard-build':
    bundle=[]
    directory=cwd/'.next/static'
    for p in directory.rglob('*') if directory.exists() else []:
        if not p.is_file() or p.suffix not in {'.js','.map'}:continue
        text=p.read_text(encoding='utf-8',errors='replace')
        signatures=[s for s in ['tonnagePerGrt','tankerFactor','moorUnmoorBerthTariff','epdaWorkingParams','goGiaBuoyMode','goGiaBuoyPerCargoTon','Math.ceil'] if s in text]
        if signatures:bundle.append({'path':p.relative_to(cwd).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'signatures':signatures})
    (OUT/'isolated-bundle-formulas.json').write_text(json.dumps(bundle,indent=2),encoding='utf-8')
print(json.dumps(status))
