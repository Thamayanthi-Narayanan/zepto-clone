import React, { useState } from 'react';
import './LoginModal.css';
// Placeholder imports for images - remember to add these assets
/* import zeptoLogo from '../../assets/zepto-logo.svg'; */ 
/* import googlePlay from '../../assets/google-play.svg'; */
/* import appStore from '../../assets/app-store.svg'; */
// Placeholder for the image above "Order faster & easier everytime"
/* import orderFasterImage from '../../assets/order-faster-image.svg'; */

export default function LoginModal({ isOpen, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

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
      alert(`Phone number entered: ${phoneNumber}`);
      // Here you would typically send the phone number to your backend for OTP or login
      onClose(); // Close the modal after successful input
    } else {
      setError('Please enter a valid 10-digit phone number.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
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
          {/* <img src={orderFasterImage} alt="Order Faster" className="modal-right-image" /> */}
          <h2 className="modal-right-title">Order faster & easier everytime</h2>
          <p className="modal-right-subtitle-app">with the Zepto App</p>
          {/* <div className="app-download-buttons"> */}
            {/* <img src={googlePlay} alt="Get it on Google Play" className="app-button" /> */}
            {/* <img src={appStore} alt="Download on the App Store" className="app-button" /> */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}
