import React, { useState } from "react";
import "./Navbar.css";
import { MagnifyingGlass, } from "@phosphor-icons/react"
import LoginModal from "../LoginModal/LoginModal";

export default function Navbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginClick = () => {
    console.log("Login button clicked, setting isLoginModalOpen to true");
    setIsLoginModalOpen(true);
    document.body.classList.add('no-scroll'); 
  };

  const handleCloseModal = () => {
    console.log("Closing modal, setting isLoginModalOpen to false");
    setIsLoginModalOpen(false);
    document.body.classList.remove('no-scroll'); 
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
        <button className="nav-cart">Cart</button>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseModal} />
    </nav>
  );
}
