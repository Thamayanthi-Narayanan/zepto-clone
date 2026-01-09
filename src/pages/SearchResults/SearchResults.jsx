import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BASE_API_URL } from '../../api/apiConfig';
import { useCart } from '../../context/CartContext';
import Loader from '../../components/Loader/Loader';
import './SearchResults.css';
import product1 from '../../assets/product1.png';
import product2 from '../../assets/product2.png';
import product3 from '../../assets/product3.png';
import product4 from '../../assets/product4.png';
import product5 from '../../assets/product5.png';
import product6 from '../../assets/product6.png.png';
import product7 from '../../assets/product7.png.png';
import product8 from '../../assets/product8.png.png';
import product9 from '../../assets/product9.png.png';
import product10 from '../../assets/product10.png.png';
import product11 from '../../assets/product11.png.png';
import product12 from '../../assets/product12.png.png';
import product13 from '../../assets/product13.png.png';
import product14 from '../../assets/product14.png.png';
import product15 from '../../assets/product15.png.png';
import product16 from '../../assets/product16.png.png';
import product17 from '../../assets/product17.png.png';
import product18 from '../../assets/product18.png.png';
import product19 from '../../assets/product19.png.png';
import product20 from '../../assets/product20.png.png';

export default function SearchResults() {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_ENDPOINT = "/api/products/all";
  const FULL_API_URL = BASE_API_URL + API_ENDPOINT;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(FULL_API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setProducts(result.data);
        } else {
          console.error("API call successful but data not as expected:", result);
          setError("Failed to fetch products: Data format incorrect.");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const searchLower = searchQuery.toLowerCase().trim();
    const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);

    // Score products based on relevance
    const scoredProducts = products.map((product) => {
      let score = 0;
      const productName = (product.productName || '').toLowerCase();
      const unitValue = (product.unitValue || '').toLowerCase();
      const unitType = (product.unitType || '').toLowerCase();
      
      const searchableText = `${productName} ${unitValue} ${unitType}`.toLowerCase();

      searchWords.forEach((word) => {
        if (productName === word) {
          score += 100;
        } else if (productName.startsWith(word)) {
          score += 50;
        } else if (productName.includes(word)) {
          score += 30;
        }

        const wordBoundaryRegex = new RegExp(`\\b${word}\\b`, 'i');
        if (wordBoundaryRegex.test(productName)) {
          score += 20;
        }

        if (unitValue.includes(word) || unitType.includes(word)) {
          score += 5;
        }

        if (searchableText.includes(word)) {
          score += 2;
        }
      });

      if (searchableText.includes(searchLower)) {
        score += 15;
      }

      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);

    return scoredProducts;
  }, [products, searchQuery]);

  // Array of product images
  const productImages = [
    product1, product2, product3, product4, product5,
    product6, product7, product8, product9, product10,
    product11, product12, product13, product14, product15,
    product16, product17, product18, product19, product20
  ];

  if (loading) {
    return (
      <div className="search-results-page">
        <div className="search-results-container">
          <Loader size="medium" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results-page">
        <div className="search-results-container">
          <div className="search-error">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="search-results-container">
        {/* Search Header */}
        <div className="search-header">
          <h1 className="search-title">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Products'}
          </h1>
          {searchQuery && (
            <p className="search-results-count">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="search-products-grid">
            {filteredProducts.map((product, index) => {
              const hasValidPrices =
                typeof product.mrp === "number" &&
                typeof product.price === "number" &&
                product.mrp > product.price;
              const discountAmount = hasValidPrices
                ? Math.round(product.mrp - product.price)
                : null;

              const productId = product.id || (index + 1);
              const imageIndex = (parseInt(productId) - 1) % productImages.length;
              const productImage = productImages[imageIndex] || product1;

              const cartItem = cartItems.find(item => item.id === product.id);
              const isInCart = !!cartItem;
              const quantity = cartItem?.qty || 0;

              const handleIncrease = (e) => {
                e.stopPropagation();
                if (isInCart) {
                  updateQuantity(product.id, quantity + 1);
                } else {
                  addToCart(product);
                }
              };

              const handleDecrease = (e) => {
                e.stopPropagation();
                if (quantity > 1) {
                  updateQuantity(product.id, quantity - 1);
                } else if (quantity === 1) {
                  updateQuantity(product.id, 0);
                }
              };

              return (
                <div
                  key={product.id}
                  className="search-product-card"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="search-product-image-container">
                    <img
                      src={productImage}
                      alt={product.productName}
                      className="search-product-image"
                    />
                    {isInCart && quantity > 0 ? (
                      <div
                        className="search-quantity-selector"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="search-qty-btn search-qty-decrease"
                          onClick={handleDecrease}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="search-qty-value">{quantity}</span>
                        <button
                          className="search-qty-btn search-qty-increase"
                          onClick={handleIncrease}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        className="search-add-button"
                        onClick={handleIncrease}
                      >
                        ADD
                      </button>
                    )}
                  </div>
                  <div className="search-product-details">
                    <div className="search-price-and-mrp">
                      <div className="search-price-pill">
                        <span>₹{product.price}</span>
                      </div>
                      {product.mrp > 0 && (
                        <span className="search-mrp-price">₹{product.mrp}</span>
                      )}
                    </div>
                    {discountAmount && discountAmount > 0 && (
                      <p className="search-discount-text">₹{discountAmount} OFF</p>
                    )}
                    <h3 className="search-product-name">{product.productName}</h3>
                    <p className="search-product-unit">
                      {product.unitValue || product.unitType}
                    </p>
                    {product.rating && (
                      <div className="search-product-rating">
                        <span className="search-star-icon">★</span>
                        <span className="search-rating-value">{product.rating}</span>
                        <span className="search-total-reviews">
                          ({product.totalReviews})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : searchQuery ? (
          <div className="search-no-results">
            <div className="no-results-icon">🔍</div>
            <h2>No products found</h2>
            <p>We couldn't find any products matching "{searchQuery}"</p>
            <p className="no-results-suggestion">
              Try searching with different keywords or check your spelling
            </p>
          </div>
        ) : (
          <div className="search-no-query">
            <p>Please enter a search term to find products</p>
          </div>
        )}
      </div>
    </div>
  );
}

