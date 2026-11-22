import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', message = '' }) => {
  return (
    <div className={`proxask-spinner-container proxask-spinner-container--${size}`}>
      <div className={`proxask-spinner proxask-spinner--${size}`} role="status">
        <span className="sr-only">Loading...</span>
      </div>
      {message && <p className="proxask-spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
