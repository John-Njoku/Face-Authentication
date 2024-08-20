import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import * as faceapi from 'face-api.js';

const Registration = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(''); // State to track the user's full name
  const [email, setEmail] = useState(''); // State to track the user's email address
  const [faceDescriptor, setFaceDescriptor] = useState(null); // State to store the captured face descriptor
  const [loading, setLoading] = useState(false); // State to manage loading state during registration
  const [cameraActive, setCameraActive] = useState(false); // State to track if the camera is active
  const videoRef = useRef(); // Ref to the video element
  const streamRef = useRef(null); // Ref to the media stream

  useEffect(() => {
    // Function to load face-api.js models when the component mounts
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

    // Clean up function to stop video stream when the component unmounts
    return () => {
      stopVideoStream();
    };
  }, []);

  // Function to start the video stream
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error('Error accessing webcam:', err));
  };

  // Function to stop the video stream
  const stopVideoStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  // Function to capture the face descriptor using face-api.js
  const captureFaceDescriptor = async () => {
    if (!cameraActive) {
      setCameraActive(true);
      startVideo();
      return;
    }

    const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      alert('No face detected. Please try again.');
      stopVideoStream();
      return;
    }

    // Normalize the face descriptor and store it
    const normalizedDescriptor = detections.descriptor.map(value => parseFloat(value.toFixed(5)));
    setFaceDescriptor(Array.from(normalizedDescriptor)); // Convert Float32Array to regular array for Firestore
    alert('Face captured successfully!');
    stopVideoStream();
  };

  // Function to handle the registration process
  const handleRegistration = async (e) => {
    e.preventDefault();

    // Validate that all fields are filled
    if (!fullName.trim()) {
      alert('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      alert('Please enter your email address.');
      return;
    }

    if (!faceDescriptor) {
      alert('Please capture your face before registering.');
      return;
    }

    try {
      setLoading(true);

      // Create a new user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, email); // using email as a password placeholder
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName,
        email,
        faceDescriptor, // Store the face descriptor as an array
      });

      alert('Registration successful! Redirecting to login...');
      navigate('/login');
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Error during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-6">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-6 text-center">
          Register Your Account
        </h1>
        {/* Form to handle user input and registration */}
        <form className="flex flex-col gap-4" onSubmit={handleRegistration}>
          <label className="flex flex-col">
            <span className="text-gray-700 font-semibold mb-1">Full Name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 font-semibold mb-1">Email Address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </label>
          <div className="mt-4 flex flex-col items-center">
            <p className="text-gray-700">Capture your face for registration:</p>
            {cameraActive && (
              <video ref={videoRef} autoPlay muted className="w-32 h-32 mt-4 rounded-full border-2 border-indigo-500"></video>
            )}
            <button
              type="button"
              onClick={captureFaceDescriptor}
              className="mt-4 py-3 px-6 rounded-full bg-indigo-500 text-white text-lg font-semibold shadow-lg hover:bg-indigo-600"
              disabled={loading}
            >
              {cameraActive ? 'Capture Face' : 'Activate Camera'}
            </button>
          </div>
          <button
            type="submit"
            className="mt-4 py-3 px-6 rounded-full bg-green-500 text-white text-lg font-semibold shadow-lg hover:bg-green-600"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-6 flex justify-center">
          <Link
            to="/user-select"
            className="text-indigo-500 hover:underline"
          >
            Already have an account? Go back to login.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Registration;
