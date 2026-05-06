import os
import json
from dotenv import load_dotenv

load_dotenv()


ENV = os.getenv("ENV", "development")
CORS_ORIGINS_STR = os.getenv("CORS_ORIGINS", '["*"]')
CORS_ORIGINS = json.loads(CORS_ORIGINS_STR)

APP_NAME = "ARC API"
APP_VERSION = "2.0.0"

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

EMBED_MODEL = "models/gemini-embedding-001"
CHAT_MODEL = "gemini-2.5-flash-lite"

TOP_K = 10
CHUNK_SIZE = 800
CHUNK_OVERLAP = 100
UPLOAD_BATCH_SIZE = 100

MAX_FILE_COUNT = 6
MAX_FILE_SIZE = 5 * 1024 * 1024

UPLOAD_DIR = "data/uploads"

ALLOWED_TYPES = {
    "pdf",
    "csv",
    "txt",
    "md",
    "json",
    "tex",
    "docx",
    "xlsx",
    "pptx",
}

PROMPT = (
    "You are ARC, a helpful document assistant. "
    "Your goal is to provide accurate and helpful answers based on the context provided. "
    "If the user asks for a summary, synthesize the context into a clear, structured overview. "
    "If the context contains math or LaTeX, preserve them using $ for inline and $$ for display math. "
    "If you cannot find the answer in the context, say so honestly, but try to be as helpful as possible with the information you have. "
    "Context: {context} Question: {question}"
)

SUMMARY_PROMPT = (
    "Provide a concise yet comprehensive summary of the following document content. "
    "Focus on the main topics, key points, and overall purpose of the document. "
    "This summary will be used to help a chatbot understand the document at a high level. "
    "Content: {content}"
)

CREATORS = [
    {"Krishnendu Das" : "https://itskdhere.com"},
    {"Saptarshi Roy" : "https://hirishi.in"}
]