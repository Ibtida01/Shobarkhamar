FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY shobarkhamar-complete-backend/requirements.txt .

RUN pip install --upgrade pip && \
    pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip install -r requirements.txt && \
    pip install gdown

RUN python -c "from torchvision.models import efficientnet_b4, EfficientNet_B4_Weights; efficientnet_b4(weights=EfficientNet_B4_Weights.DEFAULT)"

COPY shobarkhamar-complete-backend/ .

RUN python download_models.py

RUN mkdir -p /app/uploads /app/logs

EXPOSE 8000

# DEBUG — shows what's inside /app so we can fix the path
RUN echo "=== /app contents ===" && ls -la /app/ && echo "=== /app/app ===" && ls /app/app/ 2>/dev/null || echo "NO /app/app FOUND"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "7"]
