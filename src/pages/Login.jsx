import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import * as faceapi from 'face-api.js';

const Login = () => {
  const navigate = useNavigate();
  const videoRef = useRef();
  const streamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [buttonText, setButtonText] = useState('Scan Your Face');
  const [cameraActive, setCameraActive] = useState(false);

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
        setCameraActive(true);
      })
      .catch((err) => {
        console.error('Error accessing webcam:', err);
        alert('Error accessing webcam. Please ensure your camera is connected and permissions are granted.');
      });
  };

  const stopVideoStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  const handleFaceLogin = async () => {
    setButtonText('Detecting Face...');
    setLoading(true);

    try {
      const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        alert('No face detected. Please try again.');
        stopVideoStream();
        setButtonText('Scan Your Face');
        setLoading(false);
        return;
      }

      const currentDescriptor = detections.descriptor;

      // Fetch all users and their descriptors from Firestore
      const querySnapshot = await getDocs(collection(db, 'users'));
      let matchedUser = null;
      let minDistance = Infinity;

      querySnapshot.forEach((doc) => {
        const userDoc = doc.data();
        if (userDoc.faceDescriptor) {
          const savedDescriptor = new Float32Array(userDoc.faceDescriptor);
          const distance = faceapi.euclideanDistance(savedDescriptor, currentDescriptor);

          if (distance < minDistance) {
            minDistance = distance;
            matchedUser = userDoc;
          }
        }
      });

      if (matchedUser && minDistance < 0.6) {
        setButtonText('Scan Finished');
        stopVideoStream();

        const actionCodeSettings = {
          url: 'https://face-authentication-2428e.web.app/finish-sign-in', // Replace with your actual production URL
          handleCodeInApp: true,
        };

        window.localStorage.setItem('emailForSignIn', matchedUser.email);

        await sendSignInLinkToEmail(auth, matchedUser.email, actionCodeSettings);
        alert(`A sign-in link has been sent to ${matchedUser.email}. Please check your email to complete the sign-in process.`);
        navigate('/check-email');
      } else {
        alert('No matching face found. Please try again.');
        stopVideoStream();
        setButtonText('Scan Your Face');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error during face login:', error);
      alert('An error occurred during login. Please try again.');
      stopVideoStream();
      setButtonText('Scan Your Face');
      setLoading(false);
    }
  };

  const handleScanClick = () => {
    if (!cameraActive) {
      startVideo();
    } else {
      handleFaceLogin();
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
          <video ref={videoRef} autoPlay muted className="w-32 h-32 mt-4 rounded-full border-2 border-indigo-500"></video>
          <button
            onClick={handleScanClick}
            className={`mt-4 py-3 px-6 rounded-full text-white text-lg font-semibold shadow-lg ${loading ? 'bg-gray-400' : 'bg-indigo-500'}`}
            disabled={loading}
          >
            {buttonText}
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
