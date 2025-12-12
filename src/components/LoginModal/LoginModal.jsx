import React, { useState, useEffect } from 'react';
import './LoginModal.css';
import OtpVerification from './OtpVerification';
import { BASE_API_URL } from "../../api/apiConfig"; 

export default function LoginModal({ isOpen, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);

  // Reset OTP screen state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowOtpScreen(false);
      setPhoneNumber('');
      setError('');
    }
  }, [isOpen]);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Allow only digits and limit to 10 characters
    const filteredValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    setPhoneNumber(filteredValue);
    if (filteredValue.length !== 10) {
      setError('Please enter a 10-digit phone number.');
    } else {
      setError('');
    }
  };

  const handleContinue = async () => { 
    if (phoneNumber.length === 10) {
      setError(''); 
      const SEND_OTP_URL = BASE_API_URL + "/auth/sendOtp"; 

      try {
        const response = await fetch(SEND_OTP_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ phoneNumber: phoneNumber }),
          
        });

        if (!response.ok) {
          console.error("API response not OK:", response.status, response.statusText);
          let errorData = {};
          try {
            errorData = await response.json();
          } catch (jsonError) {
            setError(`Server error: ${response.status} ${response.statusText}. Please try again.`);
            return;
          }
          setError(errorData.message || "Failed to send OTP. Please try again.");
          return;
        }
        
        const result = await response.json();

        if (result.success) {
          console.log("OTP sent successfully:", result.data.otp); 
          setShowOtpScreen(true); // Transition to OTP screen
        } else {
          setError(result.message || "Failed to send OTP. Please try again.");
        }
      } catch (err) {
        console.error("Error sending OTP:", err);
        setError("Network error or server unavailable. Please try again.");
      }
    } else {
      setError('Please enter a valid 10-digit phone number.');
    }
  };

  const handleOtpVerified = () => {
    onClose(); // Close modal after OTP is verified
    // In a real application, you would redirect to the home page here
  };

  const handleBackToPhoneInput = () => {
    setShowOtpScreen(false);
    setPhoneNumber(''); // Clear phone number when going back
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        {showOtpScreen ? (
          <OtpVerification
            phoneNumber={phoneNumber}
            onVerified={handleOtpVerified}
            onBack={handleBackToPhoneInput}
          />
        ) : (
          <>
            <div className="modal-left">
              <h2 className="modal-left-logo-text">zepto</h2>
              <p className="modal-left-subtitle">Lowest Prices Everyday <br /> in 10 minutes<sup>*</sup></p>
              <div className="phone-input-container">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  placeholder="Enter Phone Number"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  maxLength="10"
                  className="phone-input"
                />
              </div>
              {error && <p className="phone-input-error">{error}</p>}
              <button className="continue-button" onClick={handleContinue}>Continue</button>
              <p className="privacy-policy-text">
                By continuing, you agree to our <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a>
              </p>
            </div>
            <div className="modal-right">
              <div className="modal-right-image-placeholder"></div>
              <h2 className="modal-right-title">Order faster & easier everytime</h2>
              <p className="modal-right-subtitle-app">with the Zepto App</p>
              <div className="app-download-buttons">
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
