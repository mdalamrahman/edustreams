#!/usr/bin/env python3
"""
Scans all problems in Cloudflare R2, downloads all embedded illustration images
(e.g. from https://assets.leetcode.com/uploads/...), and uploads them to Cloudflare R2 under images/...
"""

import sys
import re
import requests
import xml.etree.ElementTree as ET

sys.path.insert(0, '.')
from backend.r2_storage import r2_storage, R2_BUCKET_NAME, R2_ENDPOINT_URL
from backend.scrape_leetcode_to_r2 import get_sde_sheet_slugs

def main():
    slugs = get_sde_sheet_slugs()
    print(f"[Image Sync] Scanning {len(slugs)} problems for LeetCode illustration images...", flush=True)
    
    image_urls = set()
    for slug in slugs:
        p = r2_storage.fetch_problem(slug)
        if p:
            text = (p.get('description', '') or '') + ' ' + (p.get('description_full', '') or '')
            found = re.findall(r'https?://assets\.leetcode\.com/uploads/[^\s\)\"\'>]+', text)
            for img in found:
                image_urls.add(img)
    
    print(f"[Image Sync] Found {len(image_urls)} unique LeetCode images across problems:", flush=True)
    for u in sorted(image_urls):
        print(f" - {u}", flush=True)
        
    uploaded = 0
    for u in image_urls:
        clean_name = u.replace('https://assets.leetcode.com/uploads/', '').replace('http://assets.leetcode.com/uploads/', '').lstrip('/')
        ext = clean_name.split('.')[-1].lower() if '.' in clean_name else 'jpg'
        ct = 'image/png' if ext == 'png' else 'image/svg+xml' if ext == 'svg' else 'image/jpeg'
        try:
            r = requests.get(u, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
            if r.status_code == 200:
                res = r2_storage.upload_image(clean_name, r.content, ct)
                if res:
                    uploaded += 1
                    print(f"  [R2 Uploaded] {clean_name} ({len(r.content)} bytes)", flush=True)
        except Exception as e:
            print(f"  [Download Error] {u}: {e}", flush=True)
            
    print(f"\n[Image Sync] Successfully uploaded {uploaded}/{len(image_urls)} images to Cloudflare R2!", flush=True)

if __name__ == '__main__':
    main()
