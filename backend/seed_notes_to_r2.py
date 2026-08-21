import os
import sys
import json

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
from r2_storage import r2_storage

def seed_notes():
    print("[R2 Notes Seeder] Seeding LLD and HLD Boss Sheets into Cloudflare R2...")

    # 1. HLD Boss Sheet
    hld_html = """<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <title>HLD / System Design Boss Sheet</title>
</head>
<body>
  <h1>HLD / System Design Boss Sheet</h1>
  <p>The memory map for High-Level System Design. 15 Building blocks, request lifecycle, CAP theorem, back-of-the-envelope calculations, and 7-step attack framework.</p>
</body>
</html>"""
    
    key_hld = r2_storage.upload_document("hld-boss-sheet", hld_html)
    print(f"[R2 HLD Upload]: {key_hld}")

    # 2. LLD Boss Sheet
    lld_html = """<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <title>LLD / Object-Oriented Design Boss Sheet for SDE-1</title>
</head>
<body>
  <h1>LLD / Object-Oriented Design Boss Sheet</h1>
  <p>Comprehensive SDE-1 Low Level Design Guide: 4 OOP Pillars, SOLID Principles with code fixes, 12 GoF Design Patterns, and Top 10 Classic Machine Coding Case Studies.</p>
</body>
</html>"""

    key_lld = r2_storage.upload_document("lld-boss-sheet", lld_html)
    print(f"[R2 LLD Upload]: {key_lld}")

    # Also upload short aliases
    r2_storage.upload_document("hld", hld_html)
    r2_storage.upload_document("lld", lld_html)

    print("[R2 Notes Seeder] Seeding completed successfully!")

if __name__ == "__main__":
    seed_notes()
