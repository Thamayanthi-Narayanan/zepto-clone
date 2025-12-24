import React, { useState } from 'react';
import './EnterNameModal.css';

export default function EnterNameModal({ phoneNumber, onNameSubmitted, onClose }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value.trim().length === 0) {
      setError('Please enter your name');
    } else if (value.trim().length < 2) {
      setError('Name must be at least 2 characters');
    } else {
      setError('');
    }
  };

  const handleStartShopping = () => {
    if (name.trim().length < 2) {
      setError('Please enter a valid name (at least 2 characters)');
      return;
    }

    // Store name in localStorage
    localStorage.setItem('userName', name.trim());
    
    // Call the callback to proceed with the flow
    onNameSubmitted(name.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleStartShopping();
    }
  };

  return (
    <div className="enter-name-overlay">
      <div className="enter-name-modal">
        <button className="enter-name-close" onClick={onClose}>&times;</button>
        <div className="enter-name-content">
          <h2 className="enter-name-title">
            You're almost there! 👋
          </h2>
          <div className="enter-name-input-container">
            <input
              type="text"
              placeholder="Enter Your Name"
              value={name}
              onChange={handleNameChange}
              onKeyPress={handleKeyPress}
              className="enter-name-input"
              autoFocus
            />
            {error && <p className="enter-name-error">{error}</p>}
          </div>
          <button 
            className="enter-name-button" 
            onClick={handleStartShopping}
          >
            Start Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

