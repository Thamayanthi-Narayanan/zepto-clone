import React, { useState } from "react";
import "./Navbar.css";
import { MagnifyingGlass, } from "@phosphor-icons/react"
import LoginModal from "../LoginModal/LoginModal";
import CartDrawer from "../CartDrawer/CartDrawer";

export default function Navbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrollYBeforeLock, setScrollYBeforeLock] = useState(0);

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
    console.log("Login button clicked, setting isLoginModalOpen to true");
    setIsLoginModalOpen(true);
    if (!isCartOpen && !isLoginModalOpen) {
      lockScroll();
    }
  };

  const handleCloseModal = () => {
    console.log("Closing modal, setting isLoginModalOpen to false");
    setIsLoginModalOpen(false);
    if (!isCartOpen) {
      unlockScroll();
    }
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
    if (!isCartOpen && !isLoginModalOpen) {
      lockScroll();
    }
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
    if (!isLoginModalOpen) {
      unlockScroll();
    }
  };

  console.log("Navbar rendering, isLoginModalOpen:", isLoginModalOpen);

  return (
    <nav className="navbar">
      
      {/* Left Section */}
      <div className="nav-left">
        <div className="nav-logo-text">Infinite Store</div>

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
        <button className="nav-login" onClick={handleLoginClick}>Login</button>
        <button className="nav-cart" onClick={handleCartClick}>Cart</button>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseModal} />
      <CartDrawer isOpen={isCartOpen} onClose={handleCloseCart} />
    </nav>
  );
}
