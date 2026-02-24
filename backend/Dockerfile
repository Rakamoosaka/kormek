FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir \
    "fastapi[standard]>=0.131.0" \
    "psycopg2-binary>=2.9.11" \
    "pydantic-settings>=2.13.1" \
    "python-dotenv>=1.2.1" \
    "sqlmodel>=0.0.37" \
    "uvicorn>=0.41.0"

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]