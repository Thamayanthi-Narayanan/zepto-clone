import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        // If product already exists, increase quantity
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      } else {
        // Add new product with quantity 1
        return [...prevItems, { ...product, qty: 1 }];
      }
    });
    // Show toast notification
    setToastMessage('Added to cart!');
    setShowToast(true);
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, qty: newQty } : item
      )
    );
  };

  // Calculate totals
  const calculateTotals = () => {
    let itemTotal = 0;
    let itemTotalMRP = 0;
    let totalSavings = 0;

    cartItems.forEach((item) => {
      const itemPrice = item.price * item.qty;
      const itemMRP = item.mrp * item.qty;
      itemTotal += itemPrice;
      itemTotalMRP += itemMRP;
      totalSavings += itemMRP - itemPrice;
    });

    // Handling fee and delivery fee (both FREE in this case)
    const handlingFee = 0;
    const deliveryFee = 0;
    const handlingFeeMRP = 10;
    const deliveryFeeMRP = 30;

    const totalMRP = itemTotalMRP + handlingFeeMRP + deliveryFeeMRP;
    const totalToPay = itemTotal + handlingFee + deliveryFee;
    const totalSavingsOnOrder = totalSavings + handlingFeeMRP + deliveryFeeMRP;

    return {
      itemTotal,
      itemTotalMRP,
      handlingFee,
      handlingFeeMRP,
      deliveryFee,
      deliveryFeeMRP,
      totalToPay,
      totalMRP,
      totalSavingsOnOrder,
      discountOnMRP: totalSavings,
      freeDeliverySavings: deliveryFeeMRP,
      savingsOnHandlingFee: handlingFeeMRP,
    };
  };

  const hideToast = () => {
    setShowToast(false);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotals,
    showToast,
    toastMessage,
    hideToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

