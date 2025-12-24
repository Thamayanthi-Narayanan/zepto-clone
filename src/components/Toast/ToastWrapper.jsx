import React from 'react';
import { useCart } from '../../context/CartContext';
import Toast from './Toast';

export default function ToastWrapper() {
  const { showToast, toastMessage, hideToast } = useCart();

  return (
    <Toast
      message={toastMessage}
      isVisible={showToast}
      onClose={hideToast}
    />
  );
}

