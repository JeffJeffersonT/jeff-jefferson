#!/usr/bin/env python3
"""Build handmade old-web assets and copy-plus-strip archive GIFs.

Outputs (metadata stripped, gif animation kept):
  public/gifs/under-construction.gif
  public/gifs/under-construction-graphic.gif
  public/gifs/construction-bulldozer.gif
  public/gifs/tiny-star.gif
  public/buttons/sign-guestbook.gif
  public/buttons/email-me.gif
  public/cursors/pointer.png
  public/cursors/hand.png
  public/pets/pixel-friend.gif
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageSequence

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from strip_meta import strip_bytes  # noqa: E402

SRC = Path("/tmp/gifs")


def save_stripped(data: bytes, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    out, kind = strip_bytes(data)
    dest.write_bytes(out)
    print(f"  {dest.relative_to(ROOT)} ({kind}, {dest.stat().st_size} bytes)")


def save_image_file(src: Path, dest: Path) -> None:
    save_stripped(src.read_bytes(), dest)


def save_gif(frames: list[Image.Image], dest: Path, durations: list[int], *, loop: int = 0) -> None:
    if not frames:
        raise ValueError("no frames")
    rgb = [im.convert("RGB") for im in frames]
    quant = rgb[0].quantize(colors=64, method=Image.Quantize.MEDIANCUT)
    out_frames = [im.quantize(palette=quant, dither=Image.Dither.NONE) for im in rgb]
    tmp = dest.with_suffix(".tmp.gif")
    out_frames[0].save(
        tmp, "GIF", save_all=True, append_images=out_frames[1:],
        duration=durations, loop=loop, optimize=False, disposal=2,
    )
    save_stripped(tmp.read_bytes(), dest)
    tmp.unlink(missing_ok=True)


def draw_text(draw: ImageDraw.ImageDraw, xy, text, fill, shadow=None):
    # default bitmap font
    if shadow:
        draw.text((xy[0] + 1, xy[1] + 1), text, fill=shadow)
    draw.text(xy, text, fill=fill)


def make_email_button() -> list[Image.Image]:
    """88x31 animated 'email me' button in the site purple."""
    W, H = 88, 31
    bg = (74, 32, 128)
    bg2 = (92, 42, 150)
    border = (255, 230, 120)
    text = (255, 245, 255)
    env = (255, 230, 140)
    frames = []
    for i in range(4):
        color = bg if i % 2 == 0 else bg2
        im = Image.new("RGB", (W, H), color)
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, W - 1, H - 1], outline=border)
        d.rectangle([1, 1, W - 2, H - 2], outline=(40, 16, 70))
        # tiny envelope on the left
        ex, ey = 5, 9
        ew, eh = 14, 10
        d.rectangle([ex, ey, ex + ew, ey + eh], outline=env, fill=(40, 16, 70))
        if i < 2:
            # closed flap
            d.polygon([(ex, ey), (ex + ew // 2, ey + 5), (ex + ew, ey)], outline=env)
        else:
            # open flap
            d.polygon([(ex, ey), (ex + ew // 2, ey - 4), (ex + ew, ey)], outline=env)
            d.line([(ex, ey), (ex + ew // 2, ey + 5), (ex + ew, ey)], fill=env)
        draw_text(d, (24, 9), "email me", fill=text, shadow=(40, 16, 70))
        frames.append(im)
    return frames


def make_star_frames() -> list[Image.Image]:
    """Tiny 13x13 twinkling star, transparent-ish dark corners."""
    frames = []
    sizes = [2, 3, 5, 3]
    for s in sizes:
        im = Image.new("RGBA", (13, 13), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        cx, cy = 6, 6
        col = (255, 230, 120, 255)
        col2 = (255, 255, 255, 255)
        # plus
        d.line([(cx, cy - s), (cx, cy + s)], fill=col)
        d.line([(cx - s, cy), (cx + s, cy)], fill=col)
        if s >= 3:
            d.point((cx, cy), fill=col2)
            d.line([(cx - s + 1, cy - s + 1), (cx + s - 1, cy + s - 1)], fill=(255, 200, 80, 200))
            d.line([(cx - s + 1, cy + s - 1), (cx + s - 1, cy - s + 1)], fill=(255, 200, 80, 200))
        frames.append(im)
    return frames


def make_pet_frames() -> list[Image.Image]:
    """A little purple pixel friend. 48x48, four bounce frames, transparent bg."""
    frames = []
    body = (130, 80, 200, 255)
    body2 = (160, 110, 230, 255)
    outline = (40, 16, 70, 255)
    eye = (20, 10, 30, 255)
    shine = (255, 255, 255, 255)
    blush = (230, 120, 180, 255)
    star = (255, 230, 120, 255)
    # bounce offsets
    for i, yoff in enumerate((2, 0, -2, 0)):
        im = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        # shadow
        d.ellipse([14, 40, 34, 46], fill=(40, 16, 70, 60 if yoff < 0 else 90))
        # body
        x0, y0 = 10, 14 + yoff
        x1, y1 = 37, 40 + yoff
        d.ellipse([x0, y0, x1, y1], fill=body, outline=outline)
        # belly
        d.ellipse([16, 24 + yoff, 31, 38 + yoff], fill=body2)
        # ears / little nubs
        d.ellipse([12, 10 + yoff, 20, 20 + yoff], fill=body, outline=outline)
        d.ellipse([27, 10 + yoff, 35, 20 + yoff], fill=body, outline=outline)
        # eyes (blink on last frame)
        if i == 3:
            d.line([(18, 24 + yoff), (22, 24 + yoff)], fill=eye)
            d.line([(26, 24 + yoff), (30, 24 + yoff)], fill=eye)
        else:
            d.ellipse([18, 22 + yoff, 22, 26 + yoff], fill=eye)
            d.ellipse([26, 22 + yoff, 30, 26 + yoff], fill=eye)
            d.point((21, 23 + yoff), fill=shine)
            d.point((29, 23 + yoff), fill=shine)
        # blush
        d.point((16, 27 + yoff), fill=blush)
        d.point((31, 27 + yoff), fill=blush)
        # smile
        d.arc([20, 26 + yoff, 28, 32 + yoff], 20, 160, fill=eye)
        # a little star over the head
        sx, sy = 24, 6 + yoff
        if i % 2 == 0:
            d.line([(sx, sy - 3), (sx, sy + 3)], fill=star)
            d.line([(sx - 3, sy), (sx + 3, sy)], fill=star)
        else:
            d.line([(sx, sy - 2), (sx, sy + 2)], fill=star)
            d.line([(sx - 2, sy), (sx + 2, sy)], fill=star)
            d.point((sx, sy), fill=shine)
        frames.append(im)
    return frames


def px(im: Image.Image, pts, color):
    d = ImageDraw.Draw(im)
    for x, y in pts:
        d.point((x, y), fill=color)


def make_pointer() -> Image.Image:
    """24x24 classic pixel pointer, purple with a light fill and dark outline."""
    im = Image.new("RGBA", (24, 24), (0, 0, 0, 0))
    # arrow coordinates (classic cursor shape)
    outline = [
        (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13),
        (2, 1), (3, 2), (4, 3), (5, 4), (6, 5), (7, 6), (8, 7), (9, 8), (10, 9), (11, 10), (12, 11),
        (8, 11), (9, 12), (10, 13), (11, 14), (12, 15),
        (7, 11), (6, 12), (5, 13), (4, 14), (3, 15), (2, 16), (2, 14),
        (2, 13),
    ]
    # simpler: draw a filled triangle + stem
    d = ImageDraw.Draw(im)
    fill = (245, 230, 255, 255)
    edge = (40, 16, 70, 255)
    tip = [
        (1, 1), (1, 17), (6, 13), (10, 21), (13, 20), (9, 12), (15, 12), (1, 1)
    ]
    d.polygon(tip, fill=fill, outline=edge)
    # accent pixel
    d.point((4, 6), fill=(180, 120, 230, 255))
    return im


def make_hand() -> Image.Image:
    """24x24 pointing-hand cursor."""
    im = Image.new("RGBA", (24, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    fill = (245, 230, 255, 255)
    edge = (40, 16, 70, 255)
    # palm
    d.rectangle([6, 11, 16, 20], fill=fill, outline=edge)
    # thumb
    d.rectangle([3, 12, 7, 17], fill=fill, outline=edge)
    # index finger up
    d.rectangle([7, 3, 11, 12], fill=fill, outline=edge)
    # other fingers
    d.rectangle([11, 8, 14, 12], fill=fill, outline=edge)
    d.rectangle([14, 9, 17, 12], fill=fill, outline=edge)
    # knuckle highlight
    d.point((9, 13), fill=(180, 120, 230, 255))
    return im


def main() -> None:
    (ROOT / "public/pets").mkdir(parents=True, exist_ok=True)
    (ROOT / "public/cursors").mkdir(parents=True, exist_ok=True)
    # archive gifs
    save_image_file(SRC / "under-construction.gif", ROOT / "public/gifs/under-construction.gif")
    save_image_file(SRC / "under-construction-graphic.gif", ROOT / "public/gifs/under-construction-graphic.gif")
    save_image_file(SRC / "construction-bulldozer.gif", ROOT / "public/gifs/construction-bulldozer.gif")
    save_image_file(SRC / "1guestbook.gif", ROOT / "public/buttons/sign-guestbook.gif")

    # handmade
    save_gif(make_email_button(), ROOT / "public/buttons/email-me.gif", [240, 240, 240, 240])
    # star and pet need a transparent index. flatten onto a key color then set transparency.
    # Easier path: composite onto a unique magenta key and set that as transparent.
    key = (255, 0, 255)

    def keyed(frames):
        out = []
        for im in frames:
            bg = Image.new("RGB", im.size, key)
            bg.paste(im, mask=im.split()[-1] if im.mode == "RGBA" else None)
            out.append(bg)
        return out

    star_frames = keyed(make_star_frames())
    # quantize via save_gif then we'll post-process transparency by rewriting...
    # Use a simpler approach: save with Pillow transparency after putting key color as index 0
    def save_keyed_gif(frames_rgb, dest, durations):
        # build a palette with key color first
        pal_img = Image.new("P", (1, 1))
        # collect colors
        colors = {key}
        for im in frames_rgb:
            for c in im.getdata():
                colors.add(c)
                if len(colors) >= 120:
                    break
        palette = list(key)
        for c in colors:
            if c != key:
                palette.extend(c)
        palette.extend([0] * (768 - len(palette)))
        pal_img.putpalette(palette[:768])
        out_frames = []
        for im in frames_rgb:
            q = im.convert("RGB").quantize(palette=pal_img, dither=Image.Dither.NONE)
            out_frames.append(q)
        tmp = dest.with_suffix(".tmp.gif")
        out_frames[0].save(
            tmp, "GIF", save_all=True, append_images=out_frames[1:],
            duration=durations, loop=0, optimize=False, disposal=2,
            transparency=0,
        )
        save_stripped(tmp.read_bytes(), dest)
        tmp.unlink(missing_ok=True)

    save_keyed_gif(star_frames, ROOT / "public/gifs/tiny-star.gif", [160, 160, 200, 160])
    save_keyed_gif(keyed(make_pet_frames()), ROOT / "public/pets/pixel-friend.gif", [220, 220, 220, 320])

    # cursors as stripped png
    for name, im in (("pointer.png", make_pointer()), ("hand.png", make_hand())):
        dest = ROOT / "public/cursors" / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        tmp = dest.with_suffix(".tmp.png")
        im.save(tmp, "PNG")
        save_stripped(tmp.read_bytes(), dest)
        tmp.unlink(missing_ok=True)

    print("done")


if __name__ == "__main__":
    main()
