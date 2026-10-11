"""Inspect local PostgreSQL dumps and reachable Git blobs without a DB connection."""
import csv, hashlib, io, json, os, re, subprocess
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent/'evidence'
def save(name,value): (OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')

needles={}
for app in ['backend2.0','dashboard_admin']:
    for p in (ROOT/app).glob('.env*'):
        if 'example' in p.name:continue
        for line in p.read_text(encoding='utf-8',errors='replace').splitlines():
            if not line.strip() or line.lstrip().startswith('#') or '=' not in line:continue
            key,value=line.split('=',1);value=value.strip().strip('"\'')
            if re.search(r'(?i)(secret|password|token|api_key)',key) and len(value)>=12:
                needles[f'{app}/{p.name}:{key.strip()}']=value
            if re.search(r'(?i)(DB_URL|DATABASE_URL)',key):
                m=re.search(r'://[^:]+:([^@]+)@',value)
                if m and len(m.group(1))>=12:needles[f'{app}/{p.name}:DB_URL_PASSWORD']=m.group(1)

history=[]
for name in ['dashboard_admin','backend2.0']:
    repo=ROOT/name
    data=subprocess.run(['git','-C',str(repo),'rev-list','--objects','--all'],capture_output=True,text=True,encoding='utf-8').stdout
    objects={}
    for line in data.splitlines():
        sha,_,path=line.partition(' ')
        if path and (Path(path).suffix in {'.ts','.tsx','.js','.mjs','.cjs','.json','.md','.yml','.yaml','.properties','.txt','.sql','.csv'} or Path(path).name.startswith('.env')):objects[sha]=path
    batch=subprocess.Popen(['git','-C',str(repo),'cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
    hits=[]; scanned=0
    for sha,path in objects.items():
        batch.stdin.write((sha+'\n').encode());batch.stdin.flush()
        header=batch.stdout.readline().decode().split()
        if len(header)!=3:continue
        size=int(header[2]); body=batch.stdout.read(size);batch.stdout.read(1)
        if header[1]!='blob':continue
        scanned+=1
        text=body.decode('utf-8',errors='replace')
        keys=[k for k,v in needles.items() if v in text]
        private_key=bool(re.search(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',text))
        if keys or private_key:hits.append({'blob':sha,'path':path,'matched_setting_names':keys,'private_key':private_key})
    batch.stdin.close();batch.wait()
    history.append({'repo':name,'reachable_text_blobs_scanned':scanned,'matches':hits})
save('git-history-exact-secret-sweep.json',history)

bundle_hits=[]
info=json.loads((OUT/'isolated-workspace.json').read_text())
build=Path(info['directory'])/'dashboard_admin' / '.next'
for base in [ROOT/'dashboard_admin/public',ROOT/'dashboard_admin/.next/static',build/'static',build/'server/app']:
    for p in base.rglob('*') if base.exists() else []:
        if not p.is_file() or p.suffix not in {'.js','.map','.html','.rsc','.json','.txt'}:continue
        text=p.read_text(encoding='utf-8',errors='replace')
        keys=[k for k,v in needles.items() if v in text]
        if keys:bundle_hits.append({'file':p.relative_to(base).as_posix(),'artifact_root':base.name,'matched_setting_names':keys})
save('exact-secret-build-sweep.json',{'settings_compared':len(needles),'matches':bundle_hits,'limits':'Exact known local secret values only; unrelated/retired secrets need dedicated secret detection.'})

restore=Path('C:/Program Files/PostgreSQL/18/bin/pg_restore.exe')
dumps=[ROOT/'backend2.0/.loadtest/source.dump',*sorted((ROOT/'backend2.0/migration-backups').glob('*.dump'))]
results=[]
for dump in dumps:
    if not dump.exists():continue
    proc=subprocess.run([str(restore),'--no-owner','--no-privileges','--file=-',str(dump)],capture_output=True)
    if proc.returncode:results.append({'path':dump.relative_to(ROOT).as_posix(),'read_error':True});continue
    text=proc.stdout.decode('utf-8',errors='replace')
    tables={}; table=None; columns=[]
    for line in text.splitlines():
        if table is not None:
            if line == '\\.': table=None
            else:
                values=line.split('\t')
                if len(values)!=len(columns):raise ValueError('Invalid COPY row width; refusing misleading snapshot analysis')
                tables[table].append(dict(zip(columns,values)))
            continue
        m=re.fullmatch(r'COPY ([\w".]+) \((.+)\) FROM stdin;',line)
        if m:
            table=m.group(1).replace('"','').split('.')[-1]
            columns=[c.strip().strip('"') for c in m.group(2).split(',')]
            tables[table]=[]
    anomalies=[]
    checks={'users':[('email',),('username',)],'roles':[('name',)],'booking_partners':[('customer_id',)],'epda_parameter_group_members':[('port_id',)],'port_locations':[('port_id','name')]}
    for table,keys_list in checks.items():
        for keys in keys_list:
            counts=Counter(tuple(r.get(k,'').strip().lower() for k in keys) for r in tables.get(table,[]) if all(r.get(k,'') not in {'','\\N'} for k in keys))
            anomalies.append({'table':table,'key_columns':list(keys),'duplicate_groups':sum(v>1 for v in counts.values()),'extra_rows':sum(v-1 for v in counts.values() if v>1)})
    for table,records in tables.items():
        if table.endswith('inquiries') or table in {'booking_records','bill_of_lading_records','arrival_notice_records','delivery_order_records','port_calls'}:
            for key in ['code','booking_number','fbl_number','an_number','do_number','port_call_no']:
                if records and key in records[0]:
                    counts=Counter(r[key].strip().lower() for r in records if r[key] not in {'','\\N'} and r.get('deleted_at','\\N')=='\\N')
                    anomalies.append({'table':table,'key_columns':[key],'duplicate_groups':sum(v>1 for v in counts.values()),'extra_rows':sum(v-1 for v in counts.values() if v>1)})
    foreign=[]
    # Explicit relationship checks, aggregate results only.
    for child,column,parent in [('inquiry_documents','uploaded_by','users'),('shipping_agency_inquiries','user_id','users'),('booking_records','booking_partner_id','booking_partners')]:
        records=tables.get(child,[])
        if records and column in records[0] and parent in tables:
            ids={r.get('id') for r in tables[parent]}
            foreign.append({'table':child,'column':column,'parent':parent,'orphan_rows':sum(r[column] not in {'','\\N'} and r[column] not in ids for r in records)})
    docs=tables.get('inquiry_documents',[])
    urls=[r.get('cloudinary_url','') for r in docs]
    data={'path':dump.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(dump.read_bytes()).hexdigest(),'tables':{k:len(v) for k,v in tables.items()},'duplicates':anomalies,'explicit_orphan_checks':foreign,'inquiry_document_urls':{'rows':len(docs),'public_raw_upload':sum('/raw/upload/' in u for u in urls),'public_image_upload':sum('/image/upload/' in u for u in urls),'authenticated':sum('/authenticated/' in u for u in urls)},'limits':'Historical snapshots, not current database. Normalized duplicate candidates are not automatically invalid business records. No SQL was executed.'}
    results.append(data)
save('snapshot-analysis.json',results)

csv_results=[]
for p in (ROOT/'backend2.0/docs/reports').glob('*.csv'):
    with p.open(encoding='utf-8-sig',newline='') as h:
        reader=csv.DictReader(h); rows=list(reader)
    counts=Counter(tuple(sorted(r.items())) for r in rows)
    csv_results.append({'path':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'rows':len(rows),'identical_duplicate_rows':sum(v-1 for v in counts.values() if v>1),'tracked':bool(subprocess.run(['git','-C',str(ROOT/'backend2.0'),'ls-files','--error-unmatch',p.relative_to(ROOT/'backend2.0').as_posix()],capture_output=True).returncode==0)})
save('csv-analysis.json',csv_results)
print(json.dumps({'history_blobs':sum(x['reachable_text_blobs_scanned'] for x in history),'history_secret_matches':sum(len(x['matches']) for x in history),'build_secret_matches':len(bundle_hits),'dumps_read_without_connection':len(results),'csv_exports':len(csv_results)}))
