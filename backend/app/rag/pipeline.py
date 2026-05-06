from app.rag.chunker import chunk_docs
from app.rag.cleaner import clean_text, process_latex
from app.rag.loader import (
    read_pdf,
    read_csv,
    read_txt,
    read_md,
    read_json,
    read_tex,
    read_docx,
    read_xlsx,
    read_pptx,
)
from app.rag.vectorstore import add_documents
from langchain_core.documents import Document
from app.config import CHAT_MODEL, GOOGLE_API_KEY, SUMMARY_PROMPT
from langchain_google_genai import ChatGoogleGenerativeAI

LOADERS = {
    "pdf": read_pdf,
    "csv": read_csv,
    "txt": read_txt,
    "md": read_md,
    "json": read_json,
    "tex": read_tex,
    "docx": read_docx,
    "xlsx": read_xlsx,
    "pptx": read_pptx,
}

llm = ChatGoogleGenerativeAI(model=CHAT_MODEL, google_api_key=GOOGLE_API_KEY)

def _clean_docs(docs: list[Document]) -> list[Document]:
    for doc in docs:
        doc.page_content = clean_text(doc.page_content)
        doc.page_content = process_latex(doc.page_content)
    return docs

def _generate_summary(docs: list[Document]) -> str:
    full_text = "\n\n".join(doc.page_content for doc in docs[:10])
    try:
        response = llm.invoke(SUMMARY_PROMPT.format(content=full_text))
        return str(response.content)
    except Exception as e:
        print(f"Error generating summary: {e}")
        return ""

def process_file(path: str, ext: str, session_id: str = "default_index") -> int:
    loader = LOADERS.get(ext.lower())
    if loader is None:
        raise ValueError(f"Unsupported file type: .{ext}")

    docs = loader(path)
    docs = _clean_docs(docs)
    # summary_text = _generate_summary(docs)
    chunks = chunk_docs(docs)
    
    # if summary_text:
    #     src = docs[0].metadata.get("source", "unknown")
    #     summary_doc = Document(
    #         page_content=f"DOCUMENT SUMMARY of {src}: {summary_text}",
    #         metadata={"source": src, "is_summary": True}
    #     )
    #     chunks.insert(0, summary_doc)
        
    add_documents(chunks, session_id=session_id)
    return len(chunks)
