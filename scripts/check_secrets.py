"""Scan tracked source and built assets without printing credential values."""
import base64
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = {
    'Telegram bot token': r'\b\d{8,12}:[A-Za-z0-9_-]{30,}\b',
    'Groq token': r'\bgsk_[A-Za-z0-9]{20,}',
    'private browser configuration': r'VITE_(?:SUPABASE_SERVICE_ROLE_KEY|UPSTASH_REDIS_REST_TOKEN|GROQ_API_KEY|MISTRAL_API_KEY|FISH_AUDIO_API_KEY)',
}


def main():
    local_secrets = set()
    for env_path in [ROOT / '.env', ROOT / '.env.local', ROOT / '.env.render', ROOT / 'admin-portal/.env.local']:
        if not env_path.exists(): continue
        for line in env_path.read_text(encoding='utf-8-sig').splitlines():
            if '=' not in line or line.lstrip().startswith('#'): continue
            key, value = line.split('=', 1)
            value = value.strip().strip('"\'')
            if any(word in key for word in ('SERVICE_ROLE', 'API_KEY', 'SECRET', 'BOT_TOKEN', 'API_HASH', 'REDIS_REST_TOKEN')) and len(value) >= 16:
                local_secrets.add(value)
    files = set(subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard'], cwd=ROOT, text=True).splitlines())
    for directory in ['dist/assets', 'admin-portal/dist/assets']:
        files.update(str(p.relative_to(ROOT)) for p in (ROOT / directory).rglob('*') if p.is_file())
    findings = []
    for filename in sorted(files):
        path = ROOT / filename
        if path.suffix not in {'.ts', '.tsx', '.js', '.cjs', '.mjs', '.py', '.md', '.html', '.json', '.txt', '.ps1'} or not path.is_file(): continue
        if filename.replace('\\', '/') == 'scripts/check_secrets.py': continue
        try: content = path.read_text(encoding='utf-8')
        except UnicodeError: continue
        for name, pattern in PATTERNS.items():
            if re.search(pattern, content): findings.append((filename, name))
        if any(secret in content for secret in local_secrets): findings.append((filename, 'matches a local private credential'))
        for token in re.findall(r'eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+', content):
            try:
                payload = json.loads(base64.urlsafe_b64decode(token + '=' * (-len(token) % 4)))
                if payload.get('role') == 'service_role': findings.append((filename, 'privileged Supabase JWT'))
            except (ValueError, UnicodeError): pass
    for filename, reason in findings: print(f'{filename}: {reason}')
    print(f'Scanned {len(files)} source/artifact paths; {len(findings)} findings. Credential values are suppressed.')
    return bool(findings)


if __name__ == '__main__': sys.exit(main())
