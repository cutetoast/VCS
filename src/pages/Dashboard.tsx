import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import DetectionStats from '../components/DetectionStats';

const Dashboard = () => {
  const [roadName, setRoadName] = useState<string>('');
  const [videoStreamUrl, setVideoStreamUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionData, setDetectionData] = useState<any>(null);

  const auth = getAuth();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws'); // Replace with your backend WebSocket URL

    ws.onopen = () => {
      console.log('WebSocket connection established.');
    };

    ws.onmessage = (event) => {
      const updatedStats = JSON.parse(event.data);
      console.log('WebSocket message received:', updatedStats);
      setDetectionData(updatedStats);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'video/*': ['.mp4', '.avi', '.mov'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (isProcessing) return;
  
      setError(null);
      setSuccess(null);
  
      const trimmedRoadName = roadName.trim();
      if (!trimmedRoadName) {
        setError('Please enter a road name before uploading.');
        return;
      }
  
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('video', file);
  
      try {
        setIsProcessing(true);
  
        // Call the backend `/process-video/` endpoint
        const response = await axios.post('http://localhost:8000/process-video/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
  
        const { video_url, stats } = response.data; // Extract stats and video_url
        if (!video_url || !stats) throw new Error('Invalid response from server.');
  
        // Update frontend state with video URL and detection stats
        setVideoStreamUrl(`http://localhost:8000/stream-video?video_url=${encodeURIComponent(video_url)}`);
        setDetectionData(stats); // Update stats in the state for display
  
        // Save stats to Firestore
        const user = auth.currentUser;
        await addDoc(collection(db, 'detections'), {
          roadName: trimmedRoadName,
          userId: user?.uid || 'anonymous',
          timestamp: new Date().toISOString(),
          stats, // Save the detection stats
        });
  
        setSuccess('Video processed and detection results saved successfully.');
      } catch (err) {
        console.error('Error uploading video:', err?.message || err);
        setError('Failed to upload or process the video. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 npmgap-8 p-8">
      {/* Video Analysis Section */}
      <div className="col-span-2 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">Video Analysis</h2>
        <div className="mb-4">
          <label htmlFor="road-name" className="block text-sm font-medium text-gray-700">
            Road Name
          </label>
          <input
            id="road-name"
            type="text"
            value={roadName}
            onChange={(e) => setRoadName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter road name"
          />
        </div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors 
            ${!roadName.trim() || isProcessing ? 'opacity-50 pointer-events-none' : ''} 
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        >
          <input {...getInputProps()} disabled={!roadName.trim() || isProcessing} />
          {!videoStreamUrl ? (
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Drag & drop a video file here, or click to select</p>
              <p className="text-xs text-gray-500 mt-1">Supports MP4, AVI, MOV</p>
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

      {/* Vehicle Detection Results Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <DetectionStats data={detectionData} />
      </div>
    </div>
  );
};

export default Dashboard;