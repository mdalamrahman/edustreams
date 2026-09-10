import os
import shutil

src = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'company_problems.json')
dst_dir = os.path.join(os.path.dirname(__file__), '..', 'dist', 'data')
dst = os.path.join(dst_dir, 'company_problems.json')

if os.path.exists(src):
    os.makedirs(dst_dir, exist_ok=True)
    shutil.copyfile(src, dst)
    print(f"[copy_dist_assets] Copied {src} -> {dst} ({os.path.getsize(dst)} bytes)")
else:
    print(f"[copy_dist_assets] Warning: {src} not found")
