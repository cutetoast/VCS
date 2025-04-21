# Vehicle Counting System

A vehicle detection and counting system that uses YOLO model to detect and count vehicles in videos.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

Follow these simple steps to get the application up and running:

1. Clone this repository or extract the files to a directory

2. Navigate to the project directory:
   ```
   cd your-project-directory
   ```

3. Ensure the YOLO model file is present:
   - The model file should be at `backend/yolo_model/yolo2.pt`
   - If running the application for the first time, make sure this file exists

4. Start the application with Docker Compose:
   ```
   docker-compose up
   ```
   
   For a clean rebuild (recommended for first run):
   ```
   docker-compose up --build
   ```

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Health Check: http://localhost:8000/health

## Dependency Management

This Docker setup is configured to use the exact dependencies specified in:
- `frontend/package-lock.json` for the frontend
- `backend/requirements.txt` for the backend

The Docker configuration ensures that:
- No dependency updates occur during the build process
- The exact versions are maintained, eliminating "works on my machine" issues
- The containerized environment is identical to the development environment

## Using the Application

1. Upload a video file containing traffic.
2. The application will process the video and count vehicles as they cross the counting line.
3. Vehicle counts will be displayed in real-time.

## Stopping the Application

To stop the application, press `Ctrl+C` in the terminal where docker-compose is running, or run:
```
docker-compose down
```

## Troubleshooting

If you encounter any issues:

1. Ensure Docker is running
2. Check the Docker logs for any error messages:
   ```
   docker-compose logs
   ```
3. Network issues: The application may need internet access for the first run. If you're behind a proxy or firewall, configure Docker's network settings accordingly.
4. Try rebuilding the containers with no cache:
   ```
   docker-compose build --no-cache
   docker-compose up
   ```
5. If the backend fails to start, check if the YOLO model file exists:
   ```
   ls -la backend/yolo_model/
   ```
   The file `yolo2.pt` should be present in this directory.
6. If the frontend seems to be running but you can't access it, check if the port 5173 is already in use on your system.

### WebSocket Connection Issues

If you see WebSocket connection errors:

1. Check that both services are running:
   ```
   docker-compose ps
   ```

2. Verify the backend health check:
   ```
   curl http://localhost:8000/health
   ```

3. Restart the containers:
   ```
   docker-compose restart
   ```

4. Check browser console for specific WebSocket errors

5. If problems persist, try running with host networking:
   ```
   docker-compose down
   docker-compose -f docker-compose.yml -f docker-compose.host-network.yml up
   ```

## Known Issues and Solutions

- Missing YOLO Model: If you get an error about a missing model file, ensure the `yolo2.pt` file is located at `backend/yolo_model/yolo2.pt`.
- DNS Resolution: If the backend can't connect to the internet, the environment variable `ULTRALYTICS_SKIP_CHECK=1` is set to avoid network checks.
- Node.js memory issues: If the frontend build fails with memory errors, try increasing Docker's memory allocation in Docker Desktop settings.
- WebSocket connections: If you're having WebSocket connection issues, make sure no firewalls or proxies are blocking WebSocket traffic on port 8000. 