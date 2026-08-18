import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException
from pathlib import Path
from app.config import settings

ALLOWED_EXTENSIONS = {'.pdf', '.docx'}

def validate_file(file: UploadFile) -> None:
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX are allowed.")
    # For size, one could read the file but we might stream it. 
    # Usually fastAPI can handle this in dependencies or middleware, 
    # but let's check size if we must, or rely on nginx.
    pass

def save_upload_file(file: UploadFile, user_id: int) -> str:
    validate_file(file)
    ext = Path(file.filename).suffix.lower()
    filename = f"{uuid.uuid4()}{ext}"
    user_dir = os.path.join(settings.UPLOAD_DIR, str(user_id))
    os.makedirs(user_dir, exist_ok=True)
    file_path = os.path.join(user_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return file_path

def delete_file(file_path: str) -> None:
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")
