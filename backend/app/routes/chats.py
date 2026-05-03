import re
from datetime import datetime
from app.rag.vectorstore import _get_index
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/chats")
async def get_chats() -> dict:
    try:
        index = _get_index()
        stats = index.describe_index_stats()

        namespaces = list(stats.namespaces.keys())
        chats = []
        for ns in namespaces:
            if not re.fullmatch(r'\d+', ns):
                continue

            timestamp = int(ns) / 1000.0
            dt = datetime.fromtimestamp(timestamp)

            chats.append({
                "id": ns,
                "title": f"Analysis {dt.strftime('%H:%M:%S')}",
                "date": dt.strftime('%Y-%m-%d')
            })

        chats.sort(key=lambda x: int(x["id"]), reverse=True)
        return {"chats": chats}
    except Exception as e:
        print(f"Error fetching chats: {e}")
        raise HTTPException(500, "Failed to fetch chats from Pinecone.")
