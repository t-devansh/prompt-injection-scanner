# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV MODE=api

WORKDIR /app

# (optional) curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# deps first (better caching)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# app code
COPY src /app/src
COPY pytest.ini /app/pytest.ini

# entrypoint (API/CLI switch)
COPY docker/entrypoint.sh /app/docker/entrypoint.sh
RUN chmod +x /app/docker/entrypoint.sh

EXPOSE 8000

# One entrypoint that chooses API or CLI based on MODE and forwards args for CLI
ENTRYPOINT ["/app/docker/entrypoint.sh"]
