#!/usr/bin/env python3
"""
Re-formats any single-line Python/C++ solutions in Cloudflare R2 into clean multi-line indented code.
"""

import sys
import re
sys.path.insert(0, '.')
from backend.r2_storage import r2_storage
from backend.scrape_leetcode_to_r2 import get_sde_sheet_slugs

def format_python_code(code: str) -> str:
    if not code:
        return ''
    if len(code.split('\n')) > 6 and ('    ' in code or '\t' in code):
        return code
    
    code = code.replace(';', '\n')
    patterns = [
        r':\s*(def\s+)',
        r':\s*(for\s+)',
        r':\s*(while\s+)',
        r':\s*(if\s+)',
        r':\s*(elif\s+)',
        r':\s*(else:)',
        r':\s*(return\s+)',
        r':\s*(pass\b)',
        r':\s*(continue\b)',
        r':\s*(break\b)',
        r':\s*([a-zA-Z_]\w*(?:\[[^\]]*\])*\s*[,=])',
        r':\s*([a-zA-Z_]\w*\.[a-zA-Z_]\w*\()'
    ]
    for pat in patterns:
        code = re.sub(pat, r':\n\1', code)
        
    lines = [l.strip() for l in code.split('\n') if l.strip()]
    indent = 0
    res = []
    
    for l in lines:
        if l.startswith(('elif ', 'else:', 'except ', 'except:', 'finally:')):
            indent = max(0, indent - 1)
            
        res.append('    ' * indent + l)
        
        if l.endswith(':'):
            indent += 1
            
    return '\n'.join(res)

def format_c_like(code: str) -> str:
    if not code:
        return ''
    if len(code.split('\n')) > 6 and ('    ' in code or '\t' in code):
        return code
    
    for_loops = []
    def save_for(m):
        for_loops.append(m.group(0))
        return f'__FOR_LOOP_{len(for_loops)-1}__'
    
    code = re.sub(r'for\s*\([^)]*\)', save_for, code)
    code = re.sub(r';\s*', ';\n', code)
    code = re.sub(r'{\s*', ' {\n', code)
    code = re.sub(r'}\s*', '\n}\n', code)
    code = re.sub(r'public:\s*', 'public:\n', code)
    code = re.sub(r'private:\s*', 'private:\n', code)
    code = re.sub(r'\n\s*\n', '\n', code)
    
    for idx, fl in enumerate(for_loops):
        code = code.replace(f'__FOR_LOOP_{idx}__', fl)
    
    indent = 0
    lines = []
    for line in code.split('\n'):
        line = line.strip()
        if not line:
            continue
        if line.startswith('}') or line.startswith('};'):
            indent = max(0, indent - 1)
        if line in ['public:', 'private:']:
            lines.append(line)
        else:
            lines.append('    ' * indent + line)
        if line.endswith('{') and not line.startswith('//'):
            indent += 1
    return '\n'.join(lines)

def main():
    slugs = get_sde_sheet_slugs()
    print(f"Reformatting all solutions in R2 for {len(slugs)} problems...", flush=True)
    count = 0
    for slug in slugs:
        p = r2_storage.fetch_problem(slug)
        if not p or not p.get('solutions'):
            continue
        
        sols = p['solutions']
        changed = False
        if sols.get('python'):
            f_py = format_python_code(sols['python'])
            if f_py != sols['python']:
                sols['python'] = f_py
                changed = True
        
        for k in ['cpp', 'java', 'javascript']:
            if sols.get(k):
                f_c = format_c_like(sols[k])
                if f_c != sols[k]:
                    sols[k] = f_c
                    changed = True
                    
        if changed:
            r2_storage.upload_problem(slug, p)
            count += 1
            print(f"  Reformatted {slug}", flush=True)
            
    print(f"Done! Reformatted {count} problems in R2.", flush=True)

if __name__ == '__main__':
    main()
