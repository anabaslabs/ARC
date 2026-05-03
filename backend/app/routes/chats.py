from fastapi import APIRouter, HTTPException
from pinecone import Pinecone
from app.config import PINECONE_API_KEY, PINECONE_INDEX_NAME
from datetime import datetime

router = APIRouter()

@router.get("/chats")
async def get_chats() -> dict:
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        stats = index.describe_index_stats()
        
        namespaces = stats.namespaces.keys()
        chats = []
        for ns in namespaces:
            if not ns.isdigit():
                continue
                
            timestamp = int(ns) / 1000.0
            dt = datetime.fromtimestamp(timestamp)
            
            chats.append({
                "id": ns,
                "title": f"Analysis {dt.strftime('%H:%M:%S')}",
                "date": dt.strftime('%Y-%m-%d')
            })
            
        chats.sort(key=lambda x: x["id"], reverse=True)
        return {"chats": chats}
    except Exception as e:
        print(f"Error fetching chats: {e}")
        raise HTTPException(500, "Failed to fetch chats from Pinecone.")
