import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingState = ({ 
  message = 'Memuat data...',
  spinnerColor = '#028643',
  className = 'py-5'
}) => {
  return (
    <div className={`text-center ${className}`}>
      <Spinner animation="border" role="status" style={{ color: spinnerColor }}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p className="mt-3 text-muted">{message}</p>
    </div>
  );
};

export default LoadingState;