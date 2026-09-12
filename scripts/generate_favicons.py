#!/usr/bin/env python3
"""
Pure Python Favicon and PWA Icon Package Generator (No 3rd-party dependencies needed)
Generates:
- favicon-16x16.png
- favicon-32x32.png
- apple-touch-icon.png (180x180)
- pwa-192x192.png
- pwa-512x512.png
- favicon.ico (multi-resolution container)
"""

import os
import zlib
import struct

def create_png_rgba(width, height, pixel_func):
    """
    Creates a valid RGBA PNG in pure Python.
    pixel_func(x, y, width, height) -> (r, g, b, a)
    """
    raw_scanlines = bytearray()
    for y in range(height):
        raw_scanlines.append(0)  # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = pixel_func(x, y, width, height)
            raw_scanlines.extend((int(r) & 0xFF, int(g) & 0xFF, int(b) & 0xFF, int(a) & 0xFF))

    compressed = zlib.compress(bytes(raw_scanlines), level=9)

    png = bytearray(b'\x89PNG\r\n\x1a\n')

    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xFFFFFFFF
    png.extend(struct.pack('>I', len(ihdr_data)))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', ihdr_crc))

    # IDAT chunk
    idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xFFFFFFFF
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', idat_crc))

    # IEND chunk
    iend_crc = zlib.crc32(b'IEND') & 0xFFFFFFFF
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', iend_crc))

    return bytes(png)

def sdetube_logo_pixel(x, y, w, h):
    """
    Draws the SDETube brand logo:
    - Rounded gradient background: Deep Indigo (#4f46e5) to Vivid Purple (#9333ea)
    - Play / Code arrow triangle centered in crisp white
    """
    nx = x / (w - 1) if w > 1 else 0.5
    ny = y / (h - 1) if h > 1 else 0.5

    # Rounded rectangle mask
    radius = 0.22
    dx = max(0.0, abs(nx - 0.5) - (0.5 - radius))
    dy = max(0.0, abs(ny - 0.5) - (0.5 - radius))
    dist_sq = (dx * dx) + (dy * dy)
    if dist_sq > (radius * radius):
        return (0, 0, 0, 0)  # Transparent outside rounded box

    # Gradient: Indigo (79, 70, 229) to Purple (147, 51, 234)
    t = (nx + ny) / 2.0
    bg_r = 79 + int((147 - 79) * t)
    bg_g = 70 + int((51 - 70) * t)
    bg_b = 229 + int((234 - 229) * t)

    # Play Triangle: Vertices (0.38, 0.28), (0.38, 0.72), (0.74, 0.50)
    # Barycentric / Half-plane check for triangle
    def sign(p1x, p1y, p2x, p2y, p3x, p3y):
        return (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y)

    x1, y1 = 0.38, 0.28
    x2, y2 = 0.38, 0.72
    x3, y3 = 0.74, 0.50

    d1 = sign(nx, ny, x1, y1, x2, y2)
    d2 = sign(nx, ny, x2, y2, x3, y3)
    d3 = sign(nx, ny, x3, y3, x1, y1)

    has_neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
    has_pos = (d1 > 0) or (d2 > 0) or (d3 > 0)
    in_triangle = not (has_neg and has_pos)

    if in_triangle:
        return (255, 255, 255, 255)
    return (bg_r, bg_g, bg_b, 255)

def build_ico(png_dict):
    """
    Builds a Windows ICO file containing multiple PNG images.
    png_dict: dict of {size: png_bytes}
    """
    ico = bytearray()
    # ICO Header: 0 (reserved), 1 (ICO type), num_images
    ico.extend(struct.pack('<HHH', 0, 1, len(png_dict)))

    offset = 6 + (16 * len(png_dict))
    entries = bytearray()
    image_data = bytearray()

    for size, data in sorted(png_dict.items()):
        w_b = size if size < 256 else 0
        h_b = size if size < 256 else 0
        entries.extend(struct.pack('<BBBBHHII', w_b, h_b, 0, 0, 1, 32, len(data), offset))
        image_data.extend(data)
        offset += len(data)

    ico.extend(entries)
    ico.extend(image_data)
    return bytes(ico)

def main():
    public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public'))
    os.makedirs(public_dir, exist_ok=True)

    sizes = {
        'favicon-16x16.png': 16,
        'favicon-32x32.png': 32,
        'apple-touch-icon.png': 180,
        'pwa-192x192.png': 192,
        'pwa-512x512.png': 512,
    }

    generated_pngs = {}
    for filename, size in sizes.items():
        png_bytes = create_png_rgba(size, size, sdetube_logo_pixel)
        generated_pngs[size] = png_bytes
        dest = os.path.join(public_dir, filename)
        with open(dest, 'wb') as f:
            f.write(png_bytes)
        print(f"[generate_favicons] Created {filename} ({size}x{size}) -> {len(png_bytes)} bytes")

    # Generate multi-size favicon.ico (16, 32)
    ico_bytes = build_ico({16: generated_pngs[16], 32: generated_pngs[32]})
    ico_path = os.path.join(public_dir, 'favicon.ico')
    with open(ico_path, 'wb') as f:
        f.write(ico_bytes)
    print(f"[generate_favicons] Created favicon.ico -> {len(ico_bytes)} bytes")

if __name__ == '__main__':
    main()
