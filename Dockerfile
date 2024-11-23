FROM node:20-slim as frontend

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM python:3.10-slim as backend

WORKDIR /app
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server/ .
COPY --from=frontend /app/dist /app/static

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]