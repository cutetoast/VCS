
FROM python:3.11.5 as backend

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && apt-get clean

WORKDIR /app
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir "uvicorn[standard]" 

COPY server/ .

#COPY server/yolo_model/best.pt /app/server/yolo_model/best.pt

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]