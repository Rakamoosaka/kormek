FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir --upgrade pip
COPY pyproject.toml ./pyproject.toml
RUN python -c "import tomllib,subprocess,pathlib; p=pathlib.Path('pyproject.toml'); deps=tomllib.loads(p.read_text(encoding='utf-8'))['project']['dependencies']; subprocess.check_call(['pip','install','--no-cache-dir',*deps])"

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]