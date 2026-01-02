import React, { useEffect, useState } from 'react';
import './OrderSuccessAnimation.css';

export default function OrderSuccessAnimation({ orderData, onClose }) {
  const [showContent, setShowContent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Trigger animations in sequence
    setTimeout(() => setShowContent(true), 300);
    setTimeout(() => setShowDetails(true), 800);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const displayMins = mins < 30 ? 30 : mins;
    return `${displayMins} mins`;
  };

  return (
    <div className="order-success-overlay">
      <div className="order-success-container">
        {/* Animated Checkmark */}
        <div className="success-checkmark-container">
          <div className="success-checkmark-circle">
            <svg className="success-checkmark" viewBox="0 0 52 52">
              <circle className="success-checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
              <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <div className="success-particles">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="success-particle" style={{ '--delay': i * 0.1 + 's' }}></div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        <div className={`success-message ${showContent ? 'show' : ''}`}>
          <h2 className="success-title">Order Placed Successfully!</h2>
          <p className="success-subtitle">Your order is being prepared</p>
        </div>

        {/* Order Details */}
        {orderData && (
          <div className={`success-details ${showDetails ? 'show' : ''}`}>
            <div className="success-order-id">
              <span className="order-id-label">Order ID:</span>
              <span className="order-id-value">{orderData.orderId}</span>
            </div>

            <div className="success-status-card">
              <div className="status-icon">📦</div>
              <div className="status-content">
                <div className="status-text">{orderData.deliveryStatusText}</div>
                <div className="status-time">
                  Arriving in {formatTime(orderData.arrivalTimeInSeconds)}
                </div>
              </div>
            </div>

            <div className="success-summary">
              <div className="summary-row">
                <span>Total Amount</span>
                <span className="summary-amount">₹{orderData.billSummary.grandTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Payment Method</span>
                <span>{orderData.payment.paymentMethod === 'PAYONDELIVERY' ? 'Cash on Delivery' : orderData.payment.paymentMethod}</span>
              </div>
            </div>

            <button className="success-close-btn" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

