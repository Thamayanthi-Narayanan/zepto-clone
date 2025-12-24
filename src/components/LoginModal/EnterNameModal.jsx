import React, { useState } from 'react';
import './EnterNameModal.css';
import { BASE_API_URL } from "../../api/apiConfig";

export default function EnterNameModal({ phoneNumber, onNameSubmitted, onClose }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleStartShopping = async () => {
    if (name.trim().length < 2) {
      setError('Please enter a valid name (at least 2 characters)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get phone number and token from localStorage
      const phoneToUse = phoneNumber || localStorage.getItem('pendingPhoneNumber');
      const authToken = localStorage.getItem('pendingAuthToken');

      if (!phoneToUse) {
        setError('Phone number not found. Please try again.');
        setLoading(false);
        return;
      }

      if (!authToken) {
        setError('Authentication token not found. Please try logging in again.');
        setLoading(false);
        return;
      }

      // Call user creation API
      const CREATE_USER_URL = BASE_API_URL + "/api/user/create";

      const response = await fetch(CREATE_USER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          phoneNumber: phoneToUse,
          name: name.trim()
        }),
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
          console.error("User creation API error:", errorData);
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
          setError(`Server error: ${response.status} ${response.statusText}. Please try again.`);
          setLoading(false);
          return;
        }
        setError(errorData.message || `Failed to create user (${response.status}). Please try again.`);
        setLoading(false);
        return;
      }

      let result;
      try {
        result = await response.json();
        console.log("User creation API response:", result);
      } catch (jsonError) {
        console.error("Failed to parse response as JSON:", jsonError);
        setError("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      if (result.success && result.data) {
        // Store user name and credentials temporarily
        localStorage.setItem('userName', name.trim());
        localStorage.setItem('userId', result.data.userId?.toString() || '');
        
        // Store the new token temporarily for second OTP verification
        localStorage.setItem('pendingAuthToken', result.data.token);
        
        // Keep phone number in localStorage for auto-fill
        localStorage.setItem('pendingPhoneNumber', phoneToUse);
        
        // Clear the old pendingAuthToken (from first OTP)
        // The new token from user creation will be used after second OTP

        console.log("User created successfully:", result.data);
        console.log("Returning to phone input screen for second OTP verification");
        
        // Reset loading state before calling callback
        setLoading(false);
        
        // Return to phone input screen with auto-filled number
        // User will need to click Continue to send OTP again
        onNameSubmitted(name.trim());
      } else {
        console.error("User creation failed:", result);
        setError(result.message || "Failed to create user. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError("Network error or server unavailable. Please try again.");
      setLoading(false);
    }
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
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Start Shopping'}
          </button>
        </div>
      </div>
    </div>
  );
}

