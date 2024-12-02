from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
from ultralytics import YOLO
import tempfile
import os
from typing import Dict
import asyncio

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
model = YOLO("server/yolo_model/best.pt")

# Constants and global variables
line_position = 400  # Line for counting
confidence_threshold = 0.5
class_names = ["Bus", "Car", "Motorcycle", "Truck", "Van"]
class_counters = {class_name: 0 for class_name in class_names}
tracked_objects = {}
connected_websockets = set()

def reset_counters():
    """Reset all counters and tracked objects."""
    global class_counters, tracked_objects
    class_counters = {class_name: 0 for class_name in class_names}
    tracked_objects = {}


def get_closest_object_id(new_centroid, existing_objects, max_distance=50):
    """Find the closest existing object to the new centroid."""
    closest_id = None
    min_distance = float('inf')
    for object_id, data in existing_objects.items():
        existing_centroid = data['centroid']
        distance = ((new_centroid[0] - existing_centroid[0]) ** 2 +
                    (new_centroid[1] - existing_centroid[1]) ** 2) ** 0.5
        if distance < min_distance and distance <= max_distance:
            min_distance = distance
            closest_id = object_id
    return closest_id


async def broadcast_class_counters():
    """Send the latest class counters to all connected WebSocket clients."""
    global connected_websockets, class_counters
    data = {
        "classCounters": class_counters,
        "heavyVehicles": class_counters["Bus"] + class_counters["Truck"],
        "lightVehicles": class_counters["Car"] + class_counters["Motorcycle"] + class_counters["Van"]
    }
    print("Broadcasting counters:", data)  # Debug log
    for ws in list(connected_websockets):
        try:
            await ws.send_json(data)
        except WebSocketDisconnect:
            connected_websockets.remove(ws)


def process_detections(results, frame_width, frame):
    """Process detections and update tracked objects."""
    global class_counters
    updated = False
    for result in results:
        if not hasattr(result, "boxes"):
            continue

        boxes = result.boxes.xyxy
        scores = result.boxes.conf
        classes = result.boxes.cls

        for box, score, cls in zip(boxes, scores, classes):
            if score < confidence_threshold:
                continue

            class_id = int(cls)
            class_label = class_names[class_id]
            x1, y1, x2, y2 = map(int, box)
            centroid = ((x1 + x2) // 2, (y1 + y2) // 2)

            # Match the centroid to an existing object or create a new one
            object_id = get_closest_object_id(centroid, tracked_objects)
            if object_id is None:
                object_id = f"{class_label}_{len(tracked_objects)}"
                tracked_objects[object_id] = {'centroid': centroid, 'counted': False}
            else:
                tracked_objects[object_id]['centroid'] = centroid

            # Check if the object crosses the line
            if not tracked_objects[object_id]['counted'] and centroid[1] > line_position:
                class_counters[class_label] += 1
                tracked_objects[object_id]['counted'] = True
                updated = True

            # Draw bounding box and label
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(frame, f'{class_label}: {score:.2f}', (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    return frame, updated


def draw_line_and_counts(frame, frame_width):
    """Draw the counting line and display counts on the frame."""
    cv2.line(frame, (0, line_position), (frame_width, line_position), (0, 255, 0), 2)

    for idx, (class_name, count) in enumerate(class_counters.items()):
        cv2.putText(frame, f'{class_name} Count: {count}', (10, 30 + idx * 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    heavy_vehicle_count = class_counters['Bus'] + class_counters['Truck']
    light_vehicle_count = (class_counters['Car'] +
                           class_counters['Motorcycle'] +
                           class_counters['Van'])

    cv2.putText(frame, f'Heavy: {heavy_vehicle_count}', (frame_width - 200, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    cv2.putText(frame, f'Light: {light_vehicle_count}', (frame_width - 200, 60),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)


# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     connected_websockets.add(websocket)
#     try:
#         while True:
#             await asyncio.sleep(1)  
#     except WebSocketDisconnect:
#         connected_websockets.remove(websocket)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_websockets.add(websocket)
    try:
        while True:
            # Keep the connection alive
            data = await websocket.receive_text()
            # Optional: handle incoming messages
            await websocket.send_json({
                "status": "connected",
                "message": "WebSocket is active"
            })
    except WebSocketDisconnect:
        print("WebSocket disconnected")
        connected_websockets.remove(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        connected_websockets.remove(websocket)


@app.post("/process-video/")
async def process_video(video: UploadFile = File(...)):
    global latest_video_path
    reset_counters()  # Reset counters for each new video

    if not video.filename.lower().endswith((".mp4", ".avi", ".mov")):
        raise HTTPException(400, "Invalid file format. Please upload MP4, AVI, or MOV files.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        temp_video.write(await video.read())
        latest_video_path = temp_video.name

    return {"video_url": latest_video_path}

@app.get("/final-stats/")
async def get_final_stats():
    """Return the final vehicle counts for each class."""
    global class_counters
    final_counts = {
        "classCounters": class_counters,
        "heavyVehicles": class_counters["Bus"] + class_counters["Truck"],
        "lightVehicles": class_counters["Car"] + class_counters["Motorcycle"] + class_counters["Van"]
    }
    return {"stats": final_counts}


@app.get("/stream-video/")
async def stream_video(video_url: str):
    if not os.path.exists(video_url):
        raise HTTPException(400, "Video file not found.")

    cap = cv2.VideoCapture(video_url)
    if not cap.isOpened():
        raise HTTPException(500, "Failed to open video file.")

    async def generate_frames():
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_height, frame_width, _ = frame.shape

            # YOLO Detection
            results = model(frame)

            # Process detections
            frame, updated = process_detections(results, frame_width, frame)

            # Broadcast updates if counters were updated
            if updated:
                await broadcast_class_counters()

            # Draw line and display counts
            draw_line_and_counts(frame, frame_width)

            # Encode the frame as JPEG
            _, jpeg = cv2.imencode(".jpg", frame)
            yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg.tobytes() + b"\r\n")

        cap.release()

    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)