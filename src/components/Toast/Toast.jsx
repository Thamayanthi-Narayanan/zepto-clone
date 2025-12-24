import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="toast-container">
      <div className="toast-content">
        <div className="toast-icon">✓</div>
        <div className="toast-message">{message}</div>
      </div>
    </div>
  );
}

