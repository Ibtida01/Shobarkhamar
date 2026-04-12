import os
import gdown

# Download models from Google Drive links:
# best_B4_wiener_False.pth:   https://drive.google.com/file/d/1KJFskoRvKBEbMsFPU4hETYenH8Rw7QTR/view?usp=drive_link
# best_model.pt:             https://drive.google.com/file/d/1-jYbc4N1qF41GzQxu9HqjxYorhS8exI7/view?usp=drive_link
MODELS = {
    "best_B4_wiener_False.pth":   "1KJFskoRvKBEbMsFPU4hETYenH8Rw7QTR",
    "best_model.pt": "1-jYbc4N1qF41GzQxu9HqjxYorhS8exI7",
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