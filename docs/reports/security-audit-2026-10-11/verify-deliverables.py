"""Validate audit artifacts and source preservation; no DB or external calls."""
import csv
import hashlib
import json
import re
import subprocess
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
E = OUT / 'evidence'

def read(name):
    return json.loads((E / name).read_text(encoding='utf-8'))

checks = {}
failures = []

def check(name, condition):
    checks[name] = bool(condition)
    if not condition:
        failures.append(name)

source = list(csv.DictReader((E / 'asvs-5.0.0-source.csv').open(encoding='utf-8-sig')))
rows = list(csv.DictReader((OUT / 'scorecard.csv').open(encoding='utf-8-sig')))
expected_ids = {'v5.0.0-' + r['req_id'][1:] for r in source if r['L'] in {'1', '2'}}
asvs_ids = {r['id'] for r in rows if r['standard'] == 'OWASP ASVS 5.0.0'}
check('all_253_asvs_l1_l2_present_once', len(expected_ids) == 253 and asvs_ids == expected_ids and len(rows) == len({r['id'] for r in rows}) == 265)
check('12_operational_requirements', len([r for r in rows if r['id'].startswith('OPS-')]) == 12)
check('every_row_has_status_evidence_links_and_notes', all(r['status'] and r['evidence_links'] and r['notes_vi'] for r in rows))

summary = read('score-summary.json')
weights = {g['group']: g['weight'] for g in summary['groups']}
score = coverage = 0
for group, weight in weights.items():
    applicable = [r for r in rows if r['group'] == group and r['status'] != 'Không áp dụng']
    score += weight * sum(float(r['score'] or 0) for r in applicable) / (3 * len(applicable))
    coverage += weight * sum(r['status'] != 'Chưa kiểm chứng' for r in applicable) / len(applicable)
check('score_independently_recalculated', round(score, 2) == summary['lower_bound_score_out_of_100'])
check('coverage_independently_recalculated', round(coverage, 2) == summary['weighted_verification_coverage_percent'])
check('weights_total_100', sum(weights.values()) == 100)
check('unknown_and_na_have_no_claimed_points', all(r['score'] == '' for r in rows if r['status'] in {'Chưa kiểm chứng', 'Không áp dụng'}))
check('na_has_reason', all(r['notes_vi'] and r['mandatory'] == 'no' for r in rows if r['status'] == 'Không áp dụng'))

finding_ids = {f['id'] for f in read('findings-index.json')}
check('findings_references_resolve', all(set(r['finding_ids'].split()) <= finding_ids for r in rows))
finding_text = (OUT / 'findings-and-verification.md').read_text(encoding='utf-8')
check('all_16_findings_have_anchors', len(finding_ids) == 16 and all(f'<a id="{i.lower()}"></a>' in finding_text for i in finding_ids))
invalid_links = []
for document in ['report.md', 'findings-and-verification.md']:
    text = (OUT / document).read_text(encoding='utf-8')
    for target in re.findall(r'\]\(<([^>]+)>\)', text):
        match = re.fullmatch(r'(.+?)(?::(\d+))?', target)
        path, line = match.groups()
        file = Path(path)
        if not file.is_file() or (line and int(line) > len(file.read_text(encoding='utf-8', errors='replace').splitlines())):
            invalid_links.append({'document': document, 'target': target})
check('markdown_source_links_valid', not invalid_links)

changed_sources = []
hashes = read('source-hashes.json')
for record in hashes:
    path = ROOT / record['path']
    if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != record['sha256']:
        changed_sources.append(record['path'])
check('all_baseline_source_hashes_preserved', not changed_sources)
repo_status = []
for baseline in read('baseline.json'):
    repo = ROOT / baseline['repo']
    head = subprocess.run(['git', '-C', str(repo), 'rev-parse', 'HEAD'], capture_output=True, text=True, check=True).stdout.strip()
    status = subprocess.run(['git', '-C', str(repo), 'status', '--porcelain=v1'], capture_output=True, text=True, check=True).stdout.splitlines()
    repo_status.append({'repo': baseline['repo'], 'head_preserved': head == baseline['head'], 'status_preserved': status == baseline['status']})
check('both_repo_heads_and_user_changes_preserved', all(r['head_preserved'] and r['status_preserved'] for r in repo_status))
check('dump_files_unchanged', all(hashlib.sha256((ROOT / r['path']).read_bytes()).hexdigest() == r['sha256'] for r in read('snapshot-analysis.json')))
check('csv_exports_unchanged', all(hashlib.sha256((ROOT / r['path']).read_bytes()).hexdigest() == r['sha256'] for r in read('csv-analysis.json')))
check('both_builds_passed', all(read(app + '-build-status.json')['exit_code'] == 0 for app in ['backend', 'dashboard']))
tests = {app: read(app + '-tests.json') for app in ['backend', 'dashboard']}
check('selected_tests_passed', all(t['numFailedTests'] == 0 and t['success'] for t in tests.values()))

# Compare known local secret values only in memory; never record their values.
needles = {}
for app in ['backend2.0', 'dashboard_admin']:
    for env in (ROOT / app).glob('.env*'):
        if 'example' in env.name:
            continue
        for line in env.read_text(encoding='utf-8', errors='replace').splitlines():
            if not line.strip() or line.lstrip().startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            value = value.strip().strip('"\'')
            if re.search(r'(?i)(secret|password|token|api_key)', key) and len(value) >= 12:
                needles[f'{app}/{env.name}:{key.strip()}'] = value
            if re.search(r'(?i)(DB_URL|DATABASE_URL)', key):
                match = re.search(r'://[^:]+:([^@]+)@', value)
                if match and len(match.group(1)) >= 12:
                    needles[f'{app}/{env.name}:DB_URL_PASSWORD'] = match.group(1)
secret_matches = []
artifact_count = 0
for file in OUT.rglob('*'):
    if not file.is_file() or file.suffix not in {'.md', '.csv', '.json', '.log', '.py'}:
        continue
    text = file.read_text(encoding='utf-8', errors='replace')
    artifact_count += 1
    keys = [key for key, value in needles.items() if value in text]
    if keys:
        secret_matches.append({'file': file.relative_to(OUT).as_posix(), 'matched_setting_names': keys})
check('deliverables_do_not_contain_known_local_secrets', not secret_matches)

result = {
    'checks': checks,
    'passed': not failures,
    'failures': failures,
    'source_files_rehashed': len(hashes),
    'changed_sources': changed_sources,
    'repo_preservation': repo_status,
    'score_out_of_100': round(score, 2),
    'weighted_coverage_percent': round(coverage, 2),
    'tests_passed': {app: t['numPassedTests'] for app, t in tests.items()},
    'audit_artifacts_scanned_for_known_secrets': artifact_count,
    'secret_matches': secret_matches,
    'invalid_links': invalid_links,
    'privacy_limits': 'Exact comparison only; sanitized metadata and synthetic test inputs retained. No database connection or SQL execution.'
}
(E / 'verification-summary.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k: result[k] for k in ['passed', 'failures', 'source_files_rehashed', 'score_out_of_100', 'weighted_coverage_percent', 'tests_passed', 'audit_artifacts_scanned_for_known_secrets']}))
raise SystemExit(0 if result['passed'] else 1)
