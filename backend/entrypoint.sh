#!/bin/bash
set -e

# Check if the model file exists
if [ ! -f "yolo_model/yolo2.pt" ]; then
  echo "WARNING: YOLO model file not found at yolo_model/yolo2.pt"
  echo "Please make sure the model file exists in the backend/yolo_model directory"
  
  # Create the directory if it doesn't exist
  mkdir -p yolo_model
  
  # Check if there's a model file in the old directory path
  if [ -f "backend/yolo_model/yolo2.pt" ]; then
    echo "Found model at backend/yolo_model/yolo2.pt, copying to correct location..."
    cp backend/yolo_model/yolo2.pt yolo_model/yolo2.pt
  fi
fi

# Run the application
exec uvicorn main:app --host 0.0.0.0 --port 8000 