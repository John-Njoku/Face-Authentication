import React, { useEffect } from 'react';
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const FinishSignIn = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }

      signInWithEmailLink(auth, email, window.location.href)
        .then((result) => {
          window.localStorage.removeItem('emailForSignIn');
          navigate('/success');  // Redirect to Success page after sign-in
        })
        .catch((error) => {
          console.error('Error during email link sign-in:', error);
          alert('Error signing in. Please try again.');
        });
    }
  }, [auth, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-6">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-indigo-600 mb-6">
          Completing Sign-In...
        </h1>
        <p className="text-lg text-gray-700">
          Please wait while we complete your sign-in process.
        </p>
      </div>
    </div>
  );
};

export default FinishSignIn;
