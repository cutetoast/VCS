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

3. Start the application with Docker Compose:
   ```
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

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
2. Check the Docker logs for any error messages
3. Restart Docker if necessary
4. Try rebuilding the containers:
   ```
   docker-compose up --build
   ``` 