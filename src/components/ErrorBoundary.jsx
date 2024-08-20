import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // Initialize the state to track whether an error has been caught
    this.state = { hasError: false };
  }

  // Update the state when an error is caught, triggering a re-render
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Log error details to the console or an external service
  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  // Render the fallback UI if an error has been caught, otherwise render children
  render() {
    if (this.state.hasError) {
      // Fallback UI shown when an error is detected
      return <h1>Something went wrong.</h1>;
    }

    // If no error, render the child components as usual
    return this.props.children; 
  }
}

export default ErrorBoundary;
