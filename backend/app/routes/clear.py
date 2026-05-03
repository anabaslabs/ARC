from app.rag.vectorstore import delete_all_vectorstores
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.delete("/clear")
async def clear_index() -> dict:
    if not delete_all_vectorstores():
        raise HTTPException(500, "Failed to clear the vector store.")
    return {"message": "All vector stores cleared."}
