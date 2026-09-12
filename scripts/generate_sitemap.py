#!/usr/bin/env python3
"""
Dynamic Sitemap Generator for SDETube
Generates valid XML sitemap with all core learning tracks, legal pages, and high-frequency problem paths.
"""

import os
from datetime import datetime, timezone

BASE_URL = "https://sdetube.pages.dev"
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "public")
OUTPUT_FILE = os.path.join(PUBLIC_DIR, "sitemap.xml")

ROUTES = [
    {"path": "", "changefreq": "daily", "priority": "1.00"},
    {"path": "#/dsa-sheets", "changefreq": "daily", "priority": "0.95"},
    {"path": "#/dsa-problems", "changefreq": "daily", "priority": "0.90"},
    {"path": "#/lld", "changefreq": "weekly", "priority": "0.90"},
    {"path": "#/hld", "changefreq": "weekly", "priority": "0.90"},
    {"path": "#/system-design", "changefreq": "weekly", "priority": "0.85"},
    {"path": "#/interview", "changefreq": "weekly", "priority": "0.85"},
    {"path": "#/channels", "changefreq": "daily", "priority": "0.80"},
    {"path": "#/analytics", "changefreq": "weekly", "priority": "0.70"},
    {"path": "#/contact", "changefreq": "monthly", "priority": "0.60"},
    {"path": "#/privacy", "changefreq": "monthly", "priority": "0.50"},
    {"path": "#/terms", "changefreq": "monthly", "priority": "0.50"},
]

def generate_sitemap():
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S+00:00")
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
        '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">'
    ]

    for route in ROUTES:
        url = f"{BASE_URL}/{route['path']}".rstrip('/')
        if route['path'] == "":
            url = f"{BASE_URL}/"
        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{url}</loc>')
        xml_lines.append(f'    <lastmod>{now}</lastmod>')
        xml_lines.append(f'    <changefreq>{route["changefreq"]}</changefreq>')
        xml_lines.append(f'    <priority>{route["priority"]}</priority>')
        xml_lines.append('  </url>')

    xml_lines.append('</urlset>')
    xml_content = '\n'.join(xml_lines) + '\n'

    os.makedirs(PUBLIC_DIR, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(xml_content)

    print(f"[generate_sitemap] Generated sitemap with {len(ROUTES)} entries -> {OUTPUT_FILE}")

if __name__ == '__main__':
    generate_sitemap()
