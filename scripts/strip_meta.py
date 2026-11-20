#!/usr/bin/env python3
"""Strip metadata from GIF/PNG/WebP/JPEG while keeping pixels and GIF frames."""
import io
import struct
from PIL import Image, ImageSequence


def _gif_skip_sub(b, p):
    while p < len(b) and b[p] != 0:
        p += b[p] + 1
    return p + 1


def strip_gif(data: bytes) -> bytes:
    if data[:6] not in (b"GIF87a", b"GIF89a"):
        raise ValueError("not a gif")
    # force 89a so a kept NETSCAPE loop is valid
    out = bytearray(b"GIF89a")
    pos = 6
    packed = data[pos + 4]
    out.extend(data[pos:pos + 7])
    pos += 7
    if packed & 0x80:
        n = 3 * (2 ** ((packed & 7) + 1))
        out.extend(data[pos:pos + n])
        pos += n
    while pos < len(data):
        t = data[pos]
        if t == 0x3B:
            out.append(0x3B)
            break
        if t == 0x21:
            label = data[pos + 1]
            if label == 0xFF:
                size = data[pos + 2]
                ident = bytes(data[pos + 3:pos + 3 + size])
                end = _gif_skip_sub(data, pos + 2)
                if ident.startswith((b"NETSCAPE", b"ANIMEXTS")):
                    out.extend(data[pos:end])
                pos = end
            elif label == 0xFE:
                pos = _gif_skip_sub(data, pos + 2)
            elif label == 0xF9:
                end = _gif_skip_sub(data, pos + 2)
                out.extend(data[pos:end])
                pos = end
            else:
                # drop comment-like / unknown extensions (XMP, ICC, etc.)
                pos = _gif_skip_sub(data, pos + 2)
        elif t == 0x2C:
            ipk = data[pos + 9]
            p = pos + 10
            if ipk & 0x80:
                p += 3 * (2 ** ((ipk & 7) + 1))
            p += 1
            p = _gif_skip_sub(data, p)
            out.extend(data[pos:p])
            pos = p
        else:
            raise ValueError("weird gif structure")
    if out[-1] != 0x3B:
        out.append(0x3B)
    return bytes(out)


PNG_DROP = {b"tEXt", b"zTXt", b"iTXt", b"eXIf", b"iCCP", b"tIME"}


def strip_png(data: bytes) -> bytes:
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("not a png")
    out = bytearray(data[:8])
    pos = 8
    while pos + 12 <= len(data):
        length = struct.unpack(">I", data[pos:pos + 4])[0]
        typ = data[pos + 4:pos + 8]
        end = pos + 12 + length
        if end > len(data):
            raise ValueError("truncated png")
        if typ not in PNG_DROP:
            out.extend(data[pos:end])
        pos = end
        if typ == b"IEND":
            break
    return bytes(out)


def _webp_chunks(data: bytes):
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        raise ValueError("not a webp")
    pos = 12
    chunks = []
    while pos + 8 <= len(data):
        typ = data[pos:pos + 4]
        size = struct.unpack("<I", data[pos + 4:pos + 8])[0]
        payload = data[pos + 8:pos + 8 + size]
        chunks.append((typ, payload))
        pos += 8 + size + (size & 1)
    return chunks


def strip_webp(data: bytes) -> bytes:
    drop = {b"EXIF", b"XMP ", b"ICCP"}
    chunks = [(t, p) for t, p in _webp_chunks(data) if t not in drop]
    cleaned = []
    for typ, payload in chunks:
        if typ == b"VP8X" and len(payload) >= 1:
            flags = payload[0] & ~0b00011010  # clear ICC, EXIF, XMP bits
            payload = bytes([flags]) + payload[1:]
        cleaned.append((typ, payload))
    body = bytearray()
    for typ, payload in cleaned:
        body.extend(typ)
        body.extend(struct.pack("<I", len(payload)))
        body.extend(payload)
        if len(payload) & 1:
            body.append(0)
    riff = b"RIFF" + struct.pack("<I", 4 + len(body)) + b"WEBP" + body
    return bytes(riff)


def strip_jpeg(data: bytes) -> bytes:
    im = Image.open(io.BytesIO(data))
    out = io.BytesIO()
    Image.frombytes("RGB", im.size, im.convert("RGB").tobytes()).save(
        out, format="JPEG", quality=92, optimize=True
    )
    return out.getvalue()


def strip_bytes(data: bytes) -> tuple[bytes, str]:
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return strip_gif(data), "gif"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return strip_png(data), "png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return strip_webp(data), "webp"
    if data[:2] == b"\xff\xd8":
        return strip_jpeg(data), "jpg"
    raise ValueError("unsupported image type")


def gif_inventory(b: bytes):
    pos = 6
    packed = b[pos + 4]
    pos += 7
    if packed & 0x80:
        pos += 3 * (2 ** ((packed & 7) + 1))
    frames = comments = 0
    apps, other = [], 0
    while pos < len(b):
        t = b[pos]
        if t == 0x3B:
            break
        if t == 0x21:
            label = b[pos + 1]
            if label == 0xFE:
                comments += 1
                pos = _gif_skip_sub(b, pos + 2)
            elif label == 0xFF:
                size = b[pos + 2]
                apps.append(bytes(b[pos + 3:pos + 3 + size]))
                pos = _gif_skip_sub(b, pos + 2)
            elif label == 0xF9:
                pos = _gif_skip_sub(b, pos + 2)
            else:
                other += 1
                pos = _gif_skip_sub(b, pos + 2)
        elif t == 0x2C:
            frames += 1
            ipk = b[pos + 9]
            pos += 10
            if ipk & 0x80:
                pos += 3 * (2 ** ((ipk & 7) + 1))
            pos += 1
            pos = _gif_skip_sub(b, pos)
        else:
            raise ValueError("weird gif structure")
    return frames, comments, apps, other


def png_types(data: bytes):
    pos = 8
    types = []
    while pos + 8 <= len(data):
        length = struct.unpack(">I", data[pos:pos + 4])[0]
        typ = data[pos + 4:pos + 8]
        types.append(typ)
        pos += 12 + length
        if typ == b"IEND":
            break
    return types


def webp_types(data: bytes):
    return [t for t, _ in _webp_chunks(data)]


def verify(out: bytes, ext: str, frames_expected: int | None = None):
    im = Image.open(io.BytesIO(out))
    n = getattr(im, "n_frames", 1)
    if frames_expected is not None and n != frames_expected:
        raise ValueError(f"frame count changed ({frames_expected} -> {n})")
    for k in ("exif", "icc_profile", "xmp", "XML:com.adobe.xmp", "comment", "photoshop"):
        if im.info.get(k):
            raise ValueError(f"metadata still in pillow info: {k}")
    if ext == "gif":
        fr, comments, apps, other = gif_inventory(out)
        bad = [a for a in apps if not a.startswith((b"NETSCAPE", b"ANIMEXTS"))]
        if comments or bad or other:
            raise ValueError(f"leftover gif blocks comments={comments} apps={bad} other={other}")
        if frames_expected is not None and fr != frames_expected:
            raise ValueError("gif frame blocks != frames")
    elif ext == "png":
        dropped = [t for t in png_types(out) if t in PNG_DROP]
        if dropped:
            raise ValueError(f"png still has {dropped}")
    elif ext == "webp":
        typ = webp_types(out)
        bad = [t for t in typ if t in (b"EXIF", b"XMP ", b"ICCP")]
        if bad:
            raise ValueError(f"webp still has {bad}")
    return n, im.size


def original_frames(data: bytes) -> int:
    im = Image.open(io.BytesIO(data))
    return getattr(im, "n_frames", 1)
