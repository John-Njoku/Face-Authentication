// Importing necessary modules and components
import React from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import UserSelect from "./pages/UserSelect";
import Registration from "./pages/Registration";
import Success from "./pages/Success";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Ensure this is correctly imported
import ErrorBoundary from "./components/ErrorBoundary"; // Import the ErrorBoundary for catching errors

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route for the home page */}
          <Route path="/" element={<Home />} />

          {/* Route for the user selection page */}
          <Route path="/user-select" element={<UserSelect />} />

          {/* Route for the registration page */}
          <Route path="/registration" element={<Registration />} />

          {/* Route for the login page */}
          <Route path="/login" element={<Login />} />

          {/* Route for the dashboard page wrapped with ErrorBoundary */}
          <Route path="/dashboard" element={
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          } />

          {/* Route for the success page after login */}
          <Route path="/success" element={<Success />} />

          {/* Catch-all route for undefined paths (404 page) */}
          <Route path="*" element={<NotFound />} /> {/* 404 route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
