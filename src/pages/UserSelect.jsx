import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom to enable navigation between pages

const UserSelect = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-6">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        {/* Title of the page */}
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-6 text-center">
          User Selection
        </h1>
        
        <div className="flex flex-col items-center gap-6">
          {/* Button that navigates to the login page */}
          <Link to="/login">
            <button className="py-3 px-6 rounded-full bg-indigo-600 text-white text-lg font-semibold shadow-lg hover:bg-indigo-800">
              Scan Face to Log In
            </button>
          </Link>
          <p className="text-sm text-gray-600 mt-2">
            Use your face for quick and secure access.
          </p>
          
          {/* Button that navigates back to the home page */}
          <Link to="/" className="py-3 mt-20 px-6 rounded-full bg-green-600 text-white text-lg font-semibold shadow-lg hover:bg-green-800">
            Go to Home
          </Link>

          <p className="text-sm text-gray-600 mt-2">
            Don’t have an account?{" "}
            {/* Link to the registration page */}
            <Link
              to="/registration"
              className="text-indigo-600 hover:underline font-semibold"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSelect;
