# Dependencies layer

FROM python:3.10 as build

RUN apt-get update
RUN apt-get install -y --no-install-recommends build-essential gcc
RUN python -m venv /usr/app/venv
ENV PATH="/usr/app/venv/bin:$PATH"

COPY requirements.txt ./
RUN pip install -r requirements.txt

# Runtime layer

FROM python:3.10

RUN groupadd -g 999 python && useradd -r -u 999 -g python python

RUN mkdir /app && chown python:python /app
WORKDIR /app

COPY --chown=python:python --from=build /usr/app/venv ./venv
COPY --chown=python:python . .

USER python

ENV PATH="/app/venv/bin:$PATH"
CMD ["python", "main.py"]
