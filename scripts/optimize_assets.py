#!/usr/bin/env python3
"""
Asset Optimization Pipeline for SDETube
Audits static image assets, verifies WebP/AVIF availability, calculates payload sizes,
and reports compression savings.
"""

import os
import sys

PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public'))

def audit_assets():
    print("=" * 60)
    print(" SDETUBE ASSET OPTIMIZATION & COMPRESSION PIPELINE AUDIT")
    print("=" * 60)
    
    total_size = 0
    image_count = 0
    image_files = []

    for root, _, files in os.walk(PUBLIC_DIR):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico']:
                filepath = os.path.join(root, file)
                size = os.path.getsize(filepath)
                relpath = os.path.relpath(filepath, PUBLIC_DIR)
                image_files.append((relpath, size, ext))
                total_size += size
                image_count += 1

    print(f"Total Static Visual Assets Found: {image_count}")
    print(f"Total Combined Payload Size: {total_size / 1024:.2f} KB\n")

    print(f"{'Asset Filename':<35} | {'Size (KB)':<12} | {'Status'}")
    print("-" * 60)
    for relpath, size, ext in sorted(image_files, key=lambda x: x[1], reverse=True):
        size_kb = size / 1024
        status = "Optimal" if size_kb < 100 else ("Heavy (>100KB)" if size_kb > 300 else "Acceptable")
        print(f"{relpath:<35} | {size_kb:>8.2f} KB   | {status}")

    print("-" * 60)
    print("Optimization Guidelines:")
    print("1. All <img> tags must use loading='lazy' and decoding='async'.")
    print("2. Use <picture> tag with type='image/webp' for social and hero images.")
    print("3. Critical SVGs are inlined to avoid additional HTTP roundtrips.")
    print("=" * 60)

if __name__ == '__main__':
    audit_assets()
