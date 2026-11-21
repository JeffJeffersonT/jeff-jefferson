#!/usr/bin/env python3
"""Handmade pixel badges, tag stamps, and post chrome. Metadata stripped."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from strip_meta import strip_bytes  # noqa: E402


def save_stripped_png(im: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(".tmp.png")
    im.save(tmp, "PNG")
    out, kind = strip_bytes(tmp.read_bytes())
    dest.write_bytes(out)
    tmp.unlink(missing_ok=True)
    print(f"  {dest.relative_to(ROOT)} ({kind}, {dest.stat().st_size}b)")


def save_stripped_gif(frames: list[Image.Image], dest: Path, durations: list[int], loop: int = 0) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    rgb = [im.convert("RGB") for im in frames]
    quant = rgb[0].quantize(colors=48, method=Image.Quantize.MEDIANCUT)
    out_frames = [im.quantize(palette=quant, dither=Image.Dither.NONE) for im in rgb]
    tmp = dest.with_suffix(".tmp.gif")
    out_frames[0].save(
        tmp, "GIF", save_all=True, append_images=out_frames[1:],
        duration=durations, loop=loop, optimize=False, disposal=2,
    )
    out, kind = strip_bytes(tmp.read_bytes())
    dest.write_bytes(out)
    tmp.unlink(missing_ok=True)
    print(f"  {dest.relative_to(ROOT)} ({kind}, {dest.stat().st_size}b)")


def font():
    try:
        return ImageFont.load_default()
    except Exception:
        return ImageFont.load_default()


def stamp_frame(w=16, h=16, fill=(236, 228, 255), edge=(58, 20, 102)):
    im = Image.new("RGB", (w, h), fill)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, w - 1, h - 1], outline=edge)
    d.rectangle([1, 1, w - 2, h - 2], outline=(180, 150, 220))
    return im, d


def icon_cooking():
    im, d = stamp_frame(fill=(255, 236, 210))
    d.ellipse([4, 7, 11, 13], outline=(140, 60, 20), fill=(200, 90, 30))
    d.line([(3, 8), (12, 8)], fill=(80, 40, 20))
    d.line([(12, 8), (14, 6)], fill=(80, 40, 20))
    d.point((7, 5), fill=(200, 120, 40))
    d.point((8, 4), fill=(200, 120, 40))
    return im


def icon_food():
    im, d = stamp_frame(fill=(255, 236, 236))
    d.ellipse([4, 5, 11, 13], fill=(200, 40, 50), outline=(120, 20, 30))
    d.line([(7, 3), (8, 6)], fill=(40, 120, 50))
    return im


def icon_game():
    im, d = stamp_frame(fill=(228, 236, 255))
    # little trophy
    d.rectangle([6, 9, 9, 12], fill=(200, 160, 40), outline=(120, 80, 10))
    d.arc([4, 3, 11, 11], 0, 180, fill=(200, 160, 40))
    d.rectangle([5, 3, 10, 8], fill=(220, 180, 50), outline=(120, 80, 10))
    return im


def icon_pencil():
    im, d = stamp_frame(fill=(255, 252, 230))
    d.polygon([(4, 11), (5, 12), (12, 5), (11, 4)], fill=(80, 80, 200), outline=(40, 40, 100))
    d.polygon([(4, 11), (5, 12), (3, 13)], fill=(200, 160, 80))
    return im


def icon_book():
    im, d = stamp_frame(fill=(236, 244, 255))
    d.rectangle([4, 4, 12, 12], outline=(40, 50, 120), fill=(245, 245, 255))
    d.line([(8, 4), (8, 12)], fill=(40, 50, 120))
    d.line([(5, 6), (7, 6)], fill=(80, 90, 160))
    d.line([(9, 6), (11, 6)], fill=(80, 90, 160))
    return im


def icon_star():
    im, d = stamp_frame(fill=(255, 248, 220))
    d.line([(8, 3), (8, 12)], fill=(200, 150, 20))
    d.line([(4, 7), (12, 7)], fill=(200, 150, 20))
    d.line([(5, 4), (11, 11)], fill=(200, 150, 20))
    d.line([(11, 4), (5, 11)], fill=(200, 150, 20))
    d.point((8, 7), fill=(255, 230, 80))
    return im


def icon_wave():
    im, d = stamp_frame(fill=(236, 255, 236))
    d.arc([3, 5, 8, 11], 200, 20, fill=(40, 100, 40))
    d.arc([7, 5, 12, 11], 200, 20, fill=(40, 100, 40))
    return im


def icon_default():
    im, d = stamp_frame(fill=(240, 230, 255))
    d.rectangle([5, 4, 10, 11], outline=(80, 30, 140), fill=(200, 180, 230))
    d.line([(5, 6), (10, 6)], fill=(80, 30, 140))
    return im


TAG_ICONS = {
    "cooking": icon_cooking,
    "food": icon_food,
    "esports": icon_game,
    "league-of-legends": icon_game,
    "lck": icon_game,
    "lpl": icon_game,
    "worlds": icon_game,
    "gen-g": icon_game,
    "player-ratings": icon_game,
    "blogging": icon_pencil,
    "blg": icon_pencil,
    "intro": icon_wave,
    "life": icon_book,
    "life-skills": icon_book,
    "self-taught": icon_book,
    "opinions": icon_star,
    "default": icon_default,
}


def make_rss_frames():
    frames = []
    for i, bg in enumerate(((255, 130, 30), (255, 150, 50))):
        im = Image.new("RGB", (88, 31), bg)
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 87, 30], outline=(80, 30, 0))
        d.rectangle([1, 1, 86, 29], outline=(255, 230, 180))
        # rss waves
        d.ellipse([8, 18, 14, 24], fill=(255, 255, 255))
        d.arc([8, 10, 22, 24], 200, 20, fill=(255, 255, 255))
        d.arc([8, 4, 28, 24], 200, 20, fill=(255, 255, 255))
        d.text((34, 9), "RSS", fill=(255, 255, 255))
        frames.append(im)
    return frames


def make_bookmark_frames():
    frames = []
    texts = ("bookmark me!", "press ctrl+d!")
    for i, text in enumerate(texts):
        im = Image.new("RGB", (150, 20), (90, 40, 160) if i == 0 else (120, 50, 190))
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 149, 19], outline=(255, 220, 80))
        d.text((28, 4), text, fill=(255, 255, 220))
        # tiny star
        d.point((12, 9), fill=(255, 230, 80))
        d.line([(12, 6), (12, 13)], fill=(255, 230, 80))
        d.line([(9, 9), (15, 9)], fill=(255, 230, 80))
        frames.append(im)
    return frames


def make_share_stamp():
    im = Image.new("RGB", (72, 22), (255, 245, 220))
    d = ImageDraw.Draw(im)
    # perforated edge
    d.rectangle([0, 0, 71, 21], outline=(120, 60, 20), fill=(255, 245, 220))
    for x in range(2, 71, 4):
        d.point((x, 1), fill=(180, 140, 80))
        d.point((x, 20), fill=(180, 140, 80))
    d.text((10, 5), "share this", fill=(100, 40, 20))
    return im


def make_arrow():
    im = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.polygon([(8, 2), (14, 9), (10, 9), (10, 14), (6, 14), (6, 9), (2, 9)], fill=(90, 30, 150), outline=(40, 10, 70))
    return im


def make_note_icon():
    im = Image.new("RGBA", (12, 12), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([1, 1, 10, 10], fill=(255, 252, 200), outline=(80, 50, 20))
    d.line([(3, 4), (8, 4)], fill=(80, 50, 20))
    d.line([(3, 6), (8, 6)], fill=(80, 50, 20))
    d.line([(3, 8), (6, 8)], fill=(80, 50, 20))
    return im


def main():
    tag_dir = ROOT / "public" / "tag-stamps"
    for name, fn in TAG_ICONS.items():
        save_stripped_png(fn(), tag_dir / f"{name}.png")
    save_stripped_gif(make_rss_frames(), ROOT / "public" / "buttons" / "rss.gif", [500, 500])
    save_stripped_gif(make_bookmark_frames(), ROOT / "public" / "blinkies" / "bookmark-me.gif", [700, 700])
    save_stripped_png(make_share_stamp(), ROOT / "public" / "gifs" / "share-this.png")
    save_stripped_png(make_arrow(), ROOT / "public" / "gifs" / "to-top.png")
    save_stripped_png(make_note_icon(), ROOT / "public" / "gifs" / "note-icon.png")
    print("done")


if __name__ == "__main__":
    main()
