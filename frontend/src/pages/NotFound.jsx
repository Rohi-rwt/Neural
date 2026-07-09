// NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl font-bold text-gradient mb-4">404</div>
        <div className="text-xl font-bold mb-2">Page Not Found</div>
        <p className="text-secondary mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary mx-auto">← Back to Dashboard</Link>
      </div>
    </div>
  );
}

export default NotFound;
