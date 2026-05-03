import time

from app.rag.embedder import embeddings
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
from app.config import PINECONE_API_KEY, PINECONE_INDEX_NAME, UPLOAD_BATCH_SIZE
from pinecone import Pinecone


_pinecone_index = None


def _get_index():
    global _pinecone_index
    if _pinecone_index is None:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        _pinecone_index = pc.Index(PINECONE_INDEX_NAME)
    return _pinecone_index


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
    for i in range(0, len(chunks), UPLOAD_BATCH_SIZE):
        batch = chunks[i : i + UPLOAD_BATCH_SIZE]
        store.add_documents(batch)
        if i + UPLOAD_BATCH_SIZE < len(chunks):
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
        index = _get_index()
        stats = index.describe_index_stats()
        namespaces = list(stats.namespaces.keys())
        failed: list[str] = []
        for ns in namespaces:
            try:
                index.delete(delete_all=True, namespace=ns)
            except Exception as e:
                print(f"Failed to delete namespace '{ns}': {e}")
                failed.append(ns)
        if failed:
            print(f"delete_all_vectorstores: {len(failed)}/{len(namespaces)} namespaces failed: {failed}")
            return False
        return True
    except Exception as e:
        print(f"delete_all_vectorstores: unexpected error: {e}")
        return False
