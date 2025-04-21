FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies exactly as specified in requirements.txt
RUN pip install --no-cache-dir --disable-pip-version-check -r requirements.txt

# Set environment variables to avoid network checks
ENV ULTRALYTICS_SKIP_CHECK=1
ENV PYTHONUNBUFFERED=1

# Copy application code and model
COPY . .

# Ensure model directory exists
RUN mkdir -p yolo_model

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 8000

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"] 