// src/pages/Success.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth'; // Import signOut from Firebase

const Success = () => {
  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Redirect to the home page or sign-in page after sign out
        window.location.href = '/';
      })
      .catch((error) => {
        // Handle errors here if needed
        console.error('Sign out error:', error);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white p-6">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-green-600 mb-6">
          Login Successful!
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Welcome back! You have successfully logged in.
        </p>
        <Link
          to="/dashboard" // Adjust this path to your actual dashboard or main app page
          className="py-3 px-6 rounded-full bg-green-500 text-white text-lg font-semibold shadow-lg hover:bg-green-600"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/"
          className="mt-4 py-2 px-4 rounded-full bg-indigo-500 text-white text-lg font-semibold shadow-lg hover:bg-indigo-600"
        >
          Return to Home
        </Link>
        <button
          onClick={handleSignOut}
          className="mt-6 py-2 px-4 rounded-full bg-red-500 text-white text-lg font-semibold shadow-lg hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Success;
