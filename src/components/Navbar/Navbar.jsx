import React from "react";
import "./Navbar.css";
import { MagnifyingGlass, } from "@phosphor-icons/react"

export default function Navbar() {
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
        <button className="nav-login">Login</button>
        <button className="nav-cart">Cart</button>
      </div>

    </nav>
  );
}
