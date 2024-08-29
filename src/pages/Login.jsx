import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import * as faceapi from 'face-api.js';

const Login = () => {
  const navigate = useNavigate();  // For navigation after successful login
  const videoRef = useRef();  // Ref for video element to access the webcam feed
  const [loading, setLoading] = useState(false);  // State to handle loading status
  const [cameraActive, setCameraActive] = useState(false);  // State to check if the camera is active
  const streamRef = useRef(null);  // Ref to manage the video stream

  useEffect(() => {
    // Load face detection models when the component mounts
    const loadModels = async () => {
      setLoading(true);  // Set loading state to true while models are loading
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        setLoading(false);  // Set loading state to false once models are loaded
      } catch (error) {
        console.error('Error loading face-api models:', error);
        setLoading(false);
      }
    };

    loadModels();

    // Clean up: Stop video stream when the component unmounts
    return () => {
      stopVideoStream();
    };
  }, []);

  // Start video stream from the user's webcam
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;  // Attach the video stream to the video element
      })
      .catch((err) => console.error('Error accessing webcam:', err));
  };

  // Stop the video stream and reset the camera state
  const stopVideoStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());  // Stop all tracks in the video stream
      streamRef.current = null;
      setCameraActive(false);  // Deactivate the camera
    }
  };

  // Handle face login process
  const handleFaceLogin = async () => {
    if (!cameraActive) {
      setCameraActive(true);  // Activate the camera if it's not already active
      startVideo();
      return;
    }

    try {
      // Detect the face and extract face landmarks and descriptors
      const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        alert('No face detected. Please try again.');
        stopVideoStream();  // Stop video if no face is detected
        return;
      }

      const currentDescriptor = detections.descriptor.map(value => parseFloat(value.toFixed(5)));  // Normalize the descriptor

      // Fetch all users and their descriptors from Firestore
      const querySnapshot = await getDocs(collection(db, 'users'));
      let matchedUser = null;
      let minDistance = Infinity;

      // Compare the current face descriptor with stored descriptors
      querySnapshot.forEach((doc) => {
        const userDoc = doc.data();
        const savedDescriptor = new Float32Array(userDoc.faceDescriptor);
        const distance = faceapi.euclideanDistance(savedDescriptor, currentDescriptor);

        console.log('Distance with User:', distance);

        if (distance < minDistance) {
          minDistance = distance;
          matchedUser = userDoc;  // Store the closest match
        }
      });

      // If a match is found within the threshold, log in the user
      if (matchedUser && minDistance < 0.6) {  // Threshold for matching
        await signInWithEmailAndPassword(auth, matchedUser.email, matchedUser.email);  // Using email as password
        stopVideoStream();  // Stop video stream after successful login
        navigate('/success');  // Navigate to the success page
      } else {
        alert('No matching face found. Please try again.');
        stopVideoStream();  // Stop video stream if no match is found
      }
    } catch (error) {
      console.error('Error during face login:', error);
      alert('An error occurred during login. Please try again.');
      stopVideoStream();
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-6">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-6 text-center">
          Log In
        </h1>
        <div className="mt-6 flex flex-col items-center">
          <p className="text-gray-700">Sign in using your face:</p>
          {cameraActive && (
            <video ref={videoRef} autoPlay muted className="w-32 h-32 mt-4 rounded-full border-2 border-indigo-500"></video>
          )}
          <button
            onClick={handleFaceLogin}
            className="mt-4 py-3 px-6 rounded-full bg-indigo-500 text-white text-lg font-semibold shadow-lg hover:bg-indigo-600"
            disabled={loading}
          >
            {cameraActive ? 'Scan Your Face' : 'Activate Camera'}
          </button>
        </div>
        {/* Link to go back to user selection */}
        <div className="mt-6 flex justify-center">
          <Link
            to="/user-select"
            className="text-indigo-500 hover:underline"
          >
            Go back to User Selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;