import re
import glob
import os

def sanitize_file(filepath):
    if not os.path.exists(filepath):
        return
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Remove twitter and follow now links
        pattern1 = r'\\n*Follow Now:\s*https?://[^\s\\"]+'
        pattern2 = r'Follow Now:\s*https?://[^\s\\"]+'
        pattern3 = r'https?://(?:www\.)?(?:twitter\.com|x\.com)/[a-zA-Z0-9_]+'
        
        new_content = re.sub(pattern1, '', content, flags=re.IGNORECASE)
        new_content = re.sub(pattern2, '', new_content, flags=re.IGNORECASE)
        new_content = re.sub(pattern3, '', new_content, flags=re.IGNORECASE)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Sanitized: {filepath}')
    except Exception as e:
        print(f'Error sanitizing {filepath}: {e}')

def main():
    patterns = [
        'src/**/*.ts',
        'src/**/*.tsx',
        'backend/**/*.py',
        'backend/**/*.json',
        '*.json'
    ]
    for pat in patterns:
        for p in glob.glob(pat, recursive=True):
            sanitize_file(p)

if __name__ == '__main__':
    main()
