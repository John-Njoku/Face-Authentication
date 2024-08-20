// src/pages/Success.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Success = () => {
  const [userName, setUserName] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().fullName);
        }
      }
    };

    fetchUserName();
  }, [user]);

  const handleSignOut = () => {
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
        <h1 className="text-3xl md:text-5xl font-bold text-indigo-600 mb-6">
          Login Successful!
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Welcome back, {userName || 'User'}! You have successfully logged in.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            /*to="/dashboard"*/
            className="py-3 px-6 rounded-md bg-indigo-500 text-white text-lg font-semibold shadow-md hover:bg-green-600 transition duration-300"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={handleSignOut}
            className="py-3 px-6 rounded-md bg-yellow-500 text-white text-lg font-semibold shadow-md hover:bg-red-600 transition duration-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
