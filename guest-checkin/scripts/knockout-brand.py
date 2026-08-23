"""One-off: strip solid backgrounds from brand PNGs and crop."""
from pathlib import Path
from PIL import Image
import math
import shutil

ROOT = Path(__file__).resolve().parents[1] / "public" / "brand"


def dist(c, bg):
    return math.sqrt((c[0] - bg[0]) ** 2 + (c[1] - bg[1]) ** 2 + (c[2] - bg[2]) ** 2)


def knockout(im: Image.Image, bg, flood=28, fade=52) -> Image.Image:
    im = im.convert("RGBA")
    pix = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            d = dist((r, g, b), bg)
            if d <= flood:
                pix[x, y] = (r, g, b, 0)
            elif d <= fade:
                t = (d - flood) / (fade - flood)
                pix[x, y] = (r, g, b, int(max(0, min(255, t * 255))))
    return im


def crop_alpha(im: Image.Image, pad=12) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def invert_ink(im: Image.Image) -> Image.Image:
    """Navy wordmark → bone so the lockup reads on dark headers."""
    im = im.copy()
    pix = im.load()
    w, h = im.size
    bone = (247, 244, 239)
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a < 8:
                continue
            if r < 90 and g < 90 and b < 110:
                pix[x, y] = (*bone, a)
    return im


def main():
    lockup_src = ROOT / "lockup.png"
    mono_src = ROOT / "monogram.png"
    backup = ROOT / "_source"
    backup.mkdir(exist_ok=True)
    if not (backup / "lockup.png").exists():
        shutil.copy2(lockup_src, backup / "lockup.png")
    if not (backup / "monogram.png").exists():
        shutil.copy2(mono_src, backup / "monogram.png")

    lockup = Image.open(backup / "lockup.png")
    lockup = knockout(lockup, (247, 244, 239), flood=30, fade=58)
    lockup = crop_alpha(lockup, 16)
    lockup.save(ROOT / "lockup.png", "PNG", optimize=True)

    inverse = invert_ink(lockup)
    inverse.save(ROOT / "lockup-inverse.png", "PNG", optimize=True)

    mono = Image.open(backup / "monogram.png")
    mono = knockout(mono, (11, 28, 44), flood=26, fade=50)
    mono = crop_alpha(mono, 16)
    mono.save(ROOT / "monogram.png", "PNG", optimize=True)

    print("lockup", lockup.size)
    print("inverse", inverse.size)
    print("monogram", mono.size)


if __name__ == "__main__":
    main()
