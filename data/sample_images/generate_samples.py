"""Generate synthetic lunar sample images for testing."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def create_sample_lunar_images(output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    w, h = 400, 400

    # Base lunar regolith noise
    np.random.seed(101)
    base_noise = np.random.normal(120, 15, (h, w)).clip(60, 200).astype(np.uint8)
    src_img = Image.fromarray(base_noise).convert("RGB")
    src_draw = ImageDraw.Draw(src_img)

    # Draw primary crater
    src_draw.ellipse([(120, 120), (280, 280)], fill=(80, 80, 80), outline=(220, 220, 220), width=4)
    # Inner shadow (grazing sun angle from NW)
    src_draw.pieslice([(124, 124), (276, 276)], start=135, end=315, fill=(35, 35, 40))
    # Central peak
    src_draw.ellipse([(190, 190), (210, 210)], fill=(210, 210, 210), outline=(50, 50, 50))
    # Secondary small craters
    src_draw.ellipse([(60, 80), (100, 120)], fill=(70, 70, 70), outline=(190, 190, 190), width=2)
    src_draw.ellipse([(290, 290), (330, 330)], fill=(75, 75, 75), outline=(180, 180, 180), width=2)
    src_img = src_img.filter(ImageFilter.GaussianBlur(radius=1.2))

    # Reference image (different solar elevation, smoother resolution)
    ref_noise = np.random.normal(130, 10, (h, w)).clip(80, 210).astype(np.uint8)
    ref_img = Image.fromarray(ref_noise).convert("RGB")
    ref_draw = ImageDraw.Draw(ref_img)
    # Scaled / translated crater
    ref_draw.ellipse([(118, 122), (282, 286)], fill=(95, 95, 95), outline=(205, 205, 205), width=3)
    # Reduced shadow (higher sun angle)
    ref_draw.pieslice([(122, 126), (278, 282)], start=160, end=290, fill=(50, 50, 55))
    ref_draw.ellipse([(192, 192), (208, 208)], fill=(195, 195, 195))
    ref_draw.ellipse([(58, 82), (98, 122)], fill=(85, 85, 85), outline=(180, 180, 180), width=2)
    ref_draw.ellipse([(292, 292), (332, 332)], fill=(90, 90, 90), outline=(175, 175, 175), width=2)
    ref_img = ref_img.filter(ImageFilter.GaussianBlur(radius=2.0))

    src_path = output_dir / "source_ohrc_sample.png"
    ref_path = output_dir / "reference_tmc2_sample.png"
    src_img.save(src_path)
    ref_img.save(ref_path)
    print(f"Created sample lunar images at:\n  - {src_path}\n  - {ref_path}")


if __name__ == "__main__":
    create_sample_lunar_images(Path("data/sample_images"))
