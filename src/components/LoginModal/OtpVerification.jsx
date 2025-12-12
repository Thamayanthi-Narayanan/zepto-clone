import React, { useState, useEffect, useRef } from 'react';
import './OtpVerification.css';
import { BASE_API_URL } from "../../api/apiConfig"; 

export default function OtpVerification({ phoneNumber, onVerified, onBack }) {
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
          setShowSuccessMessage(true); // Show success message
          console.log("OTP verified successfully! Token:", result.data.token); // For testing
          setTimeout(() => {
            onVerified(); 
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
