#!/usr/bin/env python3
"""add-snippet: collect images for the footer snippets and /snippets/.

usage:
  python3 scripts/add-snippet.py <category> <image-url> [<image-url> ...]
         [--alt "text"] [--href URL] [--no-build]

  categories: buttons, blinkies, stamps, gifs, banners

Blinkies are usually 150x20 and render at 2x (pixelated) on desktop.
Buttons are 88x31. Stamps are usually 99x56. Gifs and banners keep their natural size.

The image is downloaded, stripped of all metadata (animated gifs keep
every frame and their timings), saved under public/<category>/, and a
line is added to src/data/banners.ts. Use add-goodie.py for the /collect/
goodies page instead.
"""
import argparse
import hashlib
import importlib.util
import json
import os
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data", "banners.ts")
CATEGORIES = ("buttons", "blinkies", "stamps", "gifs", "banners")

spec = importlib.util.spec_from_file_location(
    "add_goodie", os.path.join(os.path.dirname(__file__), "add-goodie.py")
)
goodie = importlib.util.module_from_spec(spec)
spec.loader.exec_module(goodie)


def append_entry(category, entry):
    src = open(DATA, encoding="utf-8").read()
    marker = f"// add-snippet:{category}"
    if marker not in src:
        goodie.die(f"marker '{marker}' missing in {DATA}")
    fields = [f"src: {json.dumps(entry['src'])}", f"alt: {json.dumps(entry['alt'])}"]
    if entry.get("href"):
        fields.append(f"href: {json.dumps(entry['href'])}")
    fields += [f"width: {entry['width']}", f"height: {entry['height']}"]
    line = "  { " + ", ".join(fields) + " },\n"
    idx = src.index(marker)
    start = src.rfind("\n", 0, idx) + 1
    src = src[:start] + line + src[start:]
    open(DATA, "w", encoding="utf-8").write(src)


def main():
    ap = argparse.ArgumentParser(description="add images to footer snippets")
    ap.add_argument("category", choices=CATEGORIES)
    ap.add_argument("urls", nargs="+", metavar="url")
    ap.add_argument("--alt")
    ap.add_argument("--href")
    ap.add_argument("--no-build", action="store_true")
    a = ap.parse_args()

    outdir = os.path.join(ROOT, "public", a.category)
    os.makedirs(outdir, exist_ok=True)
    added = 0
    for url in a.urls:
        print(f"-> {url}")
        try:
            data = goodie.download(url)
        except Exception as e:  # noqa: BLE001
            print(f"   download failed: {e}", file=sys.stderr)
            continue
        out, ext, w, h, n = goodie.clean(data)
        goodie.verify(out, ext, n)
        stem = goodie.slugify(
            os.path.splitext(os.path.basename(urllib.parse.urlparse(url).path))[0]
        )
        name = f"{stem}.{ext}"
        path = os.path.join(outdir, name)
        if os.path.exists(path):
            if open(path, "rb").read() == out:
                print("   already have this one, skipping")
                continue
            name = f"{stem}-{hashlib.sha1(url.encode()).hexdigest()[:6]}.{ext}"
            path = os.path.join(outdir, name)
        open(path, "wb").write(out)
        alt = a.alt or stem.replace("-", " ")
        append_entry(
            a.category,
            dict(
                src=f"/{a.category}/{name}",
                alt=alt,
                href=a.href,
                width=w,
                height=h,
            ),
        )
        print(
            f"   saved public/{a.category}/{name}  ({w}x{h}, {n} frame{'s' if n != 1 else ''}, "
            f"{len(data)} -> {len(out)} bytes, metadata stripped + verified)"
        )
        added += 1
    if added and not a.no_build:
        print("building...")
        r = __import__("subprocess").run(["npm", "run", "build"], cwd=ROOT)
        if r.returncode:
            sys.exit(r.returncode)
    if not added:
        sys.exit(1)


if __name__ == "__main__":
    main()
