#!/usr/bin/env python3
"""add-photo: put a picture on the scrapbook page.

usage:
  python3 scripts/add-photo.py <image-path-or-url> [--alt "what's in the photo"]
         [--caption "optional caption"] [--no-build]

The image is loaded (from a file or a url), stripped of all metadata,
saved under public/scrapbook/, and a line is added to src/data/gallery.ts.
Animated gifs keep every frame.
"""
import argparse
import hashlib
import importlib.util
import json
import os
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data", "gallery.ts")
OUTDIR = os.path.join(ROOT, "public", "scrapbook")
TOKEN = "// add-photo"
MAX_BYTES = 10 * 1024 * 1024
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

spec = importlib.util.spec_from_file_location(
    "strip_meta", os.path.join(os.path.dirname(__file__), "strip_meta.py")
)
strip_meta = importlib.util.module_from_spec(spec)
spec.loader.exec_module(strip_meta)


def die(msg):
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def load(src):
    if src.startswith("http://") or src.startswith("https://"):
        req = urllib.request.Request(src, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES:
            die("bigger than 10 MB, skipping")
        name = os.path.basename(urllib.parse.urlparse(src).path)
        return data, name
    path = os.path.abspath(src)
    if not os.path.isfile(path):
        die(f"file not found: {src}")
    return open(path, "rb").read(), os.path.basename(path)


def slugify(s):
    import re
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s[:40] or "photo"


def main():
    ap = argparse.ArgumentParser(description="add a photo to the scrapbook")
    ap.add_argument("source")
    ap.add_argument("--alt")
    ap.add_argument("--caption")
    ap.add_argument("--no-build", action="store_true")
    a = ap.parse_args()

    data, orig = load(a.source)
    try:
        out, ext = strip_meta.strip_bytes(data)
        strip_meta.verify(out, ext)
    except Exception as e:  # noqa: BLE001
        die(f"could not strip metadata ({e})")

    os.makedirs(OUTDIR, exist_ok=True)
    stem = slugify(os.path.splitext(orig)[0])
    name = f"{stem}.{ext}"
    dest = os.path.join(OUTDIR, name)
    if os.path.exists(dest) and open(dest, "rb").read() != out:
        name = f"{stem}-{hashlib.sha1(data).hexdigest()[:6]}.{ext}"
        dest = os.path.join(OUTDIR, name)
    open(dest, "wb").write(out)

    alt = a.alt or stem.replace("-", " ")
    fields = [f"src: {json.dumps('/scrapbook/' + name)}", f"alt: {json.dumps(alt)}"]
    if a.caption:
        fields.append(f"caption: {json.dumps(a.caption)}")
    line = "  { " + ", ".join(fields) + " },\n"
    src = open(DATA, encoding="utf-8").read()
    if TOKEN not in src:
        die(f"marker '{TOKEN}' missing in {DATA}")
    idx = src.index(TOKEN)
    start = src.rfind("\n", 0, idx) + 1
    open(DATA, "w", encoding="utf-8").write(src[:start] + line + src[start:])
    print(f"saved public/scrapbook/{name} ({len(data)} -> {len(out)} bytes, metadata stripped)")

    if not a.no_build:
        print("building...")
        r = __import__("subprocess").run(["npm", "run", "build"], cwd=ROOT)
        if r.returncode:
            sys.exit(r.returncode)
    print("done. commit + push to publish.")


if __name__ == "__main__":
    main()
