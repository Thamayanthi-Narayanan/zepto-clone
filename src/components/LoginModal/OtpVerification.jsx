import React, { useState, useEffect, useRef } from 'react';
import './OtpVerification.css';
import { BASE_API_URL } from "../../api/apiConfig"; 

export default function OtpVerification({ phoneNumber, onVerified, onBack, onNewUser }) {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timer, setTimer] = useState(30);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const otpInputRefs = useRef([]);
  const [error, setError] = useState(''); // New state for OTP verification errors

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(countdown);
          setResendEnabled(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  useEffect(() => {
    if (otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, []); 

  const handleOtpChange = async (element, index) => { 
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    setError(''); 

    if (element.nextSibling && element.value !== '' && index < otp.length - 1) {
      otpInputRefs.current[index + 1].focus(); // Use ref for next input
    }

    // If all OTPs are entered, call API to verify
    if (newOtp.every(digit => digit !== '')) {
      const enteredOtp = newOtp.join('');
      const VERIFY_OTP_URL = BASE_API_URL + "/auth/verifyOtp";

      try {
        const response = await fetch(VERIFY_OTP_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true", // Bypass ngrok warning
          },
          body: JSON.stringify({ phoneNumber: phoneNumber, otp: enteredOtp }),
        });

        if (!response.ok) {
          console.error("Verify OTP API response not OK:", response.status, response.statusText);
          let errorData = {};
          try {
            errorData = await response.json();
          } catch (jsonError) {
            console.error("Failed to parse verify OTP error response as JSON:", jsonError);
            setError(`Verification failed: ${response.status} ${response.statusText}.`);
            return;
          }
          setError(errorData.message || "OTP verification failed. Please try again.");
          return;
        }

        const result = await response.json();

        if (result.success) {
          // Check if user is new BEFORE storing anything
          // Priority: 1) API returns isNewUser flag, 2) Check if this phone number has a registered user
          const existingUserName = localStorage.getItem('userName');
          const storedPhoneNumber = localStorage.getItem('userPhoneNumber');
          let isNewUser = false;
          
          if (result.data?.isNewUser !== undefined) {
            // API explicitly returns isNewUser flag - trust the API
            isNewUser = result.data.isNewUser === true;
            console.log("API returned isNewUser:", result.data.isNewUser);
          } else {
            // API doesn't return isNewUser, check if this phone number is registered
            const pendingPhone = localStorage.getItem('pendingPhoneNumber');
            const phoneMatches = storedPhoneNumber === phoneNumber;
            const isPendingPhone = pendingPhone === phoneNumber;
            
            // A user is "new" if:
            // 1. No userName exists (first time registration), OR
            // 2. The stored phone number doesn't match current phone number (different user)
            // BUT: If userName exists and this is the pending phone (second OTP after name entry),
            //      then this is completing registration, so NOT a new user
            if (existingUserName && isPendingPhone) {
              // This is the second OTP verification after name entry - completing registration
              isNewUser = false;
              console.log("Second OTP verification after name entry - completing registration");
            } else {
              // First time registration or different phone number
              isNewUser = !existingUserName || !phoneMatches;
            }
            
            console.log("API didn't return isNewUser, checking localStorage:");
            console.log("  - userName exists:", !!existingUserName);
            console.log("  - storedPhoneNumber:", storedPhoneNumber);
            console.log("  - pendingPhoneNumber:", pendingPhone);
            console.log("  - current phoneNumber:", phoneNumber);
            console.log("  - phoneMatches:", phoneMatches);
            console.log("  - isPendingPhone:", isPendingPhone);
            console.log("  - isNewUser:", isNewUser);
            
            // Helpful message for testing
            if (existingUserName && phoneMatches) {
              console.log("✓ Existing user detected (same phone number with userName)");
            } else if (existingUserName && !phoneMatches && !isPendingPhone) {
              console.log("⚠️ Different phone number detected - treating as new user");
            }
          }
          
          // For new users, don't store authToken yet - wait until name is entered
          // Store phone number temporarily
          if (!isNewUser) {
            // Existing user - store credentials immediately
            localStorage.setItem('userPhoneNumber', phoneNumber);
            const userToken = result.data?.token || 'mock_jwt_token_for_user';
            localStorage.setItem('authToken', userToken);
            console.log("Existing user - stored credentials");
          } else {
            // New user - store phone temporarily but not authToken yet
            // We'll store authToken after name entry and second OTP verification
            localStorage.setItem('pendingPhoneNumber', phoneNumber);
            // Clear any existing authToken for new user flow
            localStorage.removeItem('authToken');
            console.log("New user - stored pendingPhoneNumber, cleared authToken");
          }
          
          setShowSuccessMessage(true); // Show success message
          console.log("OTP verified successfully!"); 
          console.log("Final decision - isNewUser:", isNewUser, "onNewUser callback exists:", !!onNewUser);
          console.log("Current localStorage - userName:", localStorage.getItem('userName'), "authToken:", localStorage.getItem('authToken'));
          
          setTimeout(() => {
            console.log("Timeout callback executing - isNewUser:", isNewUser);
            if (isNewUser) {
              if (onNewUser) {
                console.log("Calling onNewUser callback - showing name modal");
                try {
                  // New user - show name entry modal
                  onNewUser();
                  console.log("onNewUser callback executed successfully");
                } catch (error) {
                  console.error("Error calling onNewUser:", error);
                  onVerified(); // Fallback
                }
              } else {
                console.error("onNewUser callback is not provided!");
                // Fallback: proceed to home if callback not available
                onVerified();
              }
            } else {
              console.log("Existing user - calling onVerified callback");
              // Existing user - proceed to home
              onVerified(); 
            }
          }, 1500); 
        } else {
          setError(result.message || "Invalid OTP. Please try again.");
        }
      } catch (err) {
        console.error("Error verifying OTP:", err);
        setError("Network error or server unavailable during OTP verification.");
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleResendOtp = () => {
    setTimer(30); 
    setResendEnabled(false);
    setOtp(new Array(6).fill(''));
    alert('New OTP sent!');
    // Restart timer
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(countdown);
          setResendEnabled(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const formatTimer = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="modal-left otp-screen">
        <button className="back-button" onClick={onBack}>&larr;</button>
        <h2 className="otp-title">OTP Verification</h2>
        <p className="otp-subtitle">OTP has been sent to +91 {phoneNumber}</p>
        <div className="otp-inputs">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={data}
              onChange={(e) => handleOtpChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (otpInputRefs.current[index] = el)}
              className="otp-input"
            />
          ))}
        </div>
        {error && <p className="otp-error-message">{error}</p>} {/* Display error message */}
        {showSuccessMessage && (
          <p className="otp-success-message">OTP Verified Successfully!</p>
        )}
        {!showSuccessMessage && <p className="otp-timer">{formatTimer(timer)}</p>}
        {!showSuccessMessage && <p className="otp-resend-text">Didn't get it?</p>}
        {!showSuccessMessage && (
          <button
            className="resend-otp-button"
            onClick={handleResendOtp}
            disabled={!resendEnabled}
          >
            Send OTP (SMS)
          </button>
        )}
      </div>
      <div className="modal-right">
        <div className="modal-right-image-placeholder"></div> 
        <h2 className="modal-right-title">Order faster & easier everytime</h2>
        <p className="modal-right-subtitle-app">with the Zepto App</p>
        <div className="app-download-buttons">
        </div>
      </div>
    </>
  );
}
