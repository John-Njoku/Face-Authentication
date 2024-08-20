import React from 'react';

// The NotFound component is a functional component that displays a 404 error message
const NotFound = () => {
  return (
    // The main container uses Flexbox to center the content both vertically and horizontally
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {/* Display the 404 error message with a bold, red style */}
      <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
    </div>
  );
};

export default NotFound;
