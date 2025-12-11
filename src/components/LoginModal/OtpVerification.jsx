import React, { useState, useEffect, useRef } from 'react';
import './OtpVerification.css';

export default function OtpVerification({ phoneNumber, onVerified, onBack }) {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timer, setTimer] = useState(30);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const otpInputRefs = useRef([]);

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

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }

    // If all OTPs are entered, simulate verification
    if (newOtp.every(digit => digit !== '')) {
      const enteredOtp = newOtp.join('');
      if (enteredOtp === '123456') { // Static OTP for now
        setShowSuccessMessage(true);
        setTimeout(() => {
          onVerified(); // Close modal and navigate to home
        }, 1500); // Show success message for 1.5 seconds
      } else {
        alert('Incorrect OTP. Please try again.');
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleResendOtp = () => {
    setTimer(17);
    setResendEnabled(false);
    setOtp(new Array(6).fill(''));
    // Simulate sending new OTP
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
        <div className="modal-right-image-placeholder"></div> {/* Placeholder for image */}
        <h2 className="modal-right-title">Order faster & easier everytime</h2>
        <p className="modal-right-subtitle-app">with the Zepto App</p>
        <div className="app-download-buttons">
          {/* <img src={googlePlay} alt="Get it on Google Play" className="app-button" /> */}
          {/* <img src={appStore} alt="Download on the App Store" className="app-button" /> */}
        </div>
      </div>
    </>
  );
}
