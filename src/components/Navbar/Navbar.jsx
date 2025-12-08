import React, { useState } from "react";
import "./Navbar.css";
import { MagnifyingGlass, } from "@phosphor-icons/react"
import LoginModal from "../LoginModal/LoginModal";

export default function Navbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
    document.body.classList.add('no-scroll'); // Add no-scroll class
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
    document.body.classList.remove('no-scroll'); // Remove no-scroll class
  };

  return (
    <nav className="navbar">
      
      {/* Left Section */}
      <div className="nav-left">
        <div className="nav-logo-text">Infinite Store</div>

        <div className="nav-location">
          <span className="location-label">Select Location</span>
          {/* <MagnifyingGlass size={32} /> */}
          {/* <span className="location-arrow">▼</span> */}
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
        <button className="nav-cart">Cart</button>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseModal} />
    </nav>
  );
}
