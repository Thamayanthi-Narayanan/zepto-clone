import React, { useState, useEffect } from 'react';
import './LoginModal.css';
import OtpVerification from './OtpVerification';
import EnterNameModal from './EnterNameModal';
import { BASE_API_URL } from "../../api/apiConfig"; // Import BASE_API_URL
// Placeholder imports for images - remember to add these assets
/* import zeptoLogo from '../../assets/zepto-logo.svg'; */ 
/* import googlePlay from '../../assets/google-play.svg'; */
/* import appStore from '../../assets/app-store.svg'; */
// Placeholder for the image above "Order faster & easier everytime"
/* import orderFasterImage from '../../assets/order-faster-image.svg'; */

export default function LoginModal({ isOpen, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState(''); // Store phone for auto-fill after name entry

  // Reset OTP screen state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowOtpScreen(false);
      setShowNameModal(false);
      // Check if we have a pending phone number (from name entry flow)
      // Don't remove it here - we need it for auto-fill after name entry
      const storedPhone = localStorage.getItem('pendingPhoneNumber');
      if (storedPhone) {
        setPhoneNumber(storedPhone);
        setPendingPhoneNumber(storedPhone);
      } else {
        setPhoneNumber('');
      }
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

  const handleContinue = async () => { // Made async to handle fetch
    if (phoneNumber.length === 10) {
      setError(''); // Clear previous errors
      const SEND_OTP_URL = BASE_API_URL + "/auth/sendOtp"; // Updated endpoint

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
          console.log("OTP sent successfully:", result.data.otp); // For testing, remove in prod
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
    // User is logged in - close modal and navigate to home
    onClose(); 
    // Trigger a page reload or state update to show Profile instead of Login
    window.dispatchEvent(new Event('userLoggedIn'));
  };

  const handleNewUser = () => {
    console.log("handleNewUser called - showing name modal");
    console.log("Current state - showOtpScreen:", showOtpScreen, "showNameModal:", showNameModal);
    console.log("Current phoneNumber:", phoneNumber);
    
    // Store phone number temporarily for auto-fill after name entry
    const phoneToStore = phoneNumber || localStorage.getItem('pendingPhoneNumber');
    setPendingPhoneNumber(phoneToStore);
    localStorage.setItem('pendingPhoneNumber', phoneToStore);
    
    // Update both states together
    setShowOtpScreen(false);
    setShowNameModal(true);
    
    console.log("State updated - showNameModal should be true now");
    
    // Force a re-render check
    setTimeout(() => {
      console.log("After state update - showNameModal should be:", true);
    }, 100);
  };

  const handleNameSubmitted = (name) => {
    // After name is submitted, go back to phone screen with auto-filled number
    setShowNameModal(false);
    // Use pendingPhoneNumber or the stored phone number from localStorage
    const phoneToUse = pendingPhoneNumber || phoneNumber || localStorage.getItem('pendingPhoneNumber');
    if (phoneToUse) {
      setPhoneNumber(phoneToUse);
      setPendingPhoneNumber(phoneToUse);
      // Ensure it's stored in localStorage for auto-fill
      localStorage.setItem('pendingPhoneNumber', phoneToUse);
      // User needs to click Continue button to send OTP again
      // Just return to phone input screen with auto-filled number
    }
  };

  const handleBackToPhoneInput = () => {
    setShowOtpScreen(false);
    // Don't clear phone number if we're returning from name entry
    if (!pendingPhoneNumber && !localStorage.getItem('pendingPhoneNumber')) {
      setPhoneNumber('');
    }
    setError('');
  };

  if (!isOpen) return null;

  // Debug: Log current state
  console.log("LoginModal render - showNameModal:", showNameModal, "showOtpScreen:", showOtpScreen, "isOpen:", isOpen);

  return (
    <>
      {showNameModal ? (
        <>
          {console.log("Rendering EnterNameModal")}
          <EnterNameModal
            phoneNumber={phoneNumber}
            onNameSubmitted={handleNameSubmitted}
            onClose={onClose}
          />
        </>
      ) : (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={onClose}>&times;</button>
            {showOtpScreen ? (
              <OtpVerification
                phoneNumber={phoneNumber}
                onVerified={handleOtpVerified}
                onBack={handleBackToPhoneInput}
                onNewUser={handleNewUser}
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
              <div className="modal-right-image-placeholder"></div> {/* Placeholder for image */}
              <h2 className="modal-right-title">Order faster & easier everytime</h2>
              <p className="modal-right-subtitle-app">with the Zepto App</p>
              <div className="app-download-buttons">
                {/* <img src={googlePlay} alt="Get it on Google Play" className="app-button" /> */}
                {/* <img src={appStore} alt="Download on the App Store" className="app-button" /> */}
              </div>
            </div>
          </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
