# Dependencies layer

FROM python:3.11-buster as builder

RUN pip install poetry==1.4.2

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

COPY pyproject.toml poetry.lock ./

RUN poetry install --without dev --no-root && rm -rf $POETRY_CACHE_DIR

# Runtime layer

FROM python:3.11-slim-buster as runtime

RUN groupadd -g 999 python && useradd -r -u 999 -g python python
RUN mkdir /app && chown python:python /app

ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH" \
    TRANSFORMERS_CACHE=/app/.cache

WORKDIR /app

COPY --chown=python:python --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}
COPY --chown=python:python src src
COPY --chown=python:python envs envs

USER python

CMD ["python", "src/main.py"]
