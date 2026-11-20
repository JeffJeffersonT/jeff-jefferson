#!/usr/bin/env python3
"""add-goodie: collect images for the goodies page (/goodies/).

Same as add-snippet.py: files go in public/<category>/ and a line is
added to src/data/banners.ts.

usage:
  python3 scripts/add-goodie.py <category> <image-url> [<image-url> ...]
         [--alt "text"] [--href URL] [--credit "who made it"] [--no-build]

  categories: buttons, blinkies, stamps, gifs

For every URL it:
  1. downloads the image (max 10 MB, checks it really is an image),
  2. re-encodes it from the raw pixels/frames ONLY, so ALL metadata is gone
     (exif, gps, icc, xmp, text chunks, gif comments + application extensions).
     Animated gifs / webps keep every frame, the frame timings and the loop count,
  3. verifies the result (frame count unchanged, no comment/xmp/extra blocks),
  4. saves it to public/<category>/ and adds a line to src/data/banners.ts,
then runs `npm run build` (unless --no-build). Commit + push afterwards (or use ./post.sh style).

--alt / --href / --credit apply to every URL given in that run. Run it once per image
if each one needs its own text.
"""
import argparse
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request

from PIL import Image, ImageSequence

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data", "banners.ts")
CATEGORIES = ("buttons", "blinkies", "stamps", "gifs")
MAX_BYTES = 10 * 1024 * 1024
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"


def die(msg):
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def download(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        die(f"{url}: bigger than 10 MB, skipping")
    return data


def fresh(im, mode):
    """Copy of the pixels only: a brand new image with an empty .info (no exif/icc/comment/xmp)."""
    c = im.convert(mode)
    return Image.frombytes(mode, c.size, c.tobytes())


def frames_and_timing(im):
    """All frames as RGBA (fully composited) + per-frame durations."""
    frames, durs = [], []
    for fr in ImageSequence.Iterator(im):
        frames.append(fresh(fr, "RGBA"))
        durs.append(fr.info.get("duration", im.info.get("duration", 100)))
    return frames, durs


def clean(data):
    """Return (bytes, ext, width, height, n_frames) with every bit of metadata removed."""
    try:
        im = Image.open(io.BytesIO(data))
        im.load()
    except Exception as e:  # noqa: BLE001
        die(f"not a readable image ({e})")
    fmt = (im.format or "").upper()
    n = getattr(im, "n_frames", 1)
    w, h = im.size
    out = io.BytesIO()
    if fmt == "GIF":
        loop = im.info.get("loop", 0)
        frames, durs = frames_and_timing(im)
        # NOTE: Pillow only writes a loop extension (NETSCAPE2.0) + the frames. No comment,
        # no XMP, no other application extensions are ever written unless we pass them.
        kw = dict(save_all=True, append_images=frames[1:], duration=durs,
                  disposal=2, optimize=False)
        if n > 1 or "loop" in im.info:
            kw["loop"] = loop
        frames[0].save(out, format="GIF", **kw)
        ext = "gif"
    elif fmt == "PNG":
        if n > 1:  # animated png
            frames, durs = frames_and_timing(im)
            frames[0].save(out, format="PNG", save_all=True, append_images=frames[1:],
                           duration=durs, loop=im.info.get("loop", 0))
        else:
            px = fresh(im, "RGBA" if im.mode in ("RGBA", "LA", "P", "PA") or "transparency" in im.info else "RGB")
            px.save(out, format="PNG", optimize=True)
        ext = "png"
    elif fmt in ("JPEG", "MPO"):
        fresh(im, "RGB").save(out, format="JPEG", quality=92, optimize=True)  # no exif/icc passed
        ext = "jpg"
    elif fmt == "WEBP":
        if n > 1:
            frames, durs = frames_and_timing(im)
            frames[0].save(out, format="WEBP", save_all=True, append_images=frames[1:],
                           duration=durs, loop=im.info.get("loop", 0), lossless=True)
        else:
            fresh(im, "RGBA").save(out, format="WEBP", lossless=True)
        ext = "webp"
    else:
        die(f"unsupported image type: {fmt or 'unknown'}")
    return out.getvalue(), ext, w, h, n


def gif_blocks(b):
    """Walk the GIF block structure; return (frame_count, comment_blocks, app_ext_ids, other_ext)."""
    pos = 6
    lsd = b[pos + 4]
    pos += 7
    if lsd & 0x80:
        pos += 3 * (2 ** ((lsd & 7) + 1))
    frames = comments = 0
    apps, other = [], 0

    def skip_sub(p):
        while b[p] != 0:
            p += b[p] + 1
        return p + 1

    while pos < len(b):
        t = b[pos]
        if t == 0x3B:
            break
        if t == 0x21:
            label = b[pos + 1]
            if label == 0xFE:
                comments += 1
                pos = skip_sub(pos + 2)
            elif label == 0xFF:
                size = b[pos + 2]
                apps.append(bytes(b[pos + 3:pos + 3 + size]).decode("latin1"))
                pos = skip_sub(pos + 2)
            elif label == 0xF9:
                pos = skip_sub(pos + 2)
            else:
                other += 1
                pos = skip_sub(pos + 2)
        elif t == 0x2C:
            frames += 1
            ipk = b[pos + 9]
            pos += 10
            if ipk & 0x80:
                pos += 3 * (2 ** ((ipk & 7) + 1))
            pos += 1  # lzw min code size
            pos = skip_sub(pos)
        else:
            die("verify: weird GIF structure")
    return frames, comments, apps, other


def verify(out_bytes, ext, n_expected):
    im = Image.open(io.BytesIO(out_bytes))
    n = getattr(im, "n_frames", 1)
    if n != n_expected:
        die(f"verify: frame count changed ({n_expected} -> {n})")
    extras = {k for k in im.info if k in ("exif", "icc_profile", "xmp", "XML:com.adobe.xmp",
                                          "comment", "photoshop", "transparency_x")}
    extras.discard("transparency_x")
    if extras:
        die(f"verify: metadata still present: {sorted(extras)}")
    if ext == "gif":
        fr, comments, apps, other = gif_blocks(out_bytes)
        bad = [a for a in apps if not a.startswith(("NETSCAPE", "ANIMEXTS"))]
        if comments or bad or other:
            die(f"verify: leftover gif blocks (comments={comments}, apps={bad}, other={other})")
        if fr != n_expected:
            die("verify: gif frame blocks != frames")
    else:
        for marker in (b"Exif", b"<x:xmpmeta", b"http://ns.adobe.com/xap", b"tEXt", b"iTXt", b"zTXt", b"eXIf"):
            if marker in out_bytes:
                die(f"verify: found {marker!r} in output")


def slugify(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s[:40] or "goodie"


def append_entry(category, entry):
    src = open(DATA, encoding="utf-8").read()
    marker = f"// add-snippet:{category}"
    if marker not in src:
        die(f"marker '{marker}' missing in {DATA}")
    fields = [f"src: {json.dumps(entry['src'])}", f"alt: {json.dumps(entry['alt'])}"]
    for k in ("href", "credit"):
        if entry.get(k):
            fields.append(f"{k}: {json.dumps(entry[k])}")
    fields += [f"width: {entry['width']}", f"height: {entry['height']}"]
    line = "  { " + ", ".join(fields) + " },\n"
    idx = src.index(marker)
    start = src.rfind("\n", 0, idx) + 1
    src = src[:start] + line + src[start:]
    open(DATA, "w", encoding="utf-8").write(src)


def main():
    ap = argparse.ArgumentParser(description="add images to the goodies page")
    ap.add_argument("category", choices=CATEGORIES)
    ap.add_argument("urls", nargs="+", metavar="url")
    ap.add_argument("--alt")
    ap.add_argument("--href")
    ap.add_argument("--credit")
    ap.add_argument("--no-build", action="store_true")
    a = ap.parse_args()

    outdir = os.path.join(ROOT, "public", a.category)
    os.makedirs(outdir, exist_ok=True)
    added = 0
    for url in a.urls:
        print(f"-> {url}")
        try:
            data = download(url)
        except Exception as e:  # noqa: BLE001
            print(f"   download failed: {e}", file=sys.stderr)
            continue
        out, ext, w, h, n = clean(data)
        verify(out, ext, n)
        stem = slugify(os.path.splitext(os.path.basename(urllib.parse.urlparse(url).path))[0])
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
        append_entry(a.category, dict(src=f"/{a.category}/{name}", alt=alt,
                                      href=a.href, credit=a.credit, width=w, height=h))
        print(f"   saved public/{a.category}/{name}  ({w}x{h}, {n} frame{'s' if n != 1 else ''}, "
              f"{len(data)} -> {len(out)} bytes, metadata stripped + verified)")
        added += 1
    if added and not a.no_build:
        print("building...")
        r = subprocess.run(["npm", "run", "build"], cwd=ROOT)
        if r.returncode:
            die("build failed")
    print(f"done: {added} added. now commit + push to publish.")


if __name__ == "__main__":
    main()
