"""Generate WebP and @2x variants for images in images/ folder.

Usage:
    python3 scripts/generate_images.py

This script requires Pillow. If not installed, run:
    pip3 install pillow

It will process JPG/PNG files and create:
 - image.webp
 - image-2x.webp (resized to 2x) OR image@2x.jpg (upsampled) depending on orig
 - image@2x.jpg (resized to 2x) for backward compatibility

The script skips files that already exist with the target names.
"""
from PIL import Image
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
IMG_DIR = BASE / 'images'

def process_image(p: Path):
    name = p.stem
    ext = p.suffix.lower()
    if ext not in ['.jpg', '.jpeg', '.png']:
        print(f"Skipping unsupported file: {p.name}")
        return

    img = Image.open(p).convert('RGB')
    width, height = img.size

    webp = IMG_DIR / f"{name}.webp"
    webp_2x = IMG_DIR / f"{name}-2x.webp"
    at2x = IMG_DIR / f"{name}@2x.jpg"

    # Save base webp (same size)
    if not webp.exists():
        img.save(webp, 'WEBP', quality=85)
        print(f"Created {webp.name}")
    else:
        print(f"Exists {webp.name}, skipping")

    # Create 2x (double dimensions) - only if original smaller than 2x target won't blow up too much
    new_size = (min(width * 2, width * 2), min(height * 2, height * 2))
    img_2x = img.resize(new_size, Image.LANCZOS)

    if not webp_2x.exists():
        img_2x.save(webp_2x, 'WEBP', quality=80)
        print(f"Created {webp_2x.name}")
    else:
        print(f"Exists {webp_2x.name}, skipping")

    if not at2x.exists():
        img_2x.save(at2x, 'JPEG', quality=85)
        print(f"Created {at2x.name}")
    else:
        print(f"Exists {at2x.name}, skipping")


if __name__ == '__main__':
    if not IMG_DIR.exists():
        print(f"Images directory not found: {IMG_DIR}")
        exit(1)

    jpgs = list(IMG_DIR.glob('*.jpg')) + list(IMG_DIR.glob('*.jpeg')) + list(IMG_DIR.glob('*.png'))
    if not jpgs:
        print("No images found to process in images/")
        exit(0)

    for p in jpgs:
        process_image(p)

    print('Done')
