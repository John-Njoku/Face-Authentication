import React from 'react';
import { Link } from 'react-router-dom';

const CheckEmail = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-6">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-6">
          Check Your Email
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          We have sent a sign-in link to your email. Please check your inbox and follow the link to complete the sign-in process.
        </p>
        <div className="mt-6">
          <Link
            to="/user-select"
            className="py-3 px-6 rounded-full bg-indigo-500 text-white text-lg font-semibold shadow-lg hover:bg-indigo-600"
          >
            Go Back to User Selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;
