#!/usr/bin/env python3
"""Build single-file pitch.html from index.html by inlining assets/ as base64.

Run after editing index.html or adding screenshots to assets/.
"""
import base64
import os
import re

DIR = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(DIR, "index.html")
DST = os.path.join(DIR, "pitch.html")
ASSETS = os.path.join(DIR, "assets")

with open(SRC) as f:
    html = f.read()

pattern = re.compile(r'(src|href)="assets/([^"]+)"')


def to_data_uri(filename):
    path = os.path.join(ASSETS, filename)
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode("ascii")
    ext = filename.rsplit(".", 1)[-1].lower()
    mime = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg"}.get(ext, "application/octet-stream")
    return f"data:{mime};base64,{data}"


cache = {}


def repl(m):
    attr, filename = m.group(1), m.group(2)
    if filename not in cache:
        cache[filename] = to_data_uri(filename)
    return f'{attr}="{cache[filename]}"'


out = pattern.sub(repl, html)

with open(DST, "w") as f:
    f.write(out)

print(f"Inlined {len(cache)} assets → {DST}")
print(f"Size: {os.path.getsize(DST) / 1024:.1f} KB")
