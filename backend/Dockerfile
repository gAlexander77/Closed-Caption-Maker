FROM python:3.10.5

WORKDIR /app

RUN apt-get update && apt-get install -y imagemagick ffmpeg

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

ENV NAME World

CMD ["python", "./src/main.py"]
