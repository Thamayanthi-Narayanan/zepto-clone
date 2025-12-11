import React, { useState, useEffect } from 'react';
import './LoginModal.css';
import OtpVerification from './OtpVerification';
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

  const handleContinue = () => {
    if (phoneNumber.length === 10) {
      // alert(`Phone number entered: ${phoneNumber}`);
      setShowOtpScreen(true); // Transition to OTP screen
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
  );
}
