import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BASE_API_URL } from '../api/apiConfig';

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

  // Fetch cart items from API
  const fetchCartItems = useCallback(async () => {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      // User not logged in - clear cart
      setCartItems([]);
      return;
    }

    try {
      const VIEW_CART_URL = BASE_API_URL + "/api/cart";
      console.log("Fetching cart items - URL:", VIEW_CART_URL);
      
      const response = await fetch(VIEW_CART_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Cart is empty - this is OK, just set empty array
          console.log("Cart is empty");
          setCartItems([]);
          return;
        } else if (response.status === 401) {
          // Token invalid - clear cart and token
          console.log("Token invalid, clearing cart");
          localStorage.removeItem('authToken');
          setCartItems([]);
          return;
        }
        
        // Other errors
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
        }
        console.error("Error fetching cart:", errorData);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Map API response to cart items format
        // API returns array of products, each needs a qty field
        const mappedItems = result.data.map((item) => ({
          ...item,
          qty: item.qty || 1, // Use qty from API if available, otherwise default to 1
          id: item.id, // Use the cart item ID from API
        }));
        
        console.log("Cart items fetched:", mappedItems);
        setCartItems(mappedItems);
      } else {
        console.log("Cart fetch response not successful:", result);
        setCartItems([]);
      }
    } catch (err) {
      console.error("Error fetching cart items:", err);
      // Don't show error to user - just log it
    }
  }, []);

  // Monitor login/logout status and manage cart accordingly
  useEffect(() => {
    const handleUserLogin = () => {
      console.log("User logged in, fetching cart items");
      // Always fetch cart on login to get user's cart from backend
      fetchCartItems();
    };

    // Listen for login events
    window.addEventListener('userLoggedIn', handleUserLogin);
    
    // Monitor localStorage for authToken changes (logout detection)
    let previousToken = localStorage.getItem('authToken');
    const checkAuthStatus = () => {
      const currentToken = localStorage.getItem('authToken');
      
      // If token was removed (logout)
      if (previousToken && !currentToken) {
        console.log("User logged out, clearing cart");
        setCartItems([]);
      }
      // If token was added (login) - this is handled by userLoggedIn event, but check here too
      else if (!previousToken && currentToken) {
        console.log("Token detected, fetching cart");
        fetchCartItems();
      }
      
      previousToken = currentToken;
    };

    // Check on mount - if user is logged in, fetch their cart
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      console.log("User already logged in on mount, fetching cart");
      fetchCartItems();
    } else {
      // User not logged in - ensure cart is empty
      setCartItems([]);
    }
    
    // Check periodically for authToken changes (login/logout detection)
    const interval = setInterval(checkAuthStatus, 500);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
      clearInterval(interval);
    };
  }, [fetchCartItems]);

  const addToCart = async (product) => {
    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      // User not logged in - show error or prompt to login
      setToastMessage('Please login to add items to cart');
      setShowToast(true);
      return;
    }

    try {
      // Call API to add product to cart - product ID in URL path
      const ADD_TO_CART_URL = BASE_API_URL + `/api/cart/add/${product.id}`;
      console.log("Adding to cart - URL:", ADD_TO_CART_URL);
      console.log("Product ID:", product.id);
      console.log("Auth Token:", authToken ? `${authToken.substring(0, 20)}...` : 'No token');
      
      const response = await fetch(ADD_TO_CART_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
        },
        // No body needed - product ID is in the URL path
      });
      
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
          console.error("API Error Response:", errorData);
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
          setToastMessage(`Failed to add to cart (${response.status}). Please try again.`);
          setShowToast(true);
          return;
        }
        
        // Handle specific error cases
        if (response.status === 401) {
          setToastMessage('Please login to add items to cart');
          setShowToast(true);
          // Clear invalid token
          localStorage.removeItem('authToken');
          return;
        } else if (response.status === 404) {
          // 404 could mean endpoint not found or product not found
          const errorMsg = errorData.error || errorData.message || 'Endpoint or product not found';
          console.error("404 Error - Path:", errorData.path, "Error:", errorMsg);
          setToastMessage(`Cart endpoint not found. Please check the API configuration.`);
          setShowToast(true);
          return;
        } else {
          setToastMessage(errorData.message || errorData.error || "Failed to add to cart. Please try again.");
          setShowToast(true);
          return;
        }
      }

      const result = await response.json();

      if (result.success) {
        // API call successful - refresh cart from server to get latest state
        // This ensures cart is in sync with backend
        await fetchCartItems();
        // Show success toast notification
        setToastMessage('Added to cart!');
        setShowToast(true);
      } else {
        setToastMessage(result.message || "Failed to add to cart. Please try again.");
        setShowToast(true);
      }
    } catch (err) {
      console.error("Error adding product to cart:", err);
      setToastMessage("Network error. Please try again.");
      setShowToast(true);
    }
  };

  const removeFromCart = async (productId) => {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      // User not logged in - just remove from local state
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
      return;
    }

    try {
      // Call API to remove product from cart - product ID in URL path
      const REMOVE_FROM_CART_URL = BASE_API_URL + `/api/cart/remove/${productId}`;
      console.log("Removing from cart - URL:", REMOVE_FROM_CART_URL);
      console.log("Product ID:", productId);
      
      const response = await fetch(REMOVE_FROM_CART_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
          console.error("API Error Response:", errorData);
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
        }
        
        // Handle specific error cases
        if (response.status === 401) {
          setToastMessage('Please login to remove items from cart');
          setShowToast(true);
          localStorage.removeItem('authToken');
          // Still remove from local state
          setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
          return;
        } else if (response.status === 404) {
          // Product not found - might already be removed, refresh cart
          console.log("Product not found in cart, refreshing cart");
          await fetchCartItems();
          setToastMessage('Item removed from cart');
          setShowToast(true);
          return;
        } else {
          setToastMessage(errorData.message || "Failed to remove from cart. Please try again.");
          setShowToast(true);
          // Still remove from local state even if API fails
          setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
          return;
        }
      }

      const result = await response.json();

      if (result.success) {
        // API call successful - refresh cart from server to get latest state
        await fetchCartItems();
        setToastMessage('Item removed from cart');
        setShowToast(true);
      } else {
        setToastMessage(result.message || "Failed to remove from cart. Please try again.");
        setShowToast(true);
        // Still remove from local state
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
      }
    } catch (err) {
      console.error("Error removing product from cart:", err);
      setToastMessage("Network error. Please try again.");
      setShowToast(true);
      // Still remove from local state on network error
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    }
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
    fetchCartItems,
    showToast,
    toastMessage,
    hideToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

