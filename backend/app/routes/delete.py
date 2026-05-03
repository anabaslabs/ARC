from app.rag.vectorstore import delete_vectorstore
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.delete("/delete/{session_id}")
async def delete_specific_chat(session_id: str) -> dict:
    if not delete_vectorstore(session_id):
        raise HTTPException(404, f"No vector store found for session: {session_id}")
    return {"message": f"Vector store for session {session_id} deleted."}
