import React, { useState } from 'react';
import './PaymentModal.css';
import { useCart } from '../../context/CartContext';
import { BASE_API_URL } from '../../api/apiConfig';
import OrderSuccessAnimation from './OrderSuccessAnimation';

export default function PaymentModal({ isOpen, onClose }) {
  const { cartItems, calculateTotals, fetchCartItems } = useCart();
  const totals = calculateTotals();
  const [selectedPayment, setSelectedPayment] = useState('Pay On Delivery');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [orderData, setOrderData] = useState(null);

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

  const handleProceedToPay = async () => {
    if (selectedPayment === 'Pay On Delivery') {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        setOrderError('Please login to place order');
        return;
      }

      // Get selected address
      const selectedAddressStr = localStorage.getItem('selectedAddress');
      if (!selectedAddressStr) {
        setOrderError('Please select a delivery address');
        return;
      }

      const selectedAddress = JSON.parse(selectedAddressStr);
      
      // Get cart items
      if (!cartItems || cartItems.length === 0) {
        setOrderError('Cart is empty');
        return;
      }

      setIsPlacingOrder(true);
      setOrderError('');

      try {
        // Map payment method
        const paymentMethodMap = {
          'Pay On Delivery': 'PAYONDELIVERY',
          'UPI': 'UPI',
          'Credit/Debit Card': 'CARD',
          'Wallets': 'WALLET',
          'Netbanking': 'NETBANKING'
        };

        // Prepare order items
        const orderItems = cartItems.map(item => ({
          productId: item.productId || item.id,
          productName: item.productName,
          quantity: item.qty || 1,
          price: item.price,
          totalPrice: (item.price * (item.qty || 1))
        }));

        // Prepare order payload matching exact API format
        const orderPayload = {
          orderStatus: "PACKING",
          arrivalTimeInSeconds: 30,
          deliveryStatusText: "Your order is getting packed",
          onTime: true,
          billSummary: {
            itemTotal: totals.itemTotal,
            deliveryFee: totals.deliveryFee,
            discount: totals.discountOnMRP,
            grandTotal: totals.totalToPay
          },
          payment: {
            paymentMethod: paymentMethodMap[selectedPayment] || 'PAYONDELIVERY',
            paymentStatus: 'PENDING',
            message: 'Pay cash when order is delivered'
          },
          deliveryAddress: {
            addressId: selectedAddress.addressId || selectedAddress.id,
            addressLine1: selectedAddress.addressLine1,
            addressLine2: selectedAddress.addressLine2,
            landmark: selectedAddress.landmark || null,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
            addressType: selectedAddress.addressType
          },
          tracking: {
            enabled: true
          },
          items: orderItems
        };

        const PLACE_ORDER_URL = BASE_API_URL + "/api/orders/place";
        console.log("Placing order - URL:", PLACE_ORDER_URL);
        console.log("Order payload:", orderPayload);

        const response = await fetch(PLACE_ORDER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(orderPayload),
        });

        if (!response.ok) {
          let errorData = {};
          try {
            errorData = await response.json();
            console.error("API Error Response:", errorData);
          } catch (jsonError) {
            console.error("Failed to parse error response:", jsonError);
          }

          if (response.status === 401) {
            setOrderError('Please login to place order');
            localStorage.removeItem('authToken');
          } else if (response.status === 400) {
            setOrderError(errorData.message || 'Invalid order data. Please check all fields.');
          } else {
            setOrderError(errorData.message || 'Failed to place order. Please try again.');
          }
          setIsPlacingOrder(false);
          return;
        }

        const result = await response.json();

        if (result.success) {
          console.log("Order placed successfully:", result.data);
          // Store order data for success animation
          setOrderData(result.data);
          // Clear cart after successful order
          await fetchCartItems(); // This will fetch empty cart from backend
          // Clear selected address
          localStorage.removeItem('selectedAddress');
          // Show success animation
          setIsPlacingOrder(false);
          setShowSuccessAnimation(true);
        } else {
          setOrderError(result.message || 'Failed to place order. Please try again.');
          setIsPlacingOrder(false);
        }
      } catch (err) {
        console.error("Error placing order:", err);
        setOrderError("Network error. Please try again.");
        setIsPlacingOrder(false);
      }
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessAnimation(false);
    setOrderData(null);
    onClose();
  };

  if (!isOpen) return null;

  // Show success animation
  if (showSuccessAnimation && orderData) {
    return (
      <OrderSuccessAnimation
        orderData={orderData}
        onClose={handleCloseSuccess}
      />
    );
  }

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
                {orderError && (
                  <div className="payment-error-message">{orderError}</div>
                )}
                <button 
                  className="payment-proceed-btn" 
                  onClick={handleProceedToPay}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? 'Placing Order...' : 'Proceed to Pay'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

