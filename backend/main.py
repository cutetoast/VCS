from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
from ultralytics import YOLO
import tempfile
import os
import asyncio
import time

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
  #  allow_origins=["https://vcs-gray.vercel.app"],
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Globals
model = YOLO("backend/yolo_model/yolo2.pt")  # Load YOLO model
line_position = 400  # Position of the counting line
confidence_threshold = 0.5  # Minimum confidence for detections
class_names = ["Bus", "Car", "Motorcycle", "Truck", "Van"]  # Classes to detect
class_counters = {name: 0 for name in class_names}  # Vehicle counts for each class
tracked_vehicles = {}  # Tracks vehicles between frames
connected_websockets = set()  # Tracks active WebSocket clients


# Resets vehicle counters and clears tracked vehicles. 
# Called when a new video starts processing.
    
def reset_counters():
 
    global class_counters, tracked_vehicles
    class_counters = {name: 0 for name in class_names}
    tracked_vehicles = {}

# Finds the closest tracked vehicles to the given centerpoint. tracking mechanism.
# Ensures the same vehicle is not counted multiple times.
def get_closest_vehicles_id(centerpoint, max_distance=50):
    
    closest_id = None
    min_distance = float('inf')
    for obj_id, data in tracked_vehicles.items():
        existing_centerpoint = data["centerpoint"]
        distance = ((centerpoint[0] - existing_centerpoint[0]) ** 2 + (centerpoint[1] - existing_centerpoint[1]) ** 2) ** 0.5
        if distance < min_distance and distance <= max_distance:
            closest_id = obj_id
            min_distance = distance
    return closest_id


def process_frame(results, frame):
    """
    Processes the current video frame.
    Detects vehicles, updates counters, and tracks vehicles.
    """
    global class_counters, tracked_vehicles
    for result in results:
        if not hasattr(result, "boxes"):
            continue
        for box, score, cls in zip(result.boxes.xyxy, result.boxes.conf, result.boxes.cls):
            if score < confidence_threshold:
                continue
            class_label = class_names[int(cls)]
            x1, y1, x2, y2 = map(int, box)
            centerpoint = ((x1 + x2) // 2, (y1 + y2) // 2)

            # Track vehicles or create a new one
            vehicles_id = get_closest_vehicles_id(centerpoint)
            if vehicles_id is None:
                vehicles_id = f"{class_label}_{len(tracked_vehicles)}"
                tracked_vehicles[vehicles_id] = {"centerpoint": centerpoint, "counted": False}
            else:
                tracked_vehicles[vehicles_id]["centerpoint"] = centerpoint

            # Count vehicle if it crosses the line
            if not tracked_vehicles[vehicles_id]["counted"] and centerpoint[1] > line_position:
                class_counters[class_label] += 1
                tracked_vehicles[vehicles_id]["counted"] = True

            # Draw bounding box and label
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(frame, f"{class_label} {score:.2f}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)


#  Annotates the video frame with the counting line, vehicle counts, and heavy/light vehicle summaries.
def annotate_frame(frame, fps=None):
   
    # Draw the counting line
    cv2.line(frame, (0, line_position), (frame.shape[1], line_position), (0, 255, 0), 2)

    # Display individual vehicle counts
    for i, (name, count) in enumerate(class_counters.items()):
        cv2.putText(frame, f"{name}: {count}", (10, 30 + i * 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    # Calculate and display heavy and light vehicle counts
    heavy_vehicles = class_counters["Bus"] + class_counters["Truck"]
    light_vehicles = class_counters["Car"] + class_counters["Motorcycle"] + class_counters["Van"]
    cv2.putText(frame, f"Heavy Vehicles: {heavy_vehicles}", (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.putText(frame, f"Light Vehicles: {light_vehicles}", (10, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    # Display FPS
    if fps is not None:
        cv2.putText(frame, f"FPS: {int(fps)}", (frame.shape[1] - 100, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

#  Broadcasts the current vehicle counts, including heavy and light vehicles, to all connected WebSocket clients.
async def broadcast_counters():
   
    data = {
        "classCounters": class_counters,
        "heavyVehicles": class_counters["Bus"] + class_counters["Truck"],
        "lightVehicles": class_counters["Car"] + class_counters["Motorcycle"] + class_counters["Van"],
    }
    for ws in list(connected_websockets):
        try:
            await ws.send_json(data)
        except WebSocketDisconnect:
            connected_websockets.remove(ws)

# Handles WebSocket connections.
#Clients use this to receive real-time vehicle count updates.
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
   
    await websocket.accept()
    connected_websockets.add(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        connected_websockets.remove(websocket)

# Endpoint to handle video uploads.
# Saves the video temporarily and returns the file path.
@app.post("/uploadvideo/")
async def process_video(video: UploadFile = File(...)):
 
    if not video.filename.lower().endswith((".mp4", ".avi", ".mov")):
        raise HTTPException(400, "Invalid file format.")
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    temp_file.write(await video.read())
    temp_file.close()
    return {"video_url": temp_file.name}

#  Streams the processed video with real-time vehicle detection and annotations.
@app.get("/showvideo/")
async def stream_video(video_url: str):
 
    if not os.path.exists(video_url):
        raise HTTPException(404, "Video file not found.")
    cap = cv2.VideoCapture(video_url)
    if not cap.isOpened():
        raise HTTPException(500, "Cannot open video file.")

    async def generate_frames():
        reset_counters()  # Reset counters for a new video
        prev_time = time.time()
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            try:
                process_frame(model(frame), frame)  # Process the frame

                # Calculate FPS
                current_time = time.time()
                fps = 1 / (current_time - prev_time)
                prev_time = current_time

                annotate_frame(frame, fps=fps)  # Add annotations including FPS
                await broadcast_counters()  # Send updated counts
                _, jpeg = cv2.imencode(".jpg", frame)
                yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg.tobytes() + b"\r\n")
            except Exception as e:
                print(f"Error processing frame: {e}")
                break
        cap.release()

    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
