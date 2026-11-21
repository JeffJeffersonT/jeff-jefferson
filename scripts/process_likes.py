#!/usr/bin/env python3
"""Build small square WebP tiles for /likes/. Reuses favourites covers as-is
(they already live in public/favourites). New official art is resized, metadata
stripped, and saved under public/likes/."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from strip_meta import strip_bytes  # noqa: E402

OUT = ROOT / "public" / "likes"
SIZE = 240


def save_webp(im: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(".tmp.webp")
    im.convert("RGB").save(tmp, "WEBP", quality=86, method=6)
    data = tmp.read_bytes()
    stripped, kind = strip_bytes(data)
    if kind != "webp":
        raise RuntimeError(f"{dest} strip produced {kind}")
    dest.write_bytes(stripped)
    tmp.unlink(missing_ok=True)
    print(f"  wrote {dest.relative_to(ROOT)} ({dest.stat().st_size} bytes)")


def cover_square(im: Image.Image, size: int, bias_top: float = 0.0) -> Image.Image:
    im = im.convert("RGB")
    w, h = im.size
    side = min(w, h)
    left = (w - side) // 2
    top = int((h - side) * bias_top)
    top = max(0, min(top, h - side))
    return im.crop((left, top, left + side, top + side)).resize(
        (size, size), Image.Resampling.LANCZOS
    )


def contain_square(im: Image.Image, size: int, bg: tuple[int, int, int], pad: int = 16) -> Image.Image:
    canvas = Image.new("RGB", (size, size), bg)
    work = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
    if work.mode == "P":
        work = work.convert("RGBA")
    box = work.getbbox() if work.mode == "RGBA" else None
    if box:
        work = work.crop(box)
    inner = size - pad * 2
    work.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    x = (size - work.width) // 2
    y = (size - work.height) // 2
    if work.mode == "RGBA":
        canvas.paste(work, (x, y), work)
    else:
        canvas.paste(work.convert("RGB"), (x, y))
    return canvas


def trim_near(im: Image.Image, thresh: int = 248) -> Image.Image:
    """Crop near-white (or near-uniform) margins off a product photo."""
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    # sample corner to see if the backdrop is light
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    avg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
    def is_bg(p):
        return all(abs(p[i] - avg[i]) < 18 and p[i] >= thresh - 20 for i in range(3))

    minx, miny, maxx, maxy = w, h, 0, 0
    # coarse scan
    step = max(1, min(w, h) // 400)
    for y in range(0, h, step):
        for x in range(0, w, step):
            if not is_bg(px[x, y]):
                minx, miny = min(minx, x), min(miny, y)
                maxx, maxy = max(maxx, x), max(maxy, y)
    # pad a little, then clamp
    pad = 8
    minx, miny = max(0, minx - pad), max(0, miny - pad)
    maxx, maxy = min(w, maxx + pad), min(h, maxy + pad)
    if maxx - minx < 40 or maxy - miny < 40:
        return rgb
    return rgb.crop((minx, miny, maxx, maxy))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    jobs = [
        # official Steam library art (Mega Crit / Steam store)
        ("slay-the-spire.webp", Path("/tmp/src-slay-lib.jpg"), "cover", (0, 0, 0), 0.15),
        # official Riftbound cover from Riot / League wiki
        ("riftbound.webp", Path("/tmp/src-riftbound.jpg"), "cover", (0, 0, 0), 0.0),
        # official Pokémon TCG logo from tcg.pokemon.com
        ("pokemon-tcg.webp", Path("/tmp/src-pokemon-tcg.png"), "contain", (14, 32, 90), 0.0),
        # official Card-Jitsu logo (Club Penguin / Disney)
        ("card-jitsu.webp", Path("/tmp/src-cardjitsu.png"), "contain", (0, 0, 0), 0.0),
        # official Kayou PvZ box photo (retailer product shot, crop the caption)
        ("kayou-pvz.webp", Path("/tmp/src-kayou.jpg"), "trim-cover", (255, 255, 255), 0.0),
        # official Ashnikko wordmark (from her site, via Wikimedia)
        ("ashnikko.webp", Path("/tmp/src-ashnikko.png"), "contain", (8, 8, 10), 0.0),
        # official SU Soundtrack Vol. 1 cover (Cover Art Archive / MusicBrainz)
        ("steven-universe-soundtrack.webp", Path("/tmp/src-su-ost.jpg"), "cover", (0, 0, 0), 0.0),
    ]
    for name, src, mode, bg, bias in jobs:
        if not src.exists():
            raise SystemExit(f"missing source {src}")
        im = Image.open(src)
        print(f"processing {name} from {src} ({im.size} {im.mode}) [{mode}]")
        if mode == "contain":
            tile = contain_square(im, SIZE, bg)
        elif mode == "trim-cover":
            tile = cover_square(trim_near(im), SIZE, bias)
        else:
            tile = cover_square(im, SIZE, bias)
        save_webp(tile, OUT / name)
    print("done")


if __name__ == "__main__":
    main()
