import os

from app.config import ALLOWED_TYPES, MAX_FILE_SIZE, UPLOAD_DIR
from app.rag.pipeline import process_file
from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter()


@router.post("/upload")
async def upload_files(files: list[UploadFile] = File(...)) -> dict:
    results = []
    total_chunks = 0
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    for file in files:
        ext = (file.filename or "").rsplit(".", 1)[-1].lower()
        if ext not in ALLOWED_TYPES:
            raise HTTPException(415, f"Unsupported file type: .{ext} in file {file.filename}")

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(413, f"File too large: {file.filename}")

        path = os.path.join(UPLOAD_DIR, file.filename or f"file.{ext}")

        try:
            with open(path, "wb") as f:
                f.write(content)
            chunks = process_file(path, ext)
            total_chunks += chunks
            results.append({"source": file.filename or "unknown", "chunks": chunks})
        finally:
            if os.path.exists(path):
                os.remove(path)

    return {
        "total_files": len(files),
        "total_chunks": total_chunks,
        "details": results,
    }
