"""Read-only audit collector. Writes only sanitized metadata to this report folder."""
import csv, hashlib, io, json, os, re, subprocess, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
EVIDENCE = OUT / 'evidence'
EVIDENCE.mkdir(exist_ok=True)
REPOS = [ROOT / 'dashboard_admin', ROOT / 'backend2.0']
SKIP = {'.git', 'node_modules', 'target', 'dist', '.cache', 'coverage', '__pycache__'}

def git(repo, *args):
    return subprocess.run(['git', '-C', str(repo), *args], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout

def files(base):
    for directory, dirs, names in os.walk(base):
        dirs[:] = [d for d in dirs if d not in SKIP and not d.startswith('.next')]
        for name in names:
            yield Path(directory) / name

def write(name, data):
    (EVIDENCE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

baseline = []
for repo in REPOS:
    tracked = git(repo, 'ls-files').splitlines()
    # No remote URL: it can contain credentials.
    baseline.append({'repo': repo.relative_to(ROOT).as_posix(), 'head': git(repo, 'rev-parse', 'HEAD').strip(), 'status': git(repo, 'status', '--porcelain').splitlines(), 'tracked_count': len(tracked), 'env_tracked': [p for p in tracked if Path(p).name.startswith('.env')], 'snapshot_tracked': [p for p in tracked if re.search(r'(?i)(backup|\.dump$|\.sql$|\.csv$)', p)]})
write('baseline.json', baseline)

url = 'https://raw.githubusercontent.com/OWASP/ASVS/v5.0.0_release/5.0/docs_en/OWASP_Application_Security_Verification_Standard_5.0.0_en.csv'
raw = urllib.request.urlopen(url, timeout=30).read()
(EVIDENCE / 'asvs-5.0.0-source.csv').write_bytes(raw)
rows = list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))))
write('asvs-source.json', {'url': url, 'sha256': hashlib.sha256(raw).hexdigest(), 'total': len(rows), 'level1': sum(r['L']=='1' for r in rows), 'level2': sum(r['L']=='2' for r in rows)})

# Metadata only; never serialize raw credentials or customer records.
data_inventory = []
for base in ['dashboard_admin/docs', 'backend2.0/docs', 'backend2.0/tests/reports', 'backend2.0/backups']:
    for p in files(ROOT / base):
        if OUT in p.parents: continue
        if p.suffix.lower() in {'.sql', '.dump', '.backup', '.csv', '.json', '.xlsx', '.log', '.gz', '.zip'}:
            data_inventory.append({'path': p.relative_to(ROOT).as_posix(), 'bytes': p.stat().st_size})
write('data-inventory.json', data_inventory)

# Sources and build inputs fingerprint current working tree, not merely HEAD.
hashes = []
for base in ['dashboard_admin/src', 'backend2.0/src']:
    for p in files(ROOT / base):
        if p.suffix in {'.ts', '.tsx', '.js', '.mjs', '.cjs', '.java', '.json', '.properties'}:
            hashes.append({'path': p.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()})
write('source-hashes.json', hashes)

patterns = {
    'credential-in-url': re.compile(r'(?i)(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s:"\']+:[^\s@"\']+@'),
    'private-key': re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
    'literal-sensitive-setting': re.compile(r'''(?i)(?:password|api[_-]?secret|jwt[_-]?secret|secret[_-]?key)\s*[=:]\s*["']([^"'\r\n]{8,})["']'''),
    'env-sensitive-setting': re.compile(r'(?im)^(?:APP_JWT_SECRET|JWT_SECRET|DB_PASSWORD|CLOUDINARY_API_SECRET|GOOGLE_CLIENT_SECRET)\s*=\s*(\S+)'),
}
def scan(text):
    result=[]
    for kind, pattern in patterns.items():
        for match in pattern.finditer(text):
            val = match.group(1) if match.lastindex else match.group(0)
            if any(s in val.lower() for s in ['process.env', '${', 'configservice', 'placeholder', 'example', 'change_me', 'changeme', 'test', 'dummy', 'your-', 'your_', 'redacted']): continue
            result.append({'kind': kind, 'line': text.count('\n', 0, match.start())+1})
    return result

current=[]
for repo in REPOS:
    for p in files(repo):
        if p.stat().st_size > 4_000_000: continue
        if p.suffix.lower() not in {'.ts','.tsx','.java','.js','.mjs','.cjs','.json','.properties','.yml','.yaml','.md','.txt','.sql','.log'} and not p.name.startswith('.env'): continue
        try: hits = scan(p.read_text(encoding='utf-8', errors='replace'))
        except OSError: continue
        if hits: current.append({'path': p.relative_to(ROOT).as_posix(), 'hits': hits})
write('secret-candidates-current.json', current)

# Search every reachable revision of likely credential files, not just current HEAD.
history=[]
for repo in REPOS:
    names = set(git(repo, 'log', '--all', '--pretty=format:', '--name-only').splitlines())
    names = sorted(p for p in names if p and (Path(p).name.startswith('.env') or p.endswith('application.properties') or re.search(r'(?i)(secret|credential).*\.(json|ya?ml)$',p)))
    for name in names:
        commits=git(repo, 'log', '--all', '--format=%H', '--', name).splitlines()
        for commit in commits:
            body=git(repo, 'show', f'{commit}:{name}')
            hits=scan(body)
            if hits: history.append({'repo': repo.relative_to(ROOT).as_posix(), 'path':name, 'commit':commit, 'hits':hits})
write('secret-candidates-history.json', history)

bundles=[]
for app in ['dashboard_admin']:
    directory=ROOT / app / '.next/static'
    if not directory.exists(): continue
    for p in directory.rglob('*'):
        if not p.is_file() or p.suffix not in {'.js','.map','.json'}: continue
        text=p.read_text(encoding='utf-8',errors='replace')
        signatures=[s for s in ['tonnagePerGrt','tankerFactor','moorUnmoorBerthTariff','pilotagePerGrt','epdaWorkingParams','goGiaBuoyMode','frtTaxRate'] if s in text]
        if signatures: bundles.append({'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'formula_signatures':signatures})
write('existing-bundle-formulas.json',bundles)

public=[]
for app in ['dashboard_admin']:
    for p in files(ROOT / app / 'public'):
        if p.suffix.lower() in {'.sql','.csv','.xlsx','.json','.map','.env','.dump','.backup'}:
            public.append({'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size})
write('public-files.json',public)
print(json.dumps({'repos':len(baseline),'source_files':len(hashes),'asvs_l1_l2':sum(r['L'] in {'1','2'} for r in rows),'data_files':len(data_inventory),'secret_candidate_files':len(current),'history_candidate_revisions':len(history),'bundle_formula_files':len(bundles)},ensure_ascii=False))
