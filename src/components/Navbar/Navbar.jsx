import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { MagnifyingGlass, } from "@phosphor-icons/react"
import LoginModal from "../LoginModal/LoginModal";
import CartDrawer from "../CartDrawer/CartDrawer";
import AddressModal from "../CartDrawer/AddressModal";
import PaymentModal from "../CartDrawer/PaymentModal";
import ProfileModal from "../ProfileModal/ProfileModal";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [scrollYBeforeLock, setScrollYBeforeLock] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in on mount and when login state changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const authToken = localStorage.getItem('authToken');
      setIsLoggedIn(!!authToken);
    };

    checkLoginStatus();

    // Listen for login events
    window.addEventListener('userLoggedIn', checkLoginStatus);
    
    // Also check periodically (in case localStorage is updated elsewhere)
    const interval = setInterval(checkLoginStatus, 1000);

    return () => {
      window.removeEventListener('userLoggedIn', checkLoginStatus);
      clearInterval(interval);
    };
  }, []);

  const lockScroll = () => {
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    setScrollYBeforeLock(currentScrollY);
    document.body.style.position = "fixed";
    document.body.style.top = `-${currentScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  };

  const unlockScroll = () => {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollYBeforeLock || 0);
  };

  const handleLoginClick = () => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      // User is logged in - open profile modal
      setIsProfileModalOpen(true);
      if (!isCartOpen && !isAddressModalOpen && !isPaymentModalOpen && !isLoginModalOpen) {
        lockScroll();
      }
    } else {
      // User is not logged in - open login modal
      console.log("Login button clicked, setting isLoginModalOpen to true");
      setIsLoginModalOpen(true);
      if (!isCartOpen && !isAddressModalOpen && !isPaymentModalOpen) {
        lockScroll();
      }
    }
  };

  const handleCloseModal = () => {
    console.log("Closing modal, setting isLoginModalOpen to false");
    setIsLoginModalOpen(false);
    // Check login status when modal closes
    const authToken = localStorage.getItem('authToken');
    setIsLoggedIn(!!authToken);
    if (!isCartOpen && !isAddressModalOpen && !isPaymentModalOpen && !isProfileModalOpen) {
      unlockScroll();
    }
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
    if (!isLoginModalOpen && !isAddressModalOpen && !isPaymentModalOpen) {
      lockScroll();
    }
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
    if (!isLoginModalOpen && !isAddressModalOpen && !isPaymentModalOpen && !isProfileModalOpen) {
      unlockScroll();
    }
  };

  const handleOpenAddressModal = () => {
    setIsAddressModalOpen(true);
    setIsCartOpen(false); // Close cart when opening address modal
    if (!isLoginModalOpen && !isPaymentModalOpen && !isProfileModalOpen) {
      lockScroll();
    }
  };

  const handleCloseAddressModal = () => {
    setIsAddressModalOpen(false);
    if (!isLoginModalOpen && !isCartOpen && !isPaymentModalOpen && !isProfileModalOpen) {
      unlockScroll();
    }
  };

  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
    if (!isLoginModalOpen && !isCartOpen && !isAddressModalOpen && !isProfileModalOpen) {
      lockScroll();
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    if (!isLoginModalOpen && !isCartOpen && !isAddressModalOpen && !isProfileModalOpen) {
      unlockScroll();
    }
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    // Check login status when modal closes
    const authToken = localStorage.getItem('authToken');
    setIsLoggedIn(!!authToken);
    if (!isLoginModalOpen && !isCartOpen && !isAddressModalOpen && !isPaymentModalOpen) {
      unlockScroll();
    }
  };

  const handleLogoClick = () => {
    // Close all modals
    setIsLoginModalOpen(false);
    setIsCartOpen(false);
    setIsAddressModalOpen(false);
    setIsPaymentModalOpen(false);
    setIsProfileModalOpen(false);
    // Unlock scroll
    unlockScroll();
    // Navigate to home
    navigate('/');
  };

  console.log("Navbar rendering, isLoginModalOpen:", isLoginModalOpen);

  return (
    <nav className="navbar">
      
      {/* Left Section */}
      <div className="nav-left">
        <div className="nav-logo-text" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>Infinite Store</div>

        <div className="nav-location">
          <span className="location-label">Select Location</span>
        </div>
      </div>

      {/* Center Search */}
      <div className="nav-center">
        <input
          type="text"
          placeholder="Search for items..."
          className="nav-search"
        />
      </div>

      {/* Right Section */}
      <div className="nav-right">
        <button className="nav-login" onClick={handleLoginClick}>
          {isLoggedIn ? 'Profile' : 'Login'}
        </button>
        <button className="nav-cart" onClick={handleCartClick}>Cart</button>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseModal} />
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={handleCloseCart}
        onOpenAddressModal={handleOpenAddressModal}
      />
      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={handleCloseAddressModal}
        onSaveAddress={handleOpenPaymentModal}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
      />
    </nav>
  );
}
