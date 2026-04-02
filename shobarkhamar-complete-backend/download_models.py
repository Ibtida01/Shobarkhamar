import os
import gdown

MODELS = {
    "best_B4_wiener_False.pth":   "https://drive.google.com/file/d/1LE9uBQDMPULaNxOu_SKl4fTRqoykNSVo/view?usp=drive_link",
    "efficientnetv2_b4_best.pth": "https://drive.google.com/file/d/1TTo-GUvJ-m9qf3Dk3Gux0mMT-7Ev6ydI/view?usp=drive_link",
}

os.makedirs("/app/models", exist_ok=True)

for filename, file_id in MODELS.items():
    dest = f"/app/models/{filename}"
    if not os.path.exists(dest):
        print(f"Downloading {filename}...")
        gdown.download(id=file_id, output=dest, quiet=False)
        print(f"✓ {filename} done")
    else:
        print(f"✓ {filename} already exists")