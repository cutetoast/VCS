import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, AlertCircle } from "lucide-react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import DetectionStats from "../components/DetectionStats";

const Dashboard = () => {
  const [roadName, setRoadName] = useState<string>("");
  const [videoStreamUrl, setVideoStreamUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionData, setDetectionData] = useState<any>(null);

  const auth = getAuth();

  useEffect(() => {
    const ws = new WebSocket("wss://vcs-backend-gjui.onrender.com/ws");

    ws.onopen = () => console.log("WebSocket connection established.");

    ws.onmessage = async (event) => {
      try {
        const updatedStats = JSON.parse(event.data);
        console.log("WebSocket message received:", updatedStats);
        setDetectionData(updatedStats);

        const user = auth.currentUser;
        const detectionsRef = doc(db, "detections", roadName);

        try {
          await updateDoc(detectionsRef, {
            userId: user?.uid || "anonymous",
            timestamp: new Date().toISOString(),
            stats: updatedStats.classCounters,
          });
        } catch (updateError) {
          if (updateError.code === "not-found") {
            await setDoc(detectionsRef, {
              roadName,
              userId: user?.uid || "anonymous",
              timestamp: new Date().toISOString(),
              stats: updatedStats.classCounters,
            });
          } else {
            console.error("Error updating Firestore document:", updateError);
          }
        }
      } catch (err) {
        console.error("Error parsing WebSocket message or saving stats:", err);
      }
    };

    ws.onclose = () => console.log("WebSocket connection closed.");
    ws.onerror = (wsError) => console.error("WebSocket error:", wsError);

    return () => ws.close();
  }, [roadName, auth]);

  const handleRoadNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRoadName(event.target.value);
      setError(null); // Clear error on change
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "video/*": [".mp4", ".avi", ".mov"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (isProcessing) return;

      setError(null);
      setSuccess(null);

      if (!roadName.trim()) {
        setError("Please enter a road name before uploading.");
        return;
      }

      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("video", file);

      try {
        setIsProcessing(true);

        const response = await axios.post(
          "http://vcs-backend-gjui.onrender.com/process-video/",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const { video_url } = response.data;
        if (!video_url) throw new Error("Invalid server response.");
        setVideoStreamUrl(
          `http://vcs-backend-gjui.onrender.com/stream-video?video_url=${encodeURIComponent(
            video_url
          )}`
        );

        const statsResponse = await axios.get(
          "http://vcs-backend-gjui.onrender.com/final-stats/"
        );
        setDetectionData(statsResponse.data.stats);

        setSuccess("Please wait for the video to process.");
      } catch (err) {
        console.error("Error processing video:", err);
        setError("Failed to upload or process the video. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    },
  });

  return (
    <div className="min-h-screen">
      <main className="max-w-7x1 mx-auto p-6 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Analysis Section */}

        <div>
        <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-4xl h-auto">
            <h2 className="text-xl font-semibold mb-4">Video Analysis</h2>
            <div className="mb-4">
              <label
                htmlFor="road-name"
                className="block text-sm font-medium text-gray-700"
              >
                Road Name
              </label>
              <input
                id="road-name"
                type="text"
                value={roadName}
                onChange={handleRoadNameChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm"
                placeholder="Enter road name"
                aria-label="Road name"
              />
            </div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors 
            ${
              !roadName.trim() || isProcessing
                ? "opacity-50 pointer-events-none"
                : ""
            } 
            ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            >
              <input
                {...getInputProps()}
                disabled={!roadName.trim() || isProcessing}
              />
              {!videoStreamUrl ? (
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Drag & drop a video file here, or click to select
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports MP4, AVI, MOV
                  </p>
                </div>
              ) : (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <img
                    src={videoStreamUrl}
                    alt="Processed video stream"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-md">
                {success}
              </div>
            )}
            {isProcessing && (
              <div className="mt-6 text-sm text-gray-700">
                <p>Processing video... Please wait.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detection Results Section */}
        <div className="space-y-6">
          <DetectionStats data={detectionData} />

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Detection Guide</h2>
            <div className="prose prose-sm text-gray-600">
              <p className="mb-4">
                This system uses advanced AI to detect and classify vehicles in
                real-time. Here's how to get started:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Enter the road name for the current detection session</li>
                <li>Choose between live camera or video upload mode</li>
                <li>For video analysis, upload any MP4, WebM, or Ogg file</li>
                <li>
                  Watch as vehicles are detected and counted automatically
                </li>
                <li>Use the pause button to freeze detection when needed</li>
                <li>Reset counts anytime to start fresh</li>
              </ol>
              <p className="mt-4 text-sm text-gray-500">
                The detection line appears in the middle of the frame. Vehicles
                are counted as they cross this line.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
