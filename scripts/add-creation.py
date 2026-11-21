#!/usr/bin/env python3
"""add-creation: put a piece in the my stuff / creations hub.

usage:
  python3 scripts/add-creation.py <section> <image-path-or-url> --title "a title"
         [--alt "what's in the picture"] [--caption "optional caption"]
         [--note "optional note"] [--href https://...] [--no-build]

section is one of: photography, videography, graphic-design, art, voice-work, game-dev

The image is loaded (from a file or a url), stripped of all metadata,
saved under public/stuff/<section>/, and a line is added to src/data/creations.ts.
Animated gifs keep every frame.
"""
import argparse
import hashlib
import importlib.util
import json
import os
import re
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data", "creations.ts")
SECTIONS = [
    "photography",
    "videography",
    "graphic-design",
    "art",
    "voice-work",
    "game-dev",
]
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
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s[:40] or "item"


def main():
    ap = argparse.ArgumentParser(description="add a piece to my stuff")
    ap.add_argument("section", choices=SECTIONS)
    ap.add_argument("source")
    ap.add_argument("--title", required=True)
    ap.add_argument("--alt")
    ap.add_argument("--caption")
    ap.add_argument("--note")
    ap.add_argument("--href")
    ap.add_argument("--no-build", action="store_true")
    a = ap.parse_args()

    data, orig = load(a.source)
    try:
        out, ext = strip_meta.strip_bytes(data)
        strip_meta.verify(out, ext)
    except Exception as e:  # noqa: BLE001
        die(f"could not strip metadata ({e})")

    outdir = os.path.join(ROOT, "public", "stuff", a.section)
    os.makedirs(outdir, exist_ok=True)
    stem = slugify(os.path.splitext(orig)[0] or a.title)
    name = f"{stem}.{ext}"
    dest = os.path.join(outdir, name)
    if os.path.exists(dest) and open(dest, "rb").read() != out:
        name = f"{stem}-{hashlib.sha1(data).hexdigest()[:6]}.{ext}"
        dest = os.path.join(outdir, name)
    open(dest, "wb").write(out)

    fields = [f"title: {json.dumps(a.title)}"]
    fields.append(f"src: {json.dumps('/stuff/' + a.section + '/' + name)}")
    fields.append(f"alt: {json.dumps(a.alt or a.title)}")
    if a.caption:
        fields.append(f"caption: {json.dumps(a.caption)}")
    if a.note:
        fields.append(f"note: {json.dumps(a.note)}")
    if a.href:
        fields.append(f"href: {json.dumps(a.href)}")
    line = "      { " + ", ".join(fields) + " },\n"

    src = open(DATA, encoding="utf-8").read()
    token = f"// add-creation:{a.section}"
    if token not in src:
        die(f"marker '{token}' missing in {DATA}")
    idx = src.index(token)
    start = src.rfind("\n", 0, idx) + 1
    open(DATA, "w", encoding="utf-8").write(src[:start] + line + src[start:])
    print(f"saved public/stuff/{a.section}/{name} ({len(data)} -> {len(out)} bytes, metadata stripped)")

    if not a.no_build:
        print("building...")
        r = __import__("subprocess").run(["npm", "run", "build"], cwd=ROOT)
        if r.returncode:
            sys.exit(r.returncode)
    print("done. commit + push to publish.")


if __name__ == "__main__":
    main()
