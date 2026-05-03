import os

from app.config import ALLOWED_TYPES, MAX_FILE_COUNT, MAX_FILE_SIZE, UPLOAD_DIR
from app.rag.pipeline import process_file
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

router = APIRouter()


@router.post("/upload")
async def upload_files(
    files: list[UploadFile] = File(...),
    session_id: str = Form("default_index")
) -> dict:
    results = []
    total_chunks = 0
    if len(files) > MAX_FILE_COUNT:
        raise HTTPException(400, f"Maximum {MAX_FILE_COUNT} files allowed")

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
            chunks = process_file(path, ext, session_id=session_id)
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
