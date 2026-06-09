import React from 'react';

export default function Loader({ message = 'Chargement...' }) {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}
