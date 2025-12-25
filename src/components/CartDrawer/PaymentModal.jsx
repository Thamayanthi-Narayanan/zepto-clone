import React, { useState } from 'react';
import './PaymentModal.css';
import { useCart } from '../../context/CartContext';

export default function PaymentModal({ isOpen, onClose }) {
  const { calculateTotals } = useCart();
  const totals = calculateTotals();
  const [selectedPayment, setSelectedPayment] = useState('Pay On Delivery');

  const paymentMethods = [
    { id: 'UPI', name: 'UPI', icon: '🔺' },
    { id: 'Pluxee', name: 'Pluxee', icon: '🍴' },
    { id: 'Credit/Debit Card', name: 'Credit / Debit Card', icon: '💳' },
    { id: 'Paylater', name: 'Paylater', icon: '⏰' },
    { id: 'Wallets', name: 'Wallets', icon: '🔄' },
    { id: 'Netbanking', name: 'Netbanking', icon: '🏢' },
    { id: 'Pay On Delivery', name: 'Pay On Delivery', icon: '💬' },
  ];

  const handlePaymentSelect = (methodId) => {
    // Only allow Pay On Delivery for now
    if (methodId === 'Pay On Delivery') {
      setSelectedPayment(methodId);
    }
  };

  const handleProceedToPay = () => {
    if (selectedPayment === 'Pay On Delivery') {
      // TODO: Integrate with API later
      console.log('Proceeding with Pay On Delivery');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="payment-header">
          <div className="payment-header-left">Order Summary</div>
          <div className="payment-header-right">
            <div className="payment-header-amount-label">Amount</div>
            <div className="payment-header-amount-value">₹{Math.round(totals.totalToPay)}</div>
          </div>
          <button className="payment-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="payment-body">
          {/* Left Panel - Payment Methods */}
          <div className="payment-methods-panel">
            <div className="payment-methods-list">
              {paymentMethods.map((method) => {
                const isSelected = selectedPayment === method.id;
                const isClickable = method.id === 'Pay On Delivery';
                
                return (
                  <div
                    key={method.id}
                    className={`payment-method-item ${isSelected ? 'selected' : ''} ${!isClickable ? 'disabled' : ''}`}
                    onClick={() => isClickable && handlePaymentSelect(method.id)}
                    style={{ cursor: isClickable ? 'pointer' : 'not-allowed', opacity: isClickable ? 1 : 0.5 }}
                  >
                    <span className="payment-method-icon">{method.icon}</span>
                    <span className="payment-method-name">{method.name}</span>
                    {isSelected && <div className="payment-method-indicator"></div>}
                  </div>
                );
              })}
            </div>
            <div className="payment-secured">
              <span className="payment-secured-text">secured by</span>
              <div className="payment-juspay-logo">JUSPAY</div>
            </div>
          </div>

          {/* Right Panel - Payment Details */}
          <div className="payment-details-panel">
            {selectedPayment === 'Pay On Delivery' && (
              <div className="payment-details-content">
                <h3 className="payment-details-title">Cash On Delivery</h3>
                <div className="payment-option-card">
                  <div className="payment-option-left">
                    <div className="payment-option-icon">💵</div>
                    <div className="payment-option-text">
                      <div className="payment-option-name">Cash On Delivery</div>
                      <div className="payment-option-subtitle">Pay by Cash/UPI on delivery</div>
                    </div>
                  </div>
                  <div className="payment-option-check">✓</div>
                </div>
                {/* Proceed Button below Cash On Delivery */}
                <button className="payment-proceed-btn" onClick={handleProceedToPay}>
                  Proceed to Pay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

