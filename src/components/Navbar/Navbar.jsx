import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { BASE_API_URL } from "../../api/apiConfig";
import LoginModal from "../LoginModal/LoginModal";
import CartDrawer from "../CartDrawer/CartDrawer";
import AddressModal from "../CartDrawer/AddressModal";
import PaymentModal from "../CartDrawer/PaymentModal";
import ProfileModal from "../ProfileModal/ProfileModal";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [scrollYBeforeLock, setScrollYBeforeLock] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  // Calculate total cart quantity
  const cartQuantity = cartItems.reduce((total, item) => total + (item.qty || 1), 0);

  // Fetch products for search
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API_ENDPOINT = "/api/products/all";
        const FULL_API_URL = BASE_API_URL + API_ENDPOINT;
        
        const response = await fetch(FULL_API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setProducts(result.data);
            console.log("Products loaded for search:", result.data.length);
          }
        } else {
          console.error("Failed to fetch products:", response.status);
        }
      } catch (err) {
        console.error("Error fetching products for search:", err);
      }
    };

    fetchProducts();
  }, []);

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

  // Debounce search term (wait 300ms after user stops typing)
  // But also update immediately when search term changes for better responsiveness
  useEffect(() => {
    // If search term is empty, clear immediately
    if (!searchTerm.trim()) {
      setDebouncedSearchTerm('');
      return;
    }
    
    // For non-empty terms, set immediately for instant feedback
    setDebouncedSearchTerm(searchTerm);
    
    // Also set a debounced version to prevent excessive filtering
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter products based on search term (using useMemo for performance)
  // Enhanced search with better matching and relevance scoring
  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return []; // Return empty if search is empty
    }

    const searchLower = debouncedSearchTerm.toLowerCase().trim();
    const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);

    // Score products based on relevance
    const scoredProducts = products.map((product) => {
      let score = 0;
      const productName = (product.productName || '').toLowerCase();
      const unitValue = (product.unitValue || '').toLowerCase();
      const unitType = (product.unitType || '').toLowerCase();
      
      // Combine all searchable text
      const searchableText = `${productName} ${unitValue} ${unitType}`.toLowerCase();

      // Check each search word
      searchWords.forEach((word) => {
        // Exact match in product name (highest priority)
        if (productName === word) {
          score += 100;
        } else if (productName.startsWith(word)) {
          score += 50;
        } else if (productName.includes(word)) {
          score += 30;
        }

        // Word boundary match (matches whole words)
        const wordBoundaryRegex = new RegExp(`\\b${word}\\b`, 'i');
        if (wordBoundaryRegex.test(productName)) {
          score += 20;
        }

        // Partial word match in product name
        if (productName.includes(word)) {
          score += 10;
        }

        // Match in unit value/type
        if (unitValue.includes(word) || unitType.includes(word)) {
          score += 5;
        }

        // Match anywhere in searchable text
        if (searchableText.includes(word)) {
          score += 2;
        }
      });

      // Bonus for exact phrase match
      if (searchableText.includes(searchLower)) {
        score += 15;
      }

      return { product, score };
    })
    .filter((item) => item.score > 0) // Only include products with matches
    .sort((a, b) => b.score - a.score) // Sort by relevance (highest score first)
    .map((item) => item.product)
    .slice(0, 10); // Limit to 10 results for dropdown

    return scoredProducts;
  }, [products, debouncedSearchTerm]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsSearchFocused(true);
    // If there's a value, immediately update debounced term for instant results
    if (value.trim()) {
      // Clear any existing timer and set immediately for better UX
      setDebouncedSearchTerm(value);
    }
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (debouncedSearchTerm) {
      setIsSearchFocused(true);
    }
  };

  // Handle product click in search results
  const handleProductClick = (productId) => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsSearchFocused(false);
    navigate(`/product/${productId}`);
  };

  // Clear search
  const handleClearSearch = (e) => {
    e.stopPropagation();
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsSearchFocused(false);
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      // Use current searchTerm (not debounced) for immediate response
      const currentSearch = searchTerm.trim();
      // Navigate to search results page
      navigate(`/search?q=${encodeURIComponent(currentSearch)}`);
      setSearchTerm('');
      setDebouncedSearchTerm('');
      setIsSearchFocused(false);
    }
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
      <div className="nav-center" ref={searchRef}>
        <div className="nav-search-wrapper">
          <MagnifyingGlass size={20} className="nav-search-icon" />
          <input
            type="text"
            placeholder="Search for items..."
            className="nav-search"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onKeyDown={handleSearchSubmit}
          />
          {searchTerm && (
            <button
              className="nav-search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={16} weight="bold" />
            </button>
          )}
          
          {/* Search Results Dropdown */}
          {isSearchFocused && debouncedSearchTerm && filteredProducts.length > 0 && (
            <div className="search-dropdown">
              <div className="search-dropdown-header">
                <span>Search Results ({filteredProducts.length})</span>
              </div>
              <div className="search-dropdown-list">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="search-dropdown-item"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="search-item-name">{product.productName}</div>
                    <div className="search-item-details">
                      <span className="search-item-price">₹{product.price}</span>
                      {product.unitValue && (
                        <span className="search-item-unit">{product.unitValue}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* No Results Message */}
          {isSearchFocused && debouncedSearchTerm && filteredProducts.length === 0 && (
            <div className="search-dropdown">
              <div className="search-no-results">
                No products found matching "{debouncedSearchTerm}"
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="nav-right">
        <button className="nav-login" onClick={handleLoginClick}>
          {isLoggedIn ? 'Profile' : 'Login'}
        </button>
        <button className="nav-cart" onClick={handleCartClick}>
          Cart
          {cartQuantity > 0 && (
            <span className="cart-badge">{cartQuantity}</span>
          )}
        </button>
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
