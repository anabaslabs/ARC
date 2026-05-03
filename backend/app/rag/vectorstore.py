import os
import time

from app.rag.embedder import embeddings
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
from app.config import PINECONE_API_KEY, PINECONE_INDEX_NAME
from pinecone import Pinecone


def get_vectorstore(session_id: str = "default_index") -> PineconeVectorStore:
    return PineconeVectorStore(
        index_name=PINECONE_INDEX_NAME,
        embedding=embeddings,
        pinecone_api_key=PINECONE_API_KEY,
        namespace=session_id,
    )


def add_documents(chunks: list[Document], session_id: str = "default_index") -> None:
    if not chunks:
        raise ValueError("No text could be extracted from the file.")

    store = get_vectorstore(session_id)
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        store.add_documents(batch)
        if i + batch_size < len(chunks):
            time.sleep(0.5)


def delete_vectorstore(session_id: str) -> bool:
    try:
        store = get_vectorstore(session_id)
        store.delete(delete_all=True)
        return True
    except Exception:
        return False


def delete_all_vectorstores() -> bool:
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        index.delete(delete_all=True)
        return True
    except Exception:
        return False
