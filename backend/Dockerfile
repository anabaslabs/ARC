FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates \
  libmagic-dev \
  libgl1 \
  libglib2.0-0 \
  libxml2 \
  libxslt1-dev \
  poppler-utils \
  tesseract-ocr \
  && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV ENV=production \
  PORT=7860 \
  PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  NLTK_DATA=/home/user/nltk_data

RUN useradd -m -u 1000 user
WORKDIR /home/user/app

COPY requirements.txt .
RUN uv pip install --no-cache --system -r requirements.txt
RUN python -m nltk.downloader -d /home/user/nltk_data punkt averaged_perceptron_tagger punkt_tab averaged_perceptron_tagger_eng

RUN chown -R user:user /home/user/app

USER user
ENV HOME=/home/user \
  PATH=/home/user/.local/bin:$PATH

COPY --chown=user app app

EXPOSE ${PORT}

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
