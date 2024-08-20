// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import * as faceapi from 'face-api.js';

const Login = () => {
  const navigate = useNavigate();
  const videoRef = useRef();
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error loading face-api models:', error);
        setLoading(false);
      }
    };

    loadModels();

    return () => {
      stopVideoStream();
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error('Error accessing webcam:', err));
  };

  const stopVideoStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  const handleFaceLogin = async () => {
    if (!cameraActive) {
      setCameraActive(true);
      startVideo();
      return;
    }

    try {
      const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        alert('No face detected. Please try again.');
        stopVideoStream();
        return;
      }

      const currentDescriptor = detections.descriptor.map(value => parseFloat(value.toFixed(5)));

      // Fetch all users and their descriptors from Firestore
      const querySnapshot = await getDocs(collection(db, 'users'));
      let matchedUser = null;
      let minDistance = Infinity;

      querySnapshot.forEach((doc) => {
        const userDoc = doc.data();
        const savedDescriptor = new Float32Array(userDoc.faceDescriptor);
        const distance = faceapi.euclideanDistance(savedDescriptor, currentDescriptor);

        console.log('Distance with User:', distance);

        if (distance < minDistance) {
          minDistance = distance;
          matchedUser = userDoc;
        }
      });

      if (matchedUser && minDistance < 0.6) { // Threshold for matching
        await signInWithEmailAndPassword(auth, matchedUser.email, matchedUser.email); // using email as password
        stopVideoStream();
        navigate('/success');
      } else {
        alert('No matching face found. Please try again.');
        stopVideoStream();
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
