import os
import time
import shutil

from app.rag.embedder import embeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

PATH = "data/vectorstores/default_index"


def get_vectorstore() -> FAISS | None:
    if os.path.exists(PATH):
        try:
            return FAISS.load_local(PATH, embeddings, allow_dangerous_deserialization=True)
        except Exception:
            return None
    return None


def add_documents(chunks: list[Document]) -> None:
    if not chunks:
        raise ValueError("No text could be extracted from the file.")

    store = get_vectorstore()

    batch_size = 50
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        
        if store:
            store.add_documents(batch)
        else:
            store = FAISS.from_documents(batch, embeddings)

        if i + batch_size < len(chunks):
            time.sleep(1)

    os.makedirs(os.path.dirname(PATH), exist_ok=True)
    store.save_local(PATH)


def delete_vectorstore() -> bool:
    if os.path.exists(PATH):
        shutil.rmtree(PATH)
        return True
    return False


# Antigravity -> Claude Sonnet 4.6 (Thinking)
